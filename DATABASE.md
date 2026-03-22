# 🗄️ Configuração do Banco de Dados MySQL + Prisma

## 📋 Visão Geral

Sistema completo de banco de dados MySQL com Prisma ORM para gerenciar produtos, usuários, pedidos e analytics da Farmácia Medk.

---

## 🛠️ Pré-requisitos

### 1. Instalar MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
- Baixar MySQL Installer: https://dev.mysql.com/downloads/installer/
- Instalar e configurar

### 2. Configurar MySQL

```bash
# Acessar MySQL
sudo mysql -u root -p

# Criar banco de dados
CREATE DATABASE medk_farmacia;

# Criar usuário (opcional)
CREATE USER 'medk'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON medk_farmacia.* TO 'medk'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📊 Estrutura do Banco de Dados

### Modelos Implementados:

#### 1. **User** (Usuários)
- `id`: ID único
- `email`: Email único
- `name`: Nome completo
- `password`: Senha hash (bcrypt)
- `role`: USER | ADMIN
- Relações: favorites, orders

#### 2. **Category** (Categorias)
- `id`: ID único
- `name`: Nome da categoria
- `slug`: Slug único (URL-friendly)
- `icon`: Emoji/ícone
- `description`: Descrição
- Relações: products

#### 3. **Product** (Produtos)
- `id`: ID único
- `name`: Nome do produto
- `description`: Descrição detalhada
- `price`: Preço (Decimal 10,2)
- `image`: URL da imagem
- `available`: Disponibilidade (boolean)
- `featured`: Produto em destaque
- `discount`: Desconto percentual
- `requiresPrescription`: Requer receita
- `expiryDate`: Data de validade
- `stock`: Quantidade em estoque
- `categoryId`: FK para Category
- Relações: category, favorites, orderItems, productClicks

#### 4. **Banner** (Banners Promocionais)
- `id`: ID único
- `title`: Título
- `subtitle`: Subtítulo
- `image`: URL da imagem
- `link`: Link opcional
- `active`: Ativo/Inativo
- `order`: Ordem de exibição

#### 5. **Testimonial** (Depoimentos)
- `id`: ID único
- `name`: Nome do cliente
- `rating`: Avaliação (1-5)
- `comment`: Comentário
- `date`: Data do depoimento
- `active`: Ativo/Inativo

#### 6. **Favorite** (Favoritos)
- `id`: ID único
- `userId`: FK para User
- `productId`: FK para Product
- Unique constraint: (userId, productId)

#### 7. **Order** (Pedidos)
- `id`: ID único
- `userId`: FK para User (opcional)
- `customerName`: Nome do cliente
- `customerPhone`: Telefone
- `customerEmail`: Email (opcional)
- `deliveryOption`: Opção de entrega
- `deliveryAddress`: Endereço
- `totalAmount`: Valor total
- `status`: PENDING | CONFIRMED | PREPARING | DELIVERING | COMPLETED | CANCELLED
- `hasPrescription`: Tem receita anexada
- `notes`: Observações
- Relações: user, orderItems

#### 8. **OrderItem** (Itens do Pedido)
- `id`: ID único
- `orderId`: FK para Order
- `productId`: FK para Product
- `quantity`: Quantidade
- `price`: Preço no momento da compra

#### 9. **ProductClick** (Analytics)
- `id`: ID único
- `productId`: FK para Product
- `clickedAt`: Data/hora do clique

---

## 🚀 Configuração Passo a Passo

### 1. Variáveis de Ambiente

Arquivo `.env` já configurado:

```env
DATABASE_URL="mysql://root:root@localhost:3306/medk_farmacia"
```

**Ajuste conforme sua configuração:**
- `root`: seu usuário MySQL
- `root`: sua senha MySQL
- `localhost`: host do MySQL
- `3306`: porta do MySQL
- `medk_farmacia`: nome do banco

### 2. Gerar Cliente Prisma

```bash
yarn prisma:generate
```

### 3. Criar Banco e Tabelas

```bash
yarn prisma:push
```

Isso vai:
- Criar o banco `medk_farmacia` se não existir
- Criar todas as tabelas
- Aplicar índices e constraints

### 4. Popular com Dados Iniciais (Seed)

```bash
yarn prisma:seed
```

Isso vai criar:
- ✅ 1 usuário admin (admin@medk.com / admin123)
- ✅ 4 categorias
- ✅ 13 produtos de exemplo
- ✅ 2 banners promocionais
- ✅ 3 depoimentos

### 5. Verificar Banco (Prisma Studio)

```bash
yarn prisma:studio
```

Abre interface visual em: http://localhost:5555

---

## 📝 Scripts Disponíveis

```bash
# Gerar cliente Prisma após mudanças no schema
yarn prisma:generate

