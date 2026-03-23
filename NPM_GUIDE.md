# 📦 Guia de Uso - NPM

## ✅ Projeto Convertido para NPM

Este projeto foi convertido de Yarn para NPM. Todos os comandos agora usam `npm`.

---

## 📋 Comandos Principais

### Instalação e Desenvolvimento

```bash
# Instalar todas as dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linting
npm run lint
```

### Banco de Dados (Prisma)

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar schema no banco (desenvolvimento)
npm run prisma:push

# Popular banco com dados iniciais
npm run prisma:seed

# Abrir Prisma Studio (interface visual)
npm run prisma:studio
```

---

## 🔧 Gerenciamento de Dependências

### Adicionar Pacotes

```bash
# Dependência de produção
npm install nome-do-pacote

# Dependência de desenvolvimento
npm install --save-dev nome-do-pacote

# Instalar versão específica
npm install nome-do-pacote@1.2.3
```

### Remover Pacotes

```bash
npm uninstall nome-do-pacote
```

### Atualizar Pacotes

```bash
# Ver pacotes desatualizados
npm outdated

# Atualizar tudo
npm update

# Atualizar pacote específico
npm update nome-do-pacote
```

---

## 📄 Arquivos de Lock

Este projeto usa **package-lock.json** (NPM) ao invés de yarn.lock.

### O que foi removido:
- ❌ `yarn.lock` - Deletado
- ❌ Comandos `yarn` - Substituídos por `npm`

### O que mantém:
- ✅ `package-lock.json` - Gerenciado pelo NPM
- ✅ `package.json` - Mesmo arquivo, scripts atualizados
- ✅ `.npmrc` - Configurações do NPM (se necessário)

---

## 🚀 Workflow de Desenvolvimento

### 1. Clone o Repositório
```bash
git clone https://github.com/Guigms/medk.git
cd medk
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Banco de Dados
```bash
# Editar .env com suas credenciais MySQL
# DATABASE_URL="mysql://usuario:senha@localhost:3306/medk_farmacia"

# Gerar cliente
npm run prisma:generate

# Criar banco e tabelas
npm run prisma:push

# Popular com dados
npm run prisma:seed
```

### 4. Inicie o Servidor
```bash
npm run dev
```

### 5. Acesse
```
http://localhost:3000
```

---

## 🔍 Scripts Disponíveis no package.json

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Servidor desenvolvimento |
| `build` | `npm run build` | Build produção |
| `start` | `npm start` | Servidor produção |
| `lint` | `npm run lint` | Executar ESLint |
| `prisma:generate` | `npm run prisma:generate` | Gerar cliente Prisma |
| `prisma:push` | `npm run prisma:push` | Aplicar schema no banco |
| `prisma:seed` | `npm run prisma:seed` | Popular banco |
| `prisma:studio` | `npm run prisma:studio` | Interface visual |

---

## 🆚 Diferenças Yarn vs NPM

### Comandos Equivalentes:

| Yarn | NPM | Descrição |
|------|-----|-----------|
| `yarn` | `npm install` | Instalar dependências |
| `yarn add pacote` | `npm install pacote` | Adicionar pacote |
| `yarn add -D pacote` | `npm install --save-dev pacote` | Adicionar dev dependency |
| `yarn remove pacote` | `npm uninstall pacote` | Remover pacote |
| `yarn dev` | `npm run dev` | Executar script |
| `yarn build` | `npm run build` | Build |
| `yarn start` | `npm start` | Start (sem run) |

---

## 📦 Vantagens do NPM

✅ **Nativo do Node.js** - Vem instalado por padrão  
✅ **package-lock.json** - Versionamento determinístico  
✅ **npm workspaces** - Suporte a monorepos  
✅ **Compatibilidade** - Funciona em qualquer ambiente  
✅ **Documentação** - Maior base de conhecimento  

---

## 🔐 Cache e Performance

### Limpar Cache NPM
```bash
npm cache clean --force
```

### Verificar Integridade
```bash
npm audit
```

### Corrigir Vulnerabilidades
```bash
npm audit fix
```

---

## 🌍 Variáveis de Ambiente

O projeto usa `.env` para configuração:

```env
# Banco de Dados
DATABASE_URL="mysql://root:root@localhost:3306/medk_farmacia"

# Autenticação (futuro)
NEXTAUTH_SECRET="medk-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📚 Documentação Relacionada

- [README.md](/README.md) - Visão geral do projeto
- [DATABASE.md](/DATABASE.md) - Configuração do banco
- [DEPLOY.md](/DEPLOY.md) - Guia de deploy
- [CARRINHO.md](/CARRINHO.md) - Sistema de carrinho
- [FUNCIONALIDADES_AVANCADAS.md](/FUNCIONALIDADES_AVANCADAS.md) - Features avançadas

---

## 🐛 Troubleshooting

### Erro: `command not found: npm`
```bash
# Instalar Node.js (que inclui NPM)
# Ubuntu/Debian
sudo apt install nodejs npm

# macOS
brew install node

# Windows
# Baixar de: https://nodejs.org
```

### Erro: `EACCES: permission denied`
```bash
# Reconfigurar diretório global do NPM
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Erro: `package-lock.json conflicts`
```bash
# Deletar e reinstalar
rm package-lock.json
rm -rf node_modules
npm install
```

---

## ✅ Checklist de Migração

- [x] Removido yarn.lock
- [x] Criado package-lock.json
- [x] Atualizado README.md
- [x] Atualizado DATABASE.md
- [x] Atualizado DEPLOY.md
- [x] Scripts funcionando com npm
- [x] Build testado
- [x] Desenvolvimento testado

**Projeto 100% funcional com NPM! 🎉**
