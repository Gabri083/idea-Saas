import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date string
  locale: "es" | "en";
}

export interface BlogPost extends BlogPostMeta {
  html: string;
}

function readSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/** All posts, newest first. Each post file's frontmatter carries its own
 * `locale` — a post is written once, in whichever language it targets, not
 * translated in pairs like the rest of the site's UI copy. */
export function getAllBlogPosts(): BlogPostMeta[] {
  return readSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title),
        excerpt: String(data.excerpt),
        date: String(data.date),
        locale: data.locale === "en" ? "en" : "es",
      } satisfies BlogPostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title),
    excerpt: String(data.excerpt),
    date: String(data.date),
    locale: data.locale === "en" ? "en" : "es",
    html: marked.parse(content, { async: false }) as string,
  };
}
