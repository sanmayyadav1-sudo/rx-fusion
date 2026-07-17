import { Metadata } from "next";
import VivaClient from "./VivaClient";

export const metadata: Metadata = {
  title: "Viva Q&A Hub | RxFusion Pharmacy Student Portal",
  description: "Access a comprehensive database of oral viva questions and answers categorized by subject, course, and year for Pharm.D, B.Pharm, and D.Pharm students.",
};

export default function Page() {
  return <VivaClient />;
}
