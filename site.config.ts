const site = {
  name: "Airport Transfer Singapore",
  shortName: "Airport Transfer Singapore",
  url: "https://airporttransfersingapore.com",
  logo: "/images/ats-logo.png",
  favicon: "/favicon.png",
  description: "Airport transfers and professional chauffeur services for travellers, companies, hotels and travel partners in Singapore.",
  locale: "en-SG",
  phone: "+65 8081 6218",
  email: "booking@airporttransfersingapore.com",
  address: "Block 730, Tampines Street 71, Singapore 520730",
  booking: { mode: "external" as const, url: "/contact/", provider: "VERIFY", label: "Book Online" },
  theme: { ink: "#121315" },
  trustSignals: ["Airport transfers", "Hourly chauffeur", "Corporate travel", "Group transportation"],
  navigation: [
    { label: "Services", href: "/services/" },
    { label: "Fleet & Rates", href: "/fleet-rates/" },
    { label: "About", href: "/about/" },
    { label: "Blog", href: "/blog/" },
    { label: "Contact", href: "/contact/" },
  ],
};
export default site;
