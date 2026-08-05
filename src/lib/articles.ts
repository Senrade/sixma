import "server-only";

import articleIndex from "@/content/articles/index.json";
import { loadLocale, type Locale } from "@/i18n/registry";

export interface ArticleSection {
  heading: string;
  body: string;
}

export interface Article {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readTime: number;
  sections: ArticleSection[];
}

interface ArticleTranslation {
  category: string;
  title: string;
  summary: string;
  sections: ArticleSection[];
}

type ArticleCatalog = Record<string, ArticleTranslation>;

const articlePromises = new Map<Locale, Promise<Article[]>>();

function isArticleTranslation(value: unknown): value is ArticleTranslation {
  if (typeof value !== "object" || value === null) return false;
  const article = value as Partial<ArticleTranslation>;
  return (
    typeof article.category === "string"
    && typeof article.title === "string"
    && typeof article.summary === "string"
    && Array.isArray(article.sections)
    && article.sections.every(
      (section) => typeof section.heading === "string" && typeof section.body === "string",
    )
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
