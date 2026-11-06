import { BaseService } from './base.service.js';
import { studentRepository } from '../repository/student.repository.js';
import { userRepository } from '../repository/user.repository.js';
import { personRepository } from '../repository/person.repository.js';
import { createStudentSchema, updateStudentSchema } from '../validators/student.schema.js';
import { CrudContext } from './base.service.js';
import { formatCapitalized, formatPassword, formatProcessNum } from '../utils/formaters.js';
import { nextProcessNum } from '../utils/process-number.js';
import { roleRepository } from '../repository/role.repository.js';
import { userRoleRepository } from '../repository/user-role.repository.js';
import { prisma } from '../lib/prisma.js';

class StudentService extends BaseService {
    constructor() {
        super(
            studentRepository,
            "student",
            {
                create: createStudentSchema,
                update: updateStudentSchema
            },
            {
                tenant: 'mixed',
                modes: { person: 'global' },
                include: {
                    user: { include: { person: true } },
                    school: true,
                    province: true,
                    municipality: true
                }
            }
        );
    }

    protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
        const body = data as any;
        if (body?.person) {
            body.person = { ...body.person, nif: body.person.bi_number };
        }
        return body;
    }

    protected async beforeUpdate(data: unknown, _ctx: CrudContext): Promise<unknown> {
        const body = data as any;
        if (body?.person?.bi_number) {
            body.person = { ...body.person, nif: body.person.bi_number };
        }
        return body;
    }

    async create(ctx: CrudContext, data: unknown) {
        const schema = this.schemas?.create;
        let body = schema ? await schema.parseAsync(data) : data;
        body = await this.beforeCreate(body, ctx);

        const { user: _ignoredUser, person: personDto, ...studentDto } = body as any;
        const studentData = this.prepareData('student', ctx, studentDto, true);
        const schoolId = studentData.school_id;

        return await prisma.$transaction(async (tx) => {
            const processnum = studentData.processnum
                ? formatProcessNum(studentData.processnum)
                : await nextProcessNum(tx);

            const personPayload = this.prepareData('person', ctx, personDto, true, true);
            const person = await personRepository.create({ data: personPayload }, "person", tx);

            const name = formatCapitalized(`${person.firstname} ${person.lastname}`);
            const username = processnum;
            const password = await formatPassword('123456');
            const email = person.email || `${username}@student.com`;

            const userPayload = this.prepareData('user', ctx, {
                name,
                username,
                email,
                password,
                status: 'ACTIVE',
                person_id: person.id,
                school_id: schoolId
            }, true);
            const user = await userRepository.create({ data: userPayload }, "user", tx);

            const role = await roleRepository.findFirst({ where: { name: 'student' } }, "role", tx);
            if (role) {
                await userRoleRepository.create({
                    data: {
                        user_id: user.id,
                        role_id: role.id,
                        school_id: schoolId
                    }
                }, "userRole", tx);
            }

            const student = await studentRepository.create({
                data: {
                    ...studentData,
                    processnum,
                    user_id: user.id
                }
            }, 'student', tx);

            return student;
        });
    }

    async update(ctx: CrudContext, id: number, data: unknown) {
        const schema = this.schemas?.update;
        let body = schema ? await schema.parseAsync(data) : data;
        body = await this.beforeUpdate(body, ctx);

        const { user: _ignoredUser, person: personDto, ...studentDto } = body as any;
        const studentData = this.prepareData('student', ctx, studentDto, false);
        if (studentData.processnum) {
            studentData.processnum = formatProcessNum(studentData.processnum);
        }
        const parsedId = Number(this.parseId(id));

        return await prisma.$transaction(async (tx) => {
            const existingStudent = await studentRepository.findFirst({
                where: this.writeScope('student', ctx, { id: parsedId }),
                include: { user: true }
            }, "student", tx);
            if (!existingStudent) {
                throw new Error("NOT_FOUND");
            }

            if (personDto && existingStudent.user?.person_id) {
                const personPayload = this.prepareData('person', ctx, personDto, false, true);
                await personRepository.update({
                    where: { id: existingStudent.user.person_id },
                    data: personPayload
                }, "person", tx);
            }

            const updatedStudent = await studentRepository.update({
                where: { id: parsedId },
                data: studentData
            }, 'student', tx);

            return updatedStudent;
        });
    }

    async biExists(bi: string): Promise<boolean> {
        const normalized = bi.trim().toUpperCase().replace(/\s/g, '');
        if (!normalized) return false;
        const person = await personRepository.findFirst({
            where: { bi_number: normalized },
            select: { id: true }
        }, 'person');
        return !!person;
    }
}

export default new StudentService();