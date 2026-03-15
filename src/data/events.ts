/**
 * Events — talks, meetups, conferences.
 * Add events with one image (path under /public/) and text.
 */
export interface Event {
  title: string;
  date: string;
  image: string; // e.g. /events/redbull-basement.jpg
  text: string;
}

export const events: Event[] = [
  {
    title: "Redbull Basement Talk",
    date: "2026-03-09",
    image: "/events/redbull-basement-2026.png",
    text: "Attended the Redbull Basement Talk.",
  },
  {
    title: "MongoDB User Group - Trendyol Group Campus",
    date: "2025-11-08",
    image: "/events/trendyol-mongo-user-group-2025.png",
    text: "Attended the MongoDB User Group at Trendyol Group Campus.",
  },
  {
    title: "AWS Cloud Day Türkiye",
    date: "2025",
    image: "/events/aws-cloud-day-turkiye-2025.png",
    text: "Attended AWS Cloud Day Türkiye.",
  },
  {
    title: "AWS Community Day Türkiye",
    date: "2025",
    image: "/events/aws-community-day-turkiye-2025.png",
    text: "Attended AWS Community Day Türkiye.",
  },
  {
    title: "Smart City Adana Hackathon",
    date: "2021",
    image: "/events/smart-city-adana-hackathon-2021.png",
    text: "Participated in the Smart City Adana Hackathon.",
  },
];
