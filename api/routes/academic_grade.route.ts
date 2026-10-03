import { academicGradeRepository } from "../repository/academic_grade.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(academicGradeRepository, 'academic-grades')?.router;
export const academicGradeRoutes = routerInstance;