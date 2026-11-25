import studentPresenceService from "../services/student-presence.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const studentPresenceRoutes = new CrudRoutes(studentPresenceService, "student-presences").router;

export { studentPresenceRoutes };