package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// EstatisticasDashboard representa as estatísticas principais do sistema
type EstatisticasDashboard struct {
	OcorrenciasAtivas    int                    `json:"ocorrencias_ativas"`
	FalhasUltimas24h     int                    `json:"falhas_ultimas_24h"`
	EventosUltimas24h    int                    `json:"eventos_ultimas_24h"`
	TotalOcorrencias     int                    `json:"total_ocorrencias"`
	PorSetor             map[string]int         `json:"por_setor"`
	PorPrioridade        map[string]int         `json:"por_prioridade"`
	TopFalhasFrequentes  []FalhaFrequente       `json:"top_falhas_frequentes"`
	TempoMedioResolucao  float64                `json:"tempo_medio_resolucao_horas"`
}

// FalhaFrequente representa uma falha com sua frequência
type FalhaFrequente struct {
	Codigo      string `json:"codigo"`
	Descricao   string `json:"descricao"`
	SetorNome   string `json:"setor_nome"`
	Frequencia  int    `json:"frequencia"`
}

// EstatisticaPorSetor representa estatísticas agrupadas por setor
type EstatisticaPorSetor struct {
	SetorCodigo         string  `json:"setor_codigo"`
	SetorNome           string  `json:"setor_nome"`
	OcorrenciasAtivas   int     `json:"ocorrencias_ativas"`
	TotalOcorrencias    int     `json:"total_ocorrencias"`
	TempoMedioResolucao float64 `json:"tempo_medio_resolucao_horas"`
	UltimaOcorrencia    *string `json:"ultima_ocorrencia,omitempty"`
}

// DefinicaoFalhaAPI representa uma definição de falha para o front-end
type DefinicaoFalhaAPI struct {
	ID             int    `json:"id"`
	Codigo         string `json:"codigo"`
	Tipo           string `json:"tipo"`
	Descricao      string `json:"descricao"`
	Prioridade     string `json:"prioridade"`
	WordIndex      int    `json:"word_index"`
	BitIndex       int    `json:"bit_index"`
	ClasseMensagem string `json:"classe_mensagem"`
	SetorCodigo    string `json:"setor_codigo"`
	SetorNome      string `json:"setor_nome"`
	EclusaCodigo   string `json:"eclusa_codigo"`
	EclusaNome     string `json:"eclusa_nome"`
	Ativa          bool   `json:"ativa"`
}

// Setor representa um setor do sistema
type Setor struct {
	ID       int    `json:"id"`
	Codigo   string `json:"codigo"`
	Nome     string `json:"nome"`
	CorTema  string `json:"cor_tema"`
}

// Eclusa representa uma eclusa do sistema
type Eclusa struct {
	ID         int    `json:"id"`
	Codigo     string `json:"codigo"`
	Nome       string `json:"nome"`
	Localizacao string `json:"localizacao"`
	Ativa      bool   `json:"ativa"`
}

