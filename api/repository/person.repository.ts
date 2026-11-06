import { BaseRepository } from "./base/base.repository.js";

class PersonRepository extends BaseRepository {
    constructor() {
        super("person"); 
    }
}

export const personRepository = new PersonRepository();