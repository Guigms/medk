# 🏗️ Farmácia Medk - Site Institucional

Site completo da Farmácia Medk localizada no Passaré, Fortaleza - CE.

## 📋 Sobre o Projeto

Site profissional desenvolvido com Next.js 16, focado em facilitar o atendimento ao cliente através de integração direta com WhatsApp e apresentar o catálogo de produtos da farmácia.

## ✨ Funcionalidades

### Páginas Públicas:
- **Home**: Hero com banner, busca de produtos, categorias, produtos em destaque, serviços e depoimentos (5.0★ Google)
- **Produtos**: Catálogo completo com filtros por categoria e busca
- **Serviços**: Aferição de pressão, aplicação de injetáveis, entrega em domicílio
- **Contato**: Formulário, mapa interativo e informações de contato

### Painel Administrativo:
- **Sistema de Autenticação** (dados mockados)
- **Dashboard**: Estatísticas e visão geral
- **Gestão de Produtos**: CRUD completo, controle de disponibilidade e destaque
- **Filtros e Busca** avançados

### Integrações:
- **WhatsApp**: Botão flutuante e links diretos com produto pré-preenchido
- **Google Maps**: Localização da farmácia
- **SEO Otimizado**: JSON-LD LocalBusiness, meta tags completas

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 16.1.6 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **Banco de Dados**: MySQL + Prisma ORM
- **Deploy**: Vercel ready

## 🚀 Como Executar

### Desenvolvimento:

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Acessar em http://localhost:3000
```

### Produção:

```bash
# Build
npm run build

# Iniciar
npm start
```

### Banco de Dados:

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar banco e tabelas
npm run prisma:push

# Popular com dados iniciais
npm run prisma:seed

# Abrir Prisma Studio
npm run prisma:studio
```

## 📁 Estrutura do Projeto

\`\`\`
/app
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── produtos/          # Página de produtos
│   ├── servicos/          # Página de serviços
│   ├── contato/           # Página de contato
│   ├── admin/             # Painel administrativo
│   │   ├── login/         # Login admin
│   │   ├── dashboard/     # Dashboard
│   │   └── produtos/      # Gestão de produtos
│   ├── layout.tsx         # Layout principal
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── Header.tsx         # Cabeçalho
│   ├── Footer.tsx         # Rodapé
│   ├── WhatsAppButton.tsx # Botão flutuante WhatsApp
│   ├── ProductCard.tsx    # Card de produto
│   ├── SearchBar.tsx      # Barra de busca
│   └── ProtectedRoute.tsx # Proteção de rotas admin
├── lib/                   # Utilidades e dados
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Funções utilitárias
│   ├── mockData.ts        # Dados mockados
│   └── auth.tsx           # Context de autenticação
└── public/                # Arquivos públicos
\`\`\`

## 🔐 Credenciais de Demonstração (Admin)

- **Email**: admin@medk.com
- **Senha**: admin123

## 📞 Contato Farmácia Medk

- **Endereço**: R. N, 4081B - Passaré, Fortaleza - CE
- **Telefone**: (85) 2139-6783
- **WhatsApp**: (85) 2139-6783
- **Avaliação Google**: ⭐ 5.0

## 🎯 Próximos Passos (Backend Real)

Para implementar o backend completo com Prisma + MySQL:

1. Instalar dependências:
\`\`\`bash
yarn add prisma @prisma/client
yarn add -D prisma
\`\`\`

2. Inicializar Prisma:
\`\`\`bash
npx prisma init
\`\`\`

3. Configurar schema.prisma com os models
4. Configurar variáveis de ambiente (.env)
5. Rodar migrations
6. Criar API Routes no Next.js (/app/api/)
7. Substituir dados mockados por chamadas de API

## 📱 Funcionalidades Mobile-First

- Design 100% responsivo
- Touch-friendly
- Menu mobile hamburger
- Cards otimizados para mobile
- Imagens otimizadas (Next Image)

## 🎨 Tema de Cores

- **Primary**: Verde (#16a34a) - Representa saúde e confiança
- **Destaque**: Amarelo (#fbbf24) - Produtos em destaque
- **Fundo**: Cinza claro (#f9fafb)

## 📊 SEO & Performance

- Score objetivo: 90+ no PageSpeed Insights
- Schema.org LocalBusiness implementado
- Meta tags otimizadas
- Imagens otimizadas com Next/Image
- SSG (Static Site Generation) para páginas públicas

## 🔄 GitHub & Deploy

### Deploy no Vercel:
1. Conectar repositório no Vercel
2. Configurar variáveis de ambiente
3. Deploy automático a cada push

---

Desenvolvido com 💚 para cuidar da sua saúde
