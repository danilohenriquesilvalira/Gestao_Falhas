package modelos

import "time"

// DadosWord representa os dados de uma WORD recebida do PLC
type DadosWord struct {
	Endereco      int          `json:"endereco"`       // Endereço da WORD no PLC
	Valor         uint16       `json:"valor"`          // Valor da WORD (16 bits)
	DataHora      time.Time    `json:"data_hora"`      // Quando foi lida
	Setor         SetorEclusa  `json:"setor"`          // Setor associado
	TipoWord      TipoRegistro `json:"tipo_word"`      // Se é WORD de falhas ou eventos
}

// MudancaBit representa uma mudança de estado de um bit
type MudancaBit struct {
	EnderecoWord int       `json:"endereco_word"`
	IndiceBit    int       `json:"indice_bit"`
	ValorAntigo  bool      `json:"valor_antigo"`
	ValorNovo    bool      `json:"valor_novo"`
	DataHora     time.Time `json:"data_hora"`
	Setor        string    `json:"setor"`        // Agora é string para flexibilidade
	Tipo         string    `json:"tipo"`         // Agora é string para código da falha
}

// MensagemPLC representa uma mensagem completa recebida do PLC
type MensagemPLC struct {
	Words    []DadosWord `json:"words"`
	DataHora time.Time   `json:"data_hora"`
	IdPLC    string      `json:"id_plc"`
}

// TagEclusa representa um tag mapeado da eclusa
type TagEclusa struct {
	Nome            string       `json:"nome"`
	Descricao       string       `json:"descricao"`
	EnderecoWord    int          `json:"endereco_word"`
	IndiceBit       int          `json:"indice_bit"`
	Setor           SetorEclusa  `json:"setor"`
	TipoTag         TipoRegistro `json:"tipo_tag"`
	Ativo           bool         `json:"ativo"`
	UltimaAlteracao time.Time    `json:"ultima_alteracao"`
}