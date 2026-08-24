import { NextResponse } from "next/server";

import { vereadoresRepository } from "@/repositories";

export const dynamic = "force-dynamic";

type Contexto = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, contexto: Contexto) {
  try {
    const { id } = await contexto.params;
    const vereador = await vereadoresRepository.buscarPorId(id);

    if (!vereador) {
      return NextResponse.json(
        { erro: "Vereador não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(vereador);
  } catch (error) {
    console.error("Erro ao buscar vereador:", error);
    return NextResponse.json(
      { erro: "Não foi possível consultar o vereador." },
      { status: 500 },
    );
  }
}
