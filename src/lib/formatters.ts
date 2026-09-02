export const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const dataCurta = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatarMoeda(centavos: number) {
  return moeda.format(centavos / 100);
}

export function formatarData(valor: Date | null) {
  return valor ? dataCurta.format(valor) : "Aguardando protocolo";
}
