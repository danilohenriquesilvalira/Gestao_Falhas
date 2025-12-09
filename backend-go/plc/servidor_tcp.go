package plc

import (
	"database/sql"
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"net"
	"sync"
	"time"

	"github.com/edp/falhas-backend/config"
	"github.com/edp/falhas-backend/modelos"
)

// ServidorTCP gerencia o servidor TCP para comunicação com PLC
type ServidorTCP struct {
	configuracoes    *config.Configuracoes
	listener         net.Listener
	clientesConectados map[string]net.Conn
	mutex           sync.RWMutex
	canalParada     chan struct{}
	grupoWait       sync.WaitGroup
	processadorDados *ProcessadorDados
}

// NovoServidorTCP cria uma nova instância do servidor TCP
func NovoServidorTCP(cfg *config.Configuracoes, db *sql.DB) *ServidorTCP {
	// Criar mapeamento com banco de dados
	mapeamento := NovoMapeamentoTags(db)
	
	return &ServidorTCP{
		configuracoes:      cfg,
		clientesConectados: make(map[string]net.Conn),
		canalParada:        make(chan struct{}),
		processadorDados:   NovoProcessadorDados(mapeamento, db),
	}
}

// Iniciar inicia o servidor TCP
func (s *ServidorTCP) Iniciar() error {
	endereco := fmt.Sprintf("%s:%s", s.configuracoes.ServidorTCP_Host, s.configuracoes.ServidorTCP_Porta)

	listener, err := net.Listen("tcp", endereco)
	if err != nil {
		return fmt.Errorf("erro ao iniciar listener TCP: %w", err)
	}

	s.listener = listener
	log.Printf("✅ Servidor TCP iniciado em %s", endereco)

	for {
		select {
		case <-s.canalParada:
			return nil
		default:
			conn, err := s.listener.Accept()
			if err != nil {
				select {
				case <-s.canalParada:
					return nil
				default:
					log.Printf("❌ Erro ao aceitar conexão: %v", err)
					continue
				}
			}

			s.grupoWait.Add(1)
			go s.gerenciarConexao(conn)
		}
	}
}

// Parar encerra o servidor gracefully
func (s *ServidorTCP) Parar() {
	close(s.canalParada)

	if s.listener != nil {
		s.listener.Close()
	}

	s.mutex.Lock()
	for endereco, conn := range s.clientesConectados {
		log.Printf("🔌 Fechando conexão com %s", endereco)
		conn.Close()
	}
	s.clientesConectados = make(map[string]net.Conn)
	s.mutex.Unlock()

	s.grupoWait.Wait()
}

// gerenciarConexao gerencia uma conexão individual do PLC
func (s *ServidorTCP) gerenciarConexao(conn net.Conn) {
	defer s.grupoWait.Done()
	defer conn.Close()

	enderecoCliente := conn.RemoteAddr().String()
	log.Printf("🔗 Nova conexão do PLC: %s", enderecoCliente)

	s.mutex.Lock()
	s.clientesConectados[enderecoCliente] = conn
	s.mutex.Unlock()

	defer func() {
		s.mutex.Lock()
		delete(s.clientesConectados, enderecoCliente)
		s.mutex.Unlock()
		log.Printf("❌ Conexão encerrada: %s", enderecoCliente)
	}()

	// Buffer para leitura
	buffer := make([]byte, 4096)

	for {
		select {
		case <-s.canalParada:
			return
		default:
			// Timeout de leitura
			conn.SetReadDeadline(time.Now().Add(s.configuracoes.PLC_Timeout))

			n, err := conn.Read(buffer)
			if err != nil {
				if err != io.EOF {
					if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
						// Timeout - continua esperando
						continue
					}
					log.Printf("⚠️  Erro ao ler dados de %s: %v", enderecoCliente, err)
				}
				return
			}

			if n > 0 {
				// Processar dados recebidos
				s.processarDadosPLC(buffer[:n], enderecoCliente)
			}
		}
	}
}

// processarDadosPLC processa os dados recebidos do PLC
func (s *ServidorTCP) processarDadosPLC(dados []byte, enderecoCliente string) {
	timestamp := time.Now()

	log.Printf("📥 Recebidos %d bytes de %s", len(dados), enderecoCliente)

	// Cada WORD tem 2 bytes (16 bits)
	numeroWords := len(dados) / 2

	var words []modelos.DadosWord

	for i := 0; i < numeroWords; i++ {
		offset := i * 2
		if offset+1 < len(dados) {
			// Ler WORD (16 bits) em Big Endian
			valorWord := binary.BigEndian.Uint16(dados[offset : offset+2])

			word := modelos.DadosWord{
				Endereco: i,
				Valor:    valorWord,
				DataHora: timestamp,
			}

			words = append(words, word)

			// Log detalhado
			log.Printf("  WORD[%02d] = 0x%04X (%016b) | Decimal: %d",
				i, valorWord, valorWord, valorWord)
		}
	}

	// Processar WORDs e detectar bits ativos
	mudancas := s.processadorDados.ProcessarWords(words)

	if len(mudancas) > 0 {
		log.Printf("🔔 Detectadas %d mudanças de bits:", len(mudancas))
		for _, mudanca := range mudancas {
			log.Printf("   Bit %d da WORD %d: %v -> %v [%s]",
				mudanca.IndiceBit, mudanca.EnderecoWord,
				mudanca.ValorAntigo, mudanca.ValorNovo, mudanca.Setor)
		}
	}
}