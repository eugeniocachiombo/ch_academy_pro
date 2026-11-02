import classService from "../services/class.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const classRoutes = new CrudRoutes(classService, 'classes').router;

export { classRoutes };