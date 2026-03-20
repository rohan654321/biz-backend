import { Router } from "express";
import { requireUser } from "../../middleware/auth.middleware";
import { listActiveEventCategoriesPublic } from "../admin/event-categories/event-categories.service";

const router = Router();

router.get("/event-categories", requireUser, async (_req, res) => {
  try {
    const categories = await listActiveEventCategoriesPublic();
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Failed to fetch event categories", details: error?.message });
  }
});

export default router;
