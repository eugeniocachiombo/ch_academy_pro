import { BaseRepository } from "./base/base.repository.js";

class PositionRepository extends BaseRepository {
    constructor() {
        super("position");
    }
}

export const positionRepository = new PositionRepository();