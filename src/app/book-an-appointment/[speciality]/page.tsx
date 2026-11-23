import { getDoctorLandingMetadata } from "@/features/search/doctorLandingMetadata";
import DoctorLandingPage, { resolveDoctorLanding } from "../DoctorLandingPage";

type Props = { params: Promise<{ speciality: string }> };

export async function generateMetadata({ params }: Props) {
  const { speciality } = await params;
  return getDoctorLandingMetadata(resolveDoctorLanding(`/book-an-appointment/${encodeURIComponent(speciality)}`));
}

export default async function SpecialityListingPage({ params }: Props) {
  const { speciality } = await params;
  return <DoctorLandingPage pathname={`/book-an-appointment/${encodeURIComponent(speciality)}`} />;
}