# Aplicar mudanças no banco (desenvolvimento)
yarn prisma:push

# Popular banco com dados iniciais
yarn prisma:seed

# Abrir Prisma Studio (interface visual)
yarn prisma:studio

# Criar migration (produção)
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy
```

---

## 🔐 Segurança

### Senhas
- Todas as senhas são hash com bcrypt (10 rounds)
- Nunca armazene senhas em texto puro
- Admin padrão: `admin123` (MUDAR EM PRODUÇÃO!)

### Variáveis de Ambiente
- `.env` está no `.gitignore`
- Nunca commitar credenciais
- Usar variáveis diferentes por ambiente

---

## 🎯 Próximos Passos

Após configurar o banco:

1. **Criar API Routes** (`/app/api/...`)
   - GET /api/products - Listar produtos
   - POST /api/products - Criar produto
   - PUT /api/products/[id] - Atualizar produto
   - DELETE /api/products/[id] - Deletar produto
   - Etc...

2. **Atualizar Componentes**
   - Trocar mockData por chamadas API
   - Usar SWR ou React Query para cache
   - Loading states

3. **Implementar Autenticação**
   - NextAuth.js
   - JWT tokens
   - Session management

4. **Sistema de Pedidos**
   - Salvar pedidos no banco
   - Histórico de pedidos
   - Status tracking

---

## 🔄 Migrações

### Desenvolvimento:
```bash
npx prisma db push
```

### Produção:
```bash
# Criar migration
npx prisma migrate dev --name adicionar_campo_x

# Aplicar em produção
npx prisma migrate deploy
```

---

## 📊 Consultas Úteis

### Resetar Banco (CUIDADO!)
```bash
npx prisma migrate reset
```

### Ver Schema Atual
```bash
npx prisma db pull
```

### Formatar Schema
```bash
npx prisma format
```

---

## 🐛 Troubleshooting

### Erro: Can't connect to MySQL server
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Iniciar MySQL
sudo systemctl start mysql
```

### Erro: Access denied for user
```bash
# Verificar credenciais no .env
# Resetar senha MySQL se necessário
sudo mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha';
FLUSH PRIVILEGES;
```

### Erro: Database does not exist
```bash
# Criar banco manualmente
mysql -u root -p
CREATE DATABASE medk_farmacia;
EXIT;

# Tentar push novamente
yarn prisma:push
```

---

## 📈 Performance

### Índices Criados:
- `products.categoryId`
- `favorites.userId` e `productId`
- `orders.userId` e `status`
- `orderItems.orderId` e `productId`
- `productClicks.productId` e `clickedAt`

### Otimizações:
- Decimal(10,2) para preços
- Text para descrições longas
- Cascade delete em relações
- Unique constraints

---

## ✅ Checklist de Configuração

- [ ] MySQL instalado e rodando
- [ ] Banco `medk_farmacia` criado
- [ ] Arquivo `.env` configurado
- [ ] `yarn prisma:generate` executado
- [ ] `yarn prisma:push` executado
- [ ] `yarn prisma:seed` executado
- [ ] `yarn prisma:studio` funcionando
- [ ] Admin login testado (admin@medk.com)

---

**Banco de dados pronto para uso! 🎉**
