import { permitionRepository } from "../repository/permition.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(permitionRepository, 'permitions')?.router;
export const permitionRoutes = routerInstance;