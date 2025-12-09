# ⚠️ INSTRUÇÕES DE SEGURANÇA - README DE CONFIGURAÇÃO

## 🔐 Configuração de Variáveis de Ambiente

**IMPORTANTE:** Este projeto usa variáveis de ambiente para proteger informações sensíveis como senhas de banco de dados.

### Backend (Go)

1. Navegue até a pasta `backend-go/`
2. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
3. Edite o arquivo `.env` e configure suas credenciais:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha_real_aqui
   DB_NAME=falhas_edp
   ```

### ⚠️ NUNCA faça commit do arquivo `.env`

O arquivo `.env` está listado no `.gitignore` e **NÃO DEVE** ser versionado no Git.
Ele contém informações sensíveis que não devem ser expostas publicamente.

### Para Desenvolvedores

Sempre use `os.Getenv()` para ler variáveis de ambiente no código Go.
Nunca hardcode senhas ou credenciais diretamente no código fonte.

### Exemplo de Uso no Código

```go
dbPassword := os.Getenv("DB_PASSWORD")
if dbPassword == "" {
    log.Fatal("❌ DB_PASSWORD não configurado no .env")
}
```
