import { cacheLife, cacheTag } from 'next/cache';

import {
  emendasRepository,
  legislaturasRepository,
  vereadoresRepository,
} from '@/repositories';
import type { FiltrosEmenda, FiltrosResumo, FiltrosVereador } from '@/types';

/**
 * Consultas publicas mudam pouco. O perfil "days" revalida os dados uma vez
 * por dia e o cacheTag deixa a invalidacao sob demanda preparada para quando
 * houver uma tela de cadastro neste projeto.
 */
export async function listarLegislaturas() {
  'use cache: remote';
  cacheLife('days');
  cacheTag('legislaturas');
  console.info('[CACHE_FILL] Consultando legislaturas no MongoDB', {
    ocorridoEm: new Date().toISOString(),
    operacao: 'listar',
  });
  return legislaturasRepository.listar();
}

export async function listarAnosExecucao(vereadorId?: string) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('emendas');
  return emendasRepository.listarAnosExecucao(vereadorId);
}

export async function listarLegislaturaIdsPorAno(ano: number) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('emendas');
  return emendasRepository.listarLegislaturaIdsPorAno(ano);
}

export async function buscarLegislaturaPorId(id: string) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('legislaturas');
  console.info('[CACHE_FILL] Consultando legislatura no MongoDB', {
    ocorridoEm: new Date().toISOString(),
    operacao: 'buscarPorId',
    id,
  });
  return legislaturasRepository.buscarPorId(id);
}

export async function listarVereadores(filtros: FiltrosVereador = {}) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('vereadores');
  cacheTag('emendas');
  cacheTag('legislaturas');
  console.info('[CACHE_FILL] Consultando vereadores no MongoDB', {
    ocorridoEm: new Date().toISOString(),
    operacao: 'listar',
    legislaturaIds: filtros.legislaturaIds,
  });
  return vereadoresRepository.listar(filtros);
}

export async function buscarVereadorPorId(id: string) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('vereadores');
  console.info('[CACHE_FILL] Consultando vereador no MongoDB', {
    ocorridoEm: new Date().toISOString(),
    operacao: 'buscarPorId',
    id,
  });
  return vereadoresRepository.buscarPorId(id);
}

export async function listarEmendas(filtros: FiltrosEmenda = {}) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('emendas');
  console.info('[CACHE_FILL] Consultando emendas no MongoDB', {
    ocorridoEm: new Date().toISOString(),
    operacao: 'listar',
    legislaturaId: filtros.legislaturaId,
    vereadorId: filtros.vereadorId,
    periodoExecucao: filtros.periodoExecucao,
    pagina: filtros.pagina,
    itensPorPagina: filtros.itensPorPagina,
    possuiBusca: Boolean(filtros.busca),
  });
  return emendasRepository.listar(filtros);
}

export async function listarEmendasParaRelatorio(ano: number) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('emendas');
  return emendasRepository.listarParaRelatorio(ano);
}

export async function buscarEmendaPorId(id: string) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('emendas');
  console.info('[CACHE_FILL] Consultando emenda no MongoDB', {
    ocorridoEm: new Date().toISOString(),
    operacao: 'buscarPorId',
    id,
  });
  return emendasRepository.buscarPorId(id);
}

export async function obterResumoEmendas(filtros: FiltrosResumo = {}) {
  'use cache: remote';
  cacheLife('days');
  cacheTag('emendas');
  console.info('[CACHE_FILL] Consultando resumo de emendas no MongoDB', {
    ocorridoEm: new Date().toISOString(),
    operacao: 'obterResumo',
    legislaturaId: filtros.legislaturaId,
    vereadorId: filtros.vereadorId,
    periodoExecucao: filtros.periodoExecucao,
  });
  return emendasRepository.obterResumo(filtros);
}
