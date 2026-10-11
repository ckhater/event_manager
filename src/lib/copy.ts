/**
 * English-only UI copy. Single source of truth for every user-facing string.
 * - Client components: `import { t } from "@/lib/copy"`.
 * - API routes: `import { apiT } from "@/lib/copy"`.
 * - Zod validation messages: `validationMessages`.
 */

export const t = {
  brand: "Event Manager",
  nav: {
    login: "Log in",
    signup: "Sign up",
    newEvent: "New event",
    admin: "Admin",
    member: "Member",
    logout: "Log out",
    loading: "Loading…",
    toggleTheme: "Toggle light / dark mode",
  },
  footer: "Event Manager — your next night out starts here.",
  hero: {
    badge: "The party starts here",
    title: "Events that make you want to go out",
    subtitle:
      "Concerts, workshops, games, walks… Find your next outing and grab your spot in one click.",
    loadError: "Could not load events.",
  },
  filters: {
    search: "Search",
    searchPlaceholder: "Title, description, place…",
    location: "Location",
    locationPlaceholder: "City…",
    sort: "Sort by",
    sortAsc: "Start date ascending",
    sortDesc: "Start date descending",
    period: "Period",
    upcoming: "Upcoming",
    past: "Past",
    all: "All",
    from: "From",
    to: "To",
    availableOnly: "Available spots only",
    reset: "Reset",
  },
  empty: {
    title: "No events yet",
    text: "No events are scheduled right now. Check back soon — or, if you are an admin, create the first one.",
    ctaAdmin: "Create the first event",
    ctaUser: "Join the party",
  },
  status: {
    past: "Past",
    full: "Full",
    live: "Live",
    spotsLeft: (n: number): string => `${n} spot${n > 1 ? "s" : ""} left`,
  },
  gauge: {
    registered: (done: number, total: number): string =>
      `${done} / ${total} registered`,
    almostFull: "Only a few spots left!",
  },
  detail: {
    notFoundTitle: "Oops, event not found",
    notFoundText: "It may have been deleted.",
    backToList: "Back to events",
    allEvents: "All events",
    about: "About",
    registeredCount: (done: number, total: number): string =>
      `${done}/${total} registered`,
    pastNote: "This event is over. On to the next one!",
    fullNote: "Full — come back soon for upcoming events!",
    closedPast: "Registration is closed, the event is over.",
    closedFull: "Full — registration is closed.",
  },
  register: {
    title: "Book my spot",
    remaining: (n: number): string => `Only ${n} spot${n > 1 ? "s" : ""} left!`,
    bookingAs: "Booking as",
    loginRequiredTitle: "Log in to book",
    loginRequiredText: "You need an account to register for this event.",
    loginCta: "Log in",
    signupCta: "Create an account",
    submit: "Sign me up",
    pending: "Signing up…",
    success: "Registration confirmed! See you soon.",
    alreadyTitle: "You're already registered",
    alreadyText: "You're on the list for this event — see you there!",
  },
  adminActions: {
    edit: "Edit",
    delete: "Delete",
    confirmTitle: "Delete this event?",
    confirmText: "This is permanent, including all linked registrations.",
    cancel: "Cancel",
    confirm: "Delete",
    pending: "Deleting…",
    error: "Could not delete.",
  },
  registrants: {
    empty: "No registrations yet — spread the word!",
    title: (n: number): string => `Attendees (${n})`,
    remove: "Remove",
    unregisterOf: (name: string): string => `Unregister ${name}`,
    error: "Could not remove.",
  },
  eventForm: {
    title: "Title",
    titlePlaceholder: "Spring party in the park",
    description: "Description",
    descriptionPlaceholder: "Describe the program, the vibe, what to bring…",
    startDate: "Start date and time",
    endDate: "End date and time",
    location: "Location",
    locationPlaceholder: "Portland",
    capacity: "Capacity (spots)",
    coverImage: "Cover image (optional)",
    coverHint: "JPG or PNG, max 4 MB. Shown at the top of the event card.",
    coverRemove: "Remove image",
    uploading: "Uploading image…",
    cancel: "Cancel",
    pending: "Saving…",
    create: "Create event",
    save: "Save changes",
  },
  newPage: {
    title: "New event",
    subtitle:
      "Make it tempting: a joyful title, a precise place, a nice description!",
    lockedTitle: "Admins only",
    lockedText: "Sign in with an admin account to create an event.",
    loginCta: "Log in",
    loading: "Loading…",
  },
  editPage: {
    title: "Edit event",
    lockedTitle: "Admins only",
    loginCta: "Log in",
    notFound: "Event not found",
    back: "Back",
  },
  login: {
    title: "Welcome back!",
    subtitle: "Log in to book your spots faster.",
    email: "Email",
    password: "Password",
    submit: "Log in",
    pending: "Logging in…",
    noAccount: "No account yet?",
    signupLink: "Create an account",
  },
  signup: {
    title: "Join the party!",
    subtitle: "One account to book in one click and follow your outings.",
    name: "Name",
    namePlaceholder: "Alex Smith",
    email: "Email",
    password: "Password (8+ characters)",
    submit: "Create my account",
    pending: "Creating…",
    hasAccount: "Already a member?",
    loginLink: "Log in",
  },
  meta: {
    title: "Event Manager — Events that make you want to go out",
    description: "Discover events near you and sign up in one click.",
  },
};

export type Copy = typeof t;

// ------------------------------------------------------------- API errors

export const apiT = {
  invalidData: "Invalid data.",
  internal: "Internal server error.",
  unauthorized: "Please sign in to continue.",
  forbidden: "Admins only.",
  emailTaken: "An account already exists with this email.",
  loginInvalid: "Incorrect email or password.",
  eventNotFound: "Event not found.",
  capacityTooLow: (count: number): string =>
    `Capacity cannot be lower than the number of registrations (${count}).`,
  eventPast: "This event is already over.",
  alreadyRegistered: "This email is already registered for this event.",
  eventFull: "This event is full.",
  registrationNotFound: "Registration not found.",
  uploadNotConfigured:
    "Image uploads are not configured (missing BLOB_READ_WRITE_TOKEN).",
  uploadInvalidType: "Only JPG, PNG, GIF or WebP images are accepted.",
  uploadTooLarge: "Image must be 4 MB or smaller.",
  uploadMissing: "No image file provided.",
  uploadStorePrivate:
    "The Blob store is private. Switch it to public access in Vercel Dashboard → Storage → your store → Settings.",
};

// ---------------------------------------------------- Validation messages

export const validationMessages = {
  nameMin: "Name must be at least 2 characters.",
  nameMax: "Name is too long.",
  emailInvalid: "Invalid email address.",
  emailMax: "Email address is too long.",
  passwordMin: "Password must be at least 8 characters.",
  passwordMax: "Password is too long.",
  passwordRequired: "Password is required.",
  titleMin: "Title must be at least 3 characters.",
  titleMax: "Title is too long.",
  descMin: "Description must be at least 10 characters.",
  descMax: "Description is too long.",
  dateInvalid: "Invalid date.",
  dateRange: "End date must be after the start date.",
  locationMin: "Location is required.",
  locationMax: "Location is too long.",
  capacityNumber: "Capacity must be a number.",
  capacityInt: "Capacity must be a whole number.",
  capacityMin: "Capacity must be at least 1.",
  capacityMax: "Capacity is too large.",
  fromBad: "The “from” date must use YYYY-MM-DD format.",
  toBad: "The “to” date must use YYYY-MM-DD format.",
  imageUrlBad: "Invalid image URL.",
};
