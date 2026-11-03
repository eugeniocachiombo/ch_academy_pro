import { BaseService } from './base.service.js';
import { teacherocupationRepository } from '../repository/teacherocupation.repository.js';
import { createTeacherocupationSchema, updateTeacherocupationSchema } from '../validators/teacherocupation.schema.js';

class TeacherocupationService extends BaseService {
    constructor() {
        super(
            teacherocupationRepository, 
            "teacherocupation", 
            {
                create: createTeacherocupationSchema,
                update: updateTeacherocupationSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new TeacherocupationService();