import { Suspense } from 'react';

import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { HomeContent } from '@/components/home-content';
import { AnoSelector } from '@/components/ano-selector';
import { PageLoading } from '@/components/page-loading';
import {
  listarEmendas,
  listarVereadores,
  obterResumoEmendas,
} from '@/lib/dados';
import { carregarContextoAno, primeiroParametro } from '@/lib/anos';

// Props é um objeto que possui uma propriedade searchParams, e essa propriedade é uma Promise que,
// quando resolvida, retorna um objeto cujas chaves são strings e cujos valores podem ser uma string, um array de strings ou undefined.
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function Home(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomePageContent {...props} />
    </Suspense>
  );
}

async function HomePageContent({ searchParams }: Props) {
  const params = await searchParams;
  const contexto = await carregarContextoAno(
    primeiroParametro(params.ano),
  ).catch((error) => {
    console.error('Erro ao carregar os anos:', error);
    return null;
  });

  if (!contexto || contexto.ano === null) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold text-[#12334d]">
            Ano indisponível
          </h1>
          <p className="mt-3 text-slate-600">
            Não foi possível identificar um ano de execução para consulta.
          </p>
        </main>
      </>
    );
  }

  const { legislaturaIds, anos, ano } = contexto;
  const dados = await Promise.all([
    obterResumoEmendas({ periodoExecucao: ano }),
    listarEmendas({ periodoExecucao: ano, pagina: 1, itensPorPagina: 5 }),
    listarVereadores({ legislaturaIds }),
  ]).catch((error) => {
    console.error('Erro ao carregar a página inicial:', error);
    return null;
  });

  return (
    <>
      <Header ano={ano} />
      <main>
        <Hero ano={ano} />
        <div className="mx-auto flex max-w-360 w-full justify-end px-6 pt-8 lg:px-10">
          <AnoSelector action="/" anos={anos} selecionado={ano} />
        </div>
        {dados ? (
          <HomeContent
            resumo={dados[0]}
            emendas={dados[1].itens}
            vereadores={dados[2]}
            ano={ano}
          />
        ) : (
          <section className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold text-[#12334d]">
              Dados temporariamente indisponíveis
            </h2>
            <p className="mt-3 text-slate-600">
              Não foi possível carregar os dados das emendas. Tente novamente em
              alguns instantes.
            </p>
          </section>
        )}
      </main>
    </>
  );
}
