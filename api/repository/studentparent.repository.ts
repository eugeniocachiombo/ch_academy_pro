import { BaseRepository } from "./base/base.repository.js";

class StudentparentRepository extends BaseRepository {
    constructor() {
        super("studentparent"); 
    }
}

export const studentparentRepository = new StudentparentRepository();