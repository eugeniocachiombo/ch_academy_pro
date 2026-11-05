import { BaseRepository } from "./base/base.repository.js";

class SchoolRepository extends BaseRepository {
    constructor() {
        super("school"); 
    }
}

export const schoolRepository = new SchoolRepository();