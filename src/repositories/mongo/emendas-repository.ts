import { ObjectId, type Filter, type WithId } from "mongodb";

import { getDatabase } from "@/libs/mongo";
import type { EmendasRepository } from "@/repositories/contracts";
import type {
  Documento,
  Emenda,
  FiltrosEmenda,
  ResumoAgrupado,
  ResumoDashboard,
  ResultadoPaginado,
} from "@/types";

type GrupoMongo = {
  _id: string | number | null;
  quantidade: number;
  valorEmCentavos: number;
};

type GrupoVereadorMongo = Omit<GrupoMongo, "_id"> & {
  _id: ObjectId;
};

type ResumoMongo = {
  geral: Array<{
    totalEmendas: number;
    valorTotalEmCentavos: number;
    emendasAprovadas: number;
    emendasRejeitadas: number;
    aguardandoProtocolo: number;
    beneficiarios: string[];
  }>;
  porAssunto: GrupoMongo[];
  porOrgaoExecutor: GrupoMongo[];
  porPeriodoExecucao: GrupoMongo[];
  porVereador: GrupoVereadorMongo[];
};

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

function mapearGrupo(grupos: GrupoMongo[]): ResumoAgrupado[] {
  return grupos.map(({ _id, ...grupo }) => ({
    nome: _id === null || _id === "" ? "Não informado" : String(_id),
    ...grupo,
  }));
}

export class MongoEmendasRepository implements EmendasRepository {
  private async colecao() {
    const db = await getDatabase();
    return db.collection<EmendaMongo>("emendas_impositivas");
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

    if (filtros.busca) {
      const busca = { $regex: escaparRegex(filtros.busca), $options: "i" };
      query.$or = [
        { titulo: busca },
        { justificativa: busca },
        { assunto: busca },
      ];
    }

    if (filtros.titulo) {
      query.titulo = { $regex: escaparRegex(filtros.titulo), $options: "i" };
    }

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

  async obterResumo(): Promise<ResumoDashboard> {
    const colecao = await this.colecao();
    const [resultado] = await colecao
      .aggregate<ResumoMongo>([
        {
          $facet: {
            geral: [
              {
                $group: {
                  _id: null,
                  totalEmendas: { $sum: 1 },
                  valorTotalEmCentavos: { $sum: "$valorEmCentavos" },
                  emendasAprovadas: {
                    $sum: { $cond: [{ $eq: ["$aprovada", true] }, 1, 0] },
                  },
                  emendasRejeitadas: {
                    $sum: { $cond: [{ $eq: ["$aprovada", false] }, 1, 0] },
                  },
                  aguardandoProtocolo: {
                    $sum: { $cond: [{ $eq: ["$dataProtocolo", null] }, 1, 0] },
                  },
                  beneficiarios: { $addToSet: "$beneficiarioFinal" },
                },
              },
            ],
            porAssunto: [
              {
                $group: {
                  _id: "$assunto",
                  quantidade: { $sum: 1 },
                  valorEmCentavos: { $sum: "$valorEmCentavos" },
                },
              },
              { $sort: { valorEmCentavos: -1 } },
            ],
            porOrgaoExecutor: [
              {
                $group: {
                  _id: "$orgaoExecutor",
                  quantidade: { $sum: 1 },
                  valorEmCentavos: { $sum: "$valorEmCentavos" },
                },
              },
              { $sort: { valorEmCentavos: -1 } },
            ],
            porPeriodoExecucao: [
              {
                $group: {
                  _id: "$periodoExecucao",
                  quantidade: { $sum: 1 },
                  valorEmCentavos: { $sum: "$valorEmCentavos" },
                },
              },
              { $sort: { _id: 1 } },
            ],
            porVereador: [
              {
                $group: {
                  _id: "$vereadorId",
                  quantidade: { $sum: 1 },
                  valorEmCentavos: { $sum: "$valorEmCentavos" },
                },
              },
              { $sort: { valorEmCentavos: -1 } },
            ],
          },
        },
      ])
      .toArray();

    const geral = resultado?.geral[0] ?? {
      totalEmendas: 0,
      valorTotalEmCentavos: 0,
      emendasAprovadas: 0,
      emendasRejeitadas: 0,
      aguardandoProtocolo: 0,
      beneficiarios: [],
    };

    const { beneficiarios, ...totais } = geral;

    return {
      ...totais,
      entidadesBeneficiadas: beneficiarios.filter(
        (beneficiario) => beneficiario.trim() !== "",
      ).length,
      porAssunto: mapearGrupo(resultado?.porAssunto ?? []),
      porOrgaoExecutor: mapearGrupo(resultado?.porOrgaoExecutor ?? []),
      porPeriodoExecucao: mapearGrupo(resultado?.porPeriodoExecucao ?? []),
      porVereador: (resultado?.porVereador ?? []).map(({ _id, ...grupo }) => ({
        vereadorId: _id.toHexString(),
        ...grupo,
      })),
    };
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
