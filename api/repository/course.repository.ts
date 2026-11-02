import { BaseRepository } from "./base/base.repository.js";

class CourseRepository extends BaseRepository {
    constructor() {
        super("course");
    }
}

export const courseRepository = new CourseRepository();