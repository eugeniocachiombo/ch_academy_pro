import { BaseService } from "./base.service.js";
import { municipalityRepository } from "../repository/municipality.repository.js";
import { createMunicipalitySchema, updateMunicipalitySchema } from "../validators/municipality.schema.js";

class MunicipalityService extends BaseService {
  constructor() {
    super(
      municipalityRepository,
      "municipality",
      {
        create: createMunicipalitySchema,
        update: updateMunicipalitySchema,
      },
      {
        tenant: "global",
        include: {
          province: true,
        },
      }
    );
  }
}

export default new MunicipalityService();