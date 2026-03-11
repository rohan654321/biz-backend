import prisma from "../../config/prisma";

export interface ListVenuesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listVenues(params: ListVenuesParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;

  const where: any = { role: "VENUE_MANAGER" };

  const search = params.search?.trim() ?? "";
  if (search) {
    where.OR = [
      { venueName: { contains: search, mode: "insensitive" } },
      { venueDescription: { contains: search, mode: "insensitive" } },
      { venueAddress: { contains: search, mode: "insensitive" } },
    ];
  }

  const [venues, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        organizerIdForVenueManager: true,
        venueName: true,
        venueDescription: true,
        venueAddress: true,
        venueCity: true,
        venueState: true,
        venueCountry: true,
        venueZipCode: true,
        maxCapacity: true,
        totalHalls: true,
        averageRating: true,
        totalReviews: true,
        amenities: true,
        venueCurrency: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    venues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getVenueEvents(id: string) {
  if (!id) {
    throw new Error("Invalid venue ID");
  }

  const events = await prisma.event.findMany({
    where: { venueId: id },
    include: {
      organizer: {
        select: {
          firstName: true,
          lastName: true,
          company: true,
          avatar: true,
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  const transformedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    shortDescription: event.shortDescription,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    status: event.status,
    category: event.category,
    images: event.images,
    bannerImage: event.bannerImage,
    venueId: event.venueId,
    organizerId: event.organizerId,
    maxAttendees: event.maxAttendees,
    currentAttendees: event.currentAttendees,
    currency: event.currency,
    isVirtual: event.isVirtual,
    virtualLink: event.virtualLink,
    averageRating: event.averageRating,
    eventType: event.eventType,
    totalReviews: event.totalReviews,
    ticketTypes: true,
    organizer: event.organizer
      ? {
          name: `${event.organizer.firstName} ${event.organizer.lastName}`,
          organization: event.organizer.company || "Unknown Organization",
          avatar: event.organizer.avatar,
        }
      : undefined,
  }));

  return {
    success: true,
    events: transformedEvents,
  };
}

export async function listVenueReviews(venueId: string) {
  if (!venueId) {
    throw new Error("Invalid venue ID");
  }

  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: {
        venueId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err: any) {
    // If existing data has invalid UUIDs (legacy rows), avoid crashing the
    // whole endpoint; log and return an empty list instead.
    // eslint-disable-next-line no-console
    console.error("Error loading venue reviews; returning empty list:", err);
    return [];
  }

  const shaped = reviews.map((review) => ({
    id: review.id,
    rating: review.rating ?? 0,
    title: "", // no separate title in schema
    comment: review.comment ?? "",
    createdAt: review.createdAt.toISOString(),
    user: review.user && {
      id: review.user.id,
      firstName: review.user.firstName,
      lastName: review.user.lastName,
      avatar: review.user.avatar ?? null,
    },
  }));

  return shaped;
}

export async function createVenueReview(params: {
  venueId: string;
  userId: string;
  rating: number;
  comment: string;
  title?: string | null;
}) {
  const { venueId, userId, rating, comment } = params;

  if (!venueId || !userId) {
    throw new Error("venueId and userId are required");
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const review = await prisma.review.create({
    data: {
      userId,
      venueId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });

  // recompute aggregates
  const all = await prisma.review.findMany({
    where: { venueId, rating: { not: null } },
  });
  const totalReviews = all.length;
  const avg =
    totalReviews === 0
      ? 0
      : all.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews;

  await prisma.user.update({
    where: { id: venueId },
    data: {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews,
    },
  });

  return {
    id: review.id,
    rating: review.rating ?? 0,
    title: "",
    comment: review.comment ?? "",
    createdAt: review.createdAt.toISOString(),
    user: review.user && {
      id: review.user.id,
      firstName: review.user.firstName,
      lastName: review.user.lastName,
      avatar: review.user.avatar ?? null,
    },
  };
}

