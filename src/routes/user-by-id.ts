import { Request, Response, Router } from "express";
import prisma from "../config/prisma";

const router = Router();

/**
 * GET /api/users/:id
 * Used by Next.js server to fetch any user by id (e.g. visitor dashboard).
 * Secured by X-Internal-Secret so only the Next.js app can call this.
 */
router.get("/users/:id", async (req: Request, res: Response) => {
  const secret = process.env.INTERNAL_API_SECRET;
  if (secret) {
    const provided = req.headers["x-internal-secret"];
    if (provided !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User id required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        bio: true,
        website: true,
        linkedin: true,
        twitter: true,
        instagram: true,
        company: true,
        companyIndustry: true,
        jobTitle: true,
        location: true,
        interests: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = {
      ...user,
      interests: user.interests ?? [],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() ?? null,
      _count: { eventsAttended: 0, eventsOrganized: 0, connections: 0 },
    };

    return res.json({ user: userData });
  } catch (err) {
    console.error("Error fetching user by id:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
