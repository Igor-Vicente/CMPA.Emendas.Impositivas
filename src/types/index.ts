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

export type Legislatura = EntidadeBase & {
  slug: string;
  titulo: string;
  anoInicio: number;
  anoFim: number;
  ativa: boolean;
};

/** 0: não executada; 1: executada; 2: em andamento; 3: cancelada. */
export type StatusExecucao = 0 | 1 | 2 | 3;

export type Emenda = EntidadeBase & {
  titulo: string;
  legislaturaId: string;
  vereadorId: string;
  valorEmCentavos: number;
  finalidade: string;
  justificativa: string;
  assunto: string;
  beneficiarioFinal: string;
  orgaoExecutor: string;
  periodoExecucao: number;
  planoDeTrabalho: Documento[];
  justificativaAusenciaPlanoDeTrabalho?: string;
  pareceresJuridicos: Documento[];
  justificativaAusenciaPareceresJuridicos?: string;
  dataProtocolo: Date | null;
  tramitacaoLegislativa: string;
  votacao: string;
  resultadoDeliberacao: string;
  aprovada: boolean;
  alteracoes: string;
  resultado: Documento[];
  resultadoTexto?: string;
  detalhesExecucao: string;
  statusExecucao: StatusExecucao;
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

export type ResumoAgrupado = {
  nome: string;
  quantidade: number;
  valorEmCentavos: number;
};

export type ResumoPorVereador = Omit<ResumoAgrupado, 'nome'> & {
  vereadorId: string;
};

export type ResumoDashboard = {
  totalEmendas: number;
  valorTotalEmCentavos: number;
  emendasAprovadas: number;
  entidadesBeneficiadas: number;
  porAssunto: ResumoAgrupado[];
  porVereador: ResumoPorVereador[];
};

export type FiltrosEmenda = Paginacao & {
  busca?: string;
  vereadorId?: string;
  periodoExecucao?: number;
};

export type FiltrosVereador = {
  legislaturaIds?: string[];
};

export type FiltrosResumo = {
  vereadorId?: string;
  periodoExecucao?: number;
};
