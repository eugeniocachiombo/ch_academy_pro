import { BaseRepository } from "./base/base.repository.js";

class GroupRepository extends BaseRepository {
    constructor() {
        super("group");
    }
}

export const groupRepository = new GroupRepository();