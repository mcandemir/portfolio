/**
 * LinkedIn posts — add new posts by appending to this array.
 * Get postId: Open post on LinkedIn → ⋯ → Embed this post → copy from iframe src (after "embed/feed/")
 * Example: "update/urn:li:share:7436887515036377088"
 */
export const linkedinPosts: { postId: string; date: string; title?: string }[] = [
  {
    postId: "update/urn:li:share:7436887515036377088",
    date: "2026-03-09",
    title: "Attended the Redbull Basement Talk",
  },
  {
    // <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:7393426910816649216" height="855" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>
    postId: "update/urn:li:share:7393426910816649216",
    date: "2025-11-08",
    title: "Attended the MongoDB User Group - Trendyol Group Campus",
  },
];
