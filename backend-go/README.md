# 🔌 Backend Go - Sistema de Monitoramento de Falhas EDP

Backend robusto em Go para integração com PLC via TCP e monitoramento de falhas/eventos em tempo real.

## 📋 Características

- ✅ Servidor TCP para comunicação com PLC
- ✅ Parser de WORDs (16 bits) para detecção de falhas
- ✅ Monitoramento de mudanças de bits em tempo real
- ✅ Estrutura modular e escalável
- ✅ Logs detalhados de todas as operações
- ✅ Graceful shutdown
- ✅ Suporte a múltiplas conexões simultâneas

## 🏗️ Estrutura do Projeto

```
backend-go/
├── main.go                      # Ponto de entrada
├── go.mod                       # Dependências
├── .env.example                 # Exemplo de configurações
├── internal/
│   ├── config/
│   │   └── config.go           # Gerenciamento de configurações
│   ├── models/
│   │   └── falha.go            # Modelos de dados (Falha, WORD, etc)
│   ├── server/
│   │   └── tcp_server.go       # Servidor TCP
│   └── parser/
│       └── word_parser.go      # Parser de WORDs e bits
└── README.md
```

## 🚀 Como Usar

### 1. Configurar ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o `.env` com as configurações do seu PLC:
```env
TCP_HOST=0.0.0.0
TCP_PORT=8502
PLC_IP=192.168.1.100
PLC_PORT=502
```

### 2. Instalar dependências

```bash
go mod download
```

### 3. Executar o servidor

```bash
go run main.go
```

## 📡 Como Funciona

### Comunicação TCP

1. O servidor escuta na porta configurada (padrão: 8502)
2. O PLC se conecta e envia WORDs (16 bits cada)
3. Cada WORD representa 16 possíveis falhas/eventos
4. O parser detecta mudanças de bits e registra as falhas

### Formato dos Dados

```
Cada WORD = 2 bytes = 16 bits

Exemplo:
WORD[0] = 0x0005 = 0000000000000101 (binário)
         Bits 0 e 2 estão ativos (falhas ativas)
```

### Detecção de Mudanças

O sistema compara cada nova WORD recebida com o valor anterior:
- **Bit 0→1**: Falha ATIVADA
- **Bit 1→0**: Falha DESATIVADA

## 📊 Logs

O sistema gera logs detalhados:

```
✅ Servidor TCP iniciado em 0.0.0.0:8502
🔗 Nova conexão do PLC: 192.168.1.100:52341
📥 Recebidos 12 bytes de 192.168.1.100:52341
  WORD[00] = 0x0005 (0000000000000101) | Decimal: 5
  WORD[01] = 0x0012 (0000000000010010) | Decimal: 18
🔄 Bit 0 da WORD 0: ATIVADO
🔄 Bit 2 da WORD 0: ATIVADO
```

## 🎯 Próximos Passos

- [ ] Integrar banco de dados (PostgreSQL)
- [ ] Criar API REST para frontend
- [ ] Implementar WebSocket para updates em tempo real
- [ ] Adicionar mapeamento de bits para descrições de falhas
- [ ] Sistema de alertas e notificações
- [ ] Dashboard de métricas

## 🛠️ Tecnologias

- **Go 1.23+**
- **TCP/IP** para comunicação PLC
- **godotenv** para gerenciamento de variáveis de ambiente
