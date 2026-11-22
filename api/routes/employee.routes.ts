import employeeService from "../services/employee.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const employeeRoutes = new CrudRoutes(employeeService, "employees").router;

export { employeeRoutes };