import { BaseRepository } from "./base/base.repository.js";

class EmployeePositionRepository extends BaseRepository {
  constructor() {
    super("employeePosition");
  }
}

export const employeePositionRepository = new EmployeePositionRepository();