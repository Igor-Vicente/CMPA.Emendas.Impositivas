export type { EmendasRepository, LegislaturasRepository, VereadoresRepository } from "./contracts";
export { MongoEmendasRepository } from "./mongo/emendas-repository";
export { MongoLegislaturasRepository } from "./mongo/legislaturas-repository";
export { MongoVereadoresRepository } from "./mongo/vereadores-repository";

import { MongoEmendasRepository } from "./mongo/emendas-repository";
import { MongoLegislaturasRepository } from "./mongo/legislaturas-repository";
import { MongoVereadoresRepository } from "./mongo/vereadores-repository";

export const emendasRepository = new MongoEmendasRepository();
export const legislaturasRepository = new MongoLegislaturasRepository();
export const vereadoresRepository = new MongoVereadoresRepository();
