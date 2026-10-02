import { userRoleRepository } from "../repository/user_role.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(userRoleRepository, 'user-roles')?.router;
export const userRoleRoutes = routerInstance;