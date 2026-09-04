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
  return legislaturasRepository.listar();
}

export async function buscarLegislaturaPorId(id: string) {
  "use cache";
  cacheLife("days");
  cacheTag("legislaturas");
  return legislaturasRepository.buscarPorId(id);
}

export async function listarVereadores(filtros: FiltrosVereador = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("vereadores");
  return vereadoresRepository.listar(filtros);
}

export async function buscarVereadorPorId(id: string) {
  "use cache";
  cacheLife("days");
  cacheTag("vereadores");
  return vereadoresRepository.buscarPorId(id);
}

export async function listarEmendas(filtros: FiltrosEmenda = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("emendas");
  return emendasRepository.listar(filtros);
}

export async function buscarEmendaPorId(id: string) {
  "use cache";
  cacheLife("days");
  cacheTag("emendas");
  return emendasRepository.buscarPorId(id);
}

export async function obterResumoEmendas(filtros: FiltrosResumo = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("emendas");
  return emendasRepository.obterResumo(filtros);
}
