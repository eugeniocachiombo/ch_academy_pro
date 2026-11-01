import userRoleService from "../services/user-role.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const userRoleRoutes = new CrudRoutes(userRoleService, 'user-roles').router;

export { userRoleRoutes };