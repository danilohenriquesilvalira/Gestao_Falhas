package modelos

import "time"

// SetorEclusa representa os setores do sistema de eclusa
type SetorEclusa string

const (
	SetorEnchimento     SetorEclusa = "ENCHIMENTO"
	SetorEsvaziamento   SetorEclusa = "ESVAZIAMENTO"
	SetorPortaJusante   SetorEclusa = "PORTA_JUSANTE"
	SetorPortaMontante  SetorEclusa = "PORTA_MONTANTE"
	SetorComandoGeral   SetorEclusa = "COMANDO_GERAL"
	SetorSistemaDrenagem SetorEclusa = "SISTEMA_DRENAGEM"
)

// TipoRegistro indica se é falha ou evento
type TipoRegistro string

const (
	TipoFalhaCritica     TipoRegistro = "FALHA_CRITICA"
	TipoFalhaOperacional TipoRegistro = "FALHA_OPERACIONAL"
	TipoEventoSistema    TipoRegistro = "EVENTO_SISTEMA"
	TipoAlarmeProcesso   TipoRegistro = "ALARME_PROCESSO"
)

// DefinicaoFalha representa uma definição de falha/evento do banco de dados
type DefinicaoFalha struct {
	ID             int    `json:"id"`
	EclusaID       int    `json:"eclusa_id"`
	SetorID        int    `json:"setor_id"`
	Codigo         string `json:"codigo"`
	Tipo           string `json:"tipo"`
	Descricao      string `json:"descricao"`
	Prioridade     string `json:"prioridade"`
	PointIndex     int    `json:"point_index"`
	WordIndex      int    `json:"word_index"`
	BitIndex       int    `json:"bit_index"`
	ClasseMensagem string `json:"classe_mensagem"`
	Ativa          bool   `json:"ativa"`
	
	// Campos adicionais para mapeamento
	SetorCodigo   string `json:"setor_codigo"`
	SetorNome     string `json:"setor_nome"`
	EclusaCodigo  string `json:"eclusa_codigo"`
}

// RegistroFalha representa uma falha ou evento capturado do PLC
type RegistroFalha struct {
	ID              string       `json:"id"`
	Setor           SetorEclusa  `json:"setor"`
	Tipo            TipoRegistro `json:"tipo"`
	Descricao       string       `json:"descricao"`
	IndiceBit       int          `json:"indice_bit"`       // Posição do bit na WORD
	EnderecoWord    int          `json:"endereco_word"`    // Endereço da WORD no PLC
	Ativo           bool         `json:"ativo"`
	DataHora        time.Time    `json:"data_hora"`
	DuracaoSegundos int64        `json:"duracao_segundos"` // Duração em segundos (se desativado)
}