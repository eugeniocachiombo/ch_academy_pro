import schoolService from "../services/school.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const schoolRoutes = new CrudRoutes(schoolService, 'schools').router;

export { schoolRoutes };