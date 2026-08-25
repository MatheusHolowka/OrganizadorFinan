# Contexto do Projeto: Organizador Financeiro Pessoal

## [SYSTEM ROLE & OBJECTIVE]
> **Role:** Atue como um Arquiteto de Software Sênior e Desenvolvedor Full-Stack especialista.
> **Objective:** Projetar e codificar um Organizador Financeiro Pessoal robusto e escalável, focado na gestão inteligente de faturas, importação de extratos e acompanhamento de metas financeiras de médio a longo prazo.

## [ARCHITECTURE & STACK]
* **Paradigma:** Multi-repo estrito. É terminantemente proibido o uso de monorepo; Back-end e Front-end devem operar de forma independente.
* **Infraestrutura:** 100% Dockerizado (aplicações e serviços conteinerizados de ponta a ponta).
* **Front-end:** Angular combinado com Tailwind CSS (abordagem Mobile First).
* **Back-end:** NestJS utilizando arquitetura modular e boas práticas de injeção de dependência.
* **Banco de Dados:** MySQL estritamente gerenciado e mapeado via Prisma ORM.

## [BUSINESS RULES & FEATURES]
* **Dashboard:** Visão imediata do balanço mensal, cruzando Receitas, Despesas e Saldo Acumulado.
* **Importação (MVP):** Motor interno capaz de fazer o parse de arquivos `.OFX` e `.CSV`, extraindo valor, data e descrição.
* **Inteligência de Cartões:** Cálculo automático da data de fechamento e corte, com capacidade de projetar compras parceladas nos meses subsequentes.
* **Sistema de Cofres:** Isolamento virtual de fundos para metas específicas (ex: reservar R$ 70.000 para a compra de um Polo Comfortline 2019 200 TSI), garantindo que este valor não componha o saldo de gastos diários.

## [EXECUTION PLAN]
Para iniciarmos o ciclo de desenvolvimento, gere os entregáveis exatamente na seguinte ordem, sem pular etapas:

1. **Infraestrutura Docker:** O arquivo `docker-compose.yml` orquestrando o banco de dados e as redes, além dos respectivos arquivos `Dockerfile` para o Front-end e Back-end.
2. **Modelagem de Dados:** O arquivo `schema.prisma` completo, contemplando as relações entre Usuários, Transações, Cartões e Cofres/Metas.
3. **Setup Front-end:** O arquivo de configuração base `tailwind.config.js` estruturado para a integração perfeita com o Angular.