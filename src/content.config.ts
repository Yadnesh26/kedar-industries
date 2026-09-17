import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const specSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const faqSchema = z.object({
  q: z.string(),
  a: z.string(),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    category: z.enum([
      'power-distribution',
      'motor-control',
      'power-quality',
      'automation',
      'capacitor',
      'custom',
    ]),
    tagline: z.string(),
    heroImage: z.string(),
    gallery: z.array(z.string()).default([]),
    overview: z.string(),
    keySpecs: z.array(specSchema),
    specTable: z.array(specSchema),
    features: z.array(z.string()),
    applications: z.array(z.string()),
    standards: z.array(z.string()).default([]),
    faqs: z.array(faqSchema),
    relatedTestEvidence: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const parts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/parts' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    heroImage: z.string(),
    overview: z.string(),
    features: z.array(z.string()),
    applications: z.array(z.string()),
    order: z.number().default(99),
  }),
});

export const collections = { products, parts };
