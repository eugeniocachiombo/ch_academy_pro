import { BaseRepository } from "./base/base.repository.js";

class ScheduleRepository extends BaseRepository {
    constructor() {
        super("schedule");
    }
}

export const scheduleRepository = new ScheduleRepository();