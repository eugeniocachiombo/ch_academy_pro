import { BaseService } from './base.service.js';
import { parentRepository } from '../repository/parent.repository.js';
import { userRepository } from '../repository/user.repository.js';
import { personRepository } from '../repository/person.repository.js';
import { createParentSchema, updateParentSchema } from '../validators/parent.schema.js';
import { CrudContext } from './base.service.js';
import { formatCapitalized, formatPassword } from '../utils/formaters.js';
import { roleRepository } from '../repository/role.repository.js';
import { userRoleRepository } from '../repository/user-role.repository.js';
import { prisma } from '../lib/prisma.js';
import { prepareParentPersonData } from '../utils/parent.js';

class ParentService extends BaseService {
    constructor() {
        super(
            parentRepository,
            "parent",
            {
                create: createParentSchema,
                update: updateParentSchema
            },
            {
                tenant: 'mixed',
                modes: { person: 'global' },
                include: {
                    user: { include: { person: true } },
                    school: true
                }
            }
        );
    }

    protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
        return prepareParentPersonData(data);
    }

    protected async beforeUpdate(data: unknown, _ctx: CrudContext): Promise<unknown> {
        const body = data as any;
        if (body?.person) {
            if (body.person.birthday && !body.person.birthday.includes('T')) {
                body.person.birthday = new Date(body.person.birthday).toISOString();
            }
            if (body.person.bi_number && !body.person.nif) {
                body.person.nif = body.person.bi_number;
            }
        }
        return body;
    }

    async create(ctx: CrudContext, data: unknown) {
        const schema = this.schemas?.create;
        let body = schema ? await schema.parseAsync(data) : data;
        body = await this.beforeCreate(body, ctx);

        const { user: userDto, person: personDto, ...parentDto } = body as any;
        const parentData = this.prepareData('parent', ctx, parentDto, true);
        const schoolId = parentData.school_id;

        return await prisma.$transaction(async (tx) => {
            const personPayload = this.prepareData('person', ctx, personDto, true, true);
            const person = await personRepository.create({ data: personPayload }, "person", tx);

            const name = formatCapitalized(parentData.fullname || `${person.firstname} ${person.lastname}`);
            const username = userDto?.username || parentData.phone;
            const password = await formatPassword(userDto?.password || '123456');
            const email = person.email || `${username.replace(/[^0-9]/g, '')}@parent.com`;

            const userPayload = this.prepareData('user', ctx, {
                name,
                username,
                email,
                password,
                status: userDto?.status || 'ACTIVE',
                person_id: person.id,
                school_id: schoolId
            }, true);
            const user = await userRepository.create({ data: userPayload }, "user", tx);

            const role = await roleRepository.findFirst({ where: { name: 'encarregado' } }, "role", tx);
            if (role) {
                await userRoleRepository.create({
                    data: {
                        user_id: user.id,
                        role_id: role.id,
                        school_id: schoolId
                    }
                }, "userRole", tx);
            }

            const parent = await parentRepository.create({
                data: {
                    ...parentData,
                    user_id: user.id
                }
            }, 'parent', tx);

            return parent;
        });
    }

    async update(ctx: CrudContext, id: number, data: unknown) {
        const schema = this.schemas?.update;
        let body = schema ? await schema.parseAsync(data) : data;
        body = await this.beforeUpdate(body, ctx);

        const { user: userDto, person: personDto, ...parentDto } = body as any;
        const parentData = this.prepareData('parent', ctx, parentDto, false);
        const parsedId = Number(this.parseId(id));

        return await prisma.$transaction(async (tx) => {
            const existingParent = await parentRepository.findFirst({
                where: this.writeScope('parent', ctx, { id: parsedId }),
                include: { user: true }
            }, "parent", tx);
            if (!existingParent) {
                throw new Error("NOT_FOUND");
            }

            if (personDto && existingParent.user?.person_id) {
                const personPayload = this.prepareData('person', ctx, personDto, false, true);
                await personRepository.update({
                    where: { id: existingParent.user.person_id },
                    data: personPayload
                }, "person", tx);
            }

            if (existingParent.user_id) {
                const userUpdateData: any = {};
                if (parentData.phone) {
                    userUpdateData.username = parentData.phone;
                }
                if (userDto) {
                    Object.assign(userUpdateData, this.prepareData('user', ctx, userDto, false));
                }
                if (Object.keys(userUpdateData).length > 0) {
                    await userRepository.update({
                        where: { id: existingParent.user_id },
                        data: userUpdateData
                    }, "user", tx);
                }
            }

            const updatedParent = await parentRepository.update({
                where: { id: parsedId },
                data: parentData
            }, 'parent', tx);

            return updatedParent;
        });
    }
}

export default new ParentService();