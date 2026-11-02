import { BaseRepository } from "./base/base.repository.js";

class RoomRepository extends BaseRepository {
    constructor() {
        super("room");
    }
}

export const roomRepository = new RoomRepository();