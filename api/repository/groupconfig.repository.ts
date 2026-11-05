import { BaseRepository } from "./base/base.repository.js";
import { validateGroupconfigBusinessRules } from "../utils/groupconfig-validation.js";

class GroupconfigRepository extends BaseRepository {
    constructor() {
        super("groupconfig");
    }

    async create(args: any, model?: string) {
        const data = args?.data;
        if (data) {
            await validateGroupconfigBusinessRules(this, {
                group_id: data.group_id,
                room_id: data.room_id,
                period_id: data.period_id,
                year_id: data.year_id,
                class_id: data.class_id,
                course_id: data.course_id
            });
        }
        return await super.create(args, model);
    }

    async update(args: any, model?: string) {
        const data = args?.data;
        const recordId = args?.where?.id;

        if (data && recordId) {
            const current = await this.findFirst({ where: { id: recordId } });
            if (current) {
                const checkData = {
                    group_id: data.group_id !== undefined ? data.group_id : current.group_id,
                    room_id: data.room_id !== undefined ? data.room_id : current.room_id,
                    period_id: data.period_id !== undefined ? data.period_id : current.period_id,
                    year_id: data.year_id !== undefined ? data.year_id : current.year_id,
                    class_id: data.class_id !== undefined ? data.class_id : current.class_id,
                    course_id: data.course_id !== undefined ? data.course_id : current.course_id,
                };

                await validateGroupconfigBusinessRules(this, checkData, recordId);
            }
        }
        return await super.update(args, model);
    }
}

export const groupconfigRepository = new GroupconfigRepository();