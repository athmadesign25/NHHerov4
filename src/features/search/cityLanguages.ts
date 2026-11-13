/**
 * Regional consultation shortcuts, not inferred clinician language abilities.
 * State language reference: https://cdnbbsr.s3waas.gov.in/s33837a451cd0abc5ce4069304c5442c87/uploads/2025/08/202508261679681226.pdf
 * Local exceptions: https://raipur.gov.in/en/culture/ and https://reasi.nic.in/
 * https://jmc.jk.gov.in/newsdetail.aspx?id=722
 * Other consultation languages remain available in the language filter.
 */
export const CITY_CONSULTATION_LANGUAGES: Readonly<Record<string, string>> = {
  Bangalore: "Kannada", Dharwad: "Kannada", Shimoga: "Kannada", Kolar: "Kannada", Davangere: "Kannada", Mysore: "Kannada",
  Guwahati: "Assamese", Ahmedabad: "Gujarati", Mumbai: "Marathi",
  Kolkata: "Bengali", Barasat: "Bengali", Howrah: "Bengali",
  Hosur: "Tamil", Jaipur: "Hindi", Jamshedpur: "Hindi", Gurugram: "Hindi", Delhi: "Hindi",
  Raipur: "Chhattisgarhi", Katra: "Dogri", Jammu: "Dogri",
};
