import 'dotenv/config';
import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/user.routes.js";
import { authRoutes } from "./routes/auth.route.js";
import { roleRoutes } from "./routes/role.routes.js";
import { permitionRoutes } from "./routes/permition.routes.js";
import { userRoleRoutes } from "./routes/user-role.routes.js";
import { rolePermitionRoutes } from "./routes/role-permition.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { yearRoutes } from "./routes/year.routes.js";
import { courseRoutes } from "./routes/course.routes.js";
import { subjectRoutes } from "./routes/subject.routes.js";
import { classRoutes } from "./routes/class.routes.js";
import { roomRoutes } from "./routes/room.routes.js";
import { groupRoutes } from './routes/group.routes.js';
import { groupconfigRoutes } from './routes/groupconfig.routes.js';
import { periodRoutes } from './routes/preiod.routes.js';
import { registerRoutes } from './routes/register.routes.js';
import { teacherocupationRoutes } from './routes/teacherocupation.routes.js';
import { classcourseRoutes } from './routes/classcourse.routes.js';
import { classSubjectRoutes } from './routes/class-subject.routes.js';
import { schoolRoutes } from './routes/school.routes.js';
import { studentRoutes } from "./routes/student.routes.js";
import { teacherRoutes } from "./routes/teacher.routes.js";

const app = express();

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(
  "/api",
  authMiddleware,
  userRoutes,
  authRoutes,
  roleRoutes,
  permitionRoutes,
  userRoleRoutes,
  rolePermitionRoutes,
  rolePermitionRoutes,
  yearRoutes,
  courseRoutes,
  subjectRoutes,
  classRoutes,
  roomRoutes,
  groupRoutes,
  groupconfigRoutes,
  periodRoutes,
  registerRoutes,
  teacherocupationRoutes,
  classcourseRoutes,
  classSubjectRoutes,
  schoolRoutes,
  studentRoutes,
  teacherRoutes
);

app.get("/", (req, res) => {
  res.json({
    message: "API rodando!",
    environment: process.env.NODE_ENV,
  });
});


if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Servidor a rodar na porta 3000");
  });
}

export default app;