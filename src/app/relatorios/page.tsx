import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { AnoSelector } from '@/components/ano-selector';
import { Header } from '@/components/header';
import { PageLoading } from '@/components/page-loading';
import { carregarContextoAno, comAno, primeiroParametro } from '@/lib/anos';
import { listarEmendasParaRelatorio, listarVereadores } from '@/lib/dados';
import { formatarMoeda } from '@/lib/formatters';
import { extrairCodigoEmenda } from '@/lib/relatorios';
import type { Emenda, StatusExecucao } from '@/types';

export const metadata: Metadata = {
  title: 'Relatórios — Portal de Emendas Impositivas',
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const relatorios = [
  {
    situacao: 'executadas',
    statusExecucao: 1,
    titulo: 'Emendas executadas',
    cor: 'bg-emerald-50 text-emerald-700',
  },
  {
    situacao: 'nao-executadas',
    statusExecucao: 0,
    titulo: 'Emendas não executadas',
    cor: 'bg-rose-50 text-rose-700',
  },
  {
    situacao: 'em-andamento',
    statusExecucao: 2,
    titulo: 'Emendas em andamento',
    cor: 'bg-amber-50 text-amber-700',
  },
] as const;

function TabelaRelatorio({
  emendas,
  vereadoresPorId,
  ano,
}: {
  emendas: Emenda[];
  vereadoresPorId: Map<string, string>;
  ano: number;
}) {
  if (!emendas.length) {
    return (
      <p className="px-5 py-10 text-center text-sm text-slate-500">
        Nenhuma emenda nesta situação para {ano}.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-240 table-fixed text-left text-sm">
        <caption className="sr-only">
          Vereador, código da emenda, beneficiário final, valor e detalhes da
          execução
        </caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-500">
          <tr>
            <th scope="col" className="w-1/5 px-5 py-4">
              Vereador
            </th>
            <th scope="col" className="w-28 px-5 py-4">
              Código
            </th>
            <th scope="col" className="w-1/4 px-5 py-4">
              Beneficiário final
            </th>
            <th scope="col" className="w-40 px-5 py-4 text-right">
              Valor
            </th>
            <th scope="col" className="px-5 py-4">
              Detalhes da execução
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {emendas.map((emenda) => (
            <tr key={emenda.id} className="align-top hover:bg-slate-50">
              <td className="px-5 py-4 font-medium text-slate-700">
                {vereadoresPorId.get(emenda.vereadorId) ?? 'Não identificado'}
              </td>
              <td className="px-5 py-4">
                <Link
                  href={comAno(`/emendas/${emenda.id}`, ano)}
                  aria-label={`Ver ${emenda.titulo}`}
                  className="font-semibold text-[#19689b] hover:underline"
                >
                  {extrairCodigoEmenda(emenda.titulo)}
                </Link>
              </td>
              <td className="break-words px-5 py-4 leading-6 text-slate-600">
                {emenda.beneficiarioFinal || 'Não informado'}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-700">
                {formatarMoeda(emenda.valorEmCentavos)}
              </td>
              <td className="whitespace-pre-line break-words px-5 py-4 leading-6 text-slate-600">
                {emenda.detalhesExecucao || 'Não informados.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RelatoriosPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <RelatoriosPageContent {...props} />
    </Suspense>
  );
}

async function RelatoriosPageContent({ searchParams }: Props) {
  const params = await searchParams;
  const { anos, ano } = await carregarContextoAno(
    primeiroParametro(params.ano),
  );
  if (ano === null) notFound();

  const [emendas, vereadores] = await Promise.all([
    listarEmendasParaRelatorio(ano),
    listarVereadores(),
  ]);
  const vereadoresPorId = new Map(
    vereadores.map((item) => [item.id, item.nome]),
  );
  const grupos: Record<StatusExecucao, Emenda[]> = {
    0: [],
    1: [],
    2: [],
  };
  const semStatus: Emenda[] = [];

  emendas.sort((a, b) => {
    const nomeA = vereadoresPorId.get(a.vereadorId) ?? 'Não identificado';
    const nomeB = vereadoresPorId.get(b.vereadorId) ?? 'Não identificado';
    return (
      nomeA.localeCompare(nomeB, 'pt-BR') ||
      extrairCodigoEmenda(a.titulo).localeCompare(
        extrairCodigoEmenda(b.titulo),
        'pt-BR',
        { numeric: true },
      ) ||
      a.id.localeCompare(b.id)
    );
  });
  for (const emenda of emendas) {
    const grupo = grupos[emenda.statusExecucao];
    if (grupo) grupo.push(emenda);
    else semStatus.push(emenda);
  }

  return (
    <>
      <Header ano={ano} />
      <main className="mx-auto min-h-[70vh] w-full max-w-360 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">
          Consulta pública
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#12334d] sm:text-3xl">
          Relatórios de execução
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Acompanhe as emendas com execução prevista para {ano}, agrupadas pela
          situação de execução informada.
        </p>

        <div className="mt-7 flex max-w-2xl">
          <AnoSelector action="/relatorios" anos={anos} selecionado={ano} />
        </div>

        <nav
          aria-label="Relatórios por situação"
          className="mt-7 grid gap-3 sm:grid-cols-3"
        >
          {relatorios.map(({ situacao, statusExecucao, titulo, cor }) => (
            <a
              key={situacao}
              href={`#${situacao}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#19689b]"
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cor}`}
              >
                {titulo}
              </span>
              <strong className="mt-3 block text-3xl font-semibold text-[#12334d]">
                {grupos[statusExecucao].length}
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                Ver relatório ↓
              </span>
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-6">
          {relatorios.map(({ situacao, statusExecucao, titulo, cor }) => (
            <section
              key={situacao}
              id={situacao}
              aria-labelledby={`titulo-${situacao}`}
              className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">
                <h2
                  id={`titulo-${situacao}`}
                  className="text-lg font-semibold text-[#12334d]"
                >
                  {titulo}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${cor}`}
                >
                  {grupos[statusExecucao].length} emendas
                </span>
              </div>
              <TabelaRelatorio
                emendas={grupos[statusExecucao]}
                vereadoresPorId={vereadoresPorId}
                ano={ano}
              />
            </section>
          ))}
        </div>

        {semStatus.length > 0 && (
          <details className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <summary className="cursor-pointer px-5 py-5 text-sm font-semibold text-slate-700">
              {semStatus.length} emendas sem situação informada
            </summary>
            <p className="px-5 pb-5 text-sm leading-6 text-slate-500">
              A situação de execução não foi informada ou é inválida. Estas
              emendas não entram nos três relatórios acima.
            </p>
            <TabelaRelatorio
              emendas={semStatus}
              vereadoresPorId={vereadoresPorId}
              ano={ano}
            />
          </details>
        )}
      </main>
    </>
  );
}
