package plc

import (
	"database/sql"
	"log"
	"sync"
	"time"

	"github.com/edp/falhas-backend/modelos"
)

// ProcessadorDados processa WORDs recebidas e detecta mudanças de bits
type ProcessadorDados struct {
	wordsAnteriores map[int]uint16 // Armazena estado anterior das WORDs
	mutex          sync.RWMutex
	mapeamento     *MapeamentoTags // Mapeamento de falhas
	bancoDados     *sql.DB         // Conexão com banco de dados
}

// NovoProcessadorDados cria um novo processador de dados
func NovoProcessadorDados(mapeamento *MapeamentoTags, db *sql.DB) *ProcessadorDados {
	return &ProcessadorDados{
		wordsAnteriores: make(map[int]uint16),
		mapeamento:     mapeamento,
		bancoDados:     db,
	}
}

// ProcessarWords processa uma lista de WORDs e detecta mudanças de bits
func (p *ProcessadorDados) ProcessarWords(words []modelos.DadosWord) []modelos.MudancaBit {
	p.mutex.Lock()
	defer p.mutex.Unlock()

	var mudancas []modelos.MudancaBit

	for _, word := range words {
		// Obter valor anterior
		valorAnterior, existe := p.wordsAnteriores[word.Endereco]

		if existe {
			// Comparar bit a bit usando XOR
			xor := valorAnterior ^ word.Valor

			if xor != 0 {
				// Houve mudança em algum bit
				for indiceBit := 0; indiceBit < 16; indiceBit++ {
					mascaraBit := uint16(1 << indiceBit)

					if xor&mascaraBit != 0 {
						// Este bit mudou
						bitAntigo := (valorAnterior & mascaraBit) != 0
						bitNovo := (word.Valor & mascaraBit) != 0

						// Buscar definição da falha no mapeamento
						setorNome := "DESCONHECIDO"
						descricaoFalha := "Bit não mapeado"
						codigoFalha := ""
						
						if p.mapeamento != nil {
							if falha, existe := p.mapeamento.ObterFalha(word.Endereco, indiceBit); existe {
								setorNome = falha.SetorNome
								descricaoFalha = falha.Descricao
								codigoFalha = falha.Codigo
							}
						}

						mudanca := modelos.MudancaBit{
							EnderecoWord: word.Endereco,
							IndiceBit:    indiceBit,
							ValorAntigo:  bitAntigo,
							ValorNovo:    bitNovo,
							DataHora:     word.DataHora,
							Setor:        setorNome,    // string agora
							Tipo:         codigoFalha,  // string agora
						}

						mudancas = append(mudancas, mudanca)

						// Log da mudança
						estado := "DESATIVADO"
						if bitNovo {
							estado = "ATIVADO"
						}
						log.Printf("🔄 %s | WORD[%d] Bit[%d]: %s | %s", 
							setorNome, word.Endereco, indiceBit, estado, descricaoFalha)
						
						// REGISTRAR OCORRÊNCIA NO BANCO DE DADOS
						if p.mapeamento != nil && p.bancoDados != nil {
							if falha, existe := p.mapeamento.ObterFalha(word.Endereco, indiceBit); existe {
								if bitNovo {
									// Bit = 1: REGISTRAR nova ocorrência ATIVA
									p.registrarOcorrenciaAtiva(falha.ID)
								} else {
									// Bit = 0: RESOLVER ocorrência existente
									p.resolverOcorrenciaAtiva(falha.ID)
								}
							}
						}
					}
				}
			}
		} else {
			// Primeira leitura desta WORD
			log.Printf("📋 Primeira leitura da WORD %d: 0x%04X", word.Endereco, word.Valor)

			// Registrar bits ativos na primeira leitura
			for indiceBit := 0; indiceBit < 16; indiceBit++ {
				mascaraBit := uint16(1 << indiceBit)
				if word.Valor&mascaraBit != 0 {
					// Buscar definição da falha no mapeamento para primeira leitura
					setorNome := "DESCONHECIDO"
					codigoFalha := ""
					
					if p.mapeamento != nil {
						if falha, existe := p.mapeamento.ObterFalha(word.Endereco, indiceBit); existe {
							setorNome = falha.SetorNome
							codigoFalha = falha.Codigo
						}
					}
					
					mudanca := modelos.MudancaBit{
						EnderecoWord: word.Endereco,
						IndiceBit:    indiceBit,
						ValorAntigo:  false,
						ValorNovo:    true,
						DataHora:     word.DataHora,
						Setor:        setorNome,
						Tipo:         codigoFalha,
					}
					mudancas = append(mudancas, mudanca)
					
					// REGISTRAR OCORRÊNCIA INICIAL (bit já ativo)
					if p.mapeamento != nil && p.bancoDados != nil {
						if falha, existe := p.mapeamento.ObterFalha(word.Endereco, indiceBit); existe {
							p.registrarOcorrenciaAtiva(falha.ID)
						}
					}
				}
			}
		}

		// Atualizar valor anterior
		p.wordsAnteriores[word.Endereco] = word.Valor
	}

	return mudancas
}

