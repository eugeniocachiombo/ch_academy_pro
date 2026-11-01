import { Router, Request, Response } from "express";
import { errorReport } from "../utils/error-handler.js";
import authService from "../services/auth.service.js";

const authRoutes = Router();

authRoutes.post("/auth/login", async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        return res.status(200).json(result);
    } catch (error) {
        return errorReport(res, error);
    }
});

authRoutes.get("/auth/me", async (req: Request, res: Response) => {
    try {
        const ctx = {
            schoolId: (req as any).schoolId || req.headers['x-school-id'],
            isSuperAdmin: (req as any).isSuperAdmin || false
        };
        const userId = (req as any).userId || req.headers['x-user-id']; // Ajuste conforme o seu middleware de autenticação/JWT

        const result = await authService.getProfile(ctx, userId);
        return res.status(200).json(result);
    } catch (error) {
        return errorReport(res, error);
    }
});

export { authRoutes };