import roomService from "../services/room.service.js";
import { CrudRoutes } from "./base/crud.routes.js";

const roomRoutes = new CrudRoutes(roomService, 'rooms').router;

export { roomRoutes };