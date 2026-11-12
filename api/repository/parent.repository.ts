import { BaseRepository } from "./base/base.repository.js";

class ParentRepository extends BaseRepository {
    constructor() {
        super("parent"); 
    }
}

export const parentRepository = new ParentRepository();