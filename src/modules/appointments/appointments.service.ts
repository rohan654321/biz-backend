import prisma from "../../config/prisma";

export async function listVenueAppointments(params: { venueId?: string }) {
  const where: any = {};

  if (params.venueId) {
    where.venueId = params.venueId;
  }

  const [appointments, total] = await Promise.all([
    prisma.venueAppointment.findMany({
      where,
      orderBy: { requestedDate: "desc" },
      take: 200,
      include: {
        visitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            company: true,
            jobTitle: true,
          },
        },
      },
    }),
    prisma.venueAppointment.count({ where }),
  ]);

  return {
    appointments,
    total,
  };
}

export async function createVenueAppointment(body: Record<string, any>) {
  const {
    venueId,
    visitorId,
    title,
    description,
    type,
    requestedDate,
    requestedTime,
    duration,
    meetingType,
    purpose,
    location,
    meetingSpacesInterested,
  } = body;

  if (!venueId) {
    throw new Error("venueId is required");
  }

  const requestedDateObj = requestedDate
    ? new Date(requestedDate)
    : new Date();

  const created = await prisma.venueAppointment.create({
    data: {
      venueId,
      visitorId: visitorId ?? null,
      requestedDate: requestedDateObj,
      requestedTime: requestedTime || "09:00",
      duration: duration ? Number(duration) : 30,
      purpose:
        purpose ||
        description ||
        `Meeting request (${meetingType || "IN_PERSON"})`,
      notes: description || null,
      location: location || null,
      type: type || "VENUE_TOUR",
      status: "PENDING",
      priority: "MEDIUM",
    },
  });

  return {
    success: true,
    appointment: created,
    message: title
      ? `Appointment "${title}" created`
      : "Appointment created",
  };
}

export async function updateVenueAppointment(body: Record<string, any>) {
  const { id, status } = body;

  if (!id) {
    throw new Error("Appointment id is required");
  }

  const updated = await prisma.venueAppointment.update({
    where: { id },
    data: {
      status: status || undefined,
    },
  });

  return {
    success: true,
    appointment: updated,
    message: "Appointment updated",
  };
}

