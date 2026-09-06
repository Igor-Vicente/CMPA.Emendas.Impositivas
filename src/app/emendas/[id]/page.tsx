import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { Header } from "@/components/header";
import { PageLoading } from "@/components/page-loading";
import { buscarEmendaPorId, buscarLegislaturaPorId, buscarVereadorPorId } from "@/lib/dados";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import { comLegislatura } from "@/lib/legislaturas";
import type { Documento } from "@/types";

type Props = { params: Promise<{ id: string }> };

function Campo({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">{titulo}</dt>
      <dd className="mt-2 text-sm font-medium leading-6 text-slate-800">{valor || "Não informado"}</dd>
    </div>
  );
}

function Texto({ titulo, conteudo }: { titulo: string; conteudo: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
      <h2 className="text-lg font-semibold text-[#12334d]">{titulo}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{conteudo || "Não informado."}</p>
    </section>
  );
}

function TextoComLinks({ conteudo }: { conteudo: string }) {
  const padraoLink = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const partes: ReactNode[] = [];
  let inicio = 0;

  for (const correspondencia of conteudo.matchAll(padraoLink)) {
    const indice = correspondencia.index;

    if (indice > inicio) partes.push(conteudo.slice(inicio, indice));

    partes.push(
      <a
        key={`${indice}-${correspondencia[2]}`}
        href={correspondencia[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#19689b] underline decoration-[#9cc6dc] underline-offset-2 hover:text-[#12334d]"
      >
        {correspondencia[1]}
      </a>,
    );

    inicio = indice + correspondencia[0].length;
  }

  if (inicio < conteudo.length) partes.push(conteudo.slice(inicio));

  return partes;
}

function Documentos({ titulo, itens }: { titulo: string; itens: Documento[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-[#12334d]">{titulo}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {itens.length}
        </span>
      </div>
      {itens.length ? (
        <ul className="mt-4 space-y-2">
          {itens.map((documento, index) => (
            <li key={`${documento.url}-${index}`}>
              <a
                href={documento.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-[#19689b] transition hover:bg-[#eaf3f8]"
              >
                <span className="min-w-0 truncate">{documento.nome}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Nenhum documento disponibilizado.</p>
      )}
    </section>
  );
}

export default function EmendaPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <EmendaPageContent {...props} />
    </Suspense>
  );
}

async function EmendaPageContent({ params }: Props) {
  const { id } = await params;
  const emenda = await buscarEmendaPorId(id);

  if (!emenda) notFound();

  const [vereador, legislatura] = await Promise.all([
    buscarVereadorPorId(emenda.vereadorId),
    buscarLegislaturaPorId(emenda.legislaturaId),
  ]);
  const slug = legislatura?.slug;

  return (
    <>
      <Header legislaturaSlug={slug} />
      <main className="mx-auto min-h-[70vh] max-w-300 px-6 py-10 lg:px-10 lg:py-12">
        <Link
          href={slug ? comLegislatura("/emendas", slug) : "/emendas"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#19689b] hover:underline"
        >
          <span aria-hidden="true">←</span> Voltar para emendas
        </Link>

        <section className="mt-6 rounded-3xl bg-[#12334d] p-7 text-white sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              {emenda.assunto || "Assunto não informado"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                emenda.aprovada ? "bg-emerald-400/20 text-emerald-100" : "bg-amber-300/20 text-amber-100"
              }`}
            >
              {emenda.aprovada ? "Aprovada" : "Não aprovada"}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">{emenda.titulo}</h1>
          <div className="mt-7 flex flex-col justify-between gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-300">Autoria</p>
              {vereador ? (
                <Link
                  href={slug ? comLegislatura(`/vereadores/${vereador.id}`, slug) : `/vereadores/${vereador.id}`}
                  className="mt-1 inline-block font-semibold hover:underline"
                >
                  {vereador.nome}
                </Link>
              ) : (
                <p className="mt-1 font-semibold">Não identificado</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-widest text-slate-300">Valor destinado</p>
              <strong className="mt-1 block text-2xl text-[#e1b45b]">{formatarMoeda(emenda.valorEmCentavos)}</strong>
            </div>
          </div>
        </section>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Campo titulo="Legislatura" valor={legislatura?.titulo ?? "Não informada"} />
          <Campo titulo="Beneficiário final" valor={emenda.beneficiarioFinal} />
          <Campo titulo="Órgão executor" valor={emenda.orgaoExecutor} />
          <Campo titulo="Período de execução" valor={String(emenda.periodoExecucao)} />
          <Campo titulo="Data do protocolo" valor={formatarData(emenda.dataProtocolo)} />
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Texto titulo="Finalidade" conteudo={emenda.finalidade} />
          <Texto titulo="Justificativa" conteudo={emenda.justificativa} />
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-[#12334d]">Tramitação legislativa</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Tramitação</dt>
              <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {emenda.tramitacaoLegislativa ? (
                  <TextoComLinks conteudo={emenda.tramitacaoLegislativa} />
                ) : (
                  "Não informada."
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Votação</dt>
              <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {emenda.votacao || "Não informada."}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Resultado da deliberação
              </dt>
              <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {emenda.resultadoDeliberacao || "Não informado."}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Alterações</dt>
              <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {emenda.alteracoes || "Nenhuma alteração informada."}
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-6">
          <Texto titulo="Detalhes da execução" conteudo={emenda.detalhesRelatorioExecutivo} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Documentos titulo="Plano de trabalho" itens={emenda.planoDeTrabalho} />
          <Documentos titulo="Pareceres jurídicos" itens={emenda.pareceresJuridicos} />
          <Documentos titulo="Relatórios do Executivo" itens={emenda.relatoriosExecutivo} />
        </div>
      </main>
    </>
  );
}
