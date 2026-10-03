import { courseRepository } from "../repository/course.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(courseRepository, 'courses')?.router;
export const courseRoutes = routerInstance;