import type {
  Emenda,
  FiltrosEmenda,
  ResultadoPaginado,
  Vereador,
} from "@/types";

export interface VereadoresRepository {
  listar(): Promise<Vereador[]>;
  buscarPorId(id: string): Promise<Vereador | null>;
}

export interface EmendasRepository {
  listar(filtros?: FiltrosEmenda): Promise<ResultadoPaginado<Emenda>>;
  buscarPorId(id: string): Promise<Emenda | null>;
}
