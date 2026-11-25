import { BaseRepository } from "./base/base.repository.js";

class StudentPresenceRepository extends BaseRepository {
    constructor() {
        super("studentPresence");
    }
}

export const studentPresenceRepository = new StudentPresenceRepository();