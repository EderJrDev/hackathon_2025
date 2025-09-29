# Hackathon 2025 – Atendente Virtual em Saúde (Unimed-like)

Assistente virtual web com IA para:

- Orientações rápidas (FAQ inteligente) com base em fluxos de conhecimento
- Agendamento de consultas via chat orquestrado por IA
- Análise de pedido de exames (imagem/PDF) para autorização automática ou direcionamento para auditoria

Arquitetura full‑stack:

- Backend: NestJS (Node 20+), Prisma (PostgreSQL) e OpenAI
- Frontend: React + Vite (Tailwind) com chat UI e suporte a voz, upload de arquivos e roteamento inteligente


## Visão geral do produto

- Chat de orientação: o usuário faz perguntas em linguagem natural. O backend reconhece intenções e responde em HTML padronizado com passos e observações. Exemplos de fluxos: Agendar Consulta, Segunda via de Boleto, Troca de Titularidade, Solicitar Autorização de Exames, Atualização Cadastral. Os fluxos ficam em `backend/src/modules/questions-ai/flows.knowledge.json` e podem ser editados sem recompilar (o build copia o JSON para `dist`).
- Agendamento com IA: um orquestrador conduz a conversa em 7 etapas (identificação do paciente, especialidade e motivo, escolha do médico, horários disponíveis, confirmação e protocolo). Ele consulta o banco (médicos, disponibilidades) e cria o agendamento removendo a disponibilidade escolhida.
- Autorizações de Exame: o usuário envia foto/PDF do pedido. O backend extrai dados (nome do paciente, data de nascimento, lista de procedimentos), casa com a base de exames e decide: autorizado, pendente de auditoria (5 ou 10 dias) ou sem cobertura. Gera protocolos individuais e permite consultar protocolos por paciente.


## Arquitetura e pastas

- `backend/`
	- NestJS com módulos:
		- `questions-ai`: perguntas/FAQ com IA e fluxo de conhecimento
		- `appointment-ai`: orquestrador de agendamento com IA
		- `exams`: autorização de exames (upload de arquivo, decisão e protocolos)
		- `auth` e `users`: autenticação JWT e gestão de usuários (rotas protegidas)
		- `appointments`: serviços internos de médicos, disponibilidades e criação de consultas
	- `prisma/`: schema, migrações e client
	- `src/seed/seed.ts`: popular médicos, disponibilidades e alguns agendamentos de exemplo
- `frontend/`
	- React + Vite, UI do chat com:
		- Entrada de texto/voz, respostas em HTML seguro
		- Upload para autorização de exames
		- Roteamento automático para fluxo de agendamento quando detectado


## Requisitos

- Node.js 20+
- PostgreSQL (DATABASE_URL)
- Chave da OpenAI (OPENAI_API_KEY)


## Variáveis de ambiente (backend)

Crie um arquivo `backend/.env` com:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
OPENAI_API_KEY="sua_chave_openai"
JWT_SECRET="um_segredo_seguro"
JWT_EXPIRES="1d"             # opcional (padrão 1d)
PORT=3000                     # opcional
```

Variáveis de ambiente (frontend): crie `frontend/.env`:

```
VITE_API_URL="http://localhost:3000"
```


## Como rodar localmente

1) Instalar dependências

- Backend
	- entre em `backend/` e instale dependências (npm, pnpm ou yarn)
- Frontend
	- entre em `frontend/` e instale dependências

2) Banco de dados e Prisma

- Configure `DATABASE_URL` no `backend/.env`
- Aplique migrações e gere o client
- (Opcional) Rode o seed para popular médicos, disponibilidades e alguns agendamentos de demonstração

3) Rodar os servidores

- Backend: `npm run start:dev` (em `backend/`) – CORS já habilitado para `http://localhost:5173`
- Frontend: `npm run dev` (em `frontend/`) – abrirá em `http://localhost:5173`


## Principais endpoints (públicos do chat)

Base URL do backend: `http://localhost:3000`

- Perguntas/FAQ (Questions AI)
	- POST `/chat/questions/ask`
		- Body: `{ "message": "texto da pergunta" }`
		- Resposta: `{ html: string }` ou `{ route: "appointment"|"exams", reason?: string }`

- Agendamento (Appointment AI)
	- POST `/chat/appointment`
		- Body: `{ "sessionId": "sess-...", "message": "mensagem do usuário" }`
		- Resposta: `{ reply: string }` (HTML com instruções, listas numeradas, confirmações e protocolo)

