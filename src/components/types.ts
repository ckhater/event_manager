/** Shared front-end types (mirror of API responses). */

export interface EventListItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  imageUrl: string | null;
  registrationsCount: number;
  spotsLeft: number;
  isPast: boolean;
}

export interface RegistrationItem {
  id: string;
  name: string;
  email: string;
  eventId: string;
  userId: string | null;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}

export type EventStatus = "all" | "upcoming" | "past";
export type EventSort = "date_asc" | "date_desc";

export interface EventFilters {
  q: string;
  location: string;
  from: string;
  to: string;
  status: EventStatus;
  available: boolean;
  sort: EventSort;
}

export const DEFAULT_FILTERS: EventFilters = {
  q: "",
  location: "",
  from: "",
  to: "",
  status: "upcoming",
  available: false,
  sort: "date_asc",
};
