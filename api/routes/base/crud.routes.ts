import { Router, Request, Response } from "express";
import { errorReport } from "../../utils/error-handler.js";

export class CrudRoutes {
    public router: Router = Router();

    constructor(private service: any, private name: string) {
        this.initRoutes();
    }

    private getContext(req: Request): any {
        return {
            schoolId: (req as any).schoolId || req.headers['x-school-id'],
            isSuperAdmin: (req as any).isSuperAdmin || false
        };
    }

    private initRoutes() {
        const basePath = `/${this.name}`;

        this.router.get(basePath, async (req: Request, res: Response) => {
            try {
                const ctx = this.getContext(req);
                const items = await this.service.list(ctx, req.query);
                return res.status(200).json(items);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.post(basePath, async (req: Request, res: Response) => {
            try {
                const ctx = this.getContext(req);
                const newItem = await this.service.create(ctx, req.body);
                return res.status(201).json(newItem);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.get(`${basePath}/:id`, async (req: Request, res: Response) => {
            try {
                const ctx = this.getContext(req);
                const item = await this.service.find(ctx, String(req.params.id));
                return res.status(200).json(item);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.put(`${basePath}/:id`, async (req: Request, res: Response) => {
            try {
                const ctx = this.getContext(req);
                const updatedItem = await this.service.update(ctx, String(req.params.id), req.body);
                return res.status(200).json(updatedItem);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.delete(`${basePath}/:id`, async (req: Request, res: Response) => {
            try {
                const ctx = this.getContext(req);
                await this.service.remove(ctx, String(req.params.id));
                return res.status(200).json({ message: "Registo apagado com sucesso" });
            } catch (error) {
                return errorReport(res, error);
            }
        });
    }
}