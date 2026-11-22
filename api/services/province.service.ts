import { BaseService } from "./base.service.js";
import { provinceRepository } from "../repository/province.repository.js";
import { createProvinceSchema, updateProvinceSchema } from "../validators/province.schema.js";

class ProvinceService extends BaseService {
  constructor() {
    super(
      provinceRepository,
      "province",
      {
        create: createProvinceSchema,
        update: updateProvinceSchema,
      },
      {
        tenant: "global",
        include: {
          municipalities: true,
        },
      }
    );
  }
}

export default new ProvinceService();