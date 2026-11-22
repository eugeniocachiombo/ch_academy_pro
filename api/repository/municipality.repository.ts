import { BaseRepository } from "./base/base.repository.js";

class MunicipalityRepository extends BaseRepository {
  constructor() {
    super("municipality");
  }
}

export const municipalityRepository = new MunicipalityRepository();