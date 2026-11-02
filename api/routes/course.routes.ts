import courseService from "../services/course.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const courseRoutes = new CrudRoutes(courseService, 'courses').router;

export { courseRoutes };