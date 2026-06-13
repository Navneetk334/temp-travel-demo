import { Metadata } from "next";

interface SEOMetadataProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  keywords?: string | string[];
  noIndex?: boolean;
}

const DEFAULT_METADATA = {
  siteName: "Temp Travel Car Rentals",
  baseUrl: "https://temptravels.com",
  defaultImage: "/images/og-default.jpg",
  defaultKeywords: [
    "Corporate Cab Service Delhi",
    "Corporate Transportation Delhi",
    "Employee Transportation Service",
    "Airport Transfer Delhi",
    "Car Rental Delhi",
    "Tour Packages India",
    "Travel Agency Delhi",
    "Temp Travel Car Rentals",
    "Corporate Cab Service Mumbai",
    "Corporate Transportation Mumbai",
    "Employee Transportation Pune",
    "Airport Transfer Bangalore",
  ],
};

export function getSEOMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_METADATA.defaultImage,
  keywords = [],
  noIndex = false,
}: SEOMetadataProps): Metadata {
  const canonicalUrl = `${DEFAULT_METADATA.baseUrl}${path}`;
  const absoluteOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${DEFAULT_METADATA.baseUrl}${ogImage}`;

  const formattedKeywords = Array.isArray(keywords)
    ? [...keywords, ...DEFAULT_METADATA.defaultKeywords]
    : [keywords, ...DEFAULT_METADATA.defaultKeywords];

  return {
    title: title,
    description: description,
    keywords: formattedKeywords.join(", "),
    metadataBase: new URL(DEFAULT_METADATA.baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: `${title} | Temp Travel`,
      description: description,
      url: canonicalUrl,
      siteName: DEFAULT_METADATA.siteName,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: absoluteOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Temp Travel`,
      description: description,
      images: [absoluteOgImage],
    },
  };
}
