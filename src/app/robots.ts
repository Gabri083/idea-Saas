import type { MetadataRoute } from "next";

const BASE_URL = "https://kelsira.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api", "/reset-password", "/forgot-password"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
