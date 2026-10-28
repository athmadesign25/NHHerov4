import { getDoctorLandingMetadata } from "@/features/search/doctorLandingMetadata";
import DoctorLandingPage, { resolveDoctorLanding } from "../../DoctorLandingPage";

type Props = { params: Promise<{ speciality: string; city: string }> };

export async function generateMetadata({ params }: Props) {
  const { speciality, city } = await params;
  return getDoctorLandingMetadata(resolveDoctorLanding(`/book-an-appointment/${encodeURIComponent(speciality)}/${encodeURIComponent(city)}`));
}

export default async function SpecialityCityListingPage({ params }: Props) {
  const { speciality, city } = await params;
  return <DoctorLandingPage pathname={`/book-an-appointment/${encodeURIComponent(speciality)}/${encodeURIComponent(city)}`} />;
}
