import { academicClassRepository } from "../repository/academic_class.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(academicClassRepository, 'academic-classes')?.router;
export const academicClassRoutes = routerInstance;