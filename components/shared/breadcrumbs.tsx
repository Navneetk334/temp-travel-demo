import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "./json-ld";

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = "https://temptravels.com";

  // Build the schema object for BreadcrumbList
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": `${baseUrl}${item.path}`,
      })),
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbListSchema} />
      
      <nav aria-label="Breadcrumb" className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-400 font-medium">
          <li className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Link href="/" className="flex items-center gap-1">
              <Home className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.path} className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                {isLast ? (
                  <span className="text-slate-200 font-semibold" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.path} 
                    className="hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
