import { BaseRepository } from "./base/base.repository.js";

class StudentRepository extends BaseRepository {
    constructor() {
        super("student"); 
    }
}

export const studentRepository = new StudentRepository();