import classSubjectService from "../services/class-subject.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const classSubjectRoutes = new CrudRoutes(classSubjectService, 'class-subjects').router;

export { classSubjectRoutes };