// ObterBit retorna o valor de um bit específico de uma WORD
func ObterBit(word uint16, indiceBit int) bool {
	if indiceBit < 0 || indiceBit >= 16 {
		return false
	}
	return (word & (1 << indiceBit)) != 0
}

// DefinirBit define o valor de um bit específico de uma WORD
func DefinirBit(word uint16, indiceBit int, valor bool) uint16 {
	if indiceBit < 0 || indiceBit >= 16 {
		return word
	}

	if valor {
		return word | (1 << indiceBit)
	}
	return word &^ (1 << indiceBit)
}

// ContarBitsAtivos conta quantos bits estão ativos (=1) em uma WORD
func ContarBitsAtivos(word uint16) int {
	contador := 0
	for i := 0; i < 16; i++ {
		if word&(1<<i) != 0 {
			contador++
		}
	}
	return contador
}

// ObterEstadoWord retorna o estado completo de uma WORD como slice de bools
func ObterEstadoWord(word uint16) []bool {
	estado := make([]bool, 16)
	for i := 0; i < 16; i++ {
		estado[i] = (word & (1 << i)) != 0
	}
	return estado
}

// registrarOcorrenciaAtiva registra uma nova ocorrência ativa no banco de dados
func (p *ProcessadorDados) registrarOcorrenciaAtiva(definicaoID int) {
	// Verificar se já existe ocorrência ativa para esta definição
	var ocorrenciaExistente int
	err := p.bancoDados.QueryRow(`
		SELECT COUNT(*) FROM ocorrencias_falhas 
		WHERE definicao_id = $1 AND status = 'ATIVO'`, 
		definicaoID).Scan(&ocorrenciaExistente)
	
	if err != nil {
		log.Printf("❌ Erro ao verificar ocorrência existente para definição %d: %v", definicaoID, err)
		return
	}
	
	// Se já existe ocorrência ativa, não criar nova
	if ocorrenciaExistente > 0 {
		log.Printf("⚠️ Ocorrência já ativa para definição %d", definicaoID)
		return
	}
	
	// Registrar nova ocorrência
	_, err = p.bancoDados.Exec(`
		INSERT INTO ocorrencias_falhas 
		(definicao_id, status, timestamp_inicio) 
		VALUES ($1, 'ATIVO', $2)`,
		definicaoID, time.Now())
	
	if err != nil {
		log.Printf("❌ Erro ao registrar ocorrência para definição %d: %v", definicaoID, err)
		return
	}
	
	log.Printf("🔴 NOVA OCORRÊNCIA REGISTRADA: Definição ID %d", definicaoID)
}

// resolverOcorrenciaAtiva resolve uma ocorrência ativa no banco de dados
func (p *ProcessadorDados) resolverOcorrenciaAtiva(definicaoID int) {
	// Atualizar ocorrências ativas para resolvidas
	result, err := p.bancoDados.Exec(`
		UPDATE ocorrencias_falhas 
		SET status = 'RESOLVIDO', timestamp_fim = $1 
		WHERE definicao_id = $2 AND status = 'ATIVO'`,
		time.Now(), definicaoID)
	
	if err != nil {
		log.Printf("❌ Erro ao resolver ocorrência para definição %d: %v", definicaoID, err)
		return
	}
	
	// Verificar se alguma linha foi afetada
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("❌ Erro ao verificar linhas afetadas: %v", err)
		return
	}
	
	if rowsAffected > 0 {
		log.Printf("🟢 OCORRÊNCIA RESOLVIDA: Definição ID %d (%d registros atualizados)", definicaoID, rowsAffected)
	}
}