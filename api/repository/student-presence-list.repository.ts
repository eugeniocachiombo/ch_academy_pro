import { BaseRepository } from "./base/base.repository.js";

class StudentPresenceListRepository extends BaseRepository {
    constructor() {
        super("studentPresenceList");
    }
}

export const studentPresenceListRepository = new StudentPresenceListRepository();