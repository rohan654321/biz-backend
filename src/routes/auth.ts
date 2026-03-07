import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { AuthService } from "../services/auth.service";
import { sendOtpEmail } from "../services/email.service";

const router = Router();
const BOOTSTRAP_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET;

// POST /api/auth/login – email/password → JWT (user, super-admin, sub-admin)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const result = await AuthService.authenticateWithCredentials(email, password);
    if (!result) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return res.json({
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Login error (backend):", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// POST /api/auth/refresh – refreshToken → new access + refresh tokens
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }
    const tokens = await AuthService.refreshTokens(refreshToken);
    return res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Refresh token error (backend):", err);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if user already exists (same behavior as Next.js route)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        alreadyRegistered: true,
        message: "Email already registered. Please login.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });
    await prisma.otp.create({
      data: { email: normalizedEmail, otp, expiresAt },
    });

    // Send OTP email via centralized email service
    await sendOtpEmail(normalizedEmail, otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Send OTP error (backend):", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = await prisma.otp.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Verify OTP error (backend):", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
});

// POST /api/auth/register – user registration (shared with Next.js route)
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      companyName,
      designation,
      website,
      userType,
      selectedPlan,
    } = req.body as {
      fullName?: string;
      email?: string;
      password?: string;
      phone?: string;
      companyName?: string;
      designation?: string;
      website?: string;
      userType?: string;
      selectedPlan?: string;
    };

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: "fullName, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Name parsing (same logic as Next.js route)
    const nameParts = fullName.trim().split(" ");
    let firstName = "";
    let lastName = "";

    if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName = "User";
    } else if (nameParts.length === 2) {
      firstName = nameParts[0];
      lastName = nameParts[1];
    } else {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    }

    const roleMapping: Record<string, string> = {
      visitor: "ATTENDEE",
      exhibitor: "EXHIBITOR",
      organiser: "ORGANIZER",
      speaker: "SPEAKER",
      venue: "VENUE_MANAGER",
    };
    const role = roleMapping[userType ?? ""] || "ATTENDEE";

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || undefined,
        role: role as any,
        company: companyName || undefined,
        jobTitle: designation || undefined,
        website: website || undefined,
      },
    });

    if (userType === "organiser" && selectedPlan) {
      // Placeholder: could persist organizer plan selection here
      // eslint-disable-next-line no-console
      console.log(`User ${user.id} selected plan: ${selectedPlan}`);
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to our platform.",
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Registration error (backend):", error);

    if (error?.code === "P2002") {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    return res.status(500).json({
      error: "Registration failed. Please try again.",
      details: error?.message,
    });
  }
});

// TEMPORARY: POST /api/auth/bootstrap-superadmin
// Creates an initial SUPER_ADMIN when called with the correct secret.
// Remove this route (and the ADMIN_BOOTSTRAP_SECRET env) after bootstrap.
router.post("/bootstrap-superadmin", async (req, res) => {
  try {
    if (!BOOTSTRAP_SECRET) {
      return res.status(403).json({
        message: "Admin bootstrap is not enabled on this server",
      });
    }

    const { secret, email, password, name } = req.body as {
      secret?: string;
      email?: string;
      password?: string;
      name?: string;
    };

    if (!secret || secret !== BOOTSTRAP_SECRET) {
      return res.status(403).json({ message: "Invalid bootstrap secret" });
    }

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "email, password and name are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.superAdmin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "SuperAdmin already exists",
        email: existing.email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        // Prisma enum AdminRole.SUPER_ADMIN; cast as any to avoid import
        role: "SUPER_ADMIN" as any,
        isActive: true,
        permissions: ["*"],
      },
    });

    return res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully",
      email: superAdmin.email,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Bootstrap superadmin error:", err);
    return res.status(500).json({ message: "Failed to bootstrap super admin" });
  }
});

export default router;

