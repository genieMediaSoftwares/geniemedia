// Verified podcast studio facts (prices, hours, equipment, address). Single source for the
// booking widget, the /podcast_studio sub-pages and schema. Change prices here only.

export interface StudioPackage {
  id: string;
  name: string;
  /** Hourly rates in rupees for 1, 2 and 3 hour bookings. */
  rates: [number, number, number];
  crew: boolean;
  cameras: number;
  summary: string;
}

export const STUDIO_PACKAGES: StudioPackage[] = [
  {
    id: "studio-only",
    name: "Studio only",
    rates: [1500, 3000, 4500],
    crew: false,
    cameras: 0,
    summary: "Use the studio, set, microphones and recorder on your own.",
  },
  {
    id: "team-2-cameras",
    name: "Studio with team + 2 cameras",
    rates: [3999, 8000, 10000],
    crew: true,
    cameras: 2,
    summary: "Our team sets up and records your video podcast on two cameras.",
  },
  {
    id: "team-3-cameras",
    name: "Studio with team + 3 cameras",
    rates: [5000, 9000, 11000],
    crew: true,
    cameras: 3,
    summary: "Our team records a three-camera video podcast with wide and individual angles.",
  },
];

export const formatInr = (n: number): string => `₹${n.toLocaleString("en-IN")}`;

export const STUDIO = {
  address: "5A-2, 4th Floor, KP Icon, near MK Gold Coast, Yendada, Visakhapatnam, Andhra Pradesh 530045",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Genie+Media+%26+Studio+KP+Icon+Yendada+Visakhapatnam",
  phone: "+91 90328 45433",
  phoneHref: "tel:+919032845433",
  whatsappHref: (text = "Hi Genie Media, I would like to book the podcast studio.") =>
    `https://wa.me/919032845433?text=${encodeURIComponent(text)}`,
  email: "admin@geniemedia.in",
  /** Bookable hourly slots; 12 pm to 1 pm is not bookable. */
  hours: "Monday to Saturday, 10 am to 7 pm (12 pm to 1 pm not bookable)",
  closed: "Sundays and the second Saturday of the month",
  equipment: [
    "Two microphones on boom arms",
    "Zoom PodTrak P8 podcast recorder",
    "Up to three cameras (team packages)",
    "Studio lighting",
    "Acoustically treated room",
    "Two podcast sets: a blue set with two armchairs and a white panelled set",
  ],
} as const;
