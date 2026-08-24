import type {
  AtualizarEmendaInput,
  AtualizarVereadorInput,
  CriarEmendaInput,
  CriarVereadorInput,
  Emenda,
  FiltrosEmenda,
  ResultadoPaginado,
  Vereador,
} from "@/types";

export interface VereadoresRepository {
  listar(): Promise<Vereador[]>;
  buscarPorId(id: string): Promise<Vereador | null>;
  criar(dados: CriarVereadorInput): Promise<Vereador>;
  atualizar(id: string, dados: AtualizarVereadorInput): Promise<Vereador | null>;
  remover(id: string): Promise<boolean>;
}

export interface EmendasRepository {
  listar(filtros?: FiltrosEmenda): Promise<ResultadoPaginado<Emenda>>;
  buscarPorId(id: string): Promise<Emenda | null>;
  criar(dados: CriarEmendaInput): Promise<Emenda>;
  atualizar(id: string, dados: AtualizarEmendaInput): Promise<Emenda | null>;
  remover(id: string): Promise<boolean>;
}
