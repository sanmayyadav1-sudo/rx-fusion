import YearPageView from "@/components/YearPageView";

export const metadata = {
  title: "Third Year | Academic Hub",
  description: "Subject-wise notes, question banks and study resources for Pharm.D Third Year.",
};

export default function ThirdYearPage() {
  return <YearPageView yearIndex={2} />;
}

