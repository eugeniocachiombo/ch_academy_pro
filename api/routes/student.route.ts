import { studentRepository } from "../repository/student.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(studentRepository, 'students')?.router;
export const studentRoutes = routerInstance;