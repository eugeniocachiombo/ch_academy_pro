import { BaseService } from './base.service.js';
import { studentRepository } from '../repository/student.repository.js';
import { userRepository } from '../repository/user.repository.js';
import { personRepository } from '../repository/person.repository.js';
import { createStudentSchema, updateStudentSchema } from '../validators/student.schema.js';
import { CrudContext } from './base.service.js';
import { formatCapitalized, formatUsername, formatPassword } from '../utils/formaters.js';
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
                include: { 
                    user: true, 
                    school: true,
                    province: true,
                    municipality: true
                }
            }
        );
    }

    async create(ctx: CrudContext, data: unknown) {        
        const schema = this.schemas?.create;
        let body = schema ? await schema.parseAsync(data) : data;
        body = await this.beforeCreate(body, ctx);

        const { user: userDto, person: personDto, ...studentDto } = body as any;
        const studentData = this.prepareData('student', ctx, studentDto, true);
        const schoolId = studentData.school_id;

        return await prisma.$transaction(async (tx) => {
            const personPayload = this.prepareData('person', ctx, personDto, true);
            const person = await personRepository.create({ data: personPayload }, "person", tx);

            
            const name = formatCapitalized(`${person.firstname} ${person.lastname}`);
            const username = userDto.username || formatUsername(name + Math.floor(1000 + Math.random() * 9000));
            const password = await formatPassword(userDto.password || '123456');
            const email = userDto.email || person.email || `${username}@student.com`;

            const userPayload = this.prepareData('user', ctx, {
                ...userDto,
                name,
                username,
                email,
                password,
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
                    user_id: user.id
                }
            }, 'student', tx);

            return student;
        });
    }


    async update(ctx: CrudContext, id: number, data: unknown) {
        const schema = this.schemas?.update;
        let body = schema ? await schema.parseAsync(data) : data;

        const { user: userDto, person: personDto, ...studentDto } = body as any;
        const studentData = this.prepareData('student', ctx, studentDto, false);

        return await prisma.$transaction(async (tx) => {
            const existingStudent = await studentRepository.findById({ where: { id } }, "student", tx);
            if (!existingStudent) {
                throw new Error("Student not found");
            }

            if (personDto && existingStudent.user?.person_id) {
                const personPayload = this.prepareData('person', ctx, personDto, false);
                await personRepository.update({
                    where: { id: existingStudent.user.person_id },
                    data: personPayload
                }, "person", tx);
            }

            if (userDto && existingStudent.user_id) {
                const userPayload = this.prepareData('user', ctx, userDto, false);
                await userRepository.update({
                    where: { id: existingStudent.user_id },
                    data: userPayload
                }, "user", tx);
            }

            const updatedStudent = await studentRepository.update({
                where: { id },
                data: studentData
            }, 'student', tx);

            return updatedStudent;
        });
    }
}

export default new StudentService();