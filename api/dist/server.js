var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import express from "express";
import cors from "cors";

// routes/user.routes.ts
import { Router } from "express";

// repository/user.repository.ts
import { z } from "zod";
import bcrypt from "bcrypt";

// lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.1",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id       Int     @id @default(autoincrement())\n  name     String?\n  username String  @unique @default("empty")\n  password String  @default("empty")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"name","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","User.findUnique","User.findUniqueOrThrow","orderBy","cursor","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_count","_avg","_sum","_min","_max","User.groupBy","User.aggregate","AND","OR","NOT","id","name","username","password","equals","in","notIn","lt","lte","gt","gte","contains","startsWith","endsWith","not","set","increment","decrement","multiply","divide"]'),
  graph: "MgsQBxwAACYAMB0AAAQAEB4AACYAMB8CAAAAASABACgAISEBAAAAASIBACkAIQEAAAABACABAAAAAQAgBxwAACYAMB0AAAQAEB4AACYAMB8CACcAISABACgAISEBACkAISIBACkAIQEgAAAqACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAEHwIAAAABIAEAAAABIQEAAAABIgEAAAABAQgAAAkAIAQfAgAAAAEgAQAAAAEhAQAAAAEiAQAAAAEBCAAACwAwAQgAAAsAMAQfAgAyACEgAQAwACEhAQAxACEiAQAxACECAAAAAQAgCAAADgAgBB8CADIAISABADAAISEBADEAISIBADEAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgBhUAACsAIBYAACwAIBcAAC8AIBgAAC4AIBkAAC0AICAAACoAIAccAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAdACEiAQAdACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIAccAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAdACEiAQAdACENFQAAHwAgFgAAJQAgFwAAHwAgGAAAHwAgGQAAHwAgIwIAAAABJAIAAAAEJQIAAAAEJgIAAAABJwIAAAABKAIAAAABKQIAAAABLQIAJAAhDhUAACIAIBgAACMAIBkAACMAICMBAAAAASQBAAAABSUBAAAABSYBAAAAAScBAAAAASgBAAAAASkBAAAAASoBAAAAASsBAAAAASwBAAAAAS0BACEAIQ4VAAAfACAYAAAgACAZAAAgACAjAQAAAAEkAQAAAAQlAQAAAAQmAQAAAAEnAQAAAAEoAQAAAAEpAQAAAAEqAQAAAAErAQAAAAEsAQAAAAEtAQAeACEOFQAAHwAgGAAAIAAgGQAAIAAgIwEAAAABJAEAAAAEJQEAAAAEJgEAAAABJwEAAAABKAEAAAABKQEAAAABKgEAAAABKwEAAAABLAEAAAABLQEAHgAhCCMCAAAAASQCAAAABCUCAAAABCYCAAAAAScCAAAAASgCAAAAASkCAAAAAS0CAB8AIQsjAQAAAAEkAQAAAAQlAQAAAAQmAQAAAAEnAQAAAAEoAQAAAAEpAQAAAAEqAQAAAAErAQAAAAEsAQAAAAEtAQAgACEOFQAAIgAgGAAAIwAgGQAAIwAgIwEAAAABJAEAAAAFJQEAAAAFJgEAAAABJwEAAAABKAEAAAABKQEAAAABKgEAAAABKwEAAAABLAEAAAABLQEAIQAhCCMCAAAAASQCAAAABSUCAAAABSYCAAAAAScCAAAAASgCAAAAASkCAAAAAS0CACIAIQsjAQAAAAEkAQAAAAUlAQAAAAUmAQAAAAEnAQAAAAEoAQAAAAEpAQAAAAEqAQAAAAErAQAAAAEsAQAAAAEtAQAjACENFQAAHwAgFgAAJQAgFwAAHwAgGAAAHwAgGQAAHwAgIwIAAAABJAIAAAAEJQIAAAAEJgIAAAABJwIAAAABKAIAAAABKQIAAAABLQIAJAAhCCMIAAAAASQIAAAABCUIAAAABCYIAAAAAScIAAAAASgIAAAAASkIAAAAAS0IACUAIQccAAAmADAdAAAEABAeAAAmADAfAgAnACEgAQAoACEhAQApACEiAQApACEIIwIAAAABJAIAAAAEJQIAAAAEJgIAAAABJwIAAAABKAIAAAABKQIAAAABLQIAHwAhCyMBAAAAASQBAAAABSUBAAAABSYBAAAAAScBAAAAASgBAAAAASkBAAAAASoBAAAAASsBAAAAASwBAAAAAS0BACMAIQsjAQAAAAEkAQAAAAQlAQAAAAQmAQAAAAEnAQAAAAEoAQAAAAEpAQAAAAEqAQAAAAErAQAAAAEsAQAAAAEtAQAgACEAAAAAAAABLgEAAAABAS4BAAAAAQUuAgAAAAEvAgAAAAEwAgAAAAExAgAAAAEyAgAAAAEAAAAABRUABhYABxcACBgACRkACgAAAAAABRUABhYABxcACBgACRkACgECAQIDAQUGAQYHAQcIAQkKAQoMAgsNAwwPAQ0RAg4SBBETARIUARMVAhoYBRsZCw"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("node:buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.9.1",
  engine: "e922089b7d7502aff4249d5da3420f6fa55fc6ad"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  username: "username",
  password: "password"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// repository/base/crud.repository.ts
var Crud = class {
  constructor(defaultModel, schemas) {
    this.defaultModel = defaultModel;
    this.schemas = schemas;
  }
  defaultModel;
  schemas;
  getModel(model) {
    const activeModel = model || this.defaultModel;
    if (!activeModel) {
      throw new Error("Nenhum modelo Prisma foi especificado.");
    }
    return activeModel;
  }
  parseId(id) {
    if (typeof id === "number") return id;
    const isPureNumber = /^\d+$/.test(id);
    return isPureNumber ? Number(id) : id;
  }
  async beforeCreate(data) {
    return data;
  }
  async beforeUpdate(data) {
    return data;
  }
  async create(data, model, customSchema) {
    const schema = customSchema || this.schemas?.create;
    let validatedData = schema ? schema.parseAsync(data) : data;
    validatedData = await this.beforeCreate(validatedData);
    const m = this.getModel(model);
    return prisma[m].create({
      data: validatedData
    });
  }
  async list(model) {
    const m = this.getModel(model);
    return prisma[m].findMany();
  }
  async find(id, model) {
    const m = this.getModel(model);
    const parsedId = this.parseId(id);
    const item = await prisma[m].findUnique({
      where: { id: parsedId }
    });
    if (!item) {
      throw new Error("NOT_FOUND");
    }
    return item;
  }
  async update(id, data, model, customSchema) {
    await this.find(id, model);
    const schema = customSchema || this.schemas?.update;
    let validatedData = schema ? schema.parseAsync(data) : data;
    validatedData = await this.beforeUpdate(validatedData);
    const m = this.getModel(model);
    const parsedId = this.parseId(id);
    return prisma[m].update({
      where: { id: parsedId },
      data: validatedData
    });
  }
  async delete(id, model) {
    await this.find(id, model);
    const m = this.getModel(model);
    const parsedId = this.parseId(id);
    return prisma[m].delete({
      where: { id: parsedId }
    });
  }
};

// repository/user.repository.ts
var createUserSchema = z.object({
  name: z.string().transform((v) => v === "" ? void 0 : v).optional(),
  username: z.string().min(3, "Nome de utilizador \xE9 obrigat\xF3rio").refine(async (username) => {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    return !existingUser;
  }, {
    message: "Este nome de utilizador j\xE1 est\xE1 em uso, escolha um outro"
  }),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres")
});
var updateUserSchema = createUserSchema.partial();
var loginUserSchema = z.object({
  username: z.string().min(1, "O nome de utilizador \xE9 obrigat\xF3rio"),
  password: z.string().min(1, "A palavra-passe \xE9 obrigat\xF3ria")
});
var UserRepository = class extends Crud {
  constructor() {
    super("user", {
      create: createUserSchema,
      update: updateUserSchema
    });
  }
  async create(data) {
    const validatedData = await createUserSchema.parseAsync(data);
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      10
    );
    return await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword
      }
    });
  }
  async update(id, data) {
    const validatedData = await updateUserSchema.parseAsync(data);
    const updateData = {
      ...validatedData
    };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password,
        10
      );
    }
    return await prisma.user.update({
      where: {
        id: Number(id)
      },
      data: updateData
    });
  }
  async login(data, customSchema) {
    const schema = customSchema || loginUserSchema;
    const { username, password } = schema.parse(data);
    const user = await prisma.user.findUnique({
      where: { username }
    });
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};
var userRepository = new UserRepository();

// repository/base/errorHandler.repository.ts
import { ZodError } from "zod";
function errorReport(res, error) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Verifique os campos do formul\xE1rio",
      errors: error.flatten().fieldErrors
    });
  }
  if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = error.meta?.target;
        const field = Array.isArray(target) ? target.join(", ") : target;
        const model = error.meta?.modelName || "Registo";
        return res.status(409).json({
          message: field ? `J\xE1 existe um(a) ${model} com este(a) ${field}.` : "J\xE1 existe um registo com estes dados."
        });
      }
      case "P2025": {
        return res.status(404).json({
          message: "Registo n\xE3o encontrado no sistema"
        });
      }
      case "P2003": {
        return res.status(400).json({
          message: "Falha na rela\xE7\xE3o entre dados (Chave estrangeira inv\xE1lida)."
        });
      }
      default:
        return res.status(400).json({
          message: "Erro na opera\xE7\xE3o de base de dados",
          code: error.code
        });
    }
  }
  if (error instanceof Error && error.message === "NOT_FOUND") {
    return res.status(404).json({ message: "Registo n\xE3o encontrado" });
  }
  return res.status(500).json({ message: "Erro interno do servidor" });
}

// routes/user.routes.ts
import jwt from "jsonwebtoken";
var userRoutes = Router();
var JWT_SECRET = String(process.env.JWT_SECRET);
userRoutes.post("/users/login", async (req, res) => {
  try {
    const user = await userRepository.login(req.body);
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    return res.status(200).json({
      token,
      user
    });
  } catch (error) {
    return errorReport(res, error);
  }
});
userRoutes.post("/users", async (req, res) => {
  try {
    const newUser = await userRepository.create(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    return errorReport(res, error);
  }
});
userRoutes.get("/users", async (_req, res) => {
  try {
    const users = await userRepository.list();
    return res.status(200).json(users);
  } catch (error) {
    return errorReport(res, error);
  }
});
userRoutes.get("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await userRepository.find(id);
    return res.status(200).json(user);
  } catch (error) {
    return errorReport(res, error);
  }
});
userRoutes.put("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedUser = await userRepository.update(id, req.body);
    return res.status(200).json(updatedUser);
  } catch (error) {
    return errorReport(res, error);
  }
});
userRoutes.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await userRepository.delete(id);
    return res.status(200).json({ message: "Registo apagado com sucesso" });
  } catch (error) {
    return errorReport(res, error);
  }
});

// server.ts
var app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/api", userRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "API rodando!",
    environment: process.env.NODE_ENV
  });
});
if (process.env.NODE_ENV !== "production") {
  app.listen(3e3, () => {
    console.log("Servidor a rodar na porta 3000");
  });
}
var server_default = app;
export {
  server_default as default
};
