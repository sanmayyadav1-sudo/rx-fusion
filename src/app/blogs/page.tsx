import { Metadata } from "next";
import BlogsClient from "./BlogsClient";

export const metadata: Metadata = {
  title: "Pharmacy Blogs | RxFusion",
  description: "Read pharmacy science articles, drug reviews, and clinical insights written for pharmacy students.",
};

export default function Page() {
  return <BlogsClient />;
}
