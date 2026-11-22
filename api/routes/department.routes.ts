import departmentService from "../services/department.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const departmentRoutes = new CrudRoutes(departmentService, "departments").router;

export { departmentRoutes };