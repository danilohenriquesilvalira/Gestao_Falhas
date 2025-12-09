package plc

import (
	"database/sql"
	"fmt"
	"log"
	
	"github.com/edp/falhas-backend/modelos"
)

// MapeamentoTags gerencia o mapeamento entre endereços PLC e falhas do banco de dados
type MapeamentoTags struct {
	falhasPorWord  map[int]map[int]modelos.DefinicaoFalha // [word_index][bit_index] = falha
	bancoDados     *sql.DB
}

// NovoMapeamentoTags cria uma nova instância do mapeamento
func NovoMapeamentoTags(db *sql.DB) *MapeamentoTags {
	mapeamento := &MapeamentoTags{
		falhasPorWord: make(map[int]map[int]modelos.DefinicaoFalha),
		bancoDados:    db,
	}
	
	// Carregar mapeamento do banco de dados
	err := mapeamento.carregarMapeamentoBanco()
	if err != nil {
		log.Printf("⚠️ Erro ao carregar mapeamento do banco: %v", err)
		// Fallback para mapeamento padrão se houver erro
		mapeamento.configurarMapeamentoPadrao()
	}
	
	return mapeamento
}

// carregarMapeamentoBanco carrega o mapeamento das falhas do banco de dados
func (m *MapeamentoTags) carregarMapeamentoBanco() error {
	query := `
		SELECT 
			df.id, df.codigo, df.tipo, df.descricao, df.prioridade, 
			df.point_index, df.word_index, df.bit_index, df.classe_mensagem,
			s.codigo as setor_codigo, s.nome as setor_nome,
			e.codigo as eclusa_codigo
		FROM definicoes_falhas df
		JOIN setores s ON df.setor_id = s.id
		JOIN eclusas e ON df.eclusa_id = e.id
		WHERE df.ativa = true 
		AND df.word_index IS NOT NULL 
		AND df.bit_index IS NOT NULL
		ORDER BY df.word_index, df.bit_index`
	
	rows, err := m.bancoDados.Query(query)
	if err != nil {
		return fmt.Errorf("erro ao buscar definições do banco: %v", err)
	}
	defer rows.Close()
	
	contador := 0
	for rows.Next() {
		var falha modelos.DefinicaoFalha
		var setorCodigo, setorNome, eclusaCodigo string
		
		err := rows.Scan(
			&falha.ID, &falha.Codigo, &falha.Tipo, &falha.Descricao, &falha.Prioridade,
			&falha.PointIndex, &falha.WordIndex, &falha.BitIndex, &falha.ClasseMensagem,
			&setorCodigo, &setorNome, &eclusaCodigo)
		
		if err != nil {
			log.Printf("❌ Erro ao ler linha do banco: %v", err)
			continue
		}
		
		// Configurar informações do setor
		falha.SetorCodigo = setorCodigo
		falha.SetorNome = setorNome
		falha.EclusaCodigo = eclusaCodigo
		
		// Adicionar ao mapeamento
		m.adicionarFalha(falha.WordIndex, falha.BitIndex, falha)
		contador++
	}
	
	log.Printf("✅ Carregadas %d definições de falhas/eventos do banco", contador)
	return nil
}

// configurarMapeamentoPadrao define o mapeamento padrão das tags
func (m *MapeamentoTags) configurarMapeamentoPadrao() {
	// WORD 0 - ENCHIMENTO
	m.adicionarTag(0, 0, modelos.TagEclusa{
		Nome:         "ENCHIMENTO_VALVULA_01",
		Descricao:    "Válvula de enchimento principal",
		EnderecoWord: 0,
		IndiceBit:    0,
		Setor:        modelos.SetorEnchimento,
		TipoTag:      modelos.TipoEventoSistema,
	})
	
	m.adicionarTag(0, 1, modelos.TagEclusa{
		Nome:         "ENCHIMENTO_SENSOR_NIVEL",
		Descricao:    "Sensor de nível do enchimento",
		EnderecoWord: 0,
		IndiceBit:    1,
		Setor:        modelos.SetorEnchimento,
		TipoTag:      modelos.TipoEventoSistema,
	})

	// WORD 1 - ESVAZIAMENTO
	m.adicionarTag(1, 0, modelos.TagEclusa{
		Nome:         "ESVAZIAMENTO_VALVULA_01",
		Descricao:    "Válvula de esvaziamento principal",
		EnderecoWord: 1,
		IndiceBit:    0,
		Setor:        modelos.SetorEsvaziamento,
		TipoTag:      modelos.TipoEventoSistema,
	})

	// WORD 2 - PORTA JUSANTE
	m.adicionarTag(2, 0, modelos.TagEclusa{
		Nome:         "PORTA_JUSANTE_ABERTA",
		Descricao:    "Sensor porta jusante aberta",
		EnderecoWord: 2,
		IndiceBit:    0,
		Setor:        modelos.SetorPortaJusante,
		TipoTag:      modelos.TipoEventoSistema,
	})
	
	m.adicionarTag(2, 1, modelos.TagEclusa{
		Nome:         "PORTA_JUSANTE_FECHADA",
		Descricao:    "Sensor porta jusante fechada",
		EnderecoWord: 2,
		IndiceBit:    1,
		Setor:        modelos.SetorPortaJusante,
		TipoTag:      modelos.TipoEventoSistema,
	})

	// WORD 3 - PORTA MONTANTE
	m.adicionarTag(3, 0, modelos.TagEclusa{
		Nome:         "PORTA_MONTANTE_ABERTA",
		Descricao:    "Sensor porta montante aberta",
		EnderecoWord: 3,
		IndiceBit:    0,
		Setor:        modelos.SetorPortaMontante,
		TipoTag:      modelos.TipoEventoSistema,
	})

	// WORD 10 - FALHAS CRÍTICAS ENCHIMENTO
	m.adicionarTag(10, 0, modelos.TagEclusa{
		Nome:         "FALHA_VALVULA_ENCHIMENTO",
		Descricao:    "Falha na válvula de enchimento",
		EnderecoWord: 10,
		IndiceBit:    0,
		Setor:        modelos.SetorEnchimento,
		TipoTag:      modelos.TipoFalhaCritica,
	})

	// WORD 11 - FALHAS CRÍTICAS ESVAZIAMENTO
	m.adicionarTag(11, 0, modelos.TagEclusa{
		Nome:         "FALHA_VALVULA_ESVAZIAMENTO",
		Descricao:    "Falha na válvula de esvaziamento",
		EnderecoWord: 11,
		IndiceBit:    0,
		Setor:        modelos.SetorEsvaziamento,
		TipoTag:      modelos.TipoFalhaCritica,
	})
}

