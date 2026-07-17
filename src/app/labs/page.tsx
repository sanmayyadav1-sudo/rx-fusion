import { Metadata } from "next";
import LabsClient from "./LabsClient";

export const metadata: Metadata = {
  title: "Laboratory Manuals & Experiments | RxFusion Pharmacy Student Portal",
  description: "Browse step-by-step pharmacy laboratory experiment manuals, aims, principles, chemical procedures, and calculations for B.Pharm and Pharm.D courses.",
};

export default function Page() {
  return <LabsClient />;
}
