package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/edp/falhas-backend/api"
	"github.com/edp/falhas-backend/config"
	"github.com/edp/falhas-backend/database"
	"github.com/edp/falhas-backend/plc"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: arquivo .env não encontrado, usando variáveis do sistema")
	}

	// SEMPRE criar/verificar banco de dados ao iniciar
	fmt.Println("🔧 Verificando e criando banco de dados...")
	err := database.CriarBancoCompleto()
	if err != nil {
		log.Fatalf("❌ Erro ao criar/verificar banco: %v", err)
	}
	fmt.Println("✅ Banco de dados pronto!\n")

	// Carregar configurações
	configuracoes := config.CarregarConfiguracoes()

	// Conectar ao banco de dados
	fmt.Println("🔗 Conectando ao banco de dados...")
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		log.Fatal("❌ DB_PASSWORD não configurado no .env")
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "falhas_edp"
	}
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("❌ Erro ao conectar ao banco: %v", err)
	}
	defer db.Close()

	// Testar conexão
	if err = db.Ping(); err != nil {
		log.Fatalf("❌ Erro ao testar conexão com banco: %v", err)
	}
	fmt.Println("✅ Conectado ao banco de dados!\n")

	// Exibir banner
	exibirBanner(configuracoes)

	// Criar servidores
	servidorTCP := plc.NovoServidorTCP(configuracoes, db)
	servidorHTTP := api.NovoServidorHTTP(db)

	// Canal para capturar sinais de interrupção
	canalSinal := make(chan os.Signal, 1)
	signal.Notify(canalSinal, os.Interrupt, syscall.SIGTERM)

	// Iniciar servidor TCP em goroutine
	go func() {
		if err := servidorTCP.Iniciar(); err != nil {
			log.Fatalf("❌ Erro ao iniciar servidor TCP: %v", err)
		}
	}()

	// Iniciar servidor HTTP em goroutine
	go func() {
		if err := servidorHTTP.Iniciar(":8080"); err != nil {
			log.Fatalf("❌ Erro ao iniciar servidor HTTP: %v", err)
		}
	}()

	fmt.Println("🚀 Sistema completo iniciado:")
	fmt.Printf("   📡 TCP Server: %s:%s (recebimento PLC)\n", configuracoes.ServidorTCP_Host, configuracoes.ServidorTCP_Porta)
	fmt.Println("   🌐 HTTP API: http://localhost:8080 (front-end)")
	fmt.Println("   📋 Health Check: http://localhost:8080/api/v1/health")
	fmt.Println("\n⏳ Aguardando conexões...")

	// Aguardar sinal de interrupção
	<-canalSinal
	fmt.Println("\n🛑 Encerrando servidores...")

	// Encerrar servidor TCP gracefully
	servidorTCP.Parar()
	fmt.Println("✅ Servidores encerrados com sucesso")
}

func exibirBanner(cfg *config.Configuracoes) {
	fmt.Println("╔═══════════════════════════════════════════════════════╗")
	fmt.Println("║     🔌 SISTEMA DE MONITORAMENTO DE FALHAS - EDP      ║")
	fmt.Println("║              Backend TCP Server em Go                ║")
	fmt.Println("╚═══════════════════════════════════════════════════════╝")
	fmt.Printf("\n📡 Servidor TCP: %s:%s\n", cfg.ServidorTCP_Host, cfg.ServidorTCP_Porta)
	fmt.Printf("🏭 PLC Alvo: %s:%s\n", cfg.PLC_Host, cfg.PLC_Porta)
	fmt.Printf("📊 Log Level: %s\n\n", cfg.Log_Nivel)
	fmt.Println("⏳ Aguardando conexões do PLC...")
}
