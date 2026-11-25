import { BaseService } from "./base.service.js";
import { studentPresenceListRepository } from "../repository/student-presence-list.repository.js";
import {
    createStudentPresenceListSchema,
    updateStudentPresenceListSchema,
} from "../validators/student-presence-list.schema.js";

class StudentPresenceListService extends BaseService {
    constructor() {
        super(
            studentPresenceListRepository,
            "studentPresenceList",
            {
                create: createStudentPresenceListSchema,
                update: updateStudentPresenceListSchema,
            },
            {
                tenant: "mixed",
                include: {
                    student_presence: true,
                    student: true,
                },
            }
        );
    }
}

export default new StudentPresenceListService();