import { subjectRepository } from "../repository/subject.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(subjectRepository, 'subjects')?.router;
export const subjectRoutes = routerInstance;