package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

// ServidorHTTP gerencia a API REST para o front-end
type ServidorHTTP struct {
	bancoDados *sql.DB
	router     *mux.Router
}

// OcorrenciaCompleta representa uma ocorrência com todas as informações para o front-end
type OcorrenciaCompleta struct {
	ID             int64     `json:"id"`
	Status         string    `json:"status"`
	TimestampInicio time.Time `json:"timestamp_inicio"`
	TimestampFim   *time.Time `json:"timestamp_fim,omitempty"`
	
	// Dados da Definição de Falha
	DefinicaoID    int    `json:"definicao_id"`
	Codigo         string `json:"codigo"`
	Tipo           string `json:"tipo"`
	Descricao      string `json:"descricao"`
	Prioridade     string `json:"prioridade"`
	WordIndex      int    `json:"word_index"`
	BitIndex       int    `json:"bit_index"`
	ClasseMensagem string `json:"classe_mensagem"`
	
	// Dados do Setor
	SetorCodigo string `json:"setor_codigo"`
	SetorNome   string `json:"setor_nome"`
	
	// Dados da Eclusa
	EclusaCodigo string `json:"eclusa_codigo"`
	EclusaNome   string `json:"eclusa_nome"`
	
	// Dados calculados
	DuracaoSegundos *int64 `json:"duracao_segundos,omitempty"`
}

// NovoServidorHTTP cria uma nova instância do servidor HTTP
func NovoServidorHTTP(db *sql.DB) *ServidorHTTP {
	s := &ServidorHTTP{
		bancoDados: db,
		router:     mux.NewRouter(),
	}
	
	s.configurarRotas()
	return s
}

// configurarRotas configura todas as rotas da API
func (s *ServidorHTTP) configurarRotas() {
	api := s.router.PathPrefix("/api/v1").Subrouter()
	
	// Middleware CORS
	api.Use(s.middlewareCORS)
	
	// Rotas de ocorrências
	api.HandleFunc("/ocorrencias/ativas", s.obterOcorrenciasAtivas).Methods("GET")
	api.HandleFunc("/ocorrencias/historico", s.obterHistoricoOcorrencias).Methods("GET")
	api.HandleFunc("/ocorrencias/{id}/resolver", s.resolverOcorrencia).Methods("POST")
	
	// Rotas de estatísticas
	api.HandleFunc("/estatisticas/dashboard", s.obterEstatisticasDashboard).Methods("GET")
	api.HandleFunc("/estatisticas/por-setor", s.obterEstatisticasPorSetor).Methods("GET")
	
	// Rotas de definições
	api.HandleFunc("/definicoes/falhas", s.obterDefinicoesFalhas).Methods("GET")
	api.HandleFunc("/setores", s.obterSetores).Methods("GET")
	api.HandleFunc("/eclusas", s.obterEclusas).Methods("GET")
	
	// Rota de saúde
	api.HandleFunc("/health", s.verificarSaude).Methods("GET")
}

// middlewareCORS adiciona headers CORS
func (s *ServidorHTTP) middlewareCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

