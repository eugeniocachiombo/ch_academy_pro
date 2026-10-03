import { academicYearRepository } from "../repository/academic_year.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(academicYearRepository, 'academic-years')?.router;
export const academicYearRoutes = routerInstance;