import { Request, Response } from "express";
import {
  listVenueAppointments,
  createVenueAppointment,
  updateVenueAppointment,
} from "./appointments.service";

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

