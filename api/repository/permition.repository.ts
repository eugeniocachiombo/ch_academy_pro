import { BaseRepository } from "./base/base.repository.js";

class PermitionRepository extends BaseRepository {
    constructor() {
        super("permition");
    }
}

export const permitionRepository = new PermitionRepository();