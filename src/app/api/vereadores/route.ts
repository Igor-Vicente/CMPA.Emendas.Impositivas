import { NextResponse } from "next/server";

import { vereadoresRepository } from "@/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await vereadoresRepository.listar());
  } catch (error) {
    console.error("Erro ao listar vereadores:", error);
    return NextResponse.json(
      { erro: "Não foi possível consultar os vereadores." },
      { status: 500 },
    );
  }
}
