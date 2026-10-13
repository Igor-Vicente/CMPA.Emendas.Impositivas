import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Header } from '@/components/header';
import { AnoSelector } from '@/components/ano-selector';
import { PageLoading } from '@/components/page-loading';
import { listarVereadores, obterResumoEmendas } from '@/lib/dados';
import { formatarMoeda } from '@/lib/formatters';
import { carregarContextoAno, comAno, primeiroParametro } from '@/lib/anos';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function VereadoresPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <VereadoresPageContent {...props} />
    </Suspense>
  );
}

async function VereadoresPageContent({ searchParams }: Props) {
  const params = await searchParams;
  const { anos, ano, legislaturaIds, legislaturasDoAno } =
    await carregarContextoAno(primeiroParametro(params.ano));
  if (ano === null) notFound();

  const [vereadores, resumo] = await Promise.all([
    listarVereadores({ legislaturaIds }),
    obterResumoEmendas({ periodoExecucao: ano }),
  ]);
  const totais = new Map(
    resumo.porVereador.map((item) => [item.vereadorId, item]),
  );

  return (
    <>
      <Header ano={ano} />
      <main className="mx-auto min-h-[70vh] max-w-360 w-full px-6 py-12 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">
          Vereadores
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#12334d]">
          Vereadores das emendas com execução em {ano}
        </h1>
        {legislaturasDoAno.length > 0 && (
          <aside className="mt-6 max-w-3xl rounded-2xl border border-[#bdd9e8] border-l-4 border-l-[#19689b] bg-[#eaf3f8] px-5 py-4 sm:px-6 sm:py-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#19689b]">
              {legislaturasDoAno.length === 1
                ? 'Legislatura das emendas'
                : 'Legislaturas das emendas'}
            </p>
            <p className="mt-2 text-xl font-bold text-[#12334d] sm:text-2xl">
              {legislaturasDoAno.map((item) => item.titulo).join(' · ')}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O ano de execução pode ser posterior ao mandato em que as emendas
              foram apresentadas.
            </p>
          </aside>
        )}
        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500">
          Selecione um parlamentar para consultar os valores e as emendas de sua
          autoria.
        </p>
        <div className="mt-7 flex">
          <AnoSelector action="/vereadores" anos={anos} selecionado={ano} />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vereadores.map((vereador) => {
            const total = totais.get(vereador.id);
            return (
              <Link
                key={vereador.id}
                href={comAno(`/vereadores/${vereador.id}`, ano)}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="relative flex h-16 w-16 overflow-hidden rounded-full bg-slate-200 ring-2 ring-slate-100">
                  {vereador.imagemUrl ? (
                    <Image
                      src={vereador.imagemUrl}
                      alt={`Foto de ${vereador.nome}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="m-auto h-8 w-8 text-slate-400"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4.5 21c.7-5 3.2-7 7.5-7s6.8 2 7.5 7" />
                    </svg>
                  )}
                </span>
                <h2 className="mt-4 font-semibold text-slate-800">
                  {vereador.nome}
                </h2>
                <p className="mt-4 text-xl font-semibold text-[#19689b]">
                  {formatarMoeda(total?.valorEmCentavos ?? 0)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {total?.quantidade ?? 0}{' '}
                  {(total?.quantidade ?? 0) === 1 ? 'emenda' : 'emendas'}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
