import yearService from "../services/year.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const yearRoutes = new CrudRoutes(yearService, 'years').router;

export { yearRoutes };