import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';

const modules = [
    { key: "courses", label: "Cursos" },
    { key: "subjects", label: "Disciplinas" },
    { key: "classes", label: "Classes" },
    { key: "rooms", label: "Salas" },
    { key: "years", label: "Ano Letivo" },
    { key: "users", label: "Utilizadores" },
    { key: "roles", label: "Funções/Perfis" },
    { key: "permitions", label: "Permissões do Sistema" },
    { key: "role-permitions", label: "Permissões de Funções" },
    { key: "user-roles", label: "Vínculos de Funções" },
    { key: "periods", label: "Turnos" },
    { key: "groups", label: "Turmas" },
    { key: "groupconfigs", label: "Configurar Turmas" },
    { key: "classcourses", label: "Classes dos Cursos" },
    { key: "class-subjects", label: "Disciplinas das Classes" },
];

const actions = [
    { action: "manage", label: "Gerir" },
    { action: "create", label: "Criar" },
    { action: "update", label: "Actualizar" },
    { action: "delete", label: "Eliminar" },
    { action: "pdf", label: "Baixar PDF" },
    { action: "excel", label: "Baixar Excel" },
];

const roles = ["admin", "director", "aluno", "secretario", "coordenador"];

export async function seedAdmin(tx: any = prisma) {
    const hashedPassword = await bcrypt.hash("secret", 10);

    const adminUser = await tx.user.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            name: "Administrador",
            username: "admin",
            email: "admin@sistema.com",
            password: hashedPassword,
        },
    });

    console.log("Seed processado para o utilizador:", adminUser.username);

    for (const roleName of roles) {
        await tx.role.upsert({
            where: { name: roleName },
            update: {},
            create: {
                name: roleName,
                editable: false,
            },
        });
        console.log("Role criada/actualizada:", roleName);
    }

    const adminRole = await tx.role.findUnique({
        where: { name: "admin" },
    });

    if (adminRole) {
        const existingUserRole = await tx.userRole.findFirst({
            where: {
                user_id: adminUser.id,
                role_id: adminRole.id,
            },
        });

        if (!existingUserRole) {
            await tx.userRole.create({
                data: {
                    user_id: adminUser.id,
                    role_id: adminRole.id,
                    editable: false,
                },
            });
        }
    }

    for (const mod of modules) {
        for (const act of actions) {
            const permName = `${mod.key}.${act.action}`;
            const permDescription = `${act.label} ${mod.label.toLowerCase()}`;

            await tx.permition.upsert({
                where: { name: permName },
                update: {
                    description: permDescription,
                },
                create: {
                    name: permName,
                    description: permDescription,
                    editable: false,
                },
            });
        }
    }

    console.log("Todas as permissões (manage, create, update, delete, pdf, excel) e associações foram criadas com sucesso!");
}