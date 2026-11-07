import { prisma } from '../../lib/prisma';

export const coursesData = [
    { name: "Ensino Primário", code: "EP", description: "Ensino Primário (1ª à 6ª Classe)" },
    { name: "1º Ciclo do Ensino Secundário", code: "1CICLO", description: "1º Ciclo (7ª à 9ª Classe)" },
    { name: "Informática", code: "INF", description: "Curso Técnico de Informática" },
    { name: "Contabilidade e Gestão", code: "CG", description: "Curso Técnico de Contabilidade e Gestão" },
    { name: "Ciências Físicas e Biológicas", code: "CFB", description: "II Ciclo do Ensino Secundário - Ciências Físicas e Biológicas" },
    { name: "Ciências Económicas e Jurídicas", code: "CEJ", description: "II Ciclo do Ensino Secundário - Ciências Económicas e Jurídicas" },
    { name: "Enfermagem", code: "ENF", description: "Curso Técnico de Enfermagem" },
];

export const classesData = [
    "Pré-Iniciação",
    "1ª Classe",
    "2ª Classe",
    "3ª Classe",
    "4ª Classe",
    "5ª Classe",
    "6ª classe",
    "7ª classe",
    "8ª Classe",
    "9ª Classe",
    "10ª Classe",
    "11ª Classe",
    "12ª Classe",
    "13ª Classe",
];

export const subjectsData = [
    { name: "Língua Portuguesa", code: "LP" },
    { name: "Matemática", code: "MAT" },
    { name: "Física", code: "FIS" },
    { name: "Química", code: "QUI" },
    { name: "Biologia", code: "BIO" },
    { name: "História", code: "HIST" },
    { name: "Geografia", code: "GEO" },
    { name: "Inglês", code: "ING" },
    { name: "Educação Física", code: "EDF" },
    { name: "TIC", code: "TIC" },

    { name: "Francês", code: "FRA" },
    { name: "Língua Nacional", code: "LN" },
    { name: "Educação Moral e Cívica", code: "EMC" },
    { name: "Estudo do Meio", code: "EM" },
    { name: "Ciências da Natureza", code: "CN" },
    { name: "Educação Manual e Plástica", code: "EMP" },
    { name: "Educação Musical", code: "EMUS" },
    { name: "Educação Visual e Plástica", code: "EVP" },
    { name: "Educação Laboral", code: "EL" },
    { name: "Empreendedorismo", code: "EMPR" },
    { name: "Formação de Atitudes Integradoras", code: "FAI" },
    { name: "Organização e Gestão de Empresas", code: "OGE" },
    { name: "Desenho Técnico", code: "DT" },
    { name: "Estatística", code: "EST" },
    { name: "Estágio Curricular", code: "ESTC" },
    { name: "Projecto Tecnológico", code: "PTEC" },

    { name: "Arquitectura de Computadores", code: "ARQ" },
    { name: "Sistemas Operativos", code: "SO" },
    { name: "Programação", code: "PROG" },
    { name: "Redes de Computadores", code: "RC" },
    { name: "Bases de Dados", code: "BD" },
    { name: "Análise de Sistemas", code: "ANS" },
    { name: "Desenvolvimento Web", code: "WEB" },
    { name: "Electrónica", code: "ELE" },
    { name: "Segurança Informática", code: "SEG" },
    { name: "Higiene e Segurança no Trabalho", code: "HST" },

    { name: "Contabilidade Geral", code: "CGER" },
    { name: "Contabilidade Analítica", code: "CANA" },
    { name: "Contabilidade Financeira", code: "CFIN" },
    { name: "Economia", code: "ECO" },
    { name: "Direito Comercial e Fiscal", code: "DCF" },
    { name: "Fiscalidade", code: "FISC" },
    { name: "Matemática Financeira", code: "MFIN" },
    { name: "Gestão Empresarial", code: "GEMP" },
    { name: "Informática de Gestão", code: "INFG" },
    { name: "Auditoria", code: "AUD" },
    { name: "Técnicas Comerciais", code: "TCOM" },
    { name: "Gestão de Recursos Humanos", code: "GRH" },

    { name: "Filosofia", code: "FILO" },
    { name: "Geologia", code: "GEOL" },
    { name: "Introdução ao Direito", code: "IDIR" },
    { name: "Direito", code: "DIR" },
    { name: "Sociologia", code: "SOC" },
    { name: "Psicologia", code: "PSI" },

    { name: "Anatomia e Fisiologia", code: "ANAT" },
    { name: "Microbiologia e Parasitologia", code: "MICRO" },
    { name: "Fundamentos de Enfermagem", code: "FENF" },
    { name: "Primeiros Socorros", code: "PSOC" },
    { name: "Ética e Deontologia Profissional", code: "EDP" },
    { name: "Farmacologia", code: "FARM" },
    { name: "Nutrição e Dietética", code: "NUT" },
    { name: "Saúde Pública e Epidemiologia", code: "SPE" },
    { name: "Enfermagem Médico-Cirúrgica", code: "ENFMC" },
    { name: "Enfermagem Materno-Infantil", code: "ENFMI" },
    { name: "Enfermagem Comunitária", code: "ENFCOM" },
    { name: "Saúde Mental e Psiquiatria", code: "SMP" },
];

