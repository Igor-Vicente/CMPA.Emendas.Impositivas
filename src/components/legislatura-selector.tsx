import type { Legislatura } from "@/types";

type LegislaturaSelectorProps = {
  legislaturas: Legislatura[];
  selecionada: Legislatura;
  action: string;
  parametrosOcultos?: Record<string, string | undefined>;
};

export function LegislaturaSelector({
  legislaturas,
  selecionada,
  action,
  parametrosOcultos = {},
}: LegislaturaSelectorProps) {
  return (
    <form
      action={action}
      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
    >
      {Object.entries(parametrosOcultos).map(([nome, valor]) =>
        valor ? <input key={nome} type="hidden" name={nome} value={valor} /> : null,
      )}
      <label htmlFor="legislatura" className="px-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
        Legislatura
      </label>
      <select
        id="legislatura"
        name="legislatura"
        defaultValue={selecionada.slug}
        className="h-10 min-w-52 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#d5e8f1]"
      >
        {legislaturas.map((legislatura) => (
          <option key={legislatura.id} value={legislatura.slug}>
            {legislatura.titulo}
          </option>
        ))}
      </select>
      <button className="h-10 rounded-xl bg-[#19689b] px-4 text-sm font-semibold text-white transition hover:bg-[#12577f]">
        Consultar
      </button>
    </form>
  );
}
