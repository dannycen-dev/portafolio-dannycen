/** Shared identity & contact (language-agnostic). Localized copy lives in `src/i18n/`. */
export const site = {
  name: "Danny Cen",
  email: "dannycen.dev@gmail.com",
  phone: "+52 999 648 8429",
  linkedin: "https://www.linkedin.com/in/dannyscen/",
  github: "https://github.com/dannycen-dev",
  profileImage: "/images/danny-cen-profile.png",
  /** GA4 Measurement ID (public; also overridable via PUBLIC_GA_MEASUREMENT_ID). */
  gaMeasurementId: "G-S8JGBX0DRM",
  booking: {
    durationMin: 30,
    /** IANA timezone — Mérida, Yucatán */
    timezone: "America/Merida",
    timezoneLabel: "CST (Mérida, Yucatán)",
    meetingVia: "Google Meet / Zoom",
    /** 24h slots; UI formats to locale */
    slots: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"] as const,
  },
};
