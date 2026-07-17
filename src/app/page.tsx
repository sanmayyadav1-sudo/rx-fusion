import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "RxFusion | Free Pharmacy Notes for Pharm D, B Pharm & D Pharm",
  description: "Download free syllabus-aligned lecture notes, lab manuals, and study resources for pharmacy students in India.",
};

export default function Page() {
  return <HomeClient />;
}
