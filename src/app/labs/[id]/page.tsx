import { Metadata } from "next";
import LabDetailClient from "./LabDetailClient";

export const metadata: Metadata = {
  title: "Experiment Details | RxFusion Pharmacy Student Portal",
  description: "View detailed laboratory experiment procedures, theories, chemical reactions, formulas, and calculations.",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <LabDetailClient id={params.id} />;
}