- Autorizações de Exame (Exams)
	- POST `/chat/exams` (multipart/form-data)
		- Campo `file`: imagem (JPG/PNG/GIF/BMP/WEBP) ou PDF do pedido
		- Resposta: `{ patient?, procedures[], source: "gpt-json+db", protocolBatch }`
	- GET `/chat/exams/authorizations?name=Nome&birthDate=DD/MM/AAAA|AAAA-MM-DD`
		- Resposta: lista de `{ protocol, status }`

Observação: endpoints internos de `appointments` (listar médicos, disponibilidades e agendar a partir de availabilityId) são utilizados pelo orquestrador de IA.


## Como funciona (em alto nível)

- Questions AI
	- Recebe a mensagem e tenta casar com um fluxo em `flows.knowledge.json` por intents/padrões.
	- Se encontrar, a IA formata uma resposta HTML padronizada (título, passos, observações).
	- Se identificar intenção operacional (ex.: “agendar consulta”), retorna uma diretiva de rota para o front acionar o módulo adequado.

- Appointment AI
	- Fluxo conversacional robusto (dados do paciente, especialidade/motivo, seleção do médico, horários, confirmação) com interpretações flexíveis (datas pt‑BR, variações de especialidade, seleção por número ou nome).
	- Consulta o banco via Prisma (médicos/slots) e ao confirmar, gera protocolo único e cria o agendamento, removendo a disponibilidade.

- Exams
	- Para PDF: extrai texto localmente; para imagens: otimiza via `sharp`.
	- Envia prompt minimalista para a OpenAI extrair apenas o essencial (paciente e procedimentos) e retorna JSON determinístico.
	- Casa cada procedimento com tabela `Exam` e decide: `AUTHORIZED`, `PENDING_AUDIT_5D`, `PENDING_AUDIT_10D` ou `DENIED_NO_COVER`.
	- Gera protocolos e permite consulta por paciente.


## Banco de dados (Prisma + PostgreSQL)

Modelos principais: `User`, `Doctor`, `Availability`, `Appointment`, `Exam`, `ExamAuthorization` e entidades de chat (`ChatSession`, `Message`). Veja `backend/prisma/schema.prisma`.

- Seed (`backend/src/seed/seed.ts`):
	- Cria médicos e disponibilidades (próximos 30 dias) e alguns agendamentos exemplo.
	- Dica: use `prisma studio` para inspecionar dados durante o desenvolvimento.


## Autenticação e segurança

- JWT habilitado globalmente; rotas de chat usam `@Public()`.
- Login
	- POST `/login` (body `username`, `password`) retorna `{ access_token }`
- Gestão de usuários (`/users`) é protegida por roles; apenas ADMIN.
- Primeiro usuário: como a criação via API exige ADMIN, crie o primeiro usuário diretamente no banco (Prisma Studio) com `username`, `password` (hash bcrypt) e `role = ADMIN`.


## Frontend (React + Vite)

- Variável `VITE_API_URL` aponta para o backend. Por padrão, `http://localhost:3000`.
- Página `Chat` (`frontend/src/pages/Chat.tsx`):
	- Chama `/chat/questions/ask` e segue a diretiva: retorna HTML ou inicia fluxo de agendamento/autorizações.
	- Upload de arquivos para `/chat/exams` com exibição dos protocolos e decisões.
	- Reconhecimento de voz (quando disponível no navegador) e acessibilidade (escala de fonte persistida).


## Scripts úteis

- Backend (`backend/package.json`):
	- `start:dev` – Nest em watch mode
	- `seed` – executa `src/seed/seed.ts`
	- `test`, `test:e2e`, `lint`, `build`
- Frontend (`frontend/package.json`):
	- `dev`, `build`, `preview`, `lint`


## Personalização

- Fluxos de conhecimento: edite `backend/src/modules/questions-ai/flows.knowledge.json` (intents/padrões/steps/obs). O build já copia o arquivo para `dist` (veja `nest-cli.json`).
- Especialidades/mapeamentos do agendamento podem ser ampliados em `appointment-ai` (arquivo de mapeamento em `dto/specialities.dto`).
- Exames e políticas de cobertura: popular tabela `Exam` com `audit`/`opme` para ajustar decisões.


## Troubleshooting

- 401/403 em rotas de usuários: gere um token via `/login` e envie `Authorization: Bearer <token>` ou crie o primeiro usuário diretamente via DB.
- OpenAI: verifique `OPENAI_API_KEY` no ambiente do backend.
- CORS: o backend já libera `http://localhost:5173`.
- PDF sem texto: alguns PDFs “escaneados” não têm texto; prefira imagem nítida ou PDF pesquisável.


## Licença

Projeto para fins de demonstração em hackathon.