const courseClassesMap: Record<string, string[]> = {
    "EP": [
        "Pré-Iniciação",
        "1ª Classe",
        "2ª Classe",
        "3ª Classe",
        "4ª Classe",
        "5ª Classe",
        "6ª classe"
    ],
    "1CICLO": [
        "7ª classe",
        "8ª Classe",
        "9ª Classe"
    ],
    "INF": [
        "10ª Classe",
        "11ª Classe",
        "12ª Classe",
        "13ª Classe"
    ],
    "CG": [
        "10ª Classe",
        "11ª Classe",
        "12ª Classe",
        "13ª Classe"
    ],
    "CFB": [
        "10ª Classe",
        "11ª Classe",
        "12ª Classe"
    ],
    "CEJ": [
        "10ª Classe",
        "11ª Classe",
        "12ª Classe"
    ],
    "ENF": [
        "10ª Classe",
        "11ª Classe",
        "12ª Classe",
        "13ª Classe"
    ]
};

const primarioBase = ["Língua Portuguesa", "Matemática", "Educação Moral e Cívica", "Educação Manual e Plástica", "Educação Musical", "Educação Física"];
const primarioInicial = [...primarioBase, "Estudo do Meio"];
const primarioFinal = [...primarioBase, "Ciências da Natureza", "História", "Geografia", "Inglês", "Língua Nacional"];

