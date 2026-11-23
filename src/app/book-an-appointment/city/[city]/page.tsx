import { getDoctorLandingMetadata } from "@/features/search/doctorLandingMetadata";
import DoctorLandingPage, { resolveDoctorLanding } from "../../DoctorLandingPage";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  return getDoctorLandingMetadata(resolveDoctorLanding(`/book-an-appointment/city/${encodeURIComponent(city)}`));
}

export default async function CityListingPage({ params }: Props) {
  const { city } = await params;
  return <DoctorLandingPage pathname={`/book-an-appointment/city/${encodeURIComponent(city)}`} />;
}
