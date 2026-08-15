import "server-only";

import articleIndex from "@/content/articles/index.json";
import { loadLocale, type Locale } from "@/i18n/registry";

export type ArticleSection =
  | { heading: string; body: string; items?: never }
  | { heading: string; items: string[]; body?: never };

export interface Article {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readTime: number;
  datePosted?: string;
  sections: ArticleSection[];
}

interface ArticleTranslation {
  category: string;
  title: string;
  summary: string;
  date_posted?: string;
  sections: ArticleSection[];
}

type ArticleCatalog = Record<string, ArticleTranslation>;

const articlePromises = new Map<Locale, Promise<Article[]>>();

function isArticleSection(value: unknown): value is ArticleSection {
  if (typeof value !== "object" || value === null) return false;
  const section = value as { heading?: unknown; body?: unknown; items?: unknown };
  const hasBody = typeof section.body === "string";
  const hasItems = Array.isArray(section.items)
    && section.items.length > 0
    && section.items.every((item) => typeof item === "string");

  return typeof section.heading === "string" && hasBody !== hasItems;
}

function isArticleTranslation(value: unknown): value is ArticleTranslation {
  if (typeof value !== "object" || value === null) return false;
  const article = value as Partial<ArticleTranslation>;
  return (
    typeof article.category === "string"
    && typeof article.title === "string"
    && typeof article.summary === "string"
    && Array.isArray(article.sections)
    && article.sections.every(isArticleSection)
  );
}

async function readArticles(locale: Locale): Promise<Article[]> {
  const [englishResources, localizedResources] = await Promise.all([
    loadLocale("en"),
    loadLocale(locale),
  ]);
  const english = englishResources.articles as ArticleCatalog;
  const localized = localizedResources.articles as ArticleCatalog;

  return articleIndex.articles.map((entry) => {
    const translation = localized[entry.slug] ?? english[entry.slug];
    if (!isArticleTranslation(translation)) {
      throw new Error(`Missing article translation for ${locale}:${entry.slug}.`);
    }
    return {
      slug: entry.slug,
      readTime: entry.read_time,
      datePosted: translation.date_posted,
      ...translation,
    };
  });
}

export function getArticles(locale: Locale): Promise<Article[]> {
  const cached = articlePromises.get(locale);
  if (cached) return cached;
  const articles = readArticles(locale);
  articlePromises.set(locale, articles);
  return articles;
}

export async function getArticle(slug: string, locale: Locale): Promise<Article | undefined> {
  return (await getArticles(locale)).find((article) => article.slug === slug);
}
