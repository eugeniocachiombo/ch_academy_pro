import periodService from "../services/period.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const periodRoutes = new CrudRoutes(periodService, 'periods').router;

export { periodRoutes };