const ciclo1Base = ["Língua Portuguesa", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Francês", "Educação Física", "Educação Moral e Cívica", "Educação Visual e Plástica", "Educação Laboral", "TIC"];

const tecnicoBase = ["Língua Portuguesa", "Inglês", "Matemática", "Educação Física", "Formação de Atitudes Integradoras", "Física", "Química", "Biologia", "TIC"];

const extra10 = ["Filosofia", "Introdução ao Direito", "História", "Geografia", "Anatomia e Fisiologia", "Fundamentos de Enfermagem", "Primeiros Socorros", "Ética e Deontologia Profissional"];
const extra11 = ["Filosofia", "Geologia", "Direito", "Sociologia", "História", "Geografia", "Anatomia e Fisiologia", "Microbiologia e Parasitologia", "Fundamentos de Enfermagem", "Farmacologia", "Nutrição e Dietética", "Saúde Pública e Epidemiologia"];
const extra12 = ["Filosofia", "Geologia", "Direito", "Sociologia", "Psicologia", "Enfermagem Médico-Cirúrgica", "Enfermagem Materno-Infantil", "Enfermagem Comunitária", "Farmacologia", "Saúde Pública e Epidemiologia", "Saúde Mental e Psiquiatria"];
const extra13 = ["Enfermagem Médico-Cirúrgica", "Enfermagem Materno-Infantil", "Enfermagem Comunitária", "Saúde Mental e Psiquiatria", "Ética e Deontologia Profissional"];

const classSubjectsMap: Record<string, string[]> = {
    "Pré-Iniciação": ["Língua Portuguesa", "Matemática", "Educação Manual e Plástica", "Educação Musical", "Educação Física"],
    "1ª Classe": primarioInicial,
    "2ª Classe": primarioInicial,
    "3ª Classe": primarioInicial,
    "4ª Classe": primarioInicial,
    "5ª Classe": primarioFinal,
    "6ª classe": primarioFinal,
    "7ª classe": ciclo1Base,
    "8ª Classe": [...ciclo1Base, "Empreendedorismo"],
    "9ª Classe": [...ciclo1Base, "Empreendedorismo"],
    "10ª Classe": [
        ...tecnicoBase,
        "Desenho Técnico",
        "Arquitectura de Computadores",
        "Sistemas Operativos",
        "Programação",
        "Electrónica",
        "Economia",
        "Contabilidade Geral",
        "Direito Comercial e Fiscal",
        "Informática de Gestão",
        ...extra10,
    ],
    "11ª Classe": [
        ...tecnicoBase,
        "Empreendedorismo",
        "Organização e Gestão de Empresas",
        "Programação",
        "Redes de Computadores",
        "Bases de Dados",
        "Sistemas Operativos",
        "Higiene e Segurança no Trabalho",
        "Contabilidade Geral",
        "Contabilidade Analítica",
        "Economia",
        "Estatística",
        "Matemática Financeira",
        "Técnicas Comerciais",
        ...extra11,
    ],
    "12ª Classe": [
        ...tecnicoBase,
        "Empreendedorismo",
        "Organização e Gestão de Empresas",
        "Programação",
        "Redes de Computadores",
        "Bases de Dados",
        "Análise de Sistemas",
        "Desenvolvimento Web",
        "Segurança Informática",
        "Contabilidade Analítica",
        "Contabilidade Financeira",
        "Fiscalidade",
        "Gestão Empresarial",
        "Gestão de Recursos Humanos",
        "Estatística",
        "Matemática Financeira",
        ...extra12,
    ],
    "13ª Classe": [
        ...tecnicoBase,
        "Empreendedorismo",
        "Organização e Gestão de Empresas",
        "Análise de Sistemas",
        "Desenvolvimento Web",
        "Segurança Informática",
        "Redes de Computadores",
        "Contabilidade Financeira",
        "Fiscalidade",
        "Gestão Empresarial",
        "Auditoria",
        "Gestão de Recursos Humanos",
        "Projecto Tecnológico",
        "Estágio Curricular",
        ...extra13,
    ]
};

export async function seedAcademic(tx: any = prisma) {
    const stats = {
        courses: { created: 0, updated: 0, failed: 0 },
        classes: { created: 0, existing: 0, failed: 0 },
        subjects: { created: 0, updated: 0, failed: 0 },
        classCourses: { created: 0, existing: 0, failed: 0 },
        classSubjects: { created: 0, existing: 0, failed: 0 },
    };

    console.log("========== INÍCIO DO SEED ACADÉMICO ==========");

    console.log("\n--- CURSOS ---");
    const courseMap = new Map<string, number>();
    for (const course of coursesData) {
        try {
            const existing = await tx.course.findUnique({ where: { code: course.code } });
            let record;
            if (existing) {
                record = await tx.course.update({
                    where: { code: course.code },
                    data: { name: course.name, description: course.description },
                });
                stats.courses.updated++;
                console.log(`[CURSO] ATUALIZADO: ${course.name} (${course.code}) id=${record.id}`);
            } else {
                record = await tx.course.create({
                    data: {
                        name: course.name,
                        code: course.code,
                        description: course.description,
                        editable: false,
                    },
                });
                stats.courses.created++;
                console.log(`[CURSO] CADASTRADO: ${course.name} (${course.code}) id=${record.id}`);
            }
            courseMap.set(course.code, record.id);
        } catch (error) {
            stats.courses.failed++;
            console.error(`[CURSO] FALHOU: ${course.name} (${course.code})`, error);
        }
    }

    console.log("\n--- CLASSES ---");
    const classMap = new Map<string, number>();
    for (const className of classesData) {
        try {
            const existing = await tx.class.findUnique({ where: { name: className } });
            if (existing) {
                stats.classes.existing++;
                classMap.set(className, existing.id);
                console.log(`[CLASSE] JÁ EXISTIA: ${className} id=${existing.id}`);
            } else {
                const record = await tx.class.create({
                    data: { name: className, editable: false },
                });
                stats.classes.created++;
                classMap.set(className, record.id);
                console.log(`[CLASSE] CADASTRADA: ${className} id=${record.id}`);
            }
        } catch (error) {
            stats.classes.failed++;
            console.error(`[CLASSE] FALHOU: ${className}`, error);
        }
    }

    console.log("\n--- DISCIPLINAS ---");
    const subjectMap = new Map<string, number>();
    for (const subject of subjectsData) {
        try {
            let subjectRecord = await tx.subject.findFirst({
                where: { code: subject.code, school_id: null },
            });

            if (subjectRecord) {
                subjectRecord = await tx.subject.update({
                    where: { id: subjectRecord.id },
                    data: { name: subject.name },
                });
                stats.subjects.updated++;
                console.log(`[DISCIPLINA] ATUALIZADA: ${subject.name} (${subject.code}) id=${subjectRecord.id}`);
            } else {
                subjectRecord = await tx.subject.create({
                    data: {
                        name: subject.name,
                        code: subject.code,
                        editable: false,
                        school_id: null,
                    },
                });
                stats.subjects.created++;
                console.log(`[DISCIPLINA] CADASTRADA: ${subject.name} (${subject.code}) id=${subjectRecord.id}`);
            }
            subjectMap.set(subject.name, subjectRecord.id);
        } catch (error) {
            stats.subjects.failed++;
            console.error(`[DISCIPLINA] FALHOU: ${subject.name} (${subject.code})`, error);
        }
    }

    console.log("\n--- CLASSES POR CURSO ---");
    for (const [courseCode, classNames] of Object.entries(courseClassesMap)) {
        const courseId = courseMap.get(courseCode);
        if (!courseId) {
            stats.classCourses.failed += classNames.length;
            console.error(`[CLASSE-CURSO] FALHOU: curso ${courseCode} não encontrado, ${classNames.length} classe(s) ignorada(s)`);
            continue;
        }

        for (const className of classNames) {
            const classId = classMap.get(className);
            if (!classId) {
                stats.classCourses.failed++;
                console.error(`[CLASSE-CURSO] FALHOU: classe "${className}" não encontrada (curso ${courseCode})`);
                continue;
            }

            try {
                const existing = await tx.classcourse.findFirst({
                    where: { course_id: courseId, class_id: classId, school_id: null },
                });

                if (existing) {
                    stats.classCourses.existing++;
                    console.log(`[CLASSE-CURSO] JÁ EXISTIA: ${courseCode} -> ${className}`);
                } else {
                    await tx.classcourse.create({
                        data: { course_id: courseId, class_id: classId, school_id: null },
                    });
                    stats.classCourses.created++;
                    console.log(`[CLASSE-CURSO] CADASTRADO: ${courseCode} -> ${className}`);
                }
            } catch (error) {
                stats.classCourses.failed++;
                console.error(`[CLASSE-CURSO] FALHOU: ${courseCode} -> ${className}`, error);
            }
        }
    }

    console.log("\n--- DISCIPLINAS POR CLASSE ---");
    for (const [className, subjectNames] of Object.entries(classSubjectsMap)) {
        const classId = classMap.get(className);
        const uniqueSubjects = Array.from(new Set(subjectNames));

        if (!classId) {
            stats.classSubjects.failed += uniqueSubjects.length;
            console.error(`[CLASSE-DISCIPLINA] FALHOU: classe "${className}" não encontrada, ${uniqueSubjects.length} disciplina(s) ignorada(s)`);
            continue;
        }

        for (const subjectName of uniqueSubjects) {
            const subjectId = subjectMap.get(subjectName);
            if (!subjectId) {
                stats.classSubjects.failed++;
                console.error(`[CLASSE-DISCIPLINA] FALHOU: disciplina "${subjectName}" não encontrada (${className})`);
                continue;
            }

            try {
                const existing = await tx.classSubject.findFirst({
                    where: { class_id: classId, subject_id: subjectId, school_id: null },
                });

                if (existing) {
                    stats.classSubjects.existing++;
                    console.log(`[CLASSE-DISCIPLINA] JÁ EXISTIA: ${className} -> ${subjectName}`);
                } else {
                    await tx.classSubject.create({
                        data: { class_id: classId, subject_id: subjectId, school_id: null },
                    });
                    stats.classSubjects.created++;
                    console.log(`[CLASSE-DISCIPLINA] CADASTRADA: ${className} -> ${subjectName}`);
                }
            } catch (error) {
                stats.classSubjects.failed++;
                console.error(`[CLASSE-DISCIPLINA] FALHOU: ${className} -> ${subjectName}`, error);
            }
        }
    }

    const degrees = ["Ensino Médio", "Frequência Universitária", "Licenciado", "Msc. Mestrado", "Dr. Doutor"];
    for (const degree of degrees) {
        await tx.degree.upsert({
            where: { name: degree },
            update: {},
            create: {
                name: degree,
                editable: false,
            },
        });
        console.log("Grau Acadêmico criada/actualizada:", degree);
    }

    console.log("\n========== RESUMO DO SEED ACADÉMICO ==========");
    console.log(`Cursos:                cadastrados=${stats.courses.created} atualizados=${stats.courses.updated} falhas=${stats.courses.failed}`);
    console.log(`Classes:               cadastradas=${stats.classes.created} já existiam=${stats.classes.existing} falhas=${stats.classes.failed}`);
    console.log(`Disciplinas:           cadastradas=${stats.subjects.created} atualizadas=${stats.subjects.updated} falhas=${stats.subjects.failed}`);
    console.log(`Classes por curso:     cadastrados=${stats.classCourses.created} já existiam=${stats.classCourses.existing} falhas=${stats.classCourses.failed}`);
    console.log(`Disciplinas por classe: cadastradas=${stats.classSubjects.created} já existiam=${stats.classSubjects.existing} falhas=${stats.classSubjects.failed}`);
    console.log("==============================================");
}