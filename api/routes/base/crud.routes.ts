import { errorReport } from "../../repository/base/errorHandler.repository.js";
import { Router, Request, Response } from "express";
import cryptoService from "../../services/crypto.service.js";

export class CrudRoutes {
    public router: Router = Router();
    repository: any;
    name : string = '';

    constructor(repo: any, name:string) {
        this.repository = repo;
        this.name = name;
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`/${this.name}`, async (_req: Request, res: Response) => {
            try {
                const items = await this.repository.list();
                return res.status(200).json(items);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.post(`/${this.name}`, async (req: Request, res: Response) => {
            try {
                const newItem = await this.repository.create(req.body);
                return res.status(201).json(newItem);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.get(`/${this.name}/:id`, async (req: Request, res: Response) => {
            try {
                const id = cryptoService.decryptId(String(req.params.id));
                const item = await this.repository.find(id);
                return res.status(200).json(item);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.put(`/${this.name}/:id`, async (req: Request, res: Response) => {
            try {
                const id = cryptoService.decryptId(String(req.params.id));
                const updatedItem = await this.repository.update(id, req.body);
                return res.status(200).json(updatedItem);
            } catch (error) {
                return errorReport(res, error);
            }
        });

        this.router.delete(`/${this.name}/:id`, async (req: Request, res: Response) => {
            try {
                const id = cryptoService.decryptId(String(req.params.id));
                await this.repository.delete(id);
                return res.status(200).json({ message: "Registo apagado com sucesso" });
            } catch (error) {
                return errorReport(res, error);
            }
        });
    }
}