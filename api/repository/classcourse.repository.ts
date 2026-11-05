import { BaseRepository } from "./base/base.repository.js";

class ClasscourseRepository extends BaseRepository {
    constructor() {
        super("classcourse");
    }
}

export const classcourseRepository = new ClasscourseRepository();