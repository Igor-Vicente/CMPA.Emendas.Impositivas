import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Header } from "@/components/header";
import { LegislaturaSelector } from "@/components/legislatura-selector";
import { PageLoading } from "@/components/page-loading";
import { listarEmendas, listarVereadores, obterResumoEmendas } from "@/lib/dados";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import { carregarContextoLegislatura, comLegislatura, primeiroParametro } from "@/lib/legislaturas";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function VereadorPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <VereadorPageContent {...props} />
    </Suspense>
  );
}

async function VereadorPageContent({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const pagina = Math.max(1, Number(primeiroParametro(query.pagina)) || 1);
  const { legislaturas, legislatura } = await carregarContextoLegislatura(primeiroParametro(query.legislatura));
  if (!legislatura) notFound();

  const [vereadores, emendas, resumo] = await Promise.all([
    listarVereadores({ legislaturaId: legislatura.id }),
    listarEmendas({
      legislaturaId: legislatura.id,
      vereadorId: id,
      pagina,
      itensPorPagina: 12,
    }),
    obterResumoEmendas({
      legislaturaId: legislatura.id,
      vereadorId: id,
    }),
  ]);
  const vereador = vereadores.find((item) => item.id === id);
  if (!vereador) notFound();

  const porArea = resumo.porAssunto.map((item) => item.nome);
  const hrefPagina = (numero: number) => `${comLegislatura(`/vereadores/${id}`, legislatura.slug)}&pagina=${numero}`;

  return (
    <>
      <Header legislaturaSlug={legislatura.slug} />
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-6 py-12 lg:px-10">
        <div className="mb-7 flex justify-end">
          <LegislaturaSelector action={`/vereadores/${id}`} legislaturas={legislaturas} selecionada={legislatura} />
        </div>

        <section className="rounded-3xl bg-[#12334d] p-7 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e1b45b]">
            Emendas por vereador · {legislatura.titulo}
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{vereador.nome}</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs text-slate-300">Valor total indicado</p>
              <strong className="mt-2 block text-xl">{formatarMoeda(resumo.valorTotalEmCentavos)}</strong>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs text-slate-300">Emendas cadastradas</p>
              <strong className="mt-2 block text-xl">{resumo.totalEmendas}</strong>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs text-slate-300">Emendas aprovadas</p>
              <strong className="mt-2 block text-xl">{resumo.emendasAprovadas}</strong>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-2xl font-semibold text-[#12334d]">Emendas apresentadas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Áreas contempladas: {porArea.join(", ") || "nenhuma área informada"}.
            </p>
          </div>
          <div className="mt-6 grid gap-4">
            {emendas.itens.map((emenda) => (
              <Link
                key={emenda.id}
                href={comLegislatura(`/emendas/${emenda.id}`, legislatura.slug)}
                className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#9cc6dc] hover:shadow-md sm:p-6"
              >
                <article>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <span className="rounded-full bg-[#edf5f8] px-2.5 py-1 text-xs font-medium text-[#19689b]">
                        {emenda.assunto}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-slate-800">{emenda.titulo}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{emenda.finalidade}</p>
                    </div>
                    <strong className="shrink-0 text-lg text-[#19689b]">{formatarMoeda(emenda.valorEmCentavos)}</strong>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span>Beneficiário: {emenda.beneficiarioFinal}</span>
                    <span>Protocolo: {formatarData(emenda.dataProtocolo)}</span>
                    <span
                      className={emenda.aprovada ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}
                    >
                      {emenda.aprovada ? "Aprovada" : "Não aprovada"}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
            {!emendas.itens.length && (
              <p className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-500">
                Nenhuma emenda cadastrada para este vereador nesta legislatura.
              </p>
            )}
          </div>

          {emendas.totalPaginas > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-500">
                Página {emendas.pagina} de {emendas.totalPaginas}
              </span>
              <div className="flex gap-2">
                {emendas.pagina > 1 && (
                  <Link
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2"
                    href={hrefPagina(emendas.pagina - 1)}
                  >
                    Anterior
                  </Link>
                )}
                {emendas.pagina < emendas.totalPaginas && (
                  <Link
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2"
                    href={hrefPagina(emendas.pagina + 1)}
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
