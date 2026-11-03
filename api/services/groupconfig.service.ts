import { BaseService } from './base.service.js';
import { groupconfigRepository } from '../repository/groupconfig.repository.js';
import { createGroupconfigSchema, updateGroupconfigSchema } from '../validators/groupconfig.schema.js';

class GroupconfigService extends BaseService {
    constructor() {
        super(
            groupconfigRepository, 
            "groupconfig", 
            {
                create: createGroupconfigSchema,
                update: updateGroupconfigSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new GroupconfigService();