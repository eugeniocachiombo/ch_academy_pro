import { BaseService } from './base.service.js';
import { periodRepository } from '../repository/period.repository.js';
import { createPeriodSchema, updatePeriodSchema } from '../validators/period.schema.js';

class PeriodService extends BaseService {
    constructor() {
        super(
            periodRepository, 
            "period", 
            {
                create: createPeriodSchema,
                update: updatePeriodSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new PeriodService();