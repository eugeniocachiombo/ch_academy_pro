import degreeService from "../services/degree.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const degreeRoutes = new CrudRoutes(degreeService, 'degrees').router;

export { degreeRoutes };