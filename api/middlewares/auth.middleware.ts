import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.includes('/auth/login') || req.path === '/') return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "TOKEN_MISSING" });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET as string;

  try {
    const decoded: any = jwt.verify(token, secret);
    const isMasterAdmin = decoded.isSuperAdmin === true;
    (req as any).userId = decoded.userId;
    (req as any).schoolId = isMasterAdmin ? undefined : decoded.schoolId;
    (req as any).isSuperAdmin = isMasterAdmin;
    return next();
  } catch (err: any) {
    console.log("JWT erro:", err.message);
    console.log("Token (início/fim):", token.slice(0, 15), "...", token.slice(-10), "| comprimento:", token.length);
    console.log("Header/payload:", jwt.decode(token, { complete: true }));
    return res.status(401).json({ message: "TOKEN_INVALID_OR_EXPIRED", error: err.message });
  }
}