import { prisma } from '../lib/prisma';
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

async function main() {
  await prisma.$transaction(async (tx) => {
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

    const adminRole = await tx.role.upsert({
      where: { name: "admin" },
      update: {},
      create: {
        name: "admin",
      },
    });

    await tx.role.upsert({
      where: { name: "director" },
      update: {},
      create: {
        name: "director",
      },
    });

    console.log("Role criada/actualizada:", adminRole.name);

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
        },
      });
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
          },
        });
      }
    }
  });

  console.log("Todas as permissões (manage, create, update, delete) e associações foram criadas com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });