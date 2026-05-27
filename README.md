# PetLar

Conectando animais resgatados a novos lares com responsabilidade.

## Descricao

PetLar e uma plataforma web de apoio a adocao responsavel de animais. O MVP conecta ONGs, protetores independentes, lares temporarios e adotantes por meio de listagem de pets, formularios de interesse, paineis de acompanhamento e conteudo educativo.

O projeto foi criado para uso como Projeto de Extensao em Ciencia da Computacao, com foco em tecnologia aplicada a um problema social real.

## Objetivo social

Ajudar organizacoes e protetores a divulgarem caes e gatos resgatados, organizarem interessados e conduzirem a triagem inicial com mais clareza, privacidade e responsabilidade.

## Funcionalidades

- Landing page com explicacao do projeto e fluxo de adocao.
- Pagina `/pets` com cards, busca e filtros por especie, porte, sexo, cidade e status.
- Pagina `/pets/[id]` com galeria, informacoes completas, saude e responsavel.
- Login e cadastro com Supabase Auth.
- Perfil do usuario com foto, dados basicos e exclusao de conta.
- Painel do adotante em `/dashboard/adotante`.
- Formulario de interesse em adocao em `/interesse/[petId]`.
- Painel da ONG/protetor em `/dashboard/ong`.
- Cadastro de pet em `/dashboard/ong/pets/novo`.
- Edicao de pets em `/dashboard/ong/pets/[id]/editar`.
- Interessados recebidos em `/dashboard/ong/interessados`.
- Cadastro de lar temporario em `/lar-temporario`.
- Conteudo educativo em `/adocao-responsavel`.
- Pagina para ONGs em `/para-ongs`.
- Politica simples de privacidade em `/privacidade`.
- Estados vazios para listas sem dados.
- Scripts SQL para tabelas, buckets de imagens e Row Level Security.

## Tecnologias usadas

- Next.js com App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Lucide React

## Como rodar localmente

```bash
npm install
npm run dev
```

No Windows desta maquina, use:

```bash
npm.cmd install
npm.cmd run dev
```

Acesse `http://localhost:3000`.

## Como configurar Supabase

1. Crie um projeto no Supabase.
2. Acesse `/configurar-supabase` no PetLar.
3. Cole somente a connection string do `Session Pooler`.
4. Clique em `Salvar e configurar`.
5. Na Vercel, faca `Redeploy` para o site carregar as novas variaveis.

Em ambiente local, a pagina grava `.env.local`. Em producao, para manter a tela com um campo so, o projeto precisa ter `PETLAR_VERCEL_TOKEN` e `PETLAR_VERCEL_PROJECT_ID` configurados uma vez no painel da Vercel.

## Variaveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres.PROJECT_REF:SUA-SENHA@aws-0-region.pooler.supabase.com:5432/postgres
SUPABASE_DB_POOLER_URL=postgresql://postgres.PROJECT_REF:SUA-SENHA@aws-0-region.pooler.supabase.com:5432/postgres
PETLAR_SETUP_PASSWORD=senha-opcional-para-proteger-a-pagina
PETLAR_VERCEL_TOKEN=token-opcional-para-a-pagina-salvar-na-vercel
PETLAR_VERCEL_PROJECT_ID=PETLAR
PETLAR_VERCEL_TEAM_ID=team-opcional
```

## Estrutura de pastas

```text
src/
  app/
    pets/
    login/
    cadastro/
    dashboard/
    interesse/
    lar-temporario/
    adocao-responsavel/
    para-ongs/
    privacidade/
  components/
  data/
  lib/supabase/
supabase/
  schema.sql
  seed.sql
EXTENSAO.md
GUIA_ONGS.md
```

## Modelo de banco de dados

As tabelas principais sao:

- `profiles`: perfil do usuario e tipo de conta.
- `organizations`: ONG ou protetor independente.
- `pets`: animais cadastrados.
- `pet_images`: URLs das imagens de cada pet.
- `adoption_applications`: formularios de interesse em adocao.
- `temporary_homes`: voluntarios para lar temporario.

O arquivo `supabase/schema.sql` cria as tabelas, triggers, buckets `pet-images` e `profile-avatars` e politicas RLS.

## Regras de seguranca e privacidade

- Visitantes leem apenas pets disponiveis e dados publicos das organizacoes.
- Usuarios autenticados criam formularios de adocao.
- Adotantes visualizam apenas seus proprios pedidos.
- ONGs/protetores editam apenas seus proprios pets.
- ONGs/protetores visualizam apenas formularios enviados para seus pets.
- Nao ha CPF nem endereco completo no MVP.
- Dados sao usados apenas para analise inicial e contato.
- Conta e dados do usuario podem ser removidos pela pagina de configuracoes.

## Proximos passos

- Criar painel admin para aprovacao e moderacao.
- Adicionar testes automatizados de rotas e formularios.
- Adicionar notificacoes por e-mail para novas solicitacoes.
- Preparar deploy em producao com variaveis de ambiente protegidas.
- Revisar fluxos com uma ONG ou protetor antes do uso real.

## Relacao com extensao universitaria

O PetLar demonstra como Ciencia da Computacao pode apoiar uma demanda social concreta: a protecao animal. O produto aproxima comunidade, tecnologia e responsabilidade social, oferecendo uma solucao pratica para divulgacao, organizacao e triagem inicial de adocoes.

Leia tambem:

- `EXTENSAO.md`: estrutura academica do projeto.
- `GUIA_ONGS.md`: passo a passo de uso por ONGs e protetores.
