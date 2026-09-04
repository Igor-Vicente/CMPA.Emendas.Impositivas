import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { LegislaturaSelector } from "@/components/legislatura-selector";
import { listarEmendas, listarVereadores } from "@/lib/dados";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import { carregarContextoLegislatura, comLegislatura, primeiroParametro } from "@/lib/legislaturas";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EmendasPage({ searchParams }: Props) {
  const params = await searchParams;
  const busca = primeiroParametro(params.busca)?.trim();
  const pagina = Math.max(1, Number(primeiroParametro(params.pagina)) || 1);
  const { legislaturas, legislatura } = await carregarContextoLegislatura(
    primeiroParametro(params.legislatura),
  );
  if (!legislatura) notFound();

  const [resultado, vereadores] = await Promise.all([
    listarEmendas({ legislaturaId: legislatura.id, busca, pagina, itensPorPagina: 12 }),
    listarVereadores({ legislaturaId: legislatura.id }),
  ]);
  const vereadoresPorId = new Map(vereadores.map((item) => [item.id, item.nome]));
  const hrefPagina = (numero: number) =>
    `/emendas?${new URLSearchParams({
      legislatura: legislatura.slug,
      ...(busca ? { busca } : {}),
      pagina: String(numero),
    })}`;

  return (
    <>
      <Header legislaturaSlug={legislatura.slug} />
      <main className="mx-auto min-h-[70vh] w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">Consulta pública</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#12334d] sm:text-3xl">Todas as emendas</h1>
        <p className="mt-2 text-sm text-slate-500">Consulte os registros da {legislatura.titulo.toLocaleLowerCase("pt-BR")}.</p>

        <div className="mt-7 flex max-w-2xl">
          <LegislaturaSelector
            action="/emendas"
            legislaturas={legislaturas}
            selecionada={legislatura}
            parametrosOcultos={{ busca }}
          />
        </div>

        <form className="mt-7 flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:flex-row sm:gap-3">
          <input type="hidden" name="legislatura" value={legislatura.slug} />
          <input name="busca" defaultValue={busca} placeholder="Buscar por título, justificativa ou assunto" className="h-11 min-w-0 flex-1 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[#d5e8f1]" />
          <button className="h-11 rounded-xl bg-[#19689b] px-5 text-sm font-semibold text-white hover:bg-[#12577f]">Buscar</button>
        </form>

        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-5 py-4">Emenda</th><th className="px-5 py-4">Vereador</th><th className="px-5 py-4">Área</th><th className="px-5 py-4">Protocolo</th><th className="px-5 py-4 text-right">Valor</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {resultado.itens.map((emenda) => <tr key={emenda.id} className="hover:bg-slate-50"><td className="max-w-[330px] px-5 py-4"><Link href={comLegislatura(`/emendas/${emenda.id}`, legislatura.slug)} className="font-semibold text-slate-800 hover:text-[#19689b] hover:underline">{emenda.titulo}</Link><p className="mt-1 truncate text-xs text-slate-500">{emenda.finalidade}</p></td><td className="px-5 py-4 text-sm text-slate-600">{vereadoresPorId.get(emenda.vereadorId) ?? "Não identificado"}</td><td className="px-5 py-4 text-sm text-[#19689b]">{emenda.assunto}</td><td className="px-5 py-4 text-sm text-slate-600">{formatarData(emenda.dataProtocolo)}</td><td className="px-5 py-4 text-right text-sm font-semibold">{formatarMoeda(emenda.valorEmCentavos)}</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-slate-100 md:hidden">
            {resultado.itens.map((emenda) => (
              <article key={emenda.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-[#edf5f8] px-2.5 py-1 text-xs font-medium text-[#19689b]">
                    {emenda.assunto}
                  </span>
                  <strong className="shrink-0 text-sm text-slate-900">
                    {formatarMoeda(emenda.valorEmCentavos)}
                  </strong>
                </div>
                <Link
                  href={comLegislatura(`/emendas/${emenda.id}`, legislatura.slug)}
                  className="mt-3 block font-semibold leading-6 text-slate-800 hover:text-[#19689b] hover:underline"
                >
                  {emenda.titulo}
                </Link>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {emenda.finalidade}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                  <div className="min-w-0">
                    <dt className="text-slate-400">Vereador</dt>
                    <dd className="mt-1 truncate font-medium text-slate-600">
                      {vereadoresPorId.get(emenda.vereadorId) ?? "Não identificado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Protocolo</dt>
                    <dd className="mt-1 font-medium text-slate-600">
                      {formatarData(emenda.dataProtocolo)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          {!resultado.itens.length && <p className="px-6 py-14 text-center text-sm text-slate-500">Nenhuma emenda encontrada.</p>}
        </div>
        {resultado.totalPaginas > 1 && <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-slate-500">Página {resultado.pagina} de {resultado.totalPaginas}</span><div className="flex gap-2">{resultado.pagina > 1 && <Link className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-center sm:flex-none" href={hrefPagina(pagina - 1)}>Anterior</Link>}{resultado.pagina < resultado.totalPaginas && <Link className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-center sm:flex-none" href={hrefPagina(pagina + 1)}>Próxima</Link>}</div></div>}
      </main>
    </>
  );
}
