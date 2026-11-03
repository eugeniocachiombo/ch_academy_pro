import { BaseRepository } from "./base/base.repository.js";

class PeriodRepository extends BaseRepository {
    constructor() {
        super("period");
    }
}

export const periodRepository = new PeriodRepository();