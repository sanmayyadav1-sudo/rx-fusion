import { Metadata } from "next";
import DrugDetailClient from "./DrugDetailClient";

export const metadata: Metadata = {
  title: "Drug Profile | RxFusion Pharmacy Insights",
  description: "Learn pharmacological details, mechanism of action, side effects, and clinical pearls for essential medical drugs.",
};

export default function Page() {
  return <DrugDetailClient />;
}