// obterOcorrenciasAtivas retorna todas as ocorrências ativas com informações completas
func (s *ServidorHTTP) obterOcorrenciasAtivas(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			o.id, o.status, o.timestamp_inicio, o.timestamp_fim,
			df.id as definicao_id, df.codigo, df.tipo, df.descricao, df.prioridade,
			df.word_index, df.bit_index, df.classe_mensagem,
			s.codigo as setor_codigo, s.nome as setor_nome,
			e.codigo as eclusa_codigo, e.nome as eclusa_nome
		FROM ocorrencias_falhas o
		JOIN definicoes_falhas df ON o.definicao_id = df.id
		JOIN setores s ON df.setor_id = s.id
		JOIN eclusas e ON df.eclusa_id = e.id
		WHERE o.status = 'ATIVO'
		ORDER BY o.timestamp_inicio DESC`
	
	rows, err := s.bancoDados.Query(query)
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar ocorrências: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var ocorrencias []OcorrenciaCompleta
	
	for rows.Next() {
		var oc OcorrenciaCompleta
		var timestampFim sql.NullTime
		
		err := rows.Scan(
			&oc.ID, &oc.Status, &oc.TimestampInicio, &timestampFim,
			&oc.DefinicaoID, &oc.Codigo, &oc.Tipo, &oc.Descricao, &oc.Prioridade,
			&oc.WordIndex, &oc.BitIndex, &oc.ClasseMensagem,
			&oc.SetorCodigo, &oc.SetorNome,
			&oc.EclusaCodigo, &oc.EclusaNome)
		
		if err != nil {
			log.Printf("Erro ao ler linha: %v", err)
			continue
		}
		
		if timestampFim.Valid {
			oc.TimestampFim = &timestampFim.Time
		}
		
		ocorrencias = append(ocorrencias, oc)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    ocorrencias,
		"total":   len(ocorrencias),
	})
}

// obterHistoricoOcorrencias retorna histórico com filtros
func (s *ServidorHTTP) obterHistoricoOcorrencias(w http.ResponseWriter, r *http.Request) {
	// Parâmetros de filtro
	limite := r.URL.Query().Get("limite")
	if limite == "" {
		limite = "100"
	}
	
	setor := r.URL.Query().Get("setor")
	tipo := r.URL.Query().Get("tipo")
	status := r.URL.Query().Get("status")
	
	// Construir query com filtros
	baseQuery := `
		SELECT 
			o.id, o.status, o.timestamp_inicio, o.timestamp_fim,
			df.id as definicao_id, df.codigo, df.tipo, df.descricao, df.prioridade,
			df.word_index, df.bit_index, df.classe_mensagem,
			s.codigo as setor_codigo, s.nome as setor_nome,
			e.codigo as eclusa_codigo, e.nome as eclusa_nome,
			CASE 
				WHEN o.timestamp_fim IS NOT NULL THEN 
					EXTRACT(EPOCH FROM (o.timestamp_fim - o.timestamp_inicio))
				ELSE 
					EXTRACT(EPOCH FROM (NOW() - o.timestamp_inicio))
			END as duracao_segundos
		FROM ocorrencias_falhas o
		JOIN definicoes_falhas df ON o.definicao_id = df.id
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
	
	if status != "" {
		baseQuery += fmt.Sprintf(" AND o.status = $%d", argIndex)
		args = append(args, status)
		argIndex++
	}
	
	baseQuery += fmt.Sprintf(" ORDER BY o.timestamp_inicio DESC LIMIT $%d", argIndex)
	limiteInt, _ := strconv.Atoi(limite)
	args = append(args, limiteInt)
	
	rows, err := s.bancoDados.Query(baseQuery, args...)
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar histórico: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var ocorrencias []OcorrenciaCompleta
	
	for rows.Next() {
		var oc OcorrenciaCompleta
		var timestampFim sql.NullTime
		var duracaoSegundos sql.NullFloat64
		
		err := rows.Scan(
			&oc.ID, &oc.Status, &oc.TimestampInicio, &timestampFim,
			&oc.DefinicaoID, &oc.Codigo, &oc.Tipo, &oc.Descricao, &oc.Prioridade,
			&oc.WordIndex, &oc.BitIndex, &oc.ClasseMensagem,
			&oc.SetorCodigo, &oc.SetorNome,
			&oc.EclusaCodigo, &oc.EclusaNome,
			&duracaoSegundos)
		
		if err != nil {
			log.Printf("Erro ao ler linha: %v", err)
			continue
		}
		
		if timestampFim.Valid {
			oc.TimestampFim = &timestampFim.Time
		}
		
		if duracaoSegundos.Valid {
			duracao := int64(duracaoSegundos.Float64)
			oc.DuracaoSegundos = &duracao
		}
		
		ocorrencias = append(ocorrencias, oc)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    ocorrencias,
		"total":   len(ocorrencias),
		"filtros": map[string]string{
			"setor":  setor,
			"tipo":   tipo,
			"status": status,
			"limite": limite,
		},
	})
}

// verificarSaude verifica se a API está funcionando
func (s *ServidorHTTP) verificarSaude(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "OK",
		"timestamp": time.Now(),
		"servico":   "API Falhas EDP",
	})
}

// Iniciar inicia o servidor HTTP
func (s *ServidorHTTP) Iniciar(porta string) error {
	log.Printf("🌐 Servidor HTTP iniciado na porta %s", porta)
	log.Printf("📖 Documentação da API disponível em: http://localhost%s/api/v1/health", porta)
	return http.ListenAndServe(porta, s.router)
}