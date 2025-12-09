package modelos

import "time"

// RegistroEvento representa um evento do sistema
type RegistroEvento struct {
	ID              string       `json:"id"`
	Setor           SetorEclusa  `json:"setor"`
	TipoEvento      TipoRegistro `json:"tipo_evento"`
	Descricao       string       `json:"descricao"`
	IndiceBit       int          `json:"indice_bit"`
	EnderecoWord    int          `json:"endereco_word"`
	Ativo           bool         `json:"ativo"`
	DataHora        time.Time    `json:"data_hora"`
	DuracaoSegundos int64        `json:"duracao_segundos"`
}

// EstadoEclusa representa o estado atual da eclusa
type EstadoEclusa struct {
	EnchimentoAtivo     bool      `json:"enchimento_ativo"`
	EsvaziamentoAtivo   bool      `json:"esvaziamento_ativo"`
	PortaJusanteAberta  bool      `json:"porta_jusante_aberta"`
	PortaMontanteAberta bool      `json:"porta_montante_aberta"`
	NivelAgua           float64   `json:"nivel_agua"`
	UltimaAtualizacao   time.Time `json:"ultima_atualizacao"`
}