import { Metadata } from "next";
import CourseNotesClient from "./CourseNotesClient";

// Client-side rendering wrapper for dynamic course notes route

interface Props {
  params: {
    course: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedCourse = decodeURIComponent(params.course || "");
  return {
    title: `${decodedCourse} Notes | RxFusion`,
    description: `Download free ${decodedCourse} lecture notes organized by year and subject.`,
  };
}

export default function Page() {
  return <CourseNotesClient />;
}
