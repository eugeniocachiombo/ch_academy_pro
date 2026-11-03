import teacherocupationService from "../services/teacherocupation.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const teacherocupationRoutes = new CrudRoutes(teacherocupationService, 'teacherocupations').router;

export { teacherocupationRoutes };