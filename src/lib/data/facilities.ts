export interface Facility {
  id: string;
  city: string;
  locality: string;
  suffix?: string;
  type: "hospital" | "clinic";
  href: string;
}

// Exact approved navigation list, supplied 17 November 2026.
// Preserve separate facility records even when localities repeat.
export const FACILITIES: readonly Facility[] = [
  {
    id: "nh-1974",
    city: "Bangalore",
    locality: "Banashankari",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-55",
    city: "Bangalore",
    locality: "Bommasandra",
    suffix: "Health City",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-38",
    city: "Bangalore",
    locality: "Bommasandra",
    suffix: "Mazumdar Shaw",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-121",
    city: "Bangalore",
    locality: "Bommasandra",
    suffix: "Cardiac Sciences",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-32",
    city: "Bangalore",
    locality: "HSR Layout",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-2041",
    city: "Bangalore",
    locality: "Banashankari",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1518",
    city: "Bangalore",
    locality: "Chandapura",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1134",
    city: "Bangalore",
    locality: "Electronic City",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1350",
    city: "Bangalore",
    locality: "Harlur Road",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1413",
    city: "Bangalore",
    locality: "HSR Layout",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1139",
    city: "Bangalore",
    locality: "Jayanagar",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1729",
    city: "Bangalore",
    locality: "JP Nagar",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1537",
    city: "Bangalore",
    locality: "Kadubeesanahalli",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1810",
    city: "Bangalore",
    locality: "Kanakapura Road",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1272",
    city: "Bangalore",
    locality: "Manipal County",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1999",
    city: "Bangalore",
    locality: "Nagarabhavi",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1137",
    city: "Bangalore",
    locality: "Sarjapur Road",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-233",
    city: "Ahmedabad",
    locality: "Rakhial",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-246",
    city: "Barasat",
    locality: "Jessore Road",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-147",
    city: "Davangere",
    locality: "NH-4 Bypass Road",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-254",
    city: "Delhi",
    locality: "Vasundhara Enclave",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-132",
    city: "Dharwad",
    locality: "Sattur",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-436",
    city: "Gurugram",
    locality: "DLF Phase III",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-177",
    city: "Guwahati",
    locality: "Amingaon",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-89",
    city: "Hosur",
    locality: "Shanthi Nagar East",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-188",
    city: "Howrah",
    locality: "Chunabati",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-199",
    city: "Howrah",
    locality: "Shibpur",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-378",
    city: "Jaipur",
    locality: "Pratap Nagar",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-763",
    city: "Jamshedpur",
    locality: "Bhalubasa",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-181",
    city: "Jamshedpur",
    locality: "Tamolia",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-617",
    city: "Kolar",
    locality: "Tamaka",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-544",
    city: "Kolkata",
    locality: "Dum Dum Road",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-267",
    city: "Kolkata",
    locality: "Mukundapur",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-542",
    city: "Kolkata",
    locality: "Salt Lake",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1048",
    city: "Kolkata",
    locality: "Kasba",
    type: "clinic",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-223",
    city: "Mumbai",
    locality: "Mahalaxmi",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1",
    city: "Mysore",
    locality: "Devanur",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-23",
    city: "Raipur",
    locality: "Lalpur",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-1807",
    city: "Shimoga",
    locality: "Gopala Gowda Extension",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-402",
    city: "Shimoga",
    locality: "Harakere",
    type: "hospital",
    href: "#", // TODO: link destination
  },
  {
    id: "nh-145",
    city: "Shimoga",
    locality: "Durgigudi",
    type: "clinic",
    href: "#", // TODO: link destination
  },
];

// All menu groups derive from this one registry. Source order is retained
// inside each city; city names outside Bangalore are listed alphabetically.
const facilitiesByCity = new Map<string, Facility[]>();
for (const facility of FACILITIES) {
  const cityFacilities = facilitiesByCity.get(facility.city) ?? [];
  cityFacilities.push(facility);
  facilitiesByCity.set(facility.city, cityFacilities);
}

export const FACILITY_CITIES = [...facilitiesByCity.keys()].sort((a, b) => a.localeCompare(b));

export function getFacilitiesForCity(city: string): readonly Facility[] {
  return facilitiesByCity.get(city) ?? [];
}
