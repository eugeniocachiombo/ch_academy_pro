import { BaseService } from './base.service.js';
import { schoolRepository } from '../repository/school.repository.js';
import { userRepository } from '../repository/user.repository.js';
import { createSchoolSchema, updateSchoolSchema } from '../validators/school.schema.js';
import { CrudContext } from './base.service.js';
import { formatCapitalized, formatUsername, formatPassword } from '../utils/formaters.js';
import { roleRepository } from '../repository/role.repository.js';
import { userRoleRepository } from '../repository/user-role.repository.js';
import { permitionRepository } from '../repository/permition.repository.js';
import { rolePermitionRepository } from '../repository/role-permition.repository.js';
import { prisma } from '../lib/prisma.js'

class SchoolService extends BaseService {
    constructor() {
        super(
            schoolRepository,
            "school",
            {
                create: createSchoolSchema,
                update: updateSchoolSchema
            },
            {
                tenant: 'global'
            }
        );
    }

    async create(ctx: CrudContext, data: unknown) {

        const schema = this.schemas?.create;
        let validated = schema ? await schema.parseAsync(data) : data;
        validated = await this.beforeCreate(validated, ctx);
        const preparedData = this.prepareData('school', ctx, validated, true);        

        return await prisma.$transaction(async (tx) => {

            const school = await schoolRepository.create({ data: preparedData }, 'school', tx);


            const password = await formatPassword('123456');
            const formattedName = formatCapitalized(school.name);
            const username = formatUsername(school.name);

            const user = await userRepository.create({
                data: {
                    name: 'Director ' + formattedName,
                    username: username,
                    email: 'director@' + username + '.com',
                    password: password,
                    school_id: school.id
                }
            }, "user", tx);


            const role = await roleRepository.findFirst({ where: { name: 'director' } }, "role", tx);
            await userRoleRepository.create({
                data: {
                    user_id: user.id,
                    role_id: role.id,
                    school_id: school.id
                }
            }, "userRole", tx);



            const permissions = await permitionRepository.findMany({}, "permition", tx);
            
            for (const permission of permissions) {
                await rolePermitionRepository.create({
                    data: {
                        role_id: role.id,
                        permition_id: permission.id,
                        school_id: school.id
                    }
                }, "rolePermition", tx);
            }
            


            return school;
        });
    }
}

export default new SchoolService();