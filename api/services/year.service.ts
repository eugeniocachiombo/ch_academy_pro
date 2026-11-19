import { BaseService, type CrudContext } from './base.service.js';
import { yearRepository } from '../repository/year.repository.js';
import { createYearSchema, updateYearSchema } from '../validators/year.schema.js';
import { deactivateOtherActiveYears, sanitizeModelUpdateData } from '../utils/year.utils.js';

class YearService extends BaseService {
  constructor() {
    super(
      yearRepository,
      'year',
      {
        create: createYearSchema,
        update: updateYearSchema,
      },
      {
        tenant: 'mixed',
      }
    );
  }

  protected override async beforeCreate(data: any, ctx: CrudContext): Promise<any> {
    const cleanData = sanitizeModelUpdateData(data);
    if (cleanData?.isCurrent === true) {
      await deactivateOtherActiveYears(yearRepository, { ...ctx, data: cleanData });
    }
    return cleanData;
  }

  protected override async beforeUpdate(data: any, ctx: CrudContext): Promise<any> {
    const cleanData = sanitizeModelUpdateData(data);
    if (cleanData?.isCurrent === true) {
      await deactivateOtherActiveYears(yearRepository, { ...ctx, data: cleanData }, data?.id);
    }
    return cleanData;
  }
}

export default new YearService();