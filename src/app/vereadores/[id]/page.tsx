import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import { emendasRepository, vereadoresRepository } from "@/repositories";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function VereadorPage({ params }: Props) {
  const { id } = await params;
  const [vereador, emendas] = await Promise.all([
    vereadoresRepository.buscarPorId(id),
    emendasRepository.listar({ vereadorId: id, pagina: 1, itensPorPagina: 100 }),
  ]);
  if (!vereador) notFound();

  const valorTotal = emendas.itens.reduce((total, emenda) => total + emenda.valorEmCentavos, 0);
  const aprovadas = emendas.itens.filter((emenda) => emenda.aprovada).length;
  const porArea = [...new Set(emendas.itens.map((emenda) => emenda.assunto))];

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-6 py-12 lg:px-10">
        <section className="rounded-3xl bg-[#12334d] p-7 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e1b45b]">Emendas por vereador</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{vereador.nome}</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white/10 p-5"><p className="text-xs text-slate-300">Valor total indicado</p><strong className="mt-2 block text-xl">{formatarMoeda(valorTotal)}</strong></div><div className="rounded-2xl bg-white/10 p-5"><p className="text-xs text-slate-300">Emendas cadastradas</p><strong className="mt-2 block text-xl">{emendas.total}</strong></div><div className="rounded-2xl bg-white/10 p-5"><p className="text-xs text-slate-300">Emendas aprovadas</p><strong className="mt-2 block text-xl">{aprovadas}</strong></div></div>
        </section>

        <section className="mt-10">
          <div><h2 className="text-2xl font-semibold text-[#12334d]">Emendas apresentadas</h2><p className="mt-1 text-sm text-slate-500">Áreas contempladas: {porArea.join(", ") || "nenhuma área informada"}.</p></div>
          <div className="mt-6 grid gap-4">
            {emendas.itens.map((emenda) => <Link key={emenda.id} href={`/emendas/${emenda.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#9cc6dc] hover:shadow-md sm:p-6"><article><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><span className="rounded-full bg-[#edf5f8] px-2.5 py-1 text-xs font-medium text-[#19689b]">{emenda.assunto}</span><h3 className="mt-3 text-lg font-semibold text-slate-800">{emenda.titulo}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{emenda.finalidade}</p></div><strong className="shrink-0 text-lg text-[#19689b]">{formatarMoeda(emenda.valorEmCentavos)}</strong></div><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><span>Beneficiário: {emenda.beneficiarioFinal}</span><span>Protocolo: {formatarData(emenda.dataProtocolo)}</span><span className={emenda.aprovada ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{emenda.aprovada ? "Aprovada" : "Não aprovada"}</span></div></article></Link>)}
            {!emendas.itens.length && <p className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-500">Nenhuma emenda cadastrada para este vereador.</p>}
          </div>
        </section>
      </main>
    </>
  );
}
