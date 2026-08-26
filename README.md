# 🚀 OrganizadorFinan

Sistema de Gestão e Planejamento Financeiro Pessoal & Familiar com Inteligência de Cartões, Isolamento Virtual de Cofres, Motor Anti-Duplicidade de Extratos e Autenticação Segura com Confirmação por Código de 6 Dígitos (OTP).

---

## 🛠️ Tecnologias Utilizadas

### 🌐 Frontend (Angular v20+)
* **Angular SSR & Standalone Components** com arquitetura baseada em **Signals** reativos.
* **Tailwind CSS** com paleta customizada Dark Neon e efeitos de *Glassmorphism*.
* **Toasts Interativos** com barra de progresso e pausa no *hover*.
* **Layout 100% Fixo**: Cabeçalho e barra lateral estáticos com rolagem independente de conteúdo.
* **Gestão Familiar**: Alternância rápida de escopo (*Minhas Finanças* vs *Finanças da Família*).

### ⚙️ Backend (NestJS + TypeScript)
* **NestJS** modular (Auth, Users, Family, Accounts, Categories, Transactions, Cards, Vaults, Import, Mail).
* **Prisma ORM** com banco de dados **MySQL 8.4**.
* **Resend API & SMTP Mailer** com envio transacional de e-mails HTML responsivos.
* **Segurança Reforçada**:
  * Autenticação via **JWT** e criptografia de senhas com **Bcrypt**.
  * Medidor e validação de senhas fortes no cadastro e troca de senha.
  * Bloqueio anti-brute force após 5 tentativas consecutivas com link de recuperação/desbloqueio.
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
1. **Visão Geral Financeira (Dashboard)**: Métricas consolidadas, saldo livre para gastar e gráficos por categoria.
2. **Extrato & Lançamentos**: Filtros avançados por ano, mês, tipo e busca textual, além de limpeza total da base em 1 clique.
3. **Cartões de Crédito**: Gestão de faturas abertas/fechadas, projeção de parcelas futuras e controle de limites.
4. **Cofres & Metas Blindadas**: Isolamento virtual de capital para aquisições de médio e longo prazo.
5. **Motor de Importação Inteligente**: Upload de extratos `.OFX` e `.CSV` com categorização automática e proteção contra duplicidades.
6. **Finanças da Família**: Criação de grupo familiar, convites por e-mail e consolidação de receitas e despesas compartilhadas.

---

## 👨‍💻 Autor
Desenvolvido por **Matheus Holowka**.
 