import groupService from "../services/group.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const groupRoutes = new CrudRoutes(groupService, 'groups').router;

export { groupRoutes };