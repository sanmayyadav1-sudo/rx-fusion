import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About RxFusion | Free Pharmacy Education Platform",
  description: "Learn about RxFusion — built by pharmacy students and educators to provide free, syllabus-aligned study material.",
};

export default function Page() {
  return <AboutClient />;
}
