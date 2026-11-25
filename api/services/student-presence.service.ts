import { BaseService } from "./base.service.js";
import { studentPresenceRepository } from "../repository/student-presence.repository.js";
import {
    createStudentPresenceSchema,
    updateStudentPresenceSchema,
} from "../validators/student-presence.schema.js";

class StudentPresenceService extends BaseService {
    constructor() {
        super(
            studentPresenceRepository,
            "studentPresence",
            {
                create: createStudentPresenceSchema,
                update: updateStudentPresenceSchema,
            },
            {
                tenant: "mixed",
                include: {
                    groupconfig: true,
                    teacher: true,
                    subject: true,
                    student_presence_lists: {
                        include: {
                            student: true,
                        },
                    },
                },
            }
        );
    }
}

export default new StudentPresenceService();