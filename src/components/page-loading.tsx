import { Header } from "@/components/header";

export function PageLoading() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] items-center justify-center px-6 py-20">
        <div
          className="flex flex-col items-center gap-4 text-center"
          role="status"
          aria-live="polite"
        >
          <span
            className="h-10 w-10 animate-spin rounded-full border-4 border-[#cfe1eb] border-t-[#19689b]"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-[#12334d]">Carregando página...</p>
            <p className="mt-1 text-sm text-slate-500">
              Estamos preparando os dados para você.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
