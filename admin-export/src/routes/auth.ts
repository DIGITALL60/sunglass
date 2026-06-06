import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "../db.js";
import { eq } from "drizzle-orm";
import { JWT_SECRET } from "../middlewares/auth.js";
import { z } from "zod";

const LoginBody = z.object({ email: z.string().email(), password: z.string().min(1) });

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Email y contraseña requeridos" }); return; }

    const { email, password } = parsed.data;
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) { res.status(401).json({ error: "Credenciales inválidas" }); return; }

    const valid = await bcrypt.compare(password, users[0].password);
    if (!valid) { res.status(401).json({ error: "Credenciales inválidas" }); return; }

    const token = jwt.sign({ userId: users[0].id, role: users[0].role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
