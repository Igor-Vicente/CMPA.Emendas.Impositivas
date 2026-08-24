import { NextResponse } from "next/server";

import { emendasRepository, vereadoresRepository } from "@/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [resumo, vereadores] = await Promise.all([
      emendasRepository.obterResumo(),
      vereadoresRepository.listar(),
    ]);
    const vereadoresPorId = new Map(
      vereadores.map((vereador) => [vereador.id, vereador]),
    );

    return NextResponse.json({
      ...resumo,
      porVereador: resumo.porVereador.map((item) => ({
        ...item,
        vereador: vereadoresPorId.get(item.vereadorId) ?? null,
      })),
    });
  } catch (error) {
    console.error("Erro ao montar dashboard:", error);
    return NextResponse.json(
      { erro: "Não foi possível consultar o resumo das emendas." },
      { status: 500 },
    );
  }
}
