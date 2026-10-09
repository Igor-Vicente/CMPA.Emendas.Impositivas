export type SituacaoExecucao =
  'executadas' | 'nao-executadas' | 'em-andamento' | 'nao-informada';

/** Infere apenas situações explícitas; ausência de informação não indica execução. */
export function identificarSituacaoExecucao(
  detalhes?: string | null,
): SituacaoExecucao {
  const texto = (detalhes ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[.!?;\n]/, 1)[0]
    .trim();

  if (
    /\b(?:nao|ainda nao)\s+(?:(?:foi|foram)\s+)?(?:executad[ao]s?|iniciad[ao]s?)\b/.test(
      texto,
    ) ||
    /\b(?:execucao nao iniciada|nao houve execucao)\b/.test(texto)
  ) {
    return 'nao-executadas';
  }

  if (
    /\b(?:parcialmente executad[ao]s?|executad[ao]s? parcialmente|nao (?:foi )?(?:integralmente|totalmente) executad[ao]s?|execucao parcial|em execucao|em andamento)\b/.test(
      texto,
    )
  ) {
    return 'em-andamento';
  }

  // A prestação de contas pode estar pendente mesmo com a emenda executada.
  if (
    /^(?:emenda\s+)?(?:(?:foi|foram)\s+)?(?:(?:integralmente|totalmente)\s+)?(?:executad[ao]s?|concluid[ao]s?|finalizad[ao]s?)\b/.test(
      texto,
    ) ||
    /\bexecucao\s+(?:concluida|finalizada|integralmente concluida)\b/.test(
      texto,
    )
  ) {
    return 'executadas';
  }

  return 'nao-informada';
}

export function extrairCodigoEmenda(titulo: string): string {
  return (
    titulo
      .trim()
      .match(/\b(\d+\s*[-–]\s*[a-z]+)\s*$/i)?.[1]
      .replace(/\s/g, '')
      .replace('–', '-')
      .toUpperCase() ?? titulo.trim()
  );
}
