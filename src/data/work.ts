export type WorkItem = {
  id: string;
  title: string;
  client: string;
  category: string;
  video: string;
  featured: boolean;
};

export const workItems: WorkItem[] = [
  {
    id: "tripxplo-07",
    title: "FLIGHT TICKET BOOKING",
    client: "TRIPXPLO",
    category: "TRAVEL CONTENT",
    video: "/videos/tripxplo-07.mp4",
    featured: true,
  },
  {
    id: "tripxplo-02",
    title: "ASI",
    client: "TRIPXPLO",
    category: "TRAVEL / INFORMATION",
    video: "/videos/tripxplo-02.mp4",
    featured: true,
  },
  {
    id: "tripxplo-06",
    title: "EDUCATION VS EXPERIENCE",
    client: "TRIPXPLO",
    category: "SOCIAL CONTENT",
    video: "/videos/tripxplo-06.mp4",
    featured: true,
  },
  {
    id: "tripxplo-01",
    title: "MALDIVES VS ANDAMAN",
    client: "TRIPXPLO",
    category: "TRAVEL CONTENT",
    video: "/videos/tripxplo-01.mp4",
    featured: false,
  },
  {
    id: "tripxplo-03",
    title: "7 PAGODAS — MAHABALIPURAM",
    client: "TRIPXPLO",
    category: "TRAVEL / HERITAGE",
    video: "/videos/tripxplo-03.mp4",
    featured: false,
  },
  {
    id: "tripxplo-04",
    title: "MANALI HONEYMOON",
    client: "TRIPXPLO",
    category: "TRAVEL CONTENT",
    video: "/videos/tripxplo-04.mp4",
    featured: false,
  },
  {
    id: "tripxplo-05",
    title: "₹6K MANALI TRIP SCAM",
    client: "TRIPXPLO",
    category: "TRAVEL / AWARENESS",
    video: "/videos/tripxplo-05.mp4",
    featured: false,
  },
  {
    id: "tripxplo-08",
    title: "2026 LEAVE HACK",
    client: "TRIPXPLO",
    category: "SOCIAL / TIPS",
    video: "/videos/tripxplo-08.mp4",
    featured: false,
  },
  {
    id: "tripxplo-09",
    title: "MANALI SCAM",
    client: "TRIPXPLO",
    category: "TRAVEL / AWARENESS",
    video: "/videos/tripxplo-09.mp4",
    featured: false,
  },
  {
    id: "kavithai-01",
    title: "KAVITHAI — TEXT & MOTION",
    client: "PERSONAL PROJECT",
    category: "TYPOGRAPHY / MOTION",
    video: "/videos/kavithai-01.mp4",
    featured: false,
  },
];