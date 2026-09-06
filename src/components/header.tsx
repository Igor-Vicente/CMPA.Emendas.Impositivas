import Link from "next/link";

import { comLegislatura } from "@/lib/legislaturas";

export function Header({ legislaturaSlug }: { legislaturaSlug?: string }) {
  const href = (caminho: string) => (legislaturaSlug ? comLegislatura(caminho, legislaturaSlug) : caminho);

  return (
    <header className="w-full border-b border-white/10 bg-[#0d2a40] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4 lg:px-10">
        <Link
          href={href("/")}
          className="flex min-w-0 flex-col leading-tight"
          aria-label="Ir para o início do Portal de Emendas Impositivas"
        >
          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e1b45b] sm:text-xs">
            Câmara Municipal de Pouso Alto
          </span>
          <strong className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
            Portal de Emendas Impositivas
          </strong>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Navegação principal">
            <Link
              className="rounded-lg px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
              href={href("/")}
            >
              Início
            </Link>
            <Link
              className="rounded-lg px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
              href={href("/emendas")}
            >
              Emendas
            </Link>
            <Link
              className="rounded-lg px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
              href={href("/vereadores")}
            >
              Vereadores
            </Link>
          </nav>
          <a
            href="https://pousoalto.mg.leg.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-white/20 px-3 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10 sm:px-4 sm:text-sm"
          >
            <span className="hidden sm:inline">Site oficial</span>
            <span className="sm:hidden">Câmara</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
}
