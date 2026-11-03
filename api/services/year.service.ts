import { BaseService } from './base.service.js';
import { yearRepository } from '../repository/year.repository.js';
import { createYearSchema, updateYearSchema } from '../validators/year.schema.js';

class YearService extends BaseService {
    constructor() {
        super(
            yearRepository, 
            "year", 
            {
                create: createYearSchema,
                update: updateYearSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new YearService();