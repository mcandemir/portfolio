import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

export async function GET(context) {
  const blog = await getCollection("blog");
  const posts = blog
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: "M. Can Demir",
    description: "Software, system, and mostly my own studies",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? post.data.title,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
      content: post.body
        ? sanitizeHtml(marked.parse(post.body), {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          })
        : undefined,
    })),
  });
}
