import { MongoEmendasRepository } from './mongo/emendas-repository';
import { MongoLegislaturasRepository } from './mongo/legislaturas-repository';
import { MongoVereadoresRepository } from './mongo/vereadores-repository';

export const emendasRepository = new MongoEmendasRepository();
export const legislaturasRepository = new MongoLegislaturasRepository();
export const vereadoresRepository = new MongoVereadoresRepository();
