import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaXRay,
} from "react-icons/fa";

export const socialLinks = [
  {
    icon: FaGithub,
    href: "https://CarKinspection.com",
    label: "GitHub",
  },
  {
    icon: FaLinkedin,
    href: "https://CarKinspection.com",
    label: "LinkedIn",
  },
  {
    icon: FaFacebook,
    href: "https://CarKinspection.com",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://CarKinspection.com",
    label: "Instagram",
  },
  { icon: FaXRay, href: "https://CarKinspection.com", label: "Twitter" },
];

export const pricing = [
  {
    id: "10201",
    plan: "Our Plan",
    price: "$80",   
    features: [
      "1 Vehicle Report",
      "Vehicle Specification",
      "DMV Title History",
      "Safety Recall Status",
      "Online Listing History",
      "Junk & Salvage Information",
      "Accident Information",
    ],
  },
];

export const REPORT_CURRENCY = "usd";
export const REPORT_PRICE_CENTS = 8000; // $80
export const REPORT_PRICE_DISPLAY = "$80";
