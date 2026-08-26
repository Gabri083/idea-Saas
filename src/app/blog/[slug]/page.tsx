import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.coverImage ? { images: [post.coverImage] } : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <>
      <Navbar dict={dict.nav} locale={locale} />
      <main className="flex-1 bg-grid">
        <article className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            {dict.blog.backToBlog}
          </Link>

          <p className="mt-6 text-xs text-muted">{formatDate(post.date, post.locale)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>

          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt=""
              width={1200}
              height={630}
              className="mt-8 w-full rounded-2xl border border-border"
              priority
            />
          )}

          <div className="blog-content mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
