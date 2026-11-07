import { BaseRepository } from "./base/base.repository.js";

class TeacherRepository extends BaseRepository {
    constructor() {
        super("teacher");
    }
}

export const teacherRepository = new TeacherRepository();