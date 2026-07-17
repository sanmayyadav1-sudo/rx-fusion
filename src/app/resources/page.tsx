import { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";

export const metadata: Metadata = {
  title: "Syllabus Resources | RxFusion",
  description: "Download pharmacy syllabus PDFs, curriculum guides, and reference resources for all pharmacy streams.",
};

export default function Page() {
  return <ResourcesClient />;
}
