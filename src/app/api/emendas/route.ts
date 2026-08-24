import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { emendasRepository } from "@/repositories";
import type { FiltrosEmenda } from "@/types";

export const dynamic = "force-dynamic";

function texto(searchParams: URLSearchParams, nome: string) {
  return searchParams.get(nome)?.trim() || undefined;
}

function inteiroPositivo(
  searchParams: URLSearchParams,
  nome: string,
): number | undefined | null {
  const valor = searchParams.get(nome);
  if (valor === null) return undefined;

  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pagina = inteiroPositivo(searchParams, "pagina");
  const itensPorPagina = inteiroPositivo(searchParams, "itensPorPagina");
  const periodoExecucao = inteiroPositivo(searchParams, "periodoExecucao");
  const ano = inteiroPositivo(searchParams, "ano");
  const aprovadaParam = searchParams.get("aprovada");

  if ([pagina, itensPorPagina, periodoExecucao, ano].includes(null)) {
    return NextResponse.json(
      { erro: "Os filtros numéricos devem ser números inteiros positivos." },
      { status: 400 },
    );
  }

  if (
    aprovadaParam !== null &&
    aprovadaParam !== "true" &&
    aprovadaParam !== "false"
  ) {
    return NextResponse.json(
      { erro: "O filtro 'aprovada' deve ser 'true' ou 'false'." },
      { status: 400 },
    );
  }

  const filtros: FiltrosEmenda = {
    pagina: pagina ?? undefined,
    itensPorPagina: itensPorPagina ?? undefined,
    periodoExecucao: periodoExecucao ?? undefined,
    ano: ano ?? undefined,
    titulo: texto(searchParams, "titulo"),
    vereadorId: texto(searchParams, "vereadorId"),
    assunto: texto(searchParams, "assunto"),
    beneficiarioFinal: texto(searchParams, "beneficiarioFinal"),
    orgaoExecutor: texto(searchParams, "orgaoExecutor"),
    aprovada:
      aprovadaParam === null ? undefined : aprovadaParam === "true",
  };

  try {
    return NextResponse.json(await emendasRepository.listar(filtros));
  } catch (error) {
    console.error("Erro ao listar emendas:", error);
    return NextResponse.json(
      { erro: "Não foi possível consultar as emendas." },
      { status: 500 },
    );
  }
}
