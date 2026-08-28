# 🚀 FINAN

Sistema de Gestão e Engenharia Financeira Pessoal & Familiar com Integração **Open Finance Brasil** (Sincronização Bancária Automática, Investimentos e Empréstimos), Inteligência Preditiva de Cartões, Isolamento Virtual de Cofres e Conciliação Inteligente de Extratos.

---

## 🛠️ Tecnologias Utilizadas

### 🌐 Frontend (Angular v20+)
* **Angular SSR & Standalone Components** com arquitetura reativa moderna baseada em **Signals**.
* **Tailwind CSS** com paleta customizada Dark Neon e efeitos de *Glassmorphism*.
* **Integração Open Finance (Pluggy Connect Widget)** para sincronização bancária fluida.
* **Toasts Interativos** com barra de progresso e controle temporal.
* **Layout Fixo & Responsivo**: Cabeçalho e barra lateral estáticos com rolagem independente de conteúdo.
* **Gestão Familiar**: Alternância dinâmica de escopo (*Minhas Finanças* vs *Finanças da Família*).

### ⚙️ Backend (NestJS + TypeScript)
* **NestJS** modular (`Auth`, `Users`, `Family`, `Accounts`, `Categories`, `Transactions`, `Cards`, `Vaults`, `Investments`, `Loans`, `OpenFinance`, `Import`, `Mail`).
* **Open Finance Engine (Pluggy API)**: Conexão regulada com mais de 50 instituições bancárias no Brasil.
* **Prisma ORM** com banco de dados **MySQL 8.4**.
* **Resend API & SMTP Mailer** com envio transacional de e-mails HTML responsivos.
* **Segurança Reforçada**:
  * Autenticação via **JWT** e criptografia de senhas com **Bcrypt**.
  * Medidor e validação de senhas fortes no cadastro e recuperação de senha.
  * Bloqueio anti-brute force após 5 tentativas consecutivas com link seguro de desbloqueio.
  * Validação de e-mail com código de confirmação PIN de 6 dígitos.

### 🐳 Infraestrutura
* **Docker & Docker Compose** com orquestração completa dos contêineres (`organizador_app`, `organizador_api`, `organizador_mysql`).

---

## 📦 Como Executar o Projeto

### Pré-requisitos
* [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### 1. Clonar o repositório
```bash
git clone https://github.com/MatheusHolowka/OrganizadorFinan.git
cd OrganizadorFinan
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo e ajuste suas credenciais:
```bash
cp .env.example .env
```

### 3. Subir os contêineres Docker
```bash
docker compose up --build -d
```

### 4. Acessar a aplicação
* **Frontend (App Web)**: [http://localhost:4200](http://localhost:4200)
* **Backend (API NestJS)**: [http://localhost:3000/api](http://localhost:3000/api)
* **Banco de Dados (MySQL)**: `localhost:3306`

---

## 🛡️ Funcionalidades Principais
1. **Open Finance Brasil & Conexão Multi-Bancos**: Conexão direta com Itaú, Nubank, Banco do Brasil, Inter, Bradesco, Santander, BTG, XP, C6 e mais de 50 bancos com sincronização automática de saldos e transações.
2. **Investimentos & Carteira Consolidada**: Rastreamento automático de renda fixa (CDB, LCI, LCA), fundos, ações e Tesouro Direto.
3. **Passivos & Empréstimos**: Gestão de dívidas, financiamentos e contratos de crédito com atualização em tempo real do saldo devedor.
4. **Visão Geral Financeira (Dashboard)**: Métricas consolidadas, saldo livre seguro e gráficos de distribuição.
5. **Extrato & Lançamentos**: Filtros avançados por ano, mês, tipo e busca textual, além de limpeza total em 1 clique.
6. **Cartões de Crédito**: Gestão de faturas abertas/fechadas, projeção de parcelas futuras e controle de limites.
7. **Cofres & Metas Blindadas**: Isolamento virtual de capital para aquisições de médio e longo prazo sem autoengano.
8. **Motor de Importação Híbrido**: Upload de extratos `.OFX` e `.CSV` com categorização automática e proteção contra duplicidades por hash FITID.
9. **Finanças da Família**: Criação de grupo familiar, convites por e-mail e consolidação de despesas conjuntas com privacidade individual.

---

## 👨‍💻 Autor
Desenvolvido por **Matheus Holowka**.