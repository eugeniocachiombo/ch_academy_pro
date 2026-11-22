import provinceService from "../services/province.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const provinceRoutes = new CrudRoutes(provinceService, "provinces").router;

export { provinceRoutes };