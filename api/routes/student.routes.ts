import studentService from "../services/student.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const studentRoutes = new CrudRoutes(studentService, 'students').router;

export { studentRoutes };