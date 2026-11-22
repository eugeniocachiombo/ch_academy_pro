import { prisma } from '../../lib/prisma';

const angolaData = [
  {
    province: "Bengo",
    municipalities: ["Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"]
  },
  {
    province: "Benguela",
    municipalities: ["Baía Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongorói", "Cubal", "Ganda", "Lobito"]
  },
  {
    province: "Bié",
    municipalities: ["Andulo", "Camacupa", "Catabola", "Chitembo", "Cuemba", "Cuito", "Cunhinga", "Mumbué", "Nharêa"]
  },
  {
    province: "Cabinda",
    municipalities: ["Belize", "Buco-Zau", "Cabinda", "Cacongo"]
  },
  {
    province: "Cuando Cubango",
    municipalities: ["Caiundo", "Calai", "Cuangar", "Cuchi", "Cuito Cuanavale", "Dirico", "Mavinga", "Menongue", "Rivungo"]
  },
  {
    province: "Cuanza Norte",
    municipalities: ["Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Gonguembo", "Lucala", "Quiculungo", "Samba Caju"]
  },
  {
    province: "Cuanza Sul",
    municipalities: ["Amboim", "Cassongue", "Cela", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"]
  },
  {
    province: "Cunene",
    municipalities: ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"]
  },
  {
    province: "Huambo",
    municipalities: ["Bailundo", "Cachiungo", "Caála", "Ekunha", "Huambo", "Londuimbale", "Longonjo", "Mungo", "Chicala-Choloanga", "Chinjenje", "Ucuma"]
  },
  {
    province: "Huíla",
    municipalities: ["Caconda", "Cacula", "Caluquembe", "Chiange", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo"]
  },
  {
    province: "Icolo e Bengo",
    municipalities: ["Catete", "Icolo e Bengo"]
  },
  {
    province: "Luanda",
    municipalities: ["Belas", "Cacuaco", "Cazenga", "Kilamba Kiaxi", "Luanda", "Quissama", "Talatona", "Viana"]
  },
  {
    province: "Lunda Norte",
    municipalities: ["Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuílo", "Lóvua", "Lubalo", "Lucapa", "Xá-Muteba"]
  },
  {
    province: "Lunda Sul",
    municipalities: ["Cacolo", "Dala", "Muconda", "Saurimo"]
  },
  {
    province: "Malanje",
    municipalities: ["Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Cuaba Nzoji", "Cunda-Dia-Baze", "Luquembo", "Malanje", "Marimba", "Massango", "Mucari", "Quela", "Quirima"]
  },
  {
    province: "Moxico",
    municipalities: ["Alto Zambeze", "Bundas", "Camanongue", "Léua", "Luau", "Luacano", "Luchazes", "Cameia", "Moxico"]
  },
  {
    province: "Namibe",
    municipalities: ["Bibala", "Camucuio", "Moçâmedes", "Tômbua", "Virei"]
  },
  {
    province: "Uíge",
    municipalities: ["Alto Cauale", "Ambuíla", "Bembe", "Buengas", "Bungo", "Damba", "Milunga", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Sanza Pombo", "Songo", "Uíge", "Zombo"]
  },
  {
    province: "Zaire",
    municipalities: ["Cuimba", "Mbanza Kongo", "Nóqui", "Nzeto", "Soyo", "Tomboco"]
  }
];

export async function seedProvinceMunicipality(tx: any = prisma) {
  for (const item of angolaData) {
    let provinceRecord = await tx.province.findFirst({
      where: { name: item.province },
    });

    if (!provinceRecord) {
      provinceRecord = await tx.province.create({
        data: { name: item.province },
      });
    }

    console.log(`Processando província: ${provinceRecord.name}`);

    for (const muniName of item.municipalities) {
      const muniExists = await tx.municipality.findFirst({
        where: {
          name: muniName,
          province_id: provinceRecord.id,
        },
      });

      if (!muniExists) {
        await tx.municipality.create({
          data: {
            name: muniName,
            province_id: provinceRecord.id,
          },
        });
      }
    }
  }
  console.log("Seed de províncias e municípios concluído com sucesso!");
}