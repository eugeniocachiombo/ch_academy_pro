import { roleRepository } from "../repository/role.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(roleRepository, 'roles')?.router;
export const roleRoutes = routerInstance;