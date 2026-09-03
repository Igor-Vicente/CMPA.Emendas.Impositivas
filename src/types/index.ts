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

export type Mandato = EntidadeBase & {
  legislaturaId: string;
  vereadorId: string;
};

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

export type ResumoAgrupado = {
  nome: string;
  quantidade: number;
  valorEmCentavos: number;
};

export type ResumoPorVereador = Omit<ResumoAgrupado, "nome"> & {
  vereadorId: string;
};

export type ResumoDashboard = {
  totalEmendas: number;
  valorTotalEmCentavos: number;
  emendasAprovadas: number;
  emendasRejeitadas: number;
  aguardandoProtocolo: number;
  entidadesBeneficiadas: number;
  porAssunto: ResumoAgrupado[];
  porOrgaoExecutor: ResumoAgrupado[];
  porPeriodoExecucao: ResumoAgrupado[];
  porVereador: ResumoPorVereador[];
};

export type FiltrosEmenda = Paginacao & {
  busca?: string;
  titulo?: string;
  legislaturaId?: string;
  vereadorId?: string;
  assunto?: string;
  beneficiarioFinal?: string;
  orgaoExecutor?: string;
  periodoExecucao?: number;
  aprovada?: boolean;
  ano?: number;
};

export type FiltrosVereador = {
  legislaturaId?: string;
};

export type FiltrosResumo = {
  legislaturaId?: string;
  vereadorId?: string;
};
