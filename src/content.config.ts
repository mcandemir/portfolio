import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    techStack: z.array(z.string()),
    role: z.string(),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    impact: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    coverImage: z.string().optional(),
    date: z.coerce.date(),
    useReadme: z.boolean().default(false),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/experience" }),
  schema: z.object({
    company: z.string(),
    position: z.string(),
    location: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    current: z.boolean().default(false),
    achievements: z.array(z.string()),
    techStack: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

const voluntary = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/voluntary" }),
  schema: z.object({
    company: z.string(),
    position: z.string(),
    location: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    current: z.boolean().default(false),
    achievements: z.array(z.string()),
    techStack: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

const achievements = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/achievements" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    coverImage: z.string().optional(),
    readingTime: z.number().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, experience, voluntary, achievements, blog };
