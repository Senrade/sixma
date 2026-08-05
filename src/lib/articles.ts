import type { MessageKey } from "@/i18n/messages/types";

export interface Article {
  slug: string;
  category: MessageKey;
  title: MessageKey;
  summary: MessageKey;
  readTime: number;
  sections: Array<{ heading: MessageKey; body: MessageKey }>;
}

export const articles: Article[] = [
  { slug: "spotting-ai-images", category: "article.spotting.category", title: "article.spotting.title", summary: "article.spotting.summary", readTime: 6, sections: [
    { heading: "article.spotting.section1.title", body: "article.spotting.section1.body" },
    { heading: "article.spotting.section2.title", body: "article.spotting.section2.body" },
    { heading: "article.spotting.section3.title", body: "article.spotting.section3.body" },
  ] },
  { slug: "emotional-manipulation", category: "article.emotion.category", title: "article.emotion.title", summary: "article.emotion.summary", readTime: 5, sections: [
    { heading: "article.emotion.section1.title", body: "article.emotion.section1.body" },
    { heading: "article.emotion.section2.title", body: "article.emotion.section2.body" },
    { heading: "article.emotion.section3.title", body: "article.emotion.section3.body" },
  ] },
  { slug: "phishing-chain", category: "article.phishing.category", title: "article.phishing.title", summary: "article.phishing.summary", readTime: 7, sections: [
    { heading: "article.phishing.section1.title", body: "article.phishing.section1.body" },
    { heading: "article.phishing.section2.title", body: "article.phishing.section2.body" },
    { heading: "article.phishing.section3.title", body: "article.phishing.section3.body" },
  ] },
];

export function getArticle(slug: string) { return articles.find((article) => article.slug === slug); }
