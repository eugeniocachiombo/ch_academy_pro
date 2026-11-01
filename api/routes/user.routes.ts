import { Request, Response } from "express";
import userService from "../services/user.service.js";
import { CrudRoutes } from "./base/crud.routes.js";
import { errorReport } from "../utils/error-handler.js";

const userRoutes = new CrudRoutes(userService, 'users').router;

userRoutes.put("/users/:id/password", async (req: Request, res: Response) => {
    try {
        const ctx = {
            schoolId: (req as any).schoolId || req.headers['x-school-id'],
            isSuperAdmin: (req as any).isSuperAdmin || false
        };
        const result = await userService.update(ctx, String(req.params.id), req.body);
        return res.status(200).json(result);
    } catch (error) {
        return errorReport(res, error);
    }
});

export { userRoutes };