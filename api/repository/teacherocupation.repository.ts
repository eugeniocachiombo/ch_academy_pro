import { BaseRepository } from "./base/base.repository.js";

class TeacherocupationRepository extends BaseRepository {
    constructor() {
        super("teacherocupation");
    }
}

export const teacherocupationRepository = new TeacherocupationRepository();