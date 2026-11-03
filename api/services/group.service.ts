import { BaseService } from './base.service.js';
import { groupRepository } from '../repository/group.repository.js';
import { createGroupSchema, updateGroupSchema } from '../validators/group.schema.js';

class GroupService extends BaseService {
    constructor() {
        super(
            groupRepository, 
            "group", 
            {
                create: createGroupSchema,
                update: updateGroupSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new GroupService();