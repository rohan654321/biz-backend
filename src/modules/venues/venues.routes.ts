import { Router } from "express";
import {
  getVenuesHandler,
  getVenueEventsHandler,
  getVenueReviewsHandler,
  createVenueReviewHandler,
} from "./venues.controller";

const router = Router();

// List venues
router.get("/venues", getVenuesHandler);

// Events for a specific venue
router.get("/venues/:id/events", getVenueEventsHandler);

// Reviews for a specific venue
router.get("/venues/:id/reviews", getVenueReviewsHandler);
router.post("/venues/:id/reviews", createVenueReviewHandler);

export default router;

