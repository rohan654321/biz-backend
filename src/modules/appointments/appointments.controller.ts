import { Request, Response } from "express";
import {
  listEventAppointments,
  createEventAppointment,
  updateEventAppointment,
  listVenueAppointments,
  createVenueAppointment,
  updateVenueAppointment,
} from "./appointments.service";

// ─── Event–exhibitor appointments (Schedule Meeting) ───────────────────────

export async function getAppointmentsHandler(req: Request, res: Response) {
  try {
    const { exhibitorId, requesterId, eventId } = req.query as {
      exhibitorId?: string;
      requesterId?: string;
      eventId?: string;
    };
    if (!exhibitorId && !requesterId && !eventId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const result = await listEventAppointments({
      exhibitorId,
      requesterId,
      eventId,
    });
    const formatted = result.appointments.map((apt: any) => ({
      id: apt.id,
      eventId: apt.event?.id || apt.eventId,
      eventName: apt.event?.title || "Unknown Event",
      eventStartDate: apt.event?.startDate || null,
      eventEndDate: apt.event?.endDate || null,
      visitorName: apt.requester
        ? `${apt.requester.firstName || ""} ${apt.requester.lastName || ""}`.trim()
        : "Unknown Visitor",
      visitorEmail: apt.requester?.email || apt.requesterEmail || "",
      visitorPhone: apt.requester?.phone || apt.requesterPhone || "",
      company: apt.requester?.company || apt.requesterCompany || "Unknown",
      designation: apt.requester?.jobTitle || apt.requesterTitle || "Unknown",
      requestedDate: apt.requestedDate
        ? new Date(apt.requestedDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      requestedTime: apt.requestedTime || "09:00",
      duration: `${apt.duration || 60} minutes`,
      purpose: apt.purpose || apt.description || "General meeting",
      status: apt.status || "PENDING",
      priority: apt.priority || "MEDIUM",
      notes: apt.notes || "",
      meetingLink: apt.meetingLink || "",
      location: apt.location || "",
    }));
    return res.json({
      success: true,
      appointments: formatted,
      total: formatted.length,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error listing appointments:", err);
    return res.status(500).json({
      error: "Internal server error",
      appointments: [],
      total: 0,
    });
  }
}

export async function createAppointmentHandler(req: Request, res: Response) {
  try {
    const result = await createEventAppointment(req.body ?? {});
    return res.status(201).json({
      success: true,
      appointment: result.appointment,
      message: result.message ?? "Appointment request sent successfully!",
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error creating appointment:", err);
    const message = err instanceof Error ? err.message : "Failed to create appointment";
    if (
      message.includes("not found") ||
      message.includes("Event not found") ||
      message.includes("Requester not found") ||
      message.includes("Exhibitor not found")
    ) {
      return res.status(404).json({ error: message });
    }
    if (message.includes("already exists")) {
      return res.status(409).json({ error: message });
    }
    if (message.includes("Missing required") || message.includes("Invalid date")) {
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
}

export async function updateAppointmentHandler(req: Request, res: Response) {
  try {
    const result = await updateEventAppointment(req.body ?? {});
    return res.json({
      success: true,
      appointment: result.appointment,
      message: result.message ?? "Appointment updated successfully!",
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error updating appointment:", err);
    const message = err instanceof Error ? err.message : "Failed to update appointment";
    if (message.includes("not found") || message.includes("Record to update not found")) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    return res.status(500).json({ error: message });
  }
}

// ─── Venue appointments ────────────────────────────────────────────────────

export async function getVenueAppointmentsHandler(req: Request, res: Response) {
  try {
    const { venueId } = req.query as { venueId?: string };
    const result = await listVenueAppointments({ venueId });

    const apiAppointments = result.appointments.map((apt: any) => ({
      id: apt.id,
      requester: apt.visitor
        ? {
            id: apt.visitor.id,
            firstName: apt.visitor.firstName,
            lastName: apt.visitor.lastName,
            email: apt.visitor.email,
            avatar: apt.visitor.avatar,
          }
        : {
            id: "",
            firstName: "Guest",
            lastName: "",
            email: "",
            avatar: null,
          },
      requesterPhone: apt.visitor?.phone ?? "",
      requesterCompany: apt.visitor?.company ?? "",
      requesterTitle: apt.visitor?.jobTitle ?? "",
      requestedDate: apt.requestedDate.toISOString(),
      requestedTime: apt.requestedTime,
      duration: apt.duration,
      purpose: apt.purpose ?? "",
      status: apt.status,
      priority: apt.priority,
      notes: apt.notes ?? "",
      meetingLink: apt.meetingLink ?? "",
      location: apt.location ?? "",
      type: apt.type,
    }));

    return res.json({
      success: true,
      data: apiAppointments,
      total: result.total,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error listing venue appointments:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to list venue appointments",
    });
  }
}

export async function createVenueAppointmentHandler(req: Request, res: Response) {
  try {
    const result = await createVenueAppointment(req.body ?? {});
    return res.status(201).json({
      success: true,
      message: result.message ?? "Appointment created",
      data: result.appointment,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error creating venue appointment:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to create venue appointment",
    });
  }
}

export async function updateVenueAppointmentHandler(req: Request, res: Response) {
  try {
    const result = await updateVenueAppointment(req.body ?? {});
    return res.json({
      success: true,
      message: result.message ?? "Appointment updated",
      data: result.appointment,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error updating venue appointment:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update venue appointment",
    });
  }
}

