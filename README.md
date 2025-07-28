# GitHub Search

Aplicação para buscar e explorar repositórios do GitHub, construída com uma arquitetura moderna usando monorepo.

## 🚀 Tecnologias

- **Monorepo**:
  - pnpm workspaces
  - Turbo Repo
  - ESLint
  - Prettier
  - Husky
  - CommitLint
  - Coderabbit (code quality with AI)

- **Frontend**:
  - Next.js 15
  - React 19
  - TailwindCSS
  - Shadcn UI
  - Zod
  - Tanstack Query (antigo React Query)
  - React Hook Form
  - Nuqs (URL State Management)

- **Backend**:
  - Fastify
  - Vitest
  - Axios
  - Swagger UI

- **Outros**:
  - Pino (logger)
  - t3-oss/env (environment variables)
  - Either
    - "Gosto muito de usar para retorno de funções"

## 📋 Pré-requisitos

- **Node.js**: 22.0.0 ou superior
- **pnpm**: 10.13.1 ou superior (instalar com `npm install -g pnpm`)

## ⚡ Instalação Rápida

1. **Clone o repositório**

   ```bash
   git clone https://github.com/willgravinadev/trabalhe-com-a-gente.git
   ```

   ```bash
   cd trabalhe-com-a-gente
   ```

2. **Instale as dependências**

   ```bash
   # Se não tiver o pnpm instalado, instale com:
   npm install -g pnpm

   # Instale as dependências
   pnpm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   # Crie o arquivo .env.local na raiz do projeto
   cp .env.local.example .env.local
   ```

4. **Execute o projeto**

   ```bash
   # Inicia API e Frontend simultaneamente
   pnpm dev:apps
   ```

5. **Acesse**:
   - [Frontend](http://localhost:3000)
   - [Swagger](http://localhost:2222/documentation)

## 🧪 Testes

```bash
pnpm test:unit
```

## 🌐 Endpoints da API

A API estará disponível em `http://localhost:2222`

### Health Check

```http
GET /health-check
```

### Buscar Repositórios

```http
GET /github-repositories/search?query=react&selected_page=1&repositories_per_page=30&sort_by=best_match
```

**Parâmetros:**

- `query`: Termo de busca (obrigatório)
- `selected_page`: Página selecionada (padrão: 1)
- `repositories_per_page`: Repositórios por página (padrão: 30, máx: 100)
- `sort_by`: Ordenação (best_match, most_stars, most_forks, recently_updated)
