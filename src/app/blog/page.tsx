import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { getAllBlogPosts } from "@/lib/blog";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.blog.metaTitle, description: dict.blog.metaDescription };
}

export default async function BlogIndexPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.blog;
  const posts = getAllBlogPosts();

  return (
    <>
      <Navbar dict={dict.nav} locale={locale} />
      <main className="flex-1 bg-grid">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.pageTitle}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t.pageSubtitle}</p>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          {posts.length === 0 ? (
            <p className="text-center text-sm text-muted">{t.emptyState}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden p-0 transition-colors hover:border-cobalt/40">
                    {post.coverImage && (
                      <Image
                        src={post.coverImage}
                        alt=""
                        width={1200}
                        height={630}
                        className="aspect-[1200/630] w-full object-cover"
                      />
                    )}
                    <div className="p-6">
                      <p className="text-xs text-muted">{formatDate(post.date, post.locale)}</p>
                      <h2 className="mt-1.5 text-xl font-medium tracking-tight">{post.title}</h2>
                      <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
                      <span className="mt-3 inline-block text-sm font-medium text-cobalt">{t.readMore} →</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
