import { emendasRepository, vereadoresRepository } from "@/repositories";
import type { FiltrosEmenda, Vereador } from "@/types";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const data = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

function inteiro(valor: string | undefined): number | undefined {
  if (!valor) return undefined;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : undefined;
}

function formatarMoeda(centavos: number) {
  return moeda.format(centavos / 100);
}

function formatarData(valor: Date | null) {
  return valor ? data.format(valor) : "A definir";
}

function Icone({ tipo }: { tipo: "valor" | "arquivo" | "check" | "relogio" }) {
  const caminhos = {
    valor: <path d="M12 2v20m5-16.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
    arquivo: <path d="M6 2h8l4 4v16H6V2Zm8 0v5h5M9 12h6m-6 4h6" />,
    check: <path d="m5 12 4 4L19 6" />,
    relogio: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {caminhos[tipo]}
    </svg>
  );
}

function CartaoIndicador({
  rotulo,
  valor,
  detalhe,
  tipo,
}: {
  rotulo: string;
  valor: string;
  detalhe: string;
  tipo: "valor" | "arquivo" | "check" | "relogio";
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {rotulo}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            {valor}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3f8] text-[#176895]">
          <Icone tipo={tipo} />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detalhe}</p>
    </article>
  );
}

function EstadoIndisponivel() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-20">
      <div className="w-full rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
          !
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
          Não foi possível carregar o painel
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Confira se o MongoDB está disponível e tente novamente.
        </p>
      </div>
    </main>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const parametros = await searchParams;
  const status = primeiro(parametros.status);
  const pagina = inteiro(primeiro(parametros.pagina)) ?? 1;
  const filtros: FiltrosEmenda = {
    pagina,
    itensPorPagina: 10,
    titulo: primeiro(parametros.busca)?.trim() || undefined,
    vereadorId: primeiro(parametros.vereador) || undefined,
    assunto: primeiro(parametros.assunto) || undefined,
    periodoExecucao: inteiro(primeiro(parametros.periodo)),
    aprovada:
      status === "aprovada"
        ? true
        : status === "rejeitada"
          ? false
          : undefined,
  };

  const carregamento = await Promise.all([
    emendasRepository.obterResumo(),
    emendasRepository.listar(filtros),
    vereadoresRepository.listar(),
  ]).catch((error) => {
    console.error("Erro ao carregar a página inicial:", error);
    return null;
  });

  if (!carregamento) return <EstadoIndisponivel />;

  const [resumo, emendas, vereadores] = carregamento;
  const vereadoresPorId = new Map(vereadores.map((item) => [item.id, item]));
  const percentualAprovadas = resumo.totalEmendas
    ? Math.round((resumo.emendasAprovadas / resumo.totalEmendas) * 100)
    : 0;
  const maiorAssunto = Math.max(
    ...resumo.porAssunto.map((item) => item.valorEmCentavos),
    1,
  );
  const resumoVereadores = vereadores
    .map((vereador) => ({
      vereador,
      resumo: resumo.porVereador.find(
        (item) => item.vereadorId === vereador.id,
      ),
    }))
    .sort(
      (a, b) =>
        (b.resumo?.valorEmCentavos ?? 0) -
        (a.resumo?.valorEmCentavos ?? 0),
    );

  const parametrosPaginacao = Object.fromEntries(
    Object.entries(parametros).flatMap(([chave, valor]) =>
      typeof valor === "string" ? [[chave, valor]] : [],
    ),
  );

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <header className="bg-[#102f47] text-white shadow-[0_2px_12px_rgba(15,35,50,0.18)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-5 py-4 lg:px-10">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#e1b45b]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M3 21h18M5 21V9h14v12M3 9l9-6 9 6M8 12v5m4-5v5m4-5v5" />
              </svg>
            </span>
            <span>
              <strong className="block text-sm font-semibold tracking-wide">
                Câmara Municipal
              </strong>
              <span className="block text-xs text-slate-300">
                Pouso Alto · Minas Gerais
              </span>
            </span>
          </a>
          <nav
            className="hidden items-center gap-1 text-sm md:flex"
            aria-label="Navegação principal"
          >
            <a
              href="#inicio"
              className="rounded-lg bg-white/10 px-4 py-2 font-medium"
            >
              Visão geral
            </a>
            <a
              href="#emendas"
              className="rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Emendas
            </a>
            <a
              href="#vereadores"
              className="rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Por vereador
            </a>
          </nav>
          <span className="hidden rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300 sm:block">
            Legislatura 2025–2028
          </span>
        </div>
      </header>

      <main
        id="inicio"
        className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-10"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6c1d]">
              Transparência legislativa
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#102f47] sm:text-4xl">
              Painel de Emendas Impositivas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Acompanhe os recursos indicados, a tramitação e a execução das
              emendas parlamentares municipais.
            </p>
          </div>
          <p className="text-xs text-slate-500">Dados da legislatura atual</p>
        </div>

        <section
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Indicadores principais"
        >
          <CartaoIndicador
            rotulo="Valor total indicado"
            valor={formatarMoeda(resumo.valorTotalEmCentavos)}
            detalhe="Somatório de todas as emendas"
            tipo="valor"
          />
          <CartaoIndicador
            rotulo="Emendas cadastradas"
            valor={String(resumo.totalEmendas)}
            detalhe={`${resumo.porPeriodoExecucao.length} período(s) de execução`}
            tipo="arquivo"
          />
          <CartaoIndicador
            rotulo="Emendas aprovadas"
            valor={String(resumo.emendasAprovadas)}
            detalhe={`${percentualAprovadas}% do total cadastrado`}
            tipo="check"
          />
          <CartaoIndicador
            rotulo="Protocolo pendente"
            valor={String(resumo.aguardandoProtocolo)}
            detalhe="Emendas sem data de protocolo"
            tipo="relogio"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recursos por área
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Distribuição financeira por assunto
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                Valor indicado
              </span>
            </div>
            <div className="mt-7 space-y-5">
              {resumo.porAssunto.length ? (
                resumo.porAssunto.slice(0, 6).map((item) => (
                  <div key={item.nome}>
                    <div className="mb-2 flex items-end justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">
                        {item.nome}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatarMoeda(item.valorEmCentavos)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#176895] to-[#48a0c2]"
                        style={{
                          width: `${Math.max(8, (item.valorEmCentavos / maiorAssunto) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">
                  Nenhuma emenda cadastrada.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-[#102f47] p-5 text-white sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e1b45b]">
              Execução planejada
            </p>
            <h2 className="mt-2 text-xl font-semibold">Recursos por período</h2>
            <div className="mt-6 space-y-3">
              {resumo.porPeriodoExecucao.length ? (
                resumo.porPeriodoExecucao.map((item) => (
                  <div
                    key={item.nome}
                    className="rounded-xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-2xl font-semibold text-[#f0c76f]">
                        {item.nome}
                      </span>
                      <span className="text-right text-sm font-semibold">
                        {formatarMoeda(item.valorEmCentavos)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-300">
                      {item.quantidade}{" "}
                      {item.quantidade === 1
                        ? "emenda prevista"
                        : "emendas previstas"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-300">
                  Nenhum período informado.
                </p>
              )}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Aprovadas</span>
                <span>{resumo.emendasAprovadas}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-300">
                <span>Não aprovadas</span>
                <span>{resumo.emendasRejeitadas}</span>
              </div>
            </div>
          </article>
        </section>

        <section id="emendas" className="mt-8 scroll-mt-24">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#102f47]">
                Emendas cadastradas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulte e filtre os registros da legislatura
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {emendas.total} resultado(s)
            </span>
          </div>

          <form className="grid gap-3 rounded-t-2xl border border-b-0 border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_0.7fr_0.7fr_auto]">
            <label className="relative">
              <span className="sr-only">Buscar por título</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                name="busca"
                defaultValue={primeiro(parametros.busca)}
                placeholder="Buscar por título..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#4b91b6] focus:bg-white focus:ring-2 focus:ring-[#dcecf4]"
              />
            </label>
            <select
              name="vereador"
              defaultValue={primeiro(parametros.vereador) ?? ""}
              aria-label="Filtrar por vereador"
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#4b91b6]"
            >
              <option value="">Todos os vereadores</option>
              {vereadores.map((vereador) => (
                <option key={vereador.id} value={vereador.id}>
                  {vereador.nome}
                </option>
              ))}
            </select>
            <select
              name="periodo"
              defaultValue={primeiro(parametros.periodo) ?? ""}
              aria-label="Filtrar por período"
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#4b91b6]"
            >
              <option value="">Todos os anos</option>
              {resumo.porPeriodoExecucao.map((item) => (
                <option key={item.nome} value={item.nome}>
                  {item.nome}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={status ?? ""}
              aria-label="Filtrar por situação"
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#4b91b6]"
            >
              <option value="">Todas as situações</option>
              <option value="aprovada">Aprovadas</option>
              <option value="rejeitada">Não aprovadas</option>
            </select>
            <button
              type="submit"
              className="h-10 rounded-lg bg-[#176895] px-5 text-sm font-semibold text-white transition hover:bg-[#10577f]"
            >
              Filtrar
            </button>
          </form>

          <div className="overflow-hidden rounded-b-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead className="bg-[#f8fafb] text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Emenda</th>
                    <th className="px-5 py-3.5">Vereador</th>
                    <th className="px-5 py-3.5">Área</th>
                    <th className="px-5 py-3.5">Protocolo</th>
                    <th className="px-5 py-3.5 text-right">Valor</th>
                    <th className="px-5 py-3.5 text-center">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emendas.itens.map((emenda) => {
                    const vereador = vereadoresPorId.get(emenda.vereadorId);
                    return (
                      <tr
                        key={emenda.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="max-w-[300px] px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {emenda.titulo}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {emenda.finalidade}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {vereador?.nome ?? "Não identificado"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#eef5f8] px-2.5 py-1 text-xs font-medium text-[#176895]">
                            {emenda.assunto}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatarData(emenda.dataProtocolo)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                          {formatarMoeda(emenda.valorEmCentavos)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              emenda.aprovada
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                emenda.aprovada
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {emenda.aprovada ? "Aprovada" : "Não aprovada"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!emendas.itens.length && (
              <p className="px-5 py-14 text-center text-sm text-slate-500">
                Nenhuma emenda encontrada com os filtros selecionados.
              </p>
            )}
            {emendas.totalPaginas > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm">
                <span className="text-slate-500">
                  Página {emendas.pagina} de {emendas.totalPaginas}
                </span>
                <div className="flex gap-2">
                  {emendas.pagina > 1 && (
                    <a
                      href={`?${new URLSearchParams({
                        ...parametrosPaginacao,
                        pagina: String(emendas.pagina - 1),
                      })}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                    >
                      Anterior
                    </a>
                  )}
                  {emendas.pagina < emendas.totalPaginas && (
                    <a
                      href={`?${new URLSearchParams({
                        ...parametrosPaginacao,
                        pagina: String(emendas.pagina + 1),
                      })}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                    >
                      Próxima
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="vereadores" className="mt-10 scroll-mt-24">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#102f47]">
              Emendas por vereador
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Participação individual na legislatura 2025–2028
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {resumoVereadores.map(({ vereador, resumo: item }) => (
              <article
                key={vereador.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  {vereador.imagemUrl ? (
                    <span
                      role="img"
                      aria-label={`Foto de ${vereador.nome}`}
                      className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-500 ring-2 ring-slate-100"
                    >
                      {iniciais(vereador)}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${vereador.imagemUrl})` }}
                      />
                    </span>
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                      {iniciais(vereador)}
                    </span>
                  )}
                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                    {vereador.nome}
                  </h3>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-lg font-semibold tracking-tight text-[#176895]">
                    {formatarMoeda(item?.valorEmCentavos ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item?.quantidade ?? 0}{" "}
                    {(item?.quantidade ?? 0) === 1 ? "emenda" : "emendas"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row lg:px-10">
          <span>Câmara Municipal de Pouso Alto · Transparência pública</span>
          <span>Legislatura 2025–2028</span>
        </div>
      </footer>
    </div>
  );
}

function iniciais(vereador: Vereador) {
  return vereador.nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("");
}
