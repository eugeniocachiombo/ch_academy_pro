import { BaseService, CrudContext } from './base.service.js';
import { registerRepository } from '../repository/register.repository.js';
import { createRegisterSchema, updateRegisterSchema } from '../validators/register.schema.js';
import { nextRegisterProcessNum } from '../utils/process-number.js';

class RegisterService extends BaseService {
    constructor() {
        super(
            registerRepository, 
            "register", 
            {
                create: createRegisterSchema,
                update: updateRegisterSchema
            }, 
            {
                tenant: 'mixed',
                include: {
                    student: { 
                        include: { 
                            user: { 
                                include: { 
                                    person: true 
                                } 
                            } 
                        } 
                    },
                    school: true,
                    groupconfig: true,
                    year: true
                }
            }
        );
    }

    protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
        let body = data as any;
        if (body) {
            if (body.registnum === null || body.registnum === undefined || body.registnum === '') {
                body.registnum = await nextRegisterProcessNum();
            } else {
                body.registnum = Number(body.registnum);
            }
        }
        return body;
    }
}

export default new RegisterService();