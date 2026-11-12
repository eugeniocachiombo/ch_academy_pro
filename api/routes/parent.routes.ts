import parentService from "../services/parent.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const parentRoutes = new CrudRoutes(parentService, 'parents').router;

export { parentRoutes };