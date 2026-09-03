import Image from "next/image";

export function Hero({ legislaturaSlug }: { legislaturaSlug: string }) {
  return (
    <section className="relative overflow-hidden bg-[#12334d] text-white">
      <div
        className="absolute inset-0 opacity-20"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, #4ba1c4 0, transparent 28%), radial-gradient(circle at 15% 100%, #c79436 0, transparent 22%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-14 sm:py-18 lg:grid-cols-[minmax(0,1fr)_minmax(320px,480px)] lg:px-10 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e1b45b]">
            Transparência legislativa
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Emendas Impositivas
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Consulte os recursos indicados pelos vereadores e acompanhe a
            destinação das emendas parlamentares do município.
          </p>

          <form
            action="/emendas"
            className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:flex-row"
          >
            <input type="hidden" name="legislatura" value={legislaturaSlug} />
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Buscar emendas</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                type="search"
                name="busca"
                placeholder="Busque por título, justificativa ou assunto"
                className="h-12 w-full rounded-xl bg-transparent pl-12 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#4b91b6]"
              />
            </label>
            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-[#19689b] px-6 text-sm font-semibold text-white transition hover:bg-[#12577f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19689b]"
            >
              Consultar emendas
            </button>
          </form>
        </div>

        <div className="order-first flex justify-center lg:order-last lg:justify-end" aria-hidden="true">
          <Image
            src="/logo.png"
            alt=""
            width={519}
            height={236}
            priority
            className="h-auto w-full max-w-[360px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.24)] lg:max-w-[460px]"
          />
        </div>
      </div>
    </section>
  );
}
