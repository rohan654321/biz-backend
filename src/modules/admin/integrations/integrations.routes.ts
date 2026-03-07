import { Router } from "express";
import { requireAdmin } from "../../../middleware/auth.middleware";
import * as ctrl from "./integrations.controller";

const router = Router();

router.get("/payments", requireAdmin, ctrl.getPayments);
router.get("/communication", requireAdmin, ctrl.getCommunication);
router.get("/travel", requireAdmin, ctrl.getTravel);

export default router;
