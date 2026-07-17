import { Metadata } from "next";
import DrugsClient from "./DrugsClient";

export const metadata: Metadata = {
  title: "Drug of the Day | RxFusion Pharmacy Insights",
  description: "Learn pharmacological details, mechanism of action, side effects, and clinical pearls for essential medical drugs.",
};

export default function Page() {
  return <DrugsClient />;
}
