import { Router } from "express";
import {
  getVenuesHandler,
  getVenueEventsHandler,
  getVenueReviewsHandler,
  createVenueReviewHandler,
  createVenueReviewReplyHandler,
  deleteVenueReviewReplyHandler,
} from "./venues.controller";
import { requireUser } from "../../middleware/auth.middleware";

const router = Router();

// List venues
router.get("/venues", getVenuesHandler);

// Events for a specific venue
router.get("/venues/:id/events", getVenueEventsHandler);

// Reviews for a specific venue (reply routes before generic reviews)
router.post("/venues/:id/reviews/:reviewId/replies", requireUser, createVenueReviewReplyHandler);
router.delete("/venues/:id/reviews/:reviewId/replies/:replyId", requireUser, deleteVenueReviewReplyHandler);
router.get("/venues/:id/reviews", getVenueReviewsHandler);
router.post("/venues/:id/reviews", requireUser, createVenueReviewHandler);

export default router;

