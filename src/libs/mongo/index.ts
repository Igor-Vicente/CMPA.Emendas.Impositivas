import { Db, MongoClient, MongoServerSelectionError } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const databaseName = process.env.MONGODB_DB ?? 'camara';

export function getMongoClient(): Promise<MongoClient> {
  if (global._mongoClientPromise) return global._mongoClientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Defina MONGODB_URI no ambiente da aplicação.');
  }

  // Cada instância da Vercel mantém seu próprio pool. Reutilize-o também em
  // produção, sem abrir conexões durante a importação do módulo.
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 60_000,
    waitQueueTimeoutMS: 10_000,
  });

  const promise = client.connect().catch(async (error: unknown) => {
    // Uma promessa rejeitada não pode permanecer no singleton: a próxima
    // consulta precisa poder conectar novamente após uma falha transitória.
    if (global._mongoClientPromise === promise) {
      global._mongoClientPromise = undefined;
    }

    if (error instanceof MongoServerSelectionError) {
      // Registre as causas por servidor sem expor a URI ou credenciais.
      console.error('[MONGODB_CONNECTION_FAILED]', {
        name: error.name,
        servers: Array.from(error.reason?.servers.values() ?? [], (server) => ({
          address: server.address,
          type: server.type,
          errorName: server.error?.name,
          errorCode: server.error?.code,
          causeCode: (server.error?.cause as NodeJS.ErrnoException | undefined)
            ?.code,
        })),
      });
    }

    // Feche somente o cliente cuja conexão falhou, preservando o erro original.
    await client.close().catch(() => undefined);
    throw error;
  });

  global._mongoClientPromise = promise;
  return promise;
}

export async function getDatabase(): Promise<Db> {
  const mongoClient = await getMongoClient();

  return mongoClient.db(databaseName);
}
