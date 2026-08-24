import { NextResponse } from "next/server";

import { emendasRepository } from "@/repositories";

export const dynamic = "force-dynamic";

type Contexto = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, contexto: Contexto) {
  try {
    const { id } = await contexto.params;
    const emenda = await emendasRepository.buscarPorId(id);

    if (!emenda) {
      return NextResponse.json(
        { erro: "Emenda não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json(emenda);
  } catch (error) {
    console.error("Erro ao buscar emenda:", error);
    return NextResponse.json(
      { erro: "Não foi possível consultar a emenda." },
      { status: 500 },
    );
  }
}
