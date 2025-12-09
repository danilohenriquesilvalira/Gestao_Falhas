package config

import (
	"os"
	"time"
)

// Configuracoes armazena todas as configurações do sistema
type Configuracoes struct {
	// Servidor TCP
	ServidorTCP_Host string
	ServidorTCP_Porta string

	// PLC
	PLC_Host    string
	PLC_Porta    string
	PLC_Timeout time.Duration

	// Logs
	Log_Nivel string
	Log_Arquivo  string

	// Banco de Dados
	DB_Host     string
	DB_Porta     string
	DB_Nome     string
	DB_Usuario     string
	DB_Senha string
}

// CarregarConfiguracoes carrega as configurações das variáveis de ambiente
func CarregarConfiguracoes() *Configuracoes {
	return &Configuracoes{
		// Servidor TCP
		ServidorTCP_Host: obterVariavelAmbiente("TCP_HOST", "0.0.0.0"),
		ServidorTCP_Porta: obterVariavelAmbiente("TCP_PORT", "8502"),

		// PLC
		PLC_Host:    obterVariavelAmbiente("PLC_IP", "192.168.1.100"),
		PLC_Porta:    obterVariavelAmbiente("PLC_PORT", "502"),
		PLC_Timeout: obterDuracaoAmbiente("PLC_TIMEOUT", 5*time.Second),

		// Logs
		Log_Nivel: obterVariavelAmbiente("LOG_LEVEL", "info"),
		Log_Arquivo:  obterVariavelAmbiente("LOG_FILE", "./logs/falhas.log"),

		// Banco de Dados
		DB_Host:     obterVariavelAmbiente("DB_HOST", "localhost"),
		DB_Porta:     obterVariavelAmbiente("DB_PORT", "5432"),
		DB_Nome:     obterVariavelAmbiente("DB_NAME", "falhas_edp"),
		DB_Usuario:     obterVariavelAmbiente("DB_USER", "postgres"),
		DB_Senha: obterVariavelAmbiente("DB_PASSWORD", "postgres"),
	}
}

// obterVariavelAmbiente retorna o valor da variável de ambiente ou o valor padrão
func obterVariavelAmbiente(chave, valorPadrao string) string {
	if valor := os.Getenv(chave); valor != "" {
		return valor
	}
	return valorPadrao
}

// obterDuracaoAmbiente retorna a duração da variável de ambiente ou o valor padrão
func obterDuracaoAmbiente(chave string, valorPadrao time.Duration) time.Duration {
	if valor := os.Getenv(chave); valor != "" {
		if duracao, err := time.ParseDuration(valor); err == nil {
			return duracao
		}
	}
	return valorPadrao
}