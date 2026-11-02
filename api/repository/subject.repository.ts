import { BaseRepository } from "./base/base.repository.js";

class SubjectRepository extends BaseRepository {
    constructor() {
        super("subject");
    }
}

export const subjectRepository = new SubjectRepository();