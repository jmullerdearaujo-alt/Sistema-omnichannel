# Sistema Omnichannel - Clínica Médica

## Estrutura de Pastas e Arquivos

Este é um projeto web moderno que utiliza React, TypeScript e Tailwind CSS. O código é compilado para HTML, CSS e JavaScript otimizados.

### 📁 Estrutura Principal

```
clinica-omnichannel/
├── client/                    # Frontend (React + TypeScript)
│   ├── public/               # Arquivos estáticos (HTML base, imagens)
│   └── src/
│       ├── pages/            # Páginas da aplicação (componentes React)
│       │   ├── Home.tsx                    # Página inicial
│       │   ├── AttendantDashboard.tsx      # Painel do atendente
│       │   ├── ManagerDashboard.tsx        # Painel do gerente
│       │   ├── PatientDashboard.tsx        # Painel do paciente
│       │   └── ConversationView.tsx        # Visualização de conversas
│       ├── components/       # Componentes reutilizáveis (UI)
│       ├── lib/             # Bibliotecas e configurações
│       ├── index.css        # Estilos globais (Tailwind CSS)
│       ├── App.tsx          # Componente principal e rotas
│       └── main.tsx         # Ponto de entrada da aplicação
│
├── server/                   # Backend (Node.js + Express + tRPC)
│   ├── routers.ts           # Rotas da API (endpoints)
│   ├── db.ts                # Funções de banco de dados
│   └── _core/               # Configurações do servidor
│
├── drizzle/                 # Schema do banco de dados
│   └── schema.ts            # Definição das tabelas
│
└── shared/                  # Código compartilhado entre frontend e backend

```

### 🎨 Arquivos HTML, CSS e JavaScript

#### HTML
- **Arquivo base**: `client/index.html`
- Os componentes React (arquivos `.tsx`) são compilados para HTML

#### CSS
- **Estilos globais**: `client/src/index.css`
- Utiliza **Tailwind CSS** (framework CSS moderno)
- Estilos customizados para o tema médico/hospitalar

#### JavaScript/TypeScript
- **Frontend**: Todos os arquivos em `client/src/` (`.tsx`, `.ts`)
- **Backend**: Todos os arquivos em `server/` (`.ts`)
- TypeScript é compilado para JavaScript otimizado

### 📄 Páginas Principais (Componentes React)

1. **Home.tsx** - Página inicial com apresentação do sistema
2. **AttendantDashboard.tsx** - Painel do atendente com caixa de entrada
3. **ManagerDashboard.tsx** - Dashboard do gerente com métricas
4. **PatientDashboard.tsx** - Painel do paciente
5. **ConversationView.tsx** - Visualização e chat de conversas

### 🗄️ Banco de Dados

**Arquivo**: `drizzle/schema.ts`

**Tabelas criadas**:
- `users` - Usuários do sistema
- `patients` - Dados dos pacientes
- `attendants` - Dados dos atendentes
- `conversations` - Conversas
- `messages` - Mensagens
- `channels` - Canais de comunicação (WhatsApp, Instagram, etc)
- `quickReplies` - Respostas rápidas
- `appointments` - Agendamentos
- `attendantMetrics` - Métricas de desempenho
- `conversationNotes` - Notas internas

### 🚀 Como Usar

#### Opção 1: Usar o Sistema Online (Recomendado)
O sistema já está hospedado e funcionando. Acesse através do painel Manus.

#### Opção 2: Executar Localmente

1. **Instalar dependências**:
```bash
cd clinica-omnichannel
pnpm install
```

2. **Configurar banco de dados**:
```bash
pnpm db:push
node seed-db.mjs
```

3. **Iniciar servidor de desenvolvimento**:
```bash
pnpm dev
```

4. **Acessar**: http://localhost:3000

#### Opção 3: Build para Produção

```bash
pnpm build
```

Isso gera os arquivos HTML, CSS e JavaScript otimizados na pasta `dist/`.

### 📦 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Node.js, Express, tRPC
- **Banco de Dados**: MySQL/TiDB
- **Autenticação**: OAuth integrado
- **UI Components**: shadcn/ui (componentes modernos)

### 🎯 Funcionalidades Implementadas

✅ Sistema de autenticação com 3 perfis (Paciente, Atendente, Gerente)
✅ Caixa de entrada unificada omnichannel
✅ Chat em tempo real
✅ Respostas rápidas
✅ Dashboard de métricas
✅ Gestão de conversas
✅ Notas internas
✅ Histórico de conversas
✅ Agendamentos

### 📝 Observações Importantes

- Este é um projeto **React/TypeScript**, não HTML/CSS/JS puros
- Os arquivos `.tsx` são componentes React que geram HTML
- O Tailwind CSS processa os estilos e gera CSS otimizado
- Para modificar o visual, edite os arquivos em `client/src/`
- Para modificar a lógica do servidor, edite `server/routers.ts` e `server/db.ts`

### 🔧 Arquivos de Configuração

- `package.json` - Dependências do projeto
- `vite.config.ts` - Configuração do build
- `tailwind.config.ts` - Configuração do Tailwind CSS
- `drizzle.config.ts` - Configuração do banco de dados
- `tsconfig.json` - Configuração do TypeScript

---

**Desenvolvido para**: Sistema Omnichannel - Clínica Médica
**Data**: 2025
