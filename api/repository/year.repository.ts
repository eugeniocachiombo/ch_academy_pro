import { BaseRepository } from "./base/base.repository.js";

class YearRepository extends BaseRepository {
    constructor() {
        super("year"); 
    }
}

export const yearRepository = new YearRepository();