import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { formatarData, formatarMoeda } from "@/lib/formatters";
import type { Emenda, ResumoDashboard, Vereador } from "@/types";

type HomeContentProps = {
  resumo: ResumoDashboard;
  emendas: Emenda[];
  vereadores: Vereador[];
};

const icones = {
  valor: <path d="M12 2v20m5-16.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  arquivo: <path d="M6 2h8l4 4v16H6V2Zm8 0v5h5M9 12h6m-6 4h6" />,
  autores: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M16 4.5a3 3 0 0 1 0 6M16 14c2.6.2 4 2.2 4.5 5" /></>,
  entidades: <><path d="M3 21h18M5 21V8h14v13M3 8l9-5 9 5M8 12h2m4 0h2m-8 4h2m4 0h2" /></>,
};

const coresAssuntos = ["#20c997", "#5275dc", "#ef4d3f", "#f2b632", "#38b9c9", "#e9367a", "#f47b20", "#9299a8", "#5b21e8"];

function Indicador({ titulo, valor, detalhe, icone }: { titulo: string; valor: string; detalhe: string; icone: keyof typeof icones }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{titulo}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#12334d]">{valor}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3f8] text-[#19689b]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">{icones[icone]}</svg>
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detalhe}</p>
    </article>
  );
}

export function HomeContent({ resumo, emendas, vereadores }: HomeContentProps) {
  const vereadoresPorId = new Map(vereadores.map((vereador) => [vereador.id, vereador]));
  const outrosAssuntos = resumo.porAssunto.slice(8);
  const assuntos = outrosAssuntos.length
    ? [
        ...resumo.porAssunto.slice(0, 8),
        {
          nome: "Outros",
          quantidade: outrosAssuntos.reduce((total, item) => total + item.quantidade, 0),
          valorEmCentavos: outrosAssuntos.reduce((total, item) => total + item.valorEmCentavos, 0),
        },
      ]
    : resumo.porAssunto;
  const maiorQuantidade = Math.max(...assuntos.map((item) => item.quantidade), 1);
  const destaques = resumo.porVereador
    .map((item) => ({ ...item, vereador: vereadoresPorId.get(item.vereadorId) }))
    .filter((item) => item.vereador)
    .slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-16">
        <section id="indicadores" aria-labelledby="titulo-indicadores">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">Visão geral</p>
            <h2 id="titulo-indicadores" className="mt-2 text-2xl font-semibold tracking-tight text-[#12334d] sm:text-3xl">Recursos da legislatura</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador titulo="Valor total destinado" valor={formatarMoeda(resumo.valorTotalEmCentavos)} detalhe="Somatório das emendas cadastradas" icone="valor" />
            <Indicador titulo="Total de emendas" valor={String(resumo.totalEmendas)} detalhe="Registros disponíveis para consulta" icone="arquivo" />
            <Indicador titulo="Autores" valor={String(resumo.porVereador.length)} detalhe="Parlamentares com emendas cadastradas" icone="autores" />
            <Indicador titulo="Entidades beneficiadas" valor={String(resumo.entidadesBeneficiadas)} detalhe="Beneficiários únicos contemplados" icone="entidades" />
          </div>
        </section>

        <section id="areas" className="mt-14 space-y-6" aria-labelledby="titulo-areas">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#5275dc]" aria-hidden="true"><path d="M4 19h17v2H2V4h2v15Zm3-2H5v-6h2v6Zm4 0H9V7h2v10Zm4 0h-2V9h2v8Zm4 0h-2V5h2v12Z" /></svg>
              <h2 id="titulo-areas" className="font-semibold text-[#12334d]">Emendas por assunto</h2>
            </div>
            {assuntos.length ? (
              <div className="mt-6 overflow-x-auto pb-2">
                <div className="grid h-[310px] min-w-[720px] grid-cols-[repeat(var(--colunas),minmax(70px,1fr))] items-end gap-5 border-b border-slate-300 px-5" style={{ "--colunas": assuntos.length, backgroundImage: "repeating-linear-gradient(to top, transparent 0, transparent 43px, #e8edf2 44px)" } as CSSProperties}>
                  {assuntos.map((item) => (
                    <div key={item.nome} className="flex h-full flex-col justify-end text-center">
                      <span className="mb-2 text-xs font-semibold text-slate-500">{item.quantidade}</span>
                      <div className="mx-auto w-full max-w-[96px] rounded-t-md bg-[#5275dc] transition hover:bg-[#3f63cf]" style={{ height: `${Math.max(4, (item.quantidade / maiorQuantidade) * 240)}px` }} title={`${item.nome}: ${item.quantidade} emendas`} />
                      <span className="mt-3 h-10 overflow-hidden text-xs leading-4 text-slate-600" title={item.nome}>{item.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="py-14 text-center text-sm text-slate-500">Nenhum assunto cadastrado.</p>}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[#19689b]" aria-hidden="true"><path d="M12 2v14m4-10H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H7M4 22h16" /></svg>
              <h2 className="font-semibold text-[#12334d]">Destino das emendas impositivas</h2>
            </div>
            {assuntos.length ? (
              <>
                <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex h-12 min-w-0 flex-1 overflow-hidden rounded-lg shadow-sm">
                    {assuntos.map((item, index) => {
                      const percentual = resumo.valorTotalEmCentavos ? (item.valorEmCentavos / resumo.valorTotalEmCentavos) * 100 : 0;
                      return <div key={item.nome} className="flex min-w-[2px] items-center justify-center border-r border-white/60 text-[11px] font-bold text-white" style={{ width: `${percentual}%`, backgroundColor: coresAssuntos[index] }} title={`${item.nome}: ${percentual.toFixed(1)}%`}>{percentual >= 4 ? `${percentual.toFixed(percentual >= 10 ? 0 : 1)}%` : ""}</div>;
                    })}
                  </div>
                  <div className="shrink-0 border-l-4 border-slate-700 pl-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Total</p><strong className="text-sm text-slate-800">{formatarMoeda(resumo.valorTotalEmCentavos)}</strong></div>
                </div>
                <div className="mt-8 grid gap-3 border-t border-slate-200 pt-5 md:grid-cols-2 xl:grid-cols-3">
                  {assuntos.map((item, index) => {
                    const percentual = resumo.valorTotalEmCentavos ? (item.valorEmCentavos / resumo.valorTotalEmCentavos) * 100 : 0;
                    return <div key={item.nome} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3"><span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: coresAssuntos[index] }} /><span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700" title={item.nome}>{item.nome}</span><strong className="text-xs text-emerald-600">{formatarMoeda(item.valorEmCentavos)}</strong><span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500">{percentual.toFixed(1)}%</span></div>;
                  })}
                </div>
              </>
            ) : <p className="py-14 text-center text-sm text-slate-500">Nenhum destino cadastrado.</p>}
          </article>
        </section>

        <section id="emendas" className="mt-14" aria-labelledby="titulo-emendas">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">Atualizações</p>
              <h2 id="titulo-emendas" className="mt-2 text-2xl font-semibold text-[#12334d]">Emendas recentes</h2>
              <p className="mt-1 text-sm text-slate-500">Últimos registros disponibilizados no portal.</p>
            </div>
            <Link href="/emendas" className="text-sm font-semibold text-[#19689b] hover:underline">Ver todas as emendas →</Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-5 py-4">Emenda</th><th className="px-5 py-4">Vereador</th><th className="px-5 py-4">Área</th><th className="px-5 py-4">Protocolo</th><th className="px-5 py-4 text-right">Valor</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {emendas.map((emenda) => (
                    <tr key={emenda.id} className="transition hover:bg-slate-50/80">
                      <td className="max-w-[320px] px-5 py-4"><Link href={`/emendas/${emenda.id}`} className="font-semibold text-slate-800 hover:text-[#19689b] hover:underline">{emenda.titulo}</Link><p className="mt-1 truncate text-xs text-slate-500">{emenda.beneficiarioFinal}</p></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{vereadoresPorId.get(emenda.vereadorId)?.nome ?? "Não identificado"}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-[#edf5f8] px-2.5 py-1 text-xs font-medium text-[#19689b]">{emenda.assunto}</span></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatarData(emenda.dataProtocolo)}</td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">{formatarMoeda(emenda.valorEmCentavos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!emendas.length && <p className="px-6 py-12 text-center text-sm text-slate-500">Nenhuma emenda cadastrada.</p>}
          </div>
        </section>

        <section id="vereadores" className="mt-14 rounded-3xl bg-[#eaf3f8] p-6 sm:p-10" aria-labelledby="titulo-vereadores">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">Atuação parlamentar</p>
              <h2 id="titulo-vereadores" className="mt-2 text-2xl font-semibold text-[#12334d]">Consulte por vereador</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Veja quanto cada parlamentar indicou e consulte individualmente suas emendas.</p>
            </div>
            <Link href="/vereadores" className="inline-flex h-11 items-center justify-center rounded-xl bg-[#19689b] px-5 text-sm font-semibold text-white transition hover:bg-[#12577f]">Ver todos os vereadores</Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destaques.map((item) => (
              <Link key={item.vereadorId} href={`/vereadores/${item.vereadorId}`} className="rounded-2xl bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="relative flex h-14 w-14 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white">
                  {item.vereador!.imagemUrl ? (
                    <Image src={item.vereador!.imagemUrl} alt={`Foto de ${item.vereador!.nome}`} fill sizes="56px" className="object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="m-auto h-7 w-7 text-slate-400" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.7-5 3.2-7 7.5-7s6.8 2 7.5 7" /></svg>
                  )}
                </span>
                <h3 className="mt-4 font-semibold text-slate-800">{item.vereador!.nome}</h3>
                <p className="mt-3 text-lg font-semibold text-[#19689b]">{formatarMoeda(item.valorEmCentavos)}</p>
                <p className="mt-1 text-xs text-slate-500">{item.quantidade} {item.quantidade === 1 ? "emenda" : "emendas"}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer id="sobre" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center lg:px-10">
          <div><strong className="font-semibold text-[#12334d]">Câmara Municipal de Pouso Alto</strong><p className="mt-1 text-xs">Portal de transparência das emendas impositivas.</p></div>
          <span className="text-xs">Legislatura 2025–2028</span>
        </div>
      </footer>
    </>
  );
}
