import { Router, Request, Response } from "express";
import studentService from "../services/student.service.js";
import { CrudRoutes } from "./base/crud.routes.js";
import { errorReport } from "../utils/error-handler.js";

const studentRoutes = Router();

studentRoutes.get('/students/check-bi/:bi', async (req: Request, res: Response) => {
    try {
        const exists = await studentService.biExists(String(req.params.bi));
        return res.status(200).json({ exists });
    } catch (error) {
        return errorReport(res, error);
    }
});

studentRoutes.use(new CrudRoutes(studentService, 'students').router);

export { studentRoutes };