export type { EmendasRepository, VereadoresRepository } from "./contracts";
export { MongoEmendasRepository } from "./mongo/emendas-repository";
export { MongoVereadoresRepository } from "./mongo/vereadores-repository";

import { MongoEmendasRepository } from "./mongo/emendas-repository";
import { MongoVereadoresRepository } from "./mongo/vereadores-repository";

export const emendasRepository = new MongoEmendasRepository();
export const vereadoresRepository = new MongoVereadoresRepository();
