import { cacheLife, cacheTag } from "next/cache";

import {
  emendasRepository,
  legislaturasRepository,
  vereadoresRepository,
} from "@/repositories";
import type { FiltrosEmenda, FiltrosResumo, FiltrosVereador } from "@/types";

/**
 * Consultas publicas mudam pouco. O perfil "days" revalida os dados uma vez
 * por dia e o cacheTag deixa a invalidacao sob demanda preparada para quando
 * houver uma tela de cadastro neste projeto.
 */
export async function listarLegislaturas() {
  "use cache";
  cacheLife("days");
  cacheTag("legislaturas");
  // console.info("[CACHE_FILL] Consultando legislaturas no MongoDB", {
  //   operacao: "listar",
  // });
  return legislaturasRepository.listar();
}

export async function buscarLegislaturaPorId(id: string) {
  "use cache";
  cacheLife("days");
  cacheTag("legislaturas");
  // console.info("[CACHE_FILL] Consultando legislatura no MongoDB", {
  //   operacao: "buscarPorId",
  //   id,
  // });
  return legislaturasRepository.buscarPorId(id);
}

export async function listarVereadores(filtros: FiltrosVereador = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("vereadores");
  // console.info("[CACHE_FILL] Consultando vereadores no MongoDB", {
  //   operacao: "listar",
  //   legislaturaId: filtros.legislaturaId,
  // });
  return vereadoresRepository.listar(filtros);
}

export async function buscarVereadorPorId(id: string) {
  "use cache";
  cacheLife("days");
  cacheTag("vereadores");
  // console.info("[CACHE_FILL] Consultando vereador no MongoDB", {
  //   operacao: "buscarPorId",
  //   id,
  // });
  return vereadoresRepository.buscarPorId(id);
}

export async function listarEmendas(filtros: FiltrosEmenda = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("emendas");
  // console.info("[CACHE_FILL] Consultando emendas no MongoDB", {
  //   operacao: "listar",
  //   legislaturaId: filtros.legislaturaId,
  //   vereadorId: filtros.vereadorId,
  //   pagina: filtros.pagina,
  //   itensPorPagina: filtros.itensPorPagina,
  //   possuiBusca: Boolean(filtros.busca),
  // });
  return emendasRepository.listar(filtros);
}

export async function buscarEmendaPorId(id: string) {
  "use cache";
  cacheLife("days");
  cacheTag("emendas");
  // console.info("[CACHE_FILL] Consultando emenda no MongoDB", {
  //   operacao: "buscarPorId",
  //   id,
  // });
  return emendasRepository.buscarPorId(id);
}

export async function obterResumoEmendas(filtros: FiltrosResumo = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("emendas");
  // console.info("[CACHE_FILL] Consultando resumo de emendas no MongoDB", {
  //   operacao: "obterResumo",
  //   legislaturaId: filtros.legislaturaId,
  //   vereadorId: filtros.vereadorId,
  // });
  return emendasRepository.obterResumo(filtros);
}
