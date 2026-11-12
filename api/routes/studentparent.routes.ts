import studentparentService from "../services/studentparent.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const studentparentRoutes = new CrudRoutes(studentparentService, 'studentparents').router;

export { studentparentRoutes };