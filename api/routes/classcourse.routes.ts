import classcourseService from "../services/classcourse.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const classcourseRoutes = new CrudRoutes(classcourseService, 'classcourses').router;

export { classcourseRoutes };