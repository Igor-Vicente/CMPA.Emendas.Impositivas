// Execute no banco da aplicação com:
// mongosh "<MONGODB_URI>" --file data/create-indexes.mongodb.js

db.legislaturas.createIndex(
  { slug: 1 },
  {
    unique: true,
    name: "legislatura_slug_unico",
  },
);

db.legislaturas.createIndex(
  { ativa: 1 },
  {
    unique: true,
    partialFilterExpression: { ativa: true },
    name: "uma_legislatura_ativa",
  },
);

db.mandatos.createIndex(
  { legislaturaId: 1, vereadorId: 1 },
  {
    unique: true,
    name: "mandato_legislatura_vereador_unico",
  },
);

db.emendas_impositivas.createIndex(
  { legislaturaId: 1, dataProtocolo: -1 },
  {
    name: "emendas_por_legislatura",
  },
);

db.emendas_impositivas.createIndex(
  { legislaturaId: 1, vereadorId: 1, dataProtocolo: -1 },
  {
    name: "emendas_por_legislatura_e_vereador",
  },
);
