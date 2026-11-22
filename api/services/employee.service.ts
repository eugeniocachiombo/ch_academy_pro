import { BaseService, type CrudContext } from "./base.service.js";
import { employeeRepository } from "../repository/employee.repository.js";
import { employeePositionRepository } from "../repository/employee-position.repository.js";
import { personRepository } from "../repository/person.repository.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee.schema.js";
import { prisma } from "../lib/prisma.js";
import {
  normalizeEmployeePerson,
  normalizeEmployeePositions,
} from "../utils/employee.util.js";

const EMPLOYEE_INCLUDE = {
  person: true,
  department: true,
  position: true,
  school: true,
  employeePositions: {
    where: { active: true },
    include: { position: true },
  },
};

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
        include: EMPLOYEE_INCLUDE,
      }
    );
  }

  protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
    const body = data as any;
    if (body?.person) {
      body.person = normalizeEmployeePerson(body.person, true);
    }
    return body;
  }

  protected async beforeUpdate(data: unknown, _ctx: CrudContext): Promise<unknown> {
    const body = data as any;
    if (body?.person) {
      body.person = normalizeEmployeePerson(body.person, false);
    }
    return body;
  }

  async create(ctx: CrudContext, data: unknown) {
    const schema = this.schemas?.create;
    let body = schema ? await schema.parseAsync(data) : data;
    body = await this.beforeCreate(body, ctx);

    const {
      person: personDto,
      position_ids: positionIds,
      position_id: rawPositionId,
      ...employeeDto
    } = body as any;

    const { uniqueIds, primaryPositionId } = normalizeEmployeePositions(rawPositionId, positionIds);
    const employeeData = this.prepareData(
      "employee",
      ctx,
      { ...employeeDto, position_id: primaryPositionId },
      true
    );
    const schoolId = employeeData.school_id ?? (ctx as any)?.school_id ?? null;

    return await prisma.$transaction(async (tx) => {
      const personPayload = this.prepareData("person", ctx, personDto, true, true);
      const person = await personRepository.create({ data: personPayload }, "person", tx);

      const employee = await employeeRepository.create(
        {
          data: {
            ...employeeData,
            school_id: schoolId,
            person_id: person.id,
            position_id: primaryPositionId,
          },
        },
        "employee",
        tx
      );

      for (const posId of uniqueIds) {
        await employeePositionRepository.create(
          {
            data: {
              employee_id: employee.id,
              position_id: posId,
              is_primary: posId === primaryPositionId,
              active: true,
              school_id: schoolId,
            },
          },
          "employeePosition",
          tx
        );
      }

      return await employeeRepository.findFirst(
        { where: { id: employee.id }, include: EMPLOYEE_INCLUDE },
        "employee",
        tx
      );
    });
  }

  async update(ctx: CrudContext, id: number, data: unknown) {
    const schema = this.schemas?.update;
    let body = schema ? await schema.parseAsync(data) : data;
    body = await this.beforeUpdate(body, ctx);

    const {
      person: personDto,
      position_ids: positionIds,
      position_id: rawPositionId,
      ...employeeDto
    } = body as any;

    const shouldSyncPositions = positionIds !== undefined || rawPositionId !== undefined;
    const { uniqueIds, primaryPositionId } = normalizeEmployeePositions(rawPositionId, positionIds);

    const employeeData = this.prepareData(
      "employee",
      ctx,
      shouldSyncPositions ? { ...employeeDto, position_id: primaryPositionId } : employeeDto,
      false
    );
    const parsedId = Number(this.parseId(id));

    return await prisma.$transaction(async (tx) => {
      const existingEmployee = await employeeRepository.findFirst(
        { where: this.writeScope("employee", ctx, { id: parsedId }) },
        "employee",
        tx
      );
      if (!existingEmployee) {
        throw new Error("NOT_FOUND");
      }

      if (personDto && existingEmployee.person_id) {
        const personPayload = this.prepareData("person", ctx, personDto, false, true);
        await personRepository.update(
          { where: { id: existingEmployee.person_id }, data: personPayload },
          "person",
          tx
        );
      }

      await employeeRepository.update(
        { where: { id: parsedId }, data: employeeData },
        "employee",
        tx
      );

      if (shouldSyncPositions) {
        await tx.employeePosition.deleteMany({
          where: { employee_id: parsedId },
        });

        const schoolId = employeeData.school_id ?? existingEmployee.school_id ?? null;

        for (const posId of uniqueIds) {
          await employeePositionRepository.create(
            {
              data: {
                employee_id: parsedId,
                position_id: posId,
                is_primary: posId === primaryPositionId,
                active: true,
                school_id: schoolId,
              },
            },
            "employeePosition",
            tx
          );
        }
      }

      return await employeeRepository.findFirst(
        { where: { id: parsedId }, include: EMPLOYEE_INCLUDE },
        "employee",
        tx
      );
    });
  }
}

export default new EmployeeService();