import municipalityService from "../services/municipality.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const municipalityRoutes = new CrudRoutes(municipalityService, "municipalities").router;

export { municipalityRoutes };