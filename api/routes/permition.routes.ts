import permitionService from "../services/permition.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const permitionRoutes = new CrudRoutes(permitionService, 'permitions').router;

export { permitionRoutes };