import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const documentSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

const product = defineCollection({
  loader: glob({ base: "./src/content/product", pattern: "**/*.md" }),
  schema: documentSchema,
});

const development = defineCollection({
  loader: glob({ base: "./src/content/development", pattern: "**/*.md" }),
  schema: documentSchema,
});

export const collections = { product, development };
