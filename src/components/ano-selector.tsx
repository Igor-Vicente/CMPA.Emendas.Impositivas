type AnoSelectorProps = {
  anos: number[];
  selecionado: number;
  action: string;
  parametrosOcultos?: Record<string, string | undefined>;
};

export function AnoSelector({
  anos,
  selecionado,
  action,
  parametrosOcultos = {},
}: AnoSelectorProps) {
  return (
    <form
      action={action}
      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
    >
      {Object.entries(parametrosOcultos).map(([nome, valor]) =>
        valor ? (
          <input key={nome} type="hidden" name={nome} value={valor} />
        ) : null,
      )}
      <label
        htmlFor="ano"
        className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-500"
      >
        Ano de execução das emendas
      </label>
      <select
        id="ano"
        name="ano"
        defaultValue={selecionado}
        className="h-10 min-w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#d5e8f1]"
      >
        {anos.map((ano) => (
          <option key={ano} value={ano}>
            {ano}
          </option>
        ))}
      </select>
      <button className="h-10 rounded-xl bg-[#19689b] px-4 text-sm font-semibold text-white transition hover:bg-[#12577f]">
        Consultar
      </button>
    </form>
  );
}
