import { Router } from "express";
import bcrypt from "bcryptjs";
const { compare, hash } = bcrypt;
import { prisma } from "../lib/prisma.js";
import { createToken, getUser, requireAuth } from "../lib/auth.js";
import { validate, loginSchema, citizenLoginSchema, registerSchema, changePasswordSchema } from "../lib/validate.js";
import { asyncHandler } from "../lib/errors.js";
import { logAudit } from "../lib/audit.js";

export const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await logAudit(req, { action: "LOGIN_FAILED", entity: "User", details: `Failed: ${email}` });
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (user.status !== "ACTIVE") return res.status(401).json({ error: "Account inactive" });

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      await logAudit(req, { userId: user.id, userEmail: user.email, action: "LOGIN_FAILED", entity: "User", details: "Wrong password" });
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const authUser = { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role, mobile: user.mobile };
    const token = await createToken(authUser);

    await logAudit(req, { userId: user.id, userEmail: user.email, userName: authUser.name, userRole: user.role, action: "LOGIN_SUCCESS", entity: "User", entityId: user.id });

    res.cookie("auth-token", token, { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 86400000 });
    res.json({ success: true, user: authUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}));

authRoutes.get("/me", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ user: null });
  res.json({ user });
});

authRoutes.post("/logout", (req, res) => {
  res.clearCookie("auth-token");
  res.json({ success: true });
});

authRoutes.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
  if (!user?.passwordHash) return res.status(404).json({ error: "User not found" });
  if (!(await compare(currentPassword, user.passwordHash))) return res.status(400).json({ error: "Wrong current password" });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(newPassword, 12) } });
  res.json({ success: true, message: "Password changed" });
});

// Admin can reset any user's password
authRoutes.post("/admin-reset-password", requireAuth, async (req, res) => {
  const admin = (req as any).user;
  if (!["ADMIN", "EO"].includes(admin.role)) return res.status(403).json({ error: "Admin only" });
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) return res.status(400).json({ error: "User ID and new password required" });
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hash(newPassword, 12) } });
  await logAudit(req, { userId: admin.id, userName: admin.name, userRole: admin.role, action: "ADMIN_RESET_PASSWORD", entity: "User", entityId: userId, details: `Admin reset password for user ${userId}` });
  res.json({ success: true, message: "Password reset" });
});

// Citizen self-registration (mobile + password)
authRoutes.post("/register-simple", async (req, res) => {
  try {
    const { firstName, lastName, mobile, password } = req.body;
    if (!firstName || !lastName || !mobile || !password) return res.status(400).json({ error: "All fields required" });
    if (!/^[6-9]\d{9}$/.test(mobile)) return res.status(400).json({ error: "Invalid mobile number" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await prisma.user.findUnique({ where: { mobile } });
    if (existing) return res.status(409).json({ error: "Mobile already registered" });

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({ data: { firstName, lastName, mobile, passwordHash, role: "USER", status: "ACTIVE" } });
    await logAudit(req, { userId: user.id, userName: `${firstName} ${lastName}`, action: "REGISTER", entity: "User", entityId: user.id, details: `Citizen registered: ${mobile}` });
    res.status(201).json({ success: true, userId: user.id, message: "Registration successful" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Citizen login (mobile + password)
authRoutes.post("/citizen-login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: "Mobile and password required" });

    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.passwordHash) {
      await logAudit(req, { action: "CITIZEN_LOGIN_FAILED", entity: "User", details: `Failed citizen login: ${mobile}` });
      return res.status(401).json({ error: "Invalid mobile or password" });
    }
    if (user.status !== "ACTIVE") return res.status(401).json({ error: "Account inactive" });

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      await logAudit(req, { userId: user.id, action: "CITIZEN_LOGIN_FAILED", entity: "User", details: "Wrong password" });
      return res.status(401).json({ error: "Invalid mobile or password" });
    }

    const authUser = { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role, mobile: user.mobile };
    const token = await createToken(authUser);

    await logAudit(req, { userId: user.id, userEmail: user.email, userName: authUser.name, userRole: user.role, action: "CITIZEN_LOGIN_SUCCESS", entity: "User", entityId: user.id });

    res.cookie("auth-token", token, { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 86400000 });
    res.json({ success: true, user: authUser });
  } catch (err) {
    console.error("Citizen login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});
