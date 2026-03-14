import { Request, Response, Router } from "express";

const router = Router();

/**
 * GET /api/content/banners
 * Returns banners for a page/position. Backend has no Banner table; returns [] so frontend does not 500.
 * Query: page, position (optional, ignored).
 */
router.get("/content/banners", (_req: Request, res: Response) => {
  res.json([]);
});

/** POST /api/content/banners — not implemented (no Banner table in backend). Returns 501. */
router.post("/content/banners", (_req: Request, res: Response) => {
  res.status(501).json({ error: "Banner upload not implemented in backend" });
});

export default router;
