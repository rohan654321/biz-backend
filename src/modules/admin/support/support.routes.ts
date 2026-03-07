import { Router } from "express";
import { requireAdmin } from "../../../middleware/auth.middleware";
import * as ctrl from "./support.controller";

const router = Router();

router.get("/tickets", requireAdmin, ctrl.listTickets);

export default router;
