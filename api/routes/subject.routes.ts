import subjectService from "../services/subject.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const subjectRoutes = new CrudRoutes(subjectService, 'subjects').router;

export { subjectRoutes };