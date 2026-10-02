import { Router, Request, Response } from "express";
import { userRepository } from "../repository/user.repository.js";
import { errorReport } from "../repository/base/errorHandler.repository.js";
import jwt from "jsonwebtoken";

const userRoutes = Router();
const JWT_SECRET = String(process.env.JWT_SECRET);

// Rota de Login
userRoutes.post("/users/login", async (req: Request, res: Response) => {
    try {
        
        const user = await userRepository.login(req.body);

        // Gera o token JWT com validade (ex: 8 horas)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.status(200).json({
            token,
            user
        });
    } catch (error) {
        return errorReport(res, error);
    }
});

userRoutes.post("/users", async (req: Request, res: Response) => {
    try {
        const newUser = await userRepository.create(req.body);
        return res.status(201).json(newUser);
    } catch (error) {
        return errorReport(res, error);
    }
});

userRoutes.get("/users", async (_req: Request, res: Response) => {
    try {
        const users = await userRepository.list();
        return res.status(200).json(users);
    } catch (error) {
        return errorReport(res, error);
    }
});

userRoutes.get("/users/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const user = await userRepository.find(id);
        return res.status(200).json(user);
    } catch (error) {
        return errorReport(res, error);
    }
});

userRoutes.put("/users/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const updatedUser = await userRepository.update(id, req.body);
        return res.status(200).json(updatedUser);
    } catch (error) {
        return errorReport(res, error);
    }
});

userRoutes.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await userRepository.delete(id);
        return res.status(200).json({ message: "Registo apagado com sucesso" });
    } catch (error) {
        return errorReport(res, error);
    }
});

export { userRoutes };