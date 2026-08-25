import Link from "next/link";

import { Header } from "@/components/header";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import { emendasRepository, vereadoresRepository } from "@/repositories";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function primeiro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function EmendasPage({ searchParams }: Props) {
  const params = await searchParams;
  const busca = primeiro(params.busca)?.trim();
  const pagina = Math.max(1, Number(primeiro(params.pagina)) || 1);
  const [resultado, vereadores] = await Promise.all([
    emendasRepository.listar({ busca, pagina, itensPorPagina: 12 }),
    vereadoresRepository.listar(),
  ]);
  const vereadoresPorId = new Map(vereadores.map((item) => [item.id, item.nome]));

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-6 py-12 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">Consulta pública</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#12334d]">Todas as emendas</h1>
        <p className="mt-2 text-sm text-slate-500">Consulte os registros da legislatura atual.</p>

        <form className="mt-7 flex max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-white p-2">
          <input name="busca" defaultValue={busca} placeholder="Buscar por título, justificativa ou assunto" className="h-11 min-w-0 flex-1 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[#d5e8f1]" />
          <button className="rounded-xl bg-[#19689b] px-5 text-sm font-semibold text-white hover:bg-[#12577f]">Buscar</button>
        </form>

        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-5 py-4">Emenda</th><th className="px-5 py-4">Vereador</th><th className="px-5 py-4">Área</th><th className="px-5 py-4">Protocolo</th><th className="px-5 py-4 text-right">Valor</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {resultado.itens.map((emenda) => <tr key={emenda.id} className="hover:bg-slate-50"><td className="max-w-[330px] px-5 py-4"><p className="font-semibold text-slate-800">{emenda.titulo}</p><p className="mt-1 truncate text-xs text-slate-500">{emenda.beneficiarioFinal}</p></td><td className="px-5 py-4 text-sm text-slate-600">{vereadoresPorId.get(emenda.vereadorId) ?? "Não identificado"}</td><td className="px-5 py-4 text-sm text-[#19689b]">{emenda.assunto}</td><td className="px-5 py-4 text-sm text-slate-600">{formatarData(emenda.dataProtocolo)}</td><td className="px-5 py-4 text-right text-sm font-semibold">{formatarMoeda(emenda.valorEmCentavos)}</td></tr>)}
              </tbody>
            </table>
          </div>
          {!resultado.itens.length && <p className="px-6 py-14 text-center text-sm text-slate-500">Nenhuma emenda encontrada.</p>}
        </div>
        {resultado.totalPaginas > 1 && <div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-500">Página {resultado.pagina} de {resultado.totalPaginas}</span><div className="flex gap-2">{resultado.pagina > 1 && <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2" href={`/emendas?${new URLSearchParams({ ...(busca ? { busca } : {}), pagina: String(pagina - 1) })}`}>Anterior</Link>}{resultado.pagina < resultado.totalPaginas && <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2" href={`/emendas?${new URLSearchParams({ ...(busca ? { busca } : {}), pagina: String(pagina + 1) })}`}>Próxima</Link>}</div></div>}
      </main>
    </>
  );
}
