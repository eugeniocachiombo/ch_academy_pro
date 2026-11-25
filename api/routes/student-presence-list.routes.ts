import studentPresenceListService from "../services/student-presence-list.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const studentPresenceListRoutes = new CrudRoutes(studentPresenceListService, "student-presence-lists").router;

export { studentPresenceListRoutes };