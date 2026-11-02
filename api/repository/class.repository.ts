import { BaseRepository } from "./base/base.repository.js";

class ClassRepository extends BaseRepository {
    constructor() {
        super("class");
    }
}

export const classRepository = new ClassRepository();