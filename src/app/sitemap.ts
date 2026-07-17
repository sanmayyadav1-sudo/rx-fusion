import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rxfusion.netlify.app";
  
  // Public static website routes
  const staticRoutes = [
    "",
    "/notes",
    "/blogs",
    "/news",
    "/resources",
    "/about",
    "/contact",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env variables are missing. Sitemap will only contain static routes.");
    return sitemapEntries;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Fetch dynamic blog paths
    const { data: blogs } = await supabase
      .from("blogs")
      .select("slug, published_date")
      .order("published_date", { ascending: false });

    if (blogs) {
      blogs.forEach((blog) => {
        if (blog.slug) {
          sitemapEntries.push({
            url: `${baseUrl}/blogs/${blog.slug}`,
            lastModified: blog.published_date ? new Date(blog.published_date) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      });
    }

    // 2. Fetch distinct course streams from notes, merging default ones
    const coursesSet = new Set<string>(["Pharm D", "B Pharm", "D Pharm"]);
    const { data: notes } = await supabase
      .from("notes")
      .select("course");

    if (notes) {
      notes.forEach((n) => {
        if (n.course) {
          coursesSet.add(n.course);
        }
      });
    }

    Array.from(coursesSet).forEach((course) => {
      sitemapEntries.push({
        url: `${baseUrl}/notes/${encodeURIComponent(course)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  } catch (err) {
    console.error("Failed to fetch dynamic sitemap paths:", err);
  }

  return sitemapEntries;
}
