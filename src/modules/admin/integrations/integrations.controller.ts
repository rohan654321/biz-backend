import { Request, Response } from "express";
import { sendOne, sendError } from "../../../lib/admin-response";
import * as service from "./integrations.service";

export async function getPayments(req: Request, res: Response) {
  try {
    const data = await service.getPayments();
    return sendOne(res, data);
  } catch (e: any) {
    return sendError(res, 500, "Failed to get payment integration", e?.message);
  }
}

export async function getCommunication(req: Request, res: Response) {
  try {
    const data = await service.getCommunication();
    return sendOne(res, data);
  } catch (e: any) {
    return sendError(res, 500, "Failed to get communication integration", e?.message);
  }
}

export async function getTravel(req: Request, res: Response) {
  try {
    const data = await service.getTravel();
    return sendOne(res, data);
  } catch (e: any) {
    return sendError(res, 500, "Failed to get travel integration", e?.message);
  }
}