// obterEstatisticasDashboard retorna estatísticas gerais para o dashboard
func (s *ServidorHTTP) obterEstatisticasDashboard(w http.ResponseWriter, r *http.Request) {
	stats := EstatisticasDashboard{
		PorSetor:      make(map[string]int),
		PorPrioridade: make(map[string]int),
	}
	
	// Ocorrências ativas
	err := s.bancoDados.QueryRow("SELECT COUNT(*) FROM ocorrencias_falhas WHERE status = 'ATIVO'").Scan(&stats.OcorrenciasAtivas)
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar ocorrências ativas: %v", err), http.StatusInternalServerError)
		return
	}
	
	// Falhas e eventos últimas 24h
	err = s.bancoDados.QueryRow(`
		SELECT COUNT(*) FROM ocorrencias_falhas o
		JOIN definicoes_falhas df ON o.definicao_id = df.id
		WHERE df.tipo = 'FALHA' AND o.timestamp_inicio >= NOW() - INTERVAL '24 hours'`).Scan(&stats.FalhasUltimas24h)
	if err != nil {
		stats.FalhasUltimas24h = 0
	}
	
	err = s.bancoDados.QueryRow(`
		SELECT COUNT(*) FROM ocorrencias_falhas o
		JOIN definicoes_falhas df ON o.definicao_id = df.id
		WHERE df.tipo = 'EVENTO' AND o.timestamp_inicio >= NOW() - INTERVAL '24 hours'`).Scan(&stats.EventosUltimas24h)
	if err != nil {
		stats.EventosUltimas24h = 0
	}
	
	// Total de ocorrências
	err = s.bancoDados.QueryRow("SELECT COUNT(*) FROM ocorrencias_falhas").Scan(&stats.TotalOcorrencias)
	if err != nil {
		stats.TotalOcorrencias = 0
	}
	
	// Por setor
	rows, err := s.bancoDados.Query(`
		SELECT s.nome, COUNT(o.id)
		FROM ocorrencias_falhas o
		JOIN definicoes_falhas df ON o.definicao_id = df.id
		JOIN setores s ON df.setor_id = s.id
		WHERE o.status = 'ATIVO'
		GROUP BY s.nome`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var setor string
			var count int
			if rows.Scan(&setor, &count) == nil {
				stats.PorSetor[setor] = count
			}
		}
	}
	
	// Por prioridade
	rows, err = s.bancoDados.Query(`
		SELECT df.prioridade, COUNT(o.id)
		FROM ocorrencias_falhas o
		JOIN definicoes_falhas df ON o.definicao_id = df.id
		WHERE o.status = 'ATIVO'
		GROUP BY df.prioridade`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var prioridade string
			var count int
			if rows.Scan(&prioridade, &count) == nil {
				stats.PorPrioridade[prioridade] = count
			}
		}
	}
	
	// Top falhas frequentes (últimos 7 dias)
	rows, err = s.bancoDados.Query(`
		SELECT df.codigo, df.descricao, s.nome, COUNT(o.id) as freq
		FROM ocorrencias_falhas o
		JOIN definicoes_falhas df ON o.definicao_id = df.id
		JOIN setores s ON df.setor_id = s.id
		WHERE o.timestamp_inicio >= NOW() - INTERVAL '7 days'
		GROUP BY df.codigo, df.descricao, s.nome
		ORDER BY freq DESC
		LIMIT 10`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var falha FalhaFrequente
			if rows.Scan(&falha.Codigo, &falha.Descricao, &falha.SetorNome, &falha.Frequencia) == nil {
				stats.TopFalhasFrequentes = append(stats.TopFalhasFrequentes, falha)
			}
		}
	}
	
	// Tempo médio de resolução (em horas)
	err = s.bancoDados.QueryRow(`
		SELECT AVG(EXTRACT(EPOCH FROM (timestamp_fim - timestamp_inicio)) / 3600)
		FROM ocorrencias_falhas
		WHERE status = 'RESOLVIDO' AND timestamp_fim IS NOT NULL`).Scan(&stats.TempoMedioResolucao)
	if err != nil {
		stats.TempoMedioResolucao = 0
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    stats,
	})
}

// obterEstatisticasPorSetor retorna estatísticas agrupadas por setor
func (s *ServidorHTTP) obterEstatisticasPorSetor(w http.ResponseWriter, r *http.Request) {
	rows, err := s.bancoDados.Query(`
		SELECT 
			s.codigo, s.nome,
			COUNT(CASE WHEN o.status = 'ATIVO' THEN 1 END) as ativas,
			COUNT(o.id) as total,
			AVG(CASE WHEN o.status = 'RESOLVIDO' AND o.timestamp_fim IS NOT NULL 
				THEN EXTRACT(EPOCH FROM (o.timestamp_fim - o.timestamp_inicio)) / 3600 END) as tempo_medio,
			MAX(o.timestamp_inicio) as ultima
		FROM setores s
		LEFT JOIN definicoes_falhas df ON s.id = df.setor_id
		LEFT JOIN ocorrencias_falhas o ON df.id = o.definicao_id
		GROUP BY s.codigo, s.nome
		ORDER BY s.nome`)
	
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar estatísticas por setor: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var estatisticas []EstatisticaPorSetor
	
	for rows.Next() {
		var est EstatisticaPorSetor
		var tempoMedio, ultima interface{}
		
		err := rows.Scan(
			&est.SetorCodigo, &est.SetorNome,
			&est.OcorrenciasAtivas, &est.TotalOcorrencias,
			&tempoMedio, &ultima)
		
		if err != nil {
			continue
		}
		
		if tempoMedio != nil {
			if tm, ok := tempoMedio.(float64); ok {
				est.TempoMedioResolucao = tm
			}
		}
		
		if ultima != nil {
			if u, ok := ultima.(string); ok {
				est.UltimaOcorrencia = &u
			}
		}
		
		estatisticas = append(estatisticas, est)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    estatisticas,
	})
}

