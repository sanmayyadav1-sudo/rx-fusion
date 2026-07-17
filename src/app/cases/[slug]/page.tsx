import { Metadata } from "next";
import CaseDetailClient from "./CaseDetailClient";

export const metadata: Metadata = {
  title: "Clinical Case SOAP Notes | RxFusion Pharmacy Education",
  description: "Examine detailed pharmacy clinical cases featuring medical history, findings, SOAP notes, drug-related problem analysis, and learning points.",
};

export default function Page() {
  return <CaseDetailClient />;
}
