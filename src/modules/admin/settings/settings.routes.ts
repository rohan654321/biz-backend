import { Router } from "express";
import { requireAdmin } from "../../../middleware/auth.middleware";
import * as ctrl from "./settings.controller";

const router = Router();

router.get("/modules", requireAdmin, ctrl.getModules);
router.get("/notifications", requireAdmin, ctrl.getNotifications);
router.get("/security", requireAdmin, ctrl.getSecurity);
router.get("/language", requireAdmin, ctrl.getLanguage);
router.get("/backup", requireAdmin, ctrl.getBackup);

export default router;
