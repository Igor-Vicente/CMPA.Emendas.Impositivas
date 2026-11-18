'use client';

import { useTransition } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-[#12334d]">
        Dados temporariamente indisponíveis
      </h1>
      <p className="mt-3 text-slate-600">
        Não foi possível carregar esta página. Aguarde alguns instantes e tente
        novamente.
      </p>
      <button
        type="button"
        onClick={() => startTransition(() => retry())}
        disabled={isPending}
        className="mt-6 rounded-xl bg-[#12334d] px-5 py-3 font-semibold text-white transition hover:bg-[#19689b] disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? 'Tentando novamente…' : 'Tentar novamente'}
      </button>
      <Link href="/" className="mt-4 text-sm text-[#19689b] underline">
        Voltar ao início
      </Link>
      {error.digest && (
        <p className="mt-8 text-xs text-slate-500">
          Código de referência: {error.digest}
        </p>
      )}
    </main>
  );
}
