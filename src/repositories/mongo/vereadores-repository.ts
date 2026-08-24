import { ObjectId, type WithId } from "mongodb";

import { getDatabase } from "@/libs/mongo";
import type { VereadoresRepository } from "@/repositories/contracts";
import type { Vereador } from "@/types";

type VereadorMongo = {
  nome: string;
  imagemUrl?: string;
  biografiaUrl?: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

function paraDominio(documento: WithId<VereadorMongo>): Vereador {
  return {
    id: documento._id.toHexString(),
    nome: documento.nome,
    imagemUrl: documento.imagemUrl,
    biografiaUrl: documento.biografiaUrl,
    criadoEm: documento.criadoEm,
    atualizadoEm: documento.atualizadoEm,
  };
}

function objectIdValido(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export class MongoVereadoresRepository implements VereadoresRepository {
  private async colecao() {
    const db = await getDatabase();
    return db.collection<VereadorMongo>("vereadores");
  }

  async listar(): Promise<Vereador[]> {
    const colecao = await this.colecao();
    const vereadores = await colecao.find().sort({ nome: 1 }).toArray();
    return vereadores.map(paraDominio);
  }

  async buscarPorId(id: string): Promise<Vereador | null> {
    const _id = objectIdValido(id);
    if (!_id) return null;

    const colecao = await this.colecao();
    const vereador = await colecao.findOne({ _id });
    return vereador ? paraDominio(vereador) : null;
  }

}
