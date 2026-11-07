import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "RxFusion | Pharmacy Knowledge. Clinical Excellence.",
  description: "An advanced learning ecosystem designed exclusively for Doctor of Pharmacy (Pharm.D) students, combining academic resources, clinical education and scientific research.",
};

export default function Page() {
  return <HomeClient />;
}