// adicionarFalha adiciona uma falha ao mapeamento
func (m *MapeamentoTags) adicionarFalha(wordIndex, bitIndex int, falha modelos.DefinicaoFalha) {
	if m.falhasPorWord[wordIndex] == nil {
		m.falhasPorWord[wordIndex] = make(map[int]modelos.DefinicaoFalha)
	}
	m.falhasPorWord[wordIndex][bitIndex] = falha
}

// adicionarTag adiciona uma tag ao mapeamento (para compatibilidade)
func (m *MapeamentoTags) adicionarTag(enderecoWord, indiceBit int, tag modelos.TagEclusa) {
	// Esta função será removida após migração completa
	log.Printf("⚠️ Função adicionarTag obsoleta - usar adicionarFalha")
}

// ObterFalha retorna a falha correspondente à word e bit
func (m *MapeamentoTags) ObterFalha(wordIndex, bitIndex int) (modelos.DefinicaoFalha, bool) {
	if bits, existe := m.falhasPorWord[wordIndex]; existe {
		if falha, existe := bits[bitIndex]; existe {
			return falha, true
		}
	}
	return modelos.DefinicaoFalha{}, false
}

// ObterTag retorna a tag correspondente ao endereço e bit (para compatibilidade)
func (m *MapeamentoTags) ObterTag(enderecoWord, indiceBit int) (modelos.TagEclusa, bool) {
	// Converter para novo formato
	if falha, existe := m.ObterFalha(enderecoWord, indiceBit); existe {
		tag := modelos.TagEclusa{
			Nome:         falha.Codigo,
			Descricao:    falha.Descricao,
			EnderecoWord: falha.WordIndex,
			IndiceBit:    falha.BitIndex,
			Setor:        modelos.SetorEnchimento, // Default - será mapeado corretamente depois
			TipoTag:      modelos.TipoEventoSistema,
		}
		return tag, true
	}
	return modelos.TagEclusa{}, false
}

// ObterFalhasPorSetor retorna todas as falhas de um setor específico
func (m *MapeamentoTags) ObterFalhasPorSetor(setorCodigo string) []modelos.DefinicaoFalha {
	var falhas []modelos.DefinicaoFalha
	
	for _, bits := range m.falhasPorWord {
		for _, falha := range bits {
			if falha.SetorCodigo == setorCodigo {
				falhas = append(falhas, falha)
			}
		}
	}
	
	return falhas
}

// ObterTagsPorSetor retorna todas as tags de um setor específico (compatibilidade)
func (m *MapeamentoTags) ObterTagsPorSetor(setor modelos.SetorEclusa) []modelos.TagEclusa {
	var tags []modelos.TagEclusa
	
	// Converter para usar novo sistema
	falhas := m.ObterFalhasPorSetor(string(setor))
	for _, falha := range falhas {
		tag := modelos.TagEclusa{
			Nome:         falha.Codigo,
			Descricao:    falha.Descricao,
			EnderecoWord: falha.WordIndex,
			IndiceBit:    falha.BitIndex,
			Setor:        setor,
			TipoTag:      modelos.TipoEventoSistema,
		}
		tags = append(tags, tag)
	}
	
	return tags
}

// ObterFalhasPorTipo retorna todas as falhas de um tipo específico
func (m *MapeamentoTags) ObterFalhasPorTipo(tipo string) []modelos.DefinicaoFalha {
	var falhas []modelos.DefinicaoFalha
	
	for _, bits := range m.falhasPorWord {
		for _, falha := range bits {
			if falha.Tipo == tipo {
				falhas = append(falhas, falha)
			}
		}
	}
	
	return falhas
}

// ObterTagsPorTipo retorna todas as tags de um tipo específico (compatibilidade)
func (m *MapeamentoTags) ObterTagsPorTipo(tipo modelos.TipoRegistro) []modelos.TagEclusa {
	var tags []modelos.TagEclusa
	
	// Converter para usar novo sistema
	falhas := m.ObterFalhasPorTipo(string(tipo))
	for _, falha := range falhas {
		tag := modelos.TagEclusa{
			Nome:         falha.Codigo,
			Descricao:    falha.Descricao,
			EnderecoWord: falha.WordIndex,
			IndiceBit:    falha.BitIndex,
			Setor:        modelos.SetorEnchimento, // Default
			TipoTag:      tipo,
		}
		tags = append(tags, tag)
	}
	
	return tags
}