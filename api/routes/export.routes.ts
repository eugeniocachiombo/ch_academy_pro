import { Router, Request, Response } from "express";
import { errorReport } from "../utils/error-handler.js";
import studentPresenceService from "../services/student-presence.service.js";
import {
  buildPresenceExcel,
  buildPresenceHtml,
} from "../src/reports/student-presence.report.js";

const exportRoutes = Router();

function getCtx(req: Request) {
  const r = req as any;
  return {
    schoolId: r.schoolId ?? req.headers["x-school-id"],
    userId: r.userId ?? r.user?.id,
    isSuperAdmin: Boolean(r.isSuperAdmin ?? r.user?.isSuperAdmin),
  };
}


exportRoutes.get("/exports/student-presences/:id/excel", async (req: Request, res: Response) => {
  try {
    const presence = await studentPresenceService.find(getCtx(req), String(req.params.id));
    const buffer = buildPresenceExcel(presence);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="chamada-${req.params.id}.xlsx"`);
    return res.send(buffer);
  } catch (error) {
    return errorReport(res, error);
  }
});


exportRoutes.get("/exports/student-presences/:id/pdf", async (req: Request, res: Response) => {
  try {
    const presence = await studentPresenceService.find(getCtx(req), String(req.params.id));
    const html = buildPresenceHtml(presence);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  } catch (error) {
    return errorReport(res, error);
  }
});

export { exportRoutes };