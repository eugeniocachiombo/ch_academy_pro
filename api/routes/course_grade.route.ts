import { courseGradeRepository } from "../repository/course_grade.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(courseGradeRepository, 'course-grades')?.router;
export const courseGradeRoutes = routerInstance;