// obterDefinicoesFalhas retorna todas as definições de falhas
func (s *ServidorHTTP) obterDefinicoesFalhas(w http.ResponseWriter, r *http.Request) {
	// Filtros opcionais
	setor := r.URL.Query().Get("setor")
	tipo := r.URL.Query().Get("tipo")
	
	baseQuery := `
		SELECT 
			df.id, df.codigo, df.tipo, df.descricao, df.prioridade,
			df.word_index, df.bit_index, df.classe_mensagem, df.ativa,
			s.codigo as setor_codigo, s.nome as setor_nome,
			e.codigo as eclusa_codigo, e.nome as eclusa_nome
		FROM definicoes_falhas df
		JOIN setores s ON df.setor_id = s.id
		JOIN eclusas e ON df.eclusa_id = e.id
		WHERE 1=1`
	
	args := []interface{}{}
	argIndex := 1
	
	if setor != "" {
		baseQuery += fmt.Sprintf(" AND s.codigo = $%d", argIndex)
		args = append(args, setor)
		argIndex++
	}
	
	if tipo != "" {
		baseQuery += fmt.Sprintf(" AND df.tipo = $%d", argIndex)
		args = append(args, tipo)
		argIndex++
	}
	
	baseQuery += " ORDER BY df.word_index, df.bit_index"
	
	rows, err := s.bancoDados.Query(baseQuery, args...)
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar definições: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var definicoes []DefinicaoFalhaAPI
	
	for rows.Next() {
		var def DefinicaoFalhaAPI
		
		err := rows.Scan(
			&def.ID, &def.Codigo, &def.Tipo, &def.Descricao, &def.Prioridade,
			&def.WordIndex, &def.BitIndex, &def.ClasseMensagem, &def.Ativa,
			&def.SetorCodigo, &def.SetorNome,
			&def.EclusaCodigo, &def.EclusaNome)
		
		if err != nil {
			continue
		}
		
		definicoes = append(definicoes, def)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    definicoes,
		"total":   len(definicoes),
	})
}

// obterSetores retorna todos os setores
func (s *ServidorHTTP) obterSetores(w http.ResponseWriter, r *http.Request) {
	rows, err := s.bancoDados.Query("SELECT id, codigo, nome, cor_tema FROM setores ORDER BY nome")
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar setores: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var setores []Setor
	
	for rows.Next() {
		var setor Setor
		var corTema interface{}
		
		err := rows.Scan(&setor.ID, &setor.Codigo, &setor.Nome, &corTema)
		if err != nil {
			continue
		}
		
		if corTema != nil {
			if cor, ok := corTema.(string); ok {
				setor.CorTema = cor
			}
		}
		
		setores = append(setores, setor)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    setores,
	})
}

// obterEclusas retorna todas as eclusas
func (s *ServidorHTTP) obterEclusas(w http.ResponseWriter, r *http.Request) {
	rows, err := s.bancoDados.Query("SELECT id, codigo, nome, localizacao, ativa FROM eclusas ORDER BY nome")
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar eclusas: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var eclusas []Eclusa
	
	for rows.Next() {
		var eclusa Eclusa
		var localizacao interface{}
		
		err := rows.Scan(&eclusa.ID, &eclusa.Codigo, &eclusa.Nome, &localizacao, &eclusa.Ativa)
		if err != nil {
			continue
		}
		
		if localizacao != nil {
			if loc, ok := localizacao.(string); ok {
				eclusa.Localizacao = loc
			}
		}
		
		eclusas = append(eclusas, eclusa)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    eclusas,
	})
}

// resolverOcorrencia resolve manualmente uma ocorrência
func (s *ServidorHTTP) resolverOcorrencia(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}
	
	// Atualizar ocorrência
	result, err := s.bancoDados.Exec(`
		UPDATE ocorrencias_falhas 
		SET status = 'RESOLVIDO', timestamp_fim = NOW(), resolvido_por = 'USUARIO_MANUAL'
		WHERE id = $1 AND status = 'ATIVO'`, id)
	
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao resolver ocorrência: %v", err), http.StatusInternalServerError)
		return
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, "Erro ao verificar resultado", http.StatusInternalServerError)
		return
	}
	
	if rowsAffected == 0 {
		http.Error(w, "Ocorrência não encontrada ou já resolvida", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Ocorrência resolvida com sucesso",
	})
}