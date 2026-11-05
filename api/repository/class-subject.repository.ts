import { BaseRepository } from "./base/base.repository.js";

class ClassSubjectRepository extends BaseRepository {
    constructor() {
        super("classSubject");
    }
}

export const classSubjectRepository = new ClassSubjectRepository();