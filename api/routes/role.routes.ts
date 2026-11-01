import roleService from "../services/role.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const roleRoutes = new CrudRoutes(roleService, 'roles').router;

export { roleRoutes };