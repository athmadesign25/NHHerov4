import { getDoctorLandingMetadata } from "@/features/search/doctorLandingMetadata";
import DoctorLandingPage from "./DoctorLandingPage";

export const metadata = getDoctorLandingMetadata({});

export default function DoctorDirectoryPage() {
  return <DoctorLandingPage pathname="/book-an-appointment" />;
}
