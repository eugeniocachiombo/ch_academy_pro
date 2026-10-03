import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/user.routes.js";
import { roleRoutes } from "./routes/role.routes.js";
import { permitionRoutes } from "./routes/permition.routes.js";
import { userRoleRoutes } from "./routes/user_role.routes.js";
import { rolePermitionRoutes } from "./routes/role_permition.routes.js";
import { academicClassRoutes } from "./routes/academic_class.route.js";
import { academicGradeRoutes } from "./routes/academic_grade.route.js";
import { academicRoomRoutes } from "./routes/academic_room.route.js";
import { academicYearRoutes } from "./routes/academic_year.route.js";
import { courseRoutes } from "./routes/course.route.js";
const app = express();

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", roleRoutes);
app.use("/api", permitionRoutes);
app.use("/api", userRoleRoutes);
app.use("/api", rolePermitionRoutes);
app.use("/api", academicClassRoutes);
app.use("/api", academicGradeRoutes);
app.use("/api", academicRoomRoutes);
app.use("/api", academicYearRoutes);
app.use("/api", courseRoutes);

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