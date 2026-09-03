import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HomeContent } from "@/components/home-content";
import { LegislaturaSelector } from "@/components/legislatura-selector";
import { carregarContextoLegislatura, primeiroParametro } from "@/lib/legislaturas";
import { emendasRepository, vereadoresRepository } from "@/repositories";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const contexto = await carregarContextoLegislatura(
    primeiroParametro(params.legislatura),
  ).catch((error) => {
    console.error("Erro ao carregar as legislaturas:", error);
    return null;
  });

  if (!contexto?.legislatura) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold text-[#12334d]">Legislatura indisponível</h1>
          <p className="mt-3 text-slate-600">Não foi possível identificar uma legislatura para consulta.</p>
        </main>
      </>
    );
  }

  const { legislatura, legislaturas } = contexto;
  const dados = await Promise.all([
    emendasRepository.obterResumo({ legislaturaId: legislatura.id }),
    emendasRepository.listar({ legislaturaId: legislatura.id, pagina: 1, itensPorPagina: 5 }),
    vereadoresRepository.listar({ legislaturaId: legislatura.id }),
  ]).catch((error) => {
    console.error("Erro ao carregar a página inicial:", error);
    return null;
  });

  return (
    <>
      <Header legislaturaSlug={legislatura.slug} />
      <main>
        <Hero legislaturaSlug={legislatura.slug} />
        <div className="mx-auto flex max-w-[1440px] justify-end px-6 pt-8 lg:px-10">
          <LegislaturaSelector
            action="/"
            legislaturas={legislaturas}
            selecionada={legislatura}
          />
        </div>
        {dados ? (
          <HomeContent
            resumo={dados[0]}
            emendas={dados[1].itens}
            vereadores={dados[2]}
            legislatura={legislatura}
          />
        ) : (
          <section className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold text-[#12334d]">Dados temporariamente indisponíveis</h2>
            <p className="mt-3 text-slate-600">Não foi possível carregar os dados das emendas. Tente novamente em alguns instantes.</p>
          </section>
        )}
      </main>
    </>
  );
}
