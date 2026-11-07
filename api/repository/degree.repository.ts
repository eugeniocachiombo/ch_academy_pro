import { BaseRepository } from "./base/base.repository.js";

class DegreeRepository extends BaseRepository {
    constructor() {
        super("degree");
    }
}

export const degreeRepository = new DegreeRepository();