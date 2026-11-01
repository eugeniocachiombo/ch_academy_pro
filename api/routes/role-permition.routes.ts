import rolePermitionService from "../services/role-permition.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const rolePermitionRoutes = new CrudRoutes(rolePermitionService, 'role-permitions').router;

export { rolePermitionRoutes };