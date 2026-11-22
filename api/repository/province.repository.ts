import { BaseRepository } from "./base/base.repository.js";

class ProvinceRepository extends BaseRepository {
  constructor() {
    super("province");
  }
}

export const provinceRepository = new ProvinceRepository();