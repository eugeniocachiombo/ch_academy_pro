import { BaseService, type CrudContext } from "./base.service.js";
import { employeeRepository } from "../repository/employee.repository.js";
import { personRepository } from "../repository/person.repository.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee.schema.js";
import { prisma } from "../lib/prisma.js";

class EmployeeService extends BaseService {
  constructor() {
    super(
      employeeRepository,
      "employee",
      {
        create: createEmployeeSchema,
        update: updateEmployeeSchema,
      },
      {
        tenant: "mixed",
        modes: { person: "global" },
        include: {
          person: true,
          department: true,
          position: true,
          school: true,
        },
      }
    );
  }

  protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
    const body = data as any;
    if (body?.person) {
      body.person = {
        ...body.person,
        nif: body.person.nif || body.person.bi_number,
      };
    }
    return body;
  }

  protected async beforeUpdate(data: unknown, _ctx: CrudContext): Promise<unknown> {
    const body = data as any;
    if (body?.person?.bi_number && !body.person.nif) {
      body.person = { ...body.person, nif: body.person.bi_number };
    }
    return body;
  }

  async create(ctx: CrudContext, data: unknown) {
    const schema = this.schemas?.create;
    let body = schema ? await schema.parseAsync(data) : data;
    body = await this.beforeCreate(body, ctx);

    const { person: personDto, ...employeeDto } = body as any;
    const employeeData = this.prepareData("employee", ctx, employeeDto, true);

    return await prisma.$transaction(async (tx) => {
      const personPayload = this.prepareData("person", ctx, personDto, true, true);
      const person = await personRepository.create({ data: personPayload }, "person", tx);

      const employee = await employeeRepository.create(
        {
          data: {
            ...employeeData,
            person_id: person.id,
          },
        },
        "employee",
        tx
      );

      return employee;
    });
  }

  async update(ctx: CrudContext, id: number, data: unknown) {
    const schema = this.schemas?.update;
    let body = schema ? await schema.parseAsync(data) : data;
    body = await this.beforeUpdate(body, ctx);

    const { person: personDto, ...employeeDto } = body as any;
    const employeeData = this.prepareData("employee", ctx, employeeDto, false);
    const parsedId = Number(this.parseId(id));

    return await prisma.$transaction(async (tx) => {
      const existingEmployee = await employeeRepository.findFirst(
        {
          where: this.writeScope("employee", ctx, { id: parsedId }),
        },
        "employee",
        tx
      );
      if (!existingEmployee) {
        throw new Error("NOT_FOUND");
      }

      if (personDto && existingEmployee.person_id) {
        const personPayload = this.prepareData("person", ctx, personDto, false, true);
        await personRepository.update(
          {
            where: { id: existingEmployee.person_id },
            data: personPayload,
          },
          "person",
          tx
        );
      }

      const updatedEmployee = await employeeRepository.update(
        {
          where: { id: parsedId },
          data: employeeData,
        },
        "employee",
        tx
      );

      return updatedEmployee;
    });
  }
}

export default new EmployeeService();