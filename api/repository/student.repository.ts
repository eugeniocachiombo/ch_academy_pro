// student.repository.ts
import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createStudentSchema = z.object({
    firstname: z.string().min(2, "O primeiro nome deve ter pelo menos 2 caracteres"),
    middlename: z.string().optional().nullable().transform(val => val === "" ? null : val),
    lastname: z.string().min(2, "O sobrenome deve ter pelo menos 2 caracteres"),
    birthday: z.string("o").or(z.date()).transform((val) => new Date(val)),
    gender: z.string().min(1, "O género é obrigatório"),
    bi_number: z.string().min(14, "O número do BI deve ser válido").max(14, "O número do BI deve ter 14 caracteres"),
    nif: z.string().optional().nullable().transform(val => val === "" ? null : val),
    phone: z.string().min(9, "O telefone deve ter pelo menos 9 dígitos"),
    alternative_phone: z.string().optional().nullable().transform(val => val === "" ? null : val),
    email: z.string().email("E-mail inválido").optional().nullable().or(z.literal('')).transform(val => val === "" ? null : val),
    province: z.string().optional(),
    municipality: z.string().optional(),
    neighborhood: z.string().optional(),
    street: z.string().optional().nullable().transform(val => val === "" ? null : val),
    house_number: z.string().optional().nullable().transform(val => val === "" ? null : val),
    guardian_name: z.string().min(3, "O nome do encarregado é obrigatório"),
    guardian_phone: z.string().min(9, "O telefone do encarregado deve ter pelo menos 9 dígitos"),
    guardian_bi: z.string().optional().nullable().transform(val => val === "" ? null : val),
    origin_school: z.string().optional().nullable().transform(val => val === "" ? null : val)
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

class StudentRepository extends Crud {
    constructor() {
        super("student", {
            create: createStudentSchema,
            update: updateStudentSchema
        });
    }

    async list() {
        return await prisma.student.findMany({
            include: { person: true }
        });
    }

    async create(rawdata: any) {
        
        const data = createStudentSchema.parse(rawdata);

        const existingBi = await prisma.person.findUnique({
            where: { bi_number: data.bi_number }
        });

        if (existingBi) {
            throw { response: { data: { errors: { bi_number: ['Já existe uma pessoa registada com este número de BI.'] } } } };
        }

        if (data.nif) {
            const existingNif = await prisma.person.findUnique({
                where: { nif: data.nif }
            });

            if (existingNif) {
                throw { response: { data: { errors: { nif: ['Já existe uma pessoa registada com este NIF.'] } } } };
            }
        }

        if (data.email) {
            const existingEmail = await prisma.person.findUnique({
                where: { email: data.email }
            });

            if (existingEmail) {
                throw { response: { data: { errors: { email: ['Já existe uma pessoa registada com este e-mail.'] } } } };
            }
        }

        const {
            firstname,
            middlename,
            lastname,
            birthday,
            gender,
            bi_number,
            nif,
            phone,
            alternative_phone,
            email,
            province,
            municipality,
            neighborhood,
            street,
            house_number,
            guardian_name,
            guardian_phone,
            guardian_bi,
            origin_school
        } = data;

        return await prisma.student.create({
            data: {
                guardian_name,
                guardian_phone,
                guardian_bi,
                origin_school,
                person: {
                    create: {
                        firstname,
                        middlename,
                        lastname,
                        birthday,
                        gender,
                        bi_number,
                        nif,
                        phone,
                        alternative_phone,
                        email,
                        province,
                        municipality,
                        neighborhood,
                        street,
                        house_number
                    }
                }
            },
            include: {
                person: true
            }
        });
    }

    async update(id: number | string, rawdata: any) {
        const numericId = Number(id);
        const data = updateStudentSchema.parse(rawdata);

        const currentStudent = await prisma.student.findUnique({
            where: { id: numericId },
            include: { person: true }
        });

        if (!currentStudent) {
            throw { response: { data: { message: 'Estudante não encontrado.' } } };
        }

        if (data.bi_number && data.bi_number !== currentStudent.person.bi_number) {
            const existingBi = await prisma.person.findUnique({
                where: { bi_number: data.bi_number }
            });
            if (existingBi) {
                throw { response: { data: { errors: { bi_number: ['Já existe uma pessoa registada com este número de BI.'] } } } };
            }
        }

        if (data.nif && data.nif !== currentStudent.person.nif) {
            const existingNif = await prisma.person.findUnique({
                where: { nif: data.nif }
            });
            if (existingNif) {
                throw { response: { data: { errors: { nif: ['Já existe uma pessoa registada com este NIF.'] } } } };
            }
        }

        if (data.email && data.email !== currentStudent.person.email) {
            const existingEmail = await prisma.person.findUnique({
                where: { email: data.email }
            });
            if (existingEmail) {
                throw { response: { data: { errors: { email: ['Já existe uma pessoa registada com este e-mail.'] } } } };
            }
        }

        const {
            firstname,
            middlename,
            lastname,
            birthday,
            gender,
            bi_number,
            nif,
            phone,
            alternative_phone,
            email,
            province,
            municipality,
            neighborhood,
            street,
            house_number,
            guardian_name,
            guardian_phone,
            guardian_bi,
            origin_school,
            ...studentData
        } = data;

        const personData: any = {};
        if (firstname !== undefined) personData.firstname = firstname;
        if (middlename !== undefined) personData.middlename = middlename;
        if (lastname !== undefined) personData.lastname = lastname;
        if (birthday !== undefined) personData.birthday = birthday;
        if (gender !== undefined) personData.gender = gender;
        if (bi_number !== undefined) personData.bi_number = bi_number;
        if (nif !== undefined) personData.nif = nif;
        if (phone !== undefined) personData.phone = phone;
        if (alternative_phone !== undefined) personData.alternative_phone = alternative_phone;
        if (email !== undefined) personData.email = email;
        if (province !== undefined) personData.province = province;
        if (municipality !== undefined) personData.municipality = municipality;
        if (neighborhood !== undefined) personData.neighborhood = neighborhood;
        if (street !== undefined) personData.street = street;
        if (house_number !== undefined) personData.house_number = house_number;

        const updateData: any = { ...studentData };
        if (Object.keys(personData).length > 0) {
            updateData.person = {
                update: personData
            };
        }

        return await prisma.student.update({
            where: { id: numericId },
            data: updateData,
            include: {
                person: true
            }
        });
    }
}

export const studentRepository = new StudentRepository();