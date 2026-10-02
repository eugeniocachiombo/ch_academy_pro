import { rolePermitionRepository } from "../repository/role_permition.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(rolePermitionRepository, 'role-permitions')?.router;
export const rolePermitionRoutes = routerInstance;