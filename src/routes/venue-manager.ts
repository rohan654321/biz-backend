import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

// GET /api/venue-manager/:id – venue manager profile + basic stats
router.get("/venue-manager/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "Invalid venue manager ID" });
    }

    const venueManager = await prisma.user.findUnique({
      where: { id },
    });

    if (!venueManager) {
      return res.status(404).json({
        success: false,
        error: "Venue manager not found",
      });
    }

    const data = {
      id: venueManager.id,
      name: venueManager.venueName || venueManager.company || "Unnamed Venue",
      description: venueManager.venueDescription || venueManager.bio || "No description available",
      manager: {
        id: venueManager.id,
        name: `${venueManager.firstName ?? ""} ${venueManager.lastName ?? ""}`.trim() || "Venue Manager",
        email: venueManager.email,
        phone: venueManager.phone ?? "",
        avatar: venueManager.avatar ?? "/placeholder.svg",
        isVerified: venueManager.isVerified ?? false,
        bio: venueManager.bio ?? "",
        website: venueManager.website ?? "",
        address: venueManager.venueAddress ?? "",
        description: venueManager.venueDescription ?? "",
        venueName: venueManager.venueName || "Unnamed Venue",
      },
      location: {
        address: venueManager.venueAddress ?? "",
        city: venueManager.venueCity ?? "",
        state: venueManager.venueState ?? "",
        country: venueManager.venueCountry ?? "",
        zipCode: venueManager.venueZipCode ?? "",
        coordinates: {
          lat: venueManager.latitude ?? 0,
          lng: venueManager.longitude ?? 0,
        },
      },
      contact: {
        phone: venueManager.venuePhone || venueManager.phone || "",
        email: venueManager.venueEmail || venueManager.email,
        website: venueManager.venueWebsite || venueManager.website || "",
      },
      capacity: {
        total: venueManager.maxCapacity ?? 0,
        halls: venueManager.totalHalls ?? 0,
      },
      pricing: {
        basePrice: venueManager.basePrice ?? 0,
        currency: venueManager.venueCurrency || "₹",
      },
      stats: {
        averageRating: venueManager.averageRating ?? 0,
        totalReviews: venueManager.totalReviews ?? 0,
        activeBookings: venueManager.activeBookings ?? 0,
        totalEvents: venueManager.totalEvents ?? 0,
      },
      amenities: (venueManager.amenities as string[] | null) ?? [],
      images: (venueManager.venueImages as string[] | null) ?? [],
      videos: (venueManager.venueVideos as string[] | null) ?? [],
      floorPlans: (venueManager.floorPlans as string[] | null) ?? [],
      virtualTour: venueManager.virtualTour ?? "",
      meetingSpaces: [], // Meeting spaces not yet modeled in backend schema
      reviews: [], // Venue reviews not yet modeled in backend schema
      createdAt: venueManager.createdAt.toISOString(),
      updatedAt: venueManager.updatedAt.toISOString(),
    };

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Error in venue-manager GET (backend):", error);
    return res.status(500).json({
      success: false,
      error: "Internal venue error",
      details: error.message,
    });
  }
});

export default router;

