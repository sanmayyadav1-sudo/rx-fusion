import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact RxFusion | Get in Touch",
  description: "Send a message to the RxFusion team for note requests, feedback, or support.",
};

export default function Page() {
  return <ContactClient />;
}
