import YearPageView from "@/components/YearPageView";

export const metadata = {
  title: "First Year | Academic Hub",
  description: "Subject-wise notes, question banks and study resources for Pharm.D First Year.",
};

export default function FirstYearPage() {
  return <YearPageView yearIndex={0} />;
}

