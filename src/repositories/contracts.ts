import type {
  Emenda,
  FiltrosEmenda,
  FiltrosResumo,
  FiltrosVereador,
  Legislatura,
  ResultadoPaginado,
  ResumoDashboard,
  Vereador,
} from "@/types";

export interface VereadoresRepository {
  listar(filtros?: FiltrosVereador): Promise<Vereador[]>;
  buscarPorId(id: string): Promise<Vereador | null>;
}

export interface LegislaturasRepository {
  listar(): Promise<Legislatura[]>;
  buscarPorId(id: string): Promise<Legislatura | null>;
  buscarPorSlug(slug: string): Promise<Legislatura | null>;
  buscarAtiva(): Promise<Legislatura | null>;
}

export interface EmendasRepository {
  listar(filtros?: FiltrosEmenda): Promise<ResultadoPaginado<Emenda>>;
  buscarPorId(id: string): Promise<Emenda | null>;
  obterResumo(filtros?: FiltrosResumo): Promise<ResumoDashboard>;
}
