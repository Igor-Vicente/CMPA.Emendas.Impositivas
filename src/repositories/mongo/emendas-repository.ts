import { ObjectId, type Filter, type WithId } from "mongodb";

import { getDatabase } from "@/libs/mongo";
import type { EmendasRepository } from "@/repositories/contracts";
import type {
  AtualizarEmendaInput,
  CriarEmendaInput,
  Documento,
  Emenda,
  FiltrosEmenda,
  ResultadoPaginado,
} from "@/types";

type EmendaMongo = Omit<
  Emenda,
  | "id"
  | "vereadorId"
  | "planoDeTrabalho"
  | "pareceresJuridicos"
  | "relatoriosExecutivo"
> & {
  vereadorId: ObjectId;
  planoDeTrabalho: Documento[];
  pareceresJuridicos: Documento[];
  relatoriosExecutivo: Documento[];
};

function paraDominio(documento: WithId<EmendaMongo>): Emenda {
  const { _id, ...dados } = documento;

  return {
    ...dados,
    id: _id.toHexString(),
    vereadorId: documento.vereadorId.toHexString(),
  };
}

function objectIdValido(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function escaparRegex(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class MongoEmendasRepository implements EmendasRepository {
  private async colecao() {
    const db = await getDatabase();
    return db.collection<EmendaMongo>("emendas");
  }

  async listar(
    filtros: FiltrosEmenda = {},
  ): Promise<ResultadoPaginado<Emenda>> {
    const pagina = Math.max(1, Math.trunc(filtros.pagina ?? 1));
    const itensPorPagina = Math.min(
      100,
      Math.max(1, Math.trunc(filtros.itensPorPagina ?? 20)),
    );
    const query: Filter<EmendaMongo> = {};

    if (filtros.vereadorId) {
      const vereadorId = objectIdValido(filtros.vereadorId);
      if (!vereadorId) return this.resultadoVazio(pagina, itensPorPagina);
      query.vereadorId = vereadorId;
    }

    if (filtros.assunto) {
      query.assunto = { $regex: escaparRegex(filtros.assunto), $options: "i" };
    }

    if (filtros.beneficiarioFinal) {
      query.beneficiarioFinal = {
        $regex: escaparRegex(filtros.beneficiarioFinal),
        $options: "i",
      };
    }

    if (filtros.orgaoExecutor) {
      query.orgaoExecutor = {
        $regex: escaparRegex(filtros.orgaoExecutor),
        $options: "i",
      };
    }

    if (filtros.periodoExecucao !== undefined) {
      query.periodoExecucao = filtros.periodoExecucao;
    }

    if (filtros.aprovada !== undefined) query.aprovada = filtros.aprovada;

    if (filtros.ano !== undefined) {
      const inicio = new Date(Date.UTC(filtros.ano, 0, 1));
      const fim = new Date(Date.UTC(filtros.ano + 1, 0, 1));
      query.dataProtocolo = { $gte: inicio, $lt: fim };
    }

    const colecao = await this.colecao();
    const [documentos, total] = await Promise.all([
      colecao
        .find(query)
        .sort({ dataProtocolo: -1, _id: -1 })
        .skip((pagina - 1) * itensPorPagina)
        .limit(itensPorPagina)
        .toArray(),
      colecao.countDocuments(query),
    ]);

    return {
      itens: documentos.map(paraDominio),
      total,
      pagina,
      itensPorPagina,
      totalPaginas: Math.ceil(total / itensPorPagina),
    };
  }

  async buscarPorId(id: string): Promise<Emenda | null> {
    const _id = objectIdValido(id);
    if (!_id) return null;

    const colecao = await this.colecao();
    const emenda = await colecao.findOne({ _id });
    return emenda ? paraDominio(emenda) : null;
  }

  async criar(dados: CriarEmendaInput): Promise<Emenda> {
    const vereadorId = objectIdValido(dados.vereadorId);
    if (!vereadorId) throw new Error("O ID do vereador é inválido.");

    const colecao = await this.colecao();
    const agora = new Date();
    const emenda: EmendaMongo = {
      ...dados,
      vereadorId,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    const resultado = await colecao.insertOne(emenda);
    return paraDominio({ ...emenda, _id: resultado.insertedId });
  }

  async atualizar(
    id: string,
    dados: AtualizarEmendaInput,
  ): Promise<Emenda | null> {
    const _id = objectIdValido(id);
    if (!_id) return null;

    const vereadorId = dados.vereadorId
      ? objectIdValido(dados.vereadorId)
      : undefined;
    if (dados.vereadorId && !vereadorId) {
      throw new Error("O ID do vereador é inválido.");
    }

    const { vereadorId: vereadorIdOriginal, ...campos } = dados;
    void vereadorIdOriginal;
    const alteracoes: Partial<EmendaMongo> = {
      ...campos,
      ...(vereadorId ? { vereadorId } : {}),
      atualizadoEm: new Date(),
    };
    const colecao = await this.colecao();
    const emenda = await colecao.findOneAndUpdate(
      { _id },
      { $set: alteracoes },
      { returnDocument: "after" },
    );
    return emenda ? paraDominio(emenda) : null;
  }

  async remover(id: string): Promise<boolean> {
    const _id = objectIdValido(id);
    if (!_id) return false;

    const colecao = await this.colecao();
    const resultado = await colecao.deleteOne({ _id });
    return resultado.deletedCount === 1;
  }

  private resultadoVazio(
    pagina: number,
    itensPorPagina: number,
  ): ResultadoPaginado<Emenda> {
    return {
      itens: [],
      total: 0,
      pagina,
      itensPorPagina,
      totalPaginas: 0,
    };
  }
}
