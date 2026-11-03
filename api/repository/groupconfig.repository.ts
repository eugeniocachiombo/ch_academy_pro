import { BaseRepository } from "./base/base.repository.js";

class GroupconfigRepository extends BaseRepository {
    constructor() {
        super("groupconfig");
    }
}

export const groupconfigRepository = new GroupconfigRepository();