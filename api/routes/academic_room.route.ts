import { academicRoomRepository } from "../repository/academic_room.repository.js";
import { CrudRoutes } from "./base/crud.routes.js";

const routerInstance = new CrudRoutes(academicRoomRepository, 'academic-rooms')?.router;
export const academicRoomRoutes = routerInstance;