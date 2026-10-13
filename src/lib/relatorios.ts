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
