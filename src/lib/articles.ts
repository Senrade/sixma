export interface Article {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readTime: number;
  sections: Array<{ heading: string; body: string }>;
}

export const articles: Article[] = [
  { slug: "spotting-ai-images", category: "Visual verification", title: "How to inspect a suspicious image", summary: "Use structural clues, context checks, and source tracing before deciding whether an image is trustworthy.", readTime: 6, sections: [
    { heading: "Start with the claim", body: "An image is evidence only in relation to a claim. Write down what the post says happened, where it happened, and when. This makes missing context easier to see." },
    { heading: "Inspect physical consistency", body: "Look for broken geometry, merged objects, inconsistent reflections, unreadable text, and lighting that does not agree across the scene. One odd detail is a reason to investigate, not automatic proof." },
    { heading: "Verify outside the image", body: "Search for the earliest version, compare reports from independent sources, and check whether the alleged organization published the same material through an official channel." },
  ] },
  { slug: "emotional-manipulation", category: "Critical reasoning", title: "Recognizing emotional manipulation", summary: "Learn how urgency, fear, false dilemmas, and borrowed authority can shut down careful judgment.", readTime: 5, sections: [
    { heading: "Notice the pressure", body: "Manipulative posts often demand an immediate response. Pause when a message says there is no time to verify, only one acceptable choice, or catastrophic consequences for hesitation." },
    { heading: "Separate evidence from emotion", body: "Strong emotion does not make a claim false, but it can distract from weak evidence. Restate the factual claim without the loaded language and ask what still supports it." },
    { heading: "Check quoted authority", body: "A real name or institution can be quoted inaccurately. Find the original statement and check whether the surrounding context supports the interpretation in the post." },
  ] },
  { slug: "phishing-chain", category: "Digital safety", title: "Anatomy of a phishing chain", summary: "Understand how a harmless-looking hook becomes credential theft or financial loss.", readTime: 7, sections: [
    { heading: "The hook", body: "A phishing attempt begins with relevance: a prize, warning, deadline, or message that appears to come from someone familiar." },
    { heading: "The pivot", body: "The target is moved away from a trusted channel toward a link, attachment, form, or private conversation controlled by the attacker." },
    { heading: "The trap", body: "The final step requests credentials, payment, private data, or software installation. Verify the request through a separate trusted channel before taking action." },
  ] },
];

export function getArticle(slug: string) { return articles.find((article) => article.slug === slug); }
