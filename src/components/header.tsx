import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-[#0d2a40] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4 lg:px-10">
        <Link href="/" aria-label="Ir para a página inicial">
          <Image
            src="/logo.png"
            alt="Câmara Municipal de Pouso Alto"
            width={519}
            height={236}
            priority
            className="h-auto w-[190px] sm:w-[225px]"
          />
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Navegação principal">
          <Link className="rounded-lg px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white" href="/">
            Início
          </Link>
          <Link className="rounded-lg px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white" href="/emendas">
            Emendas
          </Link>
          <Link className="rounded-lg px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white" href="/vereadores">
            Vereadores
          </Link>
          <Link className="rounded-lg px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white" href="/#sobre">
            Sobre
          </Link>
        </nav>
      </div>
    </header>
  );
}
