import { Request, Response } from "express";
import { sendError } from "../../../lib/admin-response";
import * as service from "./event-categories.service";

export async function list(req: Request, res: Response) {
  try {
    const data = await service.listEventCategories();
    return res.json(data);
  } catch (e: any) {
    return sendError(res, 500, "Failed to list event categories", e?.message);
  }
}
