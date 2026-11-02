import bcrypt from 'bcrypt';
import { BaseService } from './base.service.js';
import { userRepository } from '../repository/user.repository.js';
import { createUserSchema, getUpdateUserSchema } from '../validators/user.schema.js';
import { CrudContext } from './base.service.js';

class UserService extends BaseService {
    constructor() {
        super(
            userRepository, 
            "user", 
            {
                create: createUserSchema,
                update: getUpdateUserSchema()
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }

    async create(ctx: CrudContext, data: unknown) {
        const validated: any = await createUserSchema.parseAsync(data);
        validated.password = await bcrypt.hash(validated.password, 10);
        return super.create(ctx, validated);
    }

    async update(ctx: CrudContext, id: string | number, data: unknown) {
        const userId = typeof id === 'number' ? id : Number(id);
        const schema = getUpdateUserSchema(userId);
        const validated: any = await schema.parseAsync(data);

        if (validated.password) {
            validated.password = await bcrypt.hash(validated.password, 10);
        }

        return super.update(ctx, id, validated);
    }
}

export default new UserService();