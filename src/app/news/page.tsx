import { Metadata } from "next";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "Pharmacy News | RxFusion",
  description: "Latest pharmacy news, regulatory updates, and notices for pharmacy students and professionals.",
};

export default function Page() {
  return <NewsClient />;
}
