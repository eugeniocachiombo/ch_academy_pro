import positionService from "../services/position.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const positionRoutes = new CrudRoutes(positionService, "positions").router;

export { positionRoutes };