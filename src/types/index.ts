export type EntidadeBase = {
  id: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type Documento = {
  nome: string;
  url: string;
  tipoMime?: string;
};

export type Vereador = EntidadeBase & {
  nome: string;
  imagemUrl?: string;
  biografiaUrl?: string;
};

export type Emenda = EntidadeBase & {
  titulo: string;
  vereadorId: string;
  valorEmCentavos: number;
  finalidade: string;
  justificativa: string;
  assunto: string;
  beneficiarioFinal: string;
  orgaoExecutor: string;
  periodoExecucao: number;
  planoDeTrabalho: Documento[];
  pareceresJuridicos: Documento[];
  dataProtocolo: Date | null;
  tramitacaoLegislativa: string;
  votacao: string;
  resultadoDeliberacao: string;
  aprovada: boolean;
  alteracoes: string;
  relatoriosExecutivo: Documento[];
  detalhesRelatorioExecutivo: string;
};

export type Paginacao = {
  pagina?: number;
  itensPorPagina?: number;
};

export type ResultadoPaginado<T> = {
  itens: T[];
  total: number;
  pagina: number;
  itensPorPagina: number;
  totalPaginas: number;
};

export type FiltrosEmenda = Paginacao & {
  titulo?: string;
  vereadorId?: string;
  assunto?: string;
  beneficiarioFinal?: string;
  orgaoExecutor?: string;
  periodoExecucao?: number;
  aprovada?: boolean;
  ano?: number;
};
