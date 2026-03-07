import { Request, Response } from "express";
import { sendList, sendOne, sendError } from "../../../lib/admin-response";
import * as service from "./visitors.service";

export async function list(req: Request, res: Response) {
  try {
    const result = await service.listVisitors(req.query as Record<string, unknown>);
    return sendList(res, result.data, result.pagination);
  } catch (e: any) {
    return sendError(res, 500, "Failed to list visitors", e?.message);
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const item = await service.getVisitorById(req.params.id);
    if (!item) return sendError(res, 404, "Visitor not found");
    return sendOne(res, item);
  } catch (e: any) {
    return sendError(res, 500, "Failed to get visitor", e?.message);
  }
}
