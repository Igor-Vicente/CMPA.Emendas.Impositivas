This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

As consultas publicas ao MongoDB usam o cache de dados do Next.js com o perfil
`days`: o conteudo pode ser servido do cache e e revalidado em segundo plano uma
vez por dia. As entradas tambem recebem tags (`emendas`, `vereadores` e
`legislaturas`) para permitir invalidacao sob demanda quando houver uma rotina de
cadastro no projeto.

A conexão com o MongoDB é aberta sob demanda e compartilhada pelas consultas de
cada instância, inclusive em produção. O pool permite até 10 conexões de consulta
por servidor (além das conexões de monitoramento do driver), fecha conexões ociosas
após 60 segundos e limita a espera por uma conexão do pool a 10 segundos. O tempo
de seleção do servidor continua no padrão do driver, de 30 segundos.
Uma falha na conexão inicial descarta a promessa rejeitada e fecha aquele cliente;
a próxima consulta pode tentar conectar novamente. Uma conexão já estabelecida
continua sob o gerenciamento de reconexão do driver.

Em caso de `MongoServerSelectionError` na conexão inicial, procure o evento
`[MONGODB_CONNECTION_FAILED]` nos logs da Vercel. Ele informa o endereço, o estado
e os códigos de erro dos servidores, sem registrar a URI ou credenciais. Confirme
também `MONGODB_URI` e `MONGODB_DB` no ambiente Production da Vercel, o acesso de
rede da aplicação em Network Access no Atlas e as métricas de conexões/eventos do
cluster no horário da falha. O limite do pool vale por instância e não limita o
total de conexões de todas as funções da Vercel.

As páginas possuem uma tela de erro com o botão "Tentar novamente", que solicita
novamente o segmento ao servidor. A repetição do mesmo erro não comprova cache de
HTML: uma promessa de conexão rejeitada também pode produzir esse comportamento.
As alterações locais precisam de um novo deploy para afetar produção.

Para verificar a recuperação de conexão sem acessar o banco, execute
`node --test --test-isolation=none tests/mongo.test.mjs` em Node.js 22 ou superior.

O seletor publico mostra apenas os anos de execucao (`periodoExecucao`) cadastrados
nas emendas. Na pagina de um vereador, ele mostra somente os anos em que esse
vereador possui emendas, inclusive quando a execucao ocorre depois do fim do
mandato. O ano do protocolo aparece nos detalhes, mas nao define o filtro.
A lista de vereadores usa os mandatos das legislaturas vinculadas as emendas do
ano selecionado. Para otimizar as consultas, aplique os indices de
`data/create-indexes.mongodb.js` ao banco da aplicacao.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
