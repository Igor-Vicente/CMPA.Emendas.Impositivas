import { ObjectId, type WithId } from "mongodb";

import { getDatabase } from "@/libs/mongo";
import type { LegislaturasRepository } from "@/repositories/contracts";
import type { Legislatura } from "@/types";

type LegislaturaMongo = Omit<Legislatura, "id">;

function paraDominio(documento: WithId<LegislaturaMongo>): Legislatura {
  const { _id, ...dados } = documento;
  return { ...dados, id: _id.toHexString() };
}

export class MongoLegislaturasRepository implements LegislaturasRepository {
  private async colecao() {
    const db = await getDatabase();
    return db.collection<LegislaturaMongo>("legislaturas");
  }

  async listar(): Promise<Legislatura[]> {
    const colecao = await this.colecao();
    const legislaturas = await colecao
      .find()
      .sort({ anoInicio: -1 })
      .toArray();
    return legislaturas.map(paraDominio);
  }

  async buscarPorId(id: string): Promise<Legislatura | null> {
    if (!ObjectId.isValid(id)) return null;

    const colecao = await this.colecao();
    const legislatura = await colecao.findOne({ _id: new ObjectId(id) });
    return legislatura ? paraDominio(legislatura) : null;
  }

  async buscarPorSlug(slug: string): Promise<Legislatura | null> {
    const colecao = await this.colecao();
    const legislatura = await colecao.findOne({ slug });
    return legislatura ? paraDominio(legislatura) : null;
  }

  async buscarAtiva(): Promise<Legislatura | null> {
    const colecao = await this.colecao();
    const legislatura = await colecao.findOne(
      { ativa: true },
      { sort: { anoInicio: -1 } },
    );
    return legislatura ? paraDominio(legislatura) : null;
  }
}
