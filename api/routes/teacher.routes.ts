import { Router, Request, Response } from "express";
import teacherService from "../services/teacher.service.js";
import { CrudRoutes } from "./base/crud.routes.js";
import { errorReport } from "../utils/error-handler.js";

const teacherRoutes = Router();

teacherRoutes.get('/teachers/check-bi/:bi', async (req: Request, res: Response) => {
    try {
        const exists = await teacherService.biExists(String(req.params.bi));
        return res.status(200).json({ exists });
    } catch (error) {
        return errorReport(res, error);
    }
});

teacherRoutes.use(new CrudRoutes(teacherService, 'teachers').router);

export { teacherRoutes };