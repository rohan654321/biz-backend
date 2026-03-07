import { Router } from "express";
import { requireAdmin } from "../../../middleware/auth.middleware";
import * as ctrl from "./event-categories.controller";

const router = Router();

router.get("/", requireAdmin, ctrl.list);

export default router;
