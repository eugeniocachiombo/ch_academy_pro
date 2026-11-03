import { BaseRepository } from "./base/base.repository.js";

class RegisterRepository extends BaseRepository {
    constructor() {
        super("register");
    }
}

export const registerRepository = new RegisterRepository();