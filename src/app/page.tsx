import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HomeContent } from "@/components/home-content";
import { emendasRepository, vereadoresRepository } from "@/repositories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dados = await Promise.all([
    emendasRepository.obterResumo(),
    emendasRepository.listar({ pagina: 1, itensPorPagina: 5 }),
    vereadoresRepository.listar(),
  ]).catch((error) => {
    console.error("Erro ao carregar a página inicial:", error);
    return null;
  });

  return (
    <>
      <Header />
      <main>
        <Hero />
        {dados ? (
          <HomeContent resumo={dados[0]} emendas={dados[1].itens} vereadores={dados[2]} />
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
