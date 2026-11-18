import scheduleService from "../services/schedule.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const scheduleRoutes = new CrudRoutes(scheduleService, 'schedules').router;

export { scheduleRoutes };