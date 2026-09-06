import { listarLegislaturas } from "@/lib/dados";
import type { Legislatura } from "@/types";

export function primeiroParametro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export async function carregarContextoLegislatura(slug?: string): Promise<{
  legislaturas: Legislatura[];
  legislatura: Legislatura | null;
}> {
  const legislaturas = await listarLegislaturas();
  const legislatura = slug
    ? (legislaturas.find((item) => item.slug === slug) ?? null)
    : (legislaturas.find((item) => item.ativa) ?? legislaturas[0] ?? null);

  return { legislaturas, legislatura };
}

export function comLegislatura(caminho: string, slug: string): string {
  const separador = caminho.includes("?") ? "&" : "?";
  return `${caminho}${separador}legislatura=${encodeURIComponent(slug)}`;
}
