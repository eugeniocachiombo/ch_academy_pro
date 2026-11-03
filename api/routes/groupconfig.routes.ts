import groupconfigService from "../services/groupconfig.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const groupconfigRoutes = new CrudRoutes(groupconfigService, 'groupconfigs').router;

export { groupconfigRoutes };