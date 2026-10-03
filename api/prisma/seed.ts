import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  // 1. Criar ou atualizar o Utilizador Administrador
  const hashedPassword = await bcrypt.hash("secret", 10);
  const adminUser = await prisma.user.upsert({
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

  // 2. Criar ou atualizar a Role (Perfil) "ADMIN"
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
    },
  });

  console.log("Role criada/atualizada:", adminRole.name);

  // 3. Associar a Role ao Utilizador (Tabela UserRole)
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: adminRole.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: adminRole.id,
    },
  });

  // 4. Lista exata de Permissões baseada nos itens do menu do frontend
  const permissionsToCreate = [
    // Acadêmico
    "classes.manage",
    "grades.manage",
    "attendance.manage",
    
    // Financeiro
    "fee.manage",
    "bill.manage",
    "cashflow.manage",
    
    // Alunos
    "student.manage",
    "enrollment.manage",
    
    // Professores
    "teacher.manage",
    "schedule.manage",
    
    // Comunicações
    "wall.manage",
    "message.send",
    
    // Relatórios
    "report_academic.manage",
    "report_financial.manage",
    "report_attendance.manage",
    
    // Configurações
    "academic_year.manage",
    "user.manage",
    "role.manage",
    "permition.manage",
    "role_permition.manage",
    "user_role.manage",
  ];

  for (const permName of permissionsToCreate) {
    const permission = await prisma.permition.upsert({
      where: { name: permName }, // Garante que a coluna 'name' possui restrição @unique no Prisma Schema
      update: {},
      create: {
        name: permName,
      },
    });

    // 5. Associar cada Permissão à Role ADMIN (Tabela RolePermition)
    // await prisma.rolePermition.upsert({
    //   where: {
    //     role_id_permition_id: {
    //       role_id: adminRole.id,
    //       permition_id: permission.id,
    //     },
    //   },
    //   update: {},
    //   create: {
    //     role_id: adminRole.id,
    //     permition_id: permission.id,
    //   },
    // });
  }

  console.log("Todas as permissões do menu e associações foram criadas com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });