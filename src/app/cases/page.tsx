import { Metadata } from "next";
import CasesClient from "./CasesClient";

export const metadata: Metadata = {
  title: "Clinical Cases | RxFusion Pharmacy Education",
  description: "Examine detailed pharmacy clinical cases featuring medical history, findings, SOAP notes, drug-related problem analysis, and learning points.",
};

export default function Page() {
  return <CasesClient />;
}
