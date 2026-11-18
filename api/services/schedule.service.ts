import { BaseService } from './base.service.js';
import { scheduleRepository } from '../repository/schedule.repository.js';
import { createScheduleSchema, updateScheduleSchema } from '../validators/schedule.schema.js';

class ScheduleService extends BaseService {
    constructor() {
        super(
            scheduleRepository,
            "schedule",
            {
                create: createScheduleSchema,
                update: updateScheduleSchema
            },
            {
                tenant: 'mixed',
                include: {
                    groupconfig: {
                        include: {
                            class: true,
                            group: true,
                            period: true,
                            room: true,
                            course: true
                        }
                    },
                    subject: true,
                    teacher: {
                        include: {
                            user: {
                                include: {
                                    person: true
                                }
                            }
                        }
                    },
                    school: true
                }
            }
        );
    }
}

export default new ScheduleService();