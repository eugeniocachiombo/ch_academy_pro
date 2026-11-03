import { BaseService } from './base.service.js';
import { roomRepository } from '../repository/room.repository.js';
import { createRoomSchema, updateRoomSchema } from '../validators/room.schema.js';

class RoomService extends BaseService {
    constructor() {
        super(
            roomRepository, 
            "room", 
            {
                create: createRoomSchema,
                update: updateRoomSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new RoomService();