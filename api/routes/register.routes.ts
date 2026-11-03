import registerService from "../services/register.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const registerRoutes = new CrudRoutes(registerService, 'registers').router;

export { registerRoutes };