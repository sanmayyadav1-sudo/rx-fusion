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
    "/colleges",
    "/cases",
    "/drugs",
    "/clinical-tools",
    "/flashcards",
    "/quiz",
    "/viva",
    "/question-bank",
    "/question-papers",
    "/labs",
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

    // 2. Fetch distinct course streams from notes
    const coursesSet = new Set<string>(["Pharm D"]);
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

    // 3. Fetch published colleges
    const { data: colleges } = await supabase
      .from("colleges")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (colleges) {
      colleges.forEach((c) => {
        if (c.slug) {
          sitemapEntries.push({
            url: `${baseUrl}/colleges/${c.slug}`,
            lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      });
    }

    // 4. Fetch published clinical cases
    const { data: cases } = await supabase
      .from("clinical_cases")
      .select("slug, updated_at")
      .eq("status", "published");

    if (cases) {
      cases.forEach((c) => {
        if (c.slug) {
          sitemapEntries.push({
            url: `${baseUrl}/cases/${c.slug}`,
            lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      });
    }

    // 5. Fetch published drugs of the day
    const { data: drugs } = await supabase
      .from("drug_of_the_day")
      .select("slug, updated_at")
      .eq("status", "published");

    if (drugs) {
      drugs.forEach((d) => {
        if (d.slug) {
          sitemapEntries.push({
            url: `${baseUrl}/drugs/${d.slug}`,
            lastModified: d.updated_at ? new Date(d.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      });
    }

    // 6. Fetch lab manuals
    const { data: labs } = await supabase
      .from("lab_manuals")
      .select("id, created_at");

    if (labs) {
      labs.forEach((l) => {
        if (l.id) {
          sitemapEntries.push({
            url: `${baseUrl}/labs/${l.id}`,
            lastModified: l.created_at ? new Date(l.created_at) : new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
          });
        }
      });
    }

  } catch (err) {
    console.error("Failed to fetch dynamic sitemap paths:", err);
  }

  return sitemapEntries;
}
