import {
  listarAnosExecucao,
  listarLegislaturaIdsPorAno,
  listarLegislaturas,
} from '@/lib/dados';
import type { Legislatura } from '@/types';

export function primeiroParametro(
  valor: string | string[] | undefined,
): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export async function carregarContextoAno(anoParametro?: string): Promise<{
  anos: number[];
  ano: number | null;
  legislaturaIds: string[];
  legislaturasDoAno: Legislatura[];
}> {
  const [anos, legislaturas] = await Promise.all([
    listarAnosExecucao(),
    listarLegislaturas(),
  ]);

  let ano: number | null;
  if (anoParametro !== undefined) {
    const solicitado = Number(anoParametro);
    ano =
      /^\d{4}$/.test(anoParametro) && anos.includes(solicitado)
        ? solicitado
        : null;
  } else {
    ano = anos[0] ?? null;
  }

  const legislaturaIds =
    ano === null ? [] : await listarLegislaturaIdsPorAno(ano);
  const legislaturasDoAno = legislaturas.filter((item) =>
    legislaturaIds.includes(item.id),
  );

  return { anos, ano, legislaturaIds, legislaturasDoAno };
}

export function comAno(caminho: string, ano: number): string {
  const separador = caminho.includes('?') ? '&' : '?';
  return `${caminho}${separador}ano=${ano}`;
}
