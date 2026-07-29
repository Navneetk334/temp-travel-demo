# PROJECT PROPOSAL & PRODUCT REQUIREMENT DOCUMENT (PRD)
**Client / Brand:** TEMP TRAVEL CAR RENTALS PVT LTD  
**Document Status:** Official Reference & Requirements Baseline  

---

## 1. EXECUTIVE SUMMARY

This document outlines the master blueprint and specification for the development of a comprehensive **Corporate Transportation, Car Rental, Tours & Travel, Lead Management, Billing Software, and SEO Platform** for **TEMP TRAVEL CAR RENTALS PVT LTD**.

The objective is to provide a modern digital platform capable of:
* Generating corporate transportation leads
* Managing employee transportation requests
* Handling rental bookings
* Managing tour package inquiries
* Collecting online payments
* Managing customer relationships (CRM)
* Billing & GST Invoice Management
* Improving search engine visibility
* Supporting long-term business growth

---

## 2. COMPANY OVERVIEW

**TEMP TRAVEL CAR RENTALS PVT LTD** provides:
* Corporate Transportation Services
* Employee Pickup & Drop Services
* Airport Transfers
* Local Car Rentals
* Outstation Car Rentals
* Domestic Tour Packages
* International Tour Packages
* Customized Travel Solutions

The platform digitizes operations and provides centralized management.

---

## 3. PROJECT OBJECTIVES

### Business Objectives
* **Increase Lead Generation:** High-converting forms and landing pages.
* **Improve Online Presence:** Modern UI, responsive design, and SEO structure.
* **Automate Inquiry Management:** Centralized lead capture and CRM pipeline.
* **Streamline Booking Process:** Online payment gateway integration and automated status tracking.
* **Enhance Billing Operations:** GST tax invoicing, payment ledgers, and downloadable receipts.
* **Increase Revenue Opportunities:** Targeted corporate mobility, local rentals, and tour packages.

### Technical Objectives
* **Mobile-Responsive Website:** 100% responsive across devices.
* **High-Performance Architecture:** Fast load times with Next.js App Router & Server Components.
* **SEO-Friendly Structure:** Dynamic sitemaps, schema markup, and city-based landing pages.
* **Secure Data Management:** Encrypted authentication, role-based access, API validation.
* **Scalable Infrastructure:** Clean code architecture supporting future module extensions.

---

## 4. PROPOSED SOLUTION OVERVIEW & PHASE ROADMAP

| Phase | Scope |
|---|---|
| **Phase 1** | Public Business Website (Landing, Rentals, Fleet, Tours, Corporate, Blog, Contact, Legal) |
| **Phase 2** | Admin CRM & Lead Management System (Leads, Dispatch, Fleet, CMS) |
| **Phase 3** | Payment Gateway (Razorpay) & Billing / GST Invoicing Software |
| **Phase 4** | SEO & Digital Growth Package (Local SEO, City Landing Pages, Schema, Content) |

---

## 5. TECHNOLOGY STACK

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Radix UI.
* **Backend:** Next.js API Routes, Server Actions.
* **Database:** PostgreSQL.
* **ORM:** Prisma ORM.
* **Payment Gateway:** Razorpay.
* **Deployment & Hosting:** Hostinger VPS / Node Hosting / Vercel.
* **Version Control:** GitHub.

---

## 6. WEBSITE FEATURES & MODULES

### 6.1 Home Page
* Hero Banner with Multi-Tab Interactive Booking Widget (Corporate, Local, Outstation, Tours)
* Corporate Transportation Highlights & Value Propositions
* Local Rentals & Outstation Services Showcase
* Popular Domestic & International Tour Packages
* ISO 9001:2015 Certified Fleet Showcase
* Customer Testimonials & Reviews
* Major Service Areas Grid
* Quick Contact & Lead Capture Form

### 6.2 About Us
* Company Profile & History
* Vision & Mission Statements
* Core Values & Safety Commitments

### 6.3 Services Pages
* Corporate Transportation & Employee Shuttle Commute
* Executive & Airport Transfers
* Local City Rentals (Hourly/Kms packages)
* Outstation Rentals (One-Way & Round-Trip)
* Customized Domestic & International Tours

### 6.4 Fleet Management Page
* Complete Vehicle Listing & Categories (Sedan, SUV, Luxury, Bus, Tempo Traveller)
* Seating Capacity, Tariff Structure, Base Rate, and Extra Hr/Km rates

### 6.5 Tour Packages
* Domestic & International Tour Catalog
* Dynamic Day-by-Day Itineraries, Inclusions & Exclusions
* Direct Package Booking & Inquiry Forms

### 6.6 Blog System
* Search Engine Optimized Article Catalog
* Categorized Travel Guides & Corporate Commute Insights
* Author Attribution & Related Posts

### 6.7 Contact & Legal Pages
* Contact Form, Office Locations, Google Maps Embed
* Terms & Conditions, Privacy Policy, Refund Policy

---

## 7. LEAD GENERATION SYSTEM

1. **Corporate Lead Form:** Company Name, Contact Person, Email, Phone, Employee Count, Pickup Locations, Service Requirements.
2. **Rental Lead Form:** Customer Details, Trip Type (Local/Outstation), Vehicle Category, Pickup/Drop Location, Dates.
3. **Tour Inquiry Form:** Selected Package, Travel Dates, Number of Travelers, Special Demands, Customer Info.
4. **General Contact Form:** Name, Email, Phone, Subject, Message.

---

## 8. ADMIN PANEL & CRM MODULES

* **Dashboard Overview:** Summary Cards (Total Leads, Total Bookings, Active Fleet, Total Revenue) and Interactive Recharts Charts.
* **Corporate Leads CRM:** Lead Tracking Pipeline (`NEW`, `CONTACTED`, `QUALIFIED`, `LOST`, `ARCHIVED`), Notes, CSV/Excel Export.
* **Rental & Contact Leads CRM:** Lead Management, Follow-ups, Status Updates, Export.
* **Booking & Dispatch Center:** Booking Overview, Driver & Vehicle Assignment, Status Progression (`PENDING` ➔ `CONFIRMED` ➔ `DRIVER_ASSIGNED` ➔ `IN_TRANSIT` ➔ `COMPLETED`).
* **Fleet Management:** Add/Edit/Delete Vehicles, Registration Numbers, Category Rates, Maintenance Status.
* **Tour Management:** Package CRUD, Dynamic Itinerary Builder, Pricing & Category Assignment.
* **Blog & Media CMS:** Rich Text Editor, SEO Metadata, Category Management, Gallery Uploader.
* **Testimonials:** Review, Approve, Feature Customer Reviews.
* **Payment Ledger:** Gateway Transaction Ledger, Razorpay Order/Payment ID Inspector.
* **Site Settings:** Global System Configuration & Business Parameters.

---

## 9. PAYMENT GATEWAY INTEGRATION

### Razorpay Features
* Online Advance & Full Payments for Rental Bookings & Tour Packages
* Automated Razorpay Order Creation via `/api/payments/order`
* HMAC SHA-256 Signature Verification via `/api/payments/verify`
* Asynchronous Webhook Event Handlers via `/api/payments/webhook`
* Transaction Ledger Auditing in Admin Panel

---

## 10. BILLING & INVOICE MANAGEMENT SYSTEM

### Core Features & Requirements
* **Invoice Generation:** Automatic creation of formal invoices upon booking confirmation.
* **GST Invoice Support:** Support for CGST, SGST, IGST calculations, SAC codes, and company GSTIN input.
* **Customer Billing Database:** Stored customer billing profiles, billing address, and transaction histories.
* **Downloadable PDF Invoices:** On-demand generation and PDF download of tax invoices and receipts.
* **Revenue & Tax Reports:** Admin dashboard summaries of tax collected, discounts applied, and net revenue.

---

## 11. SEO & DIGITAL GROWTH PACKAGE

* **Technical SEO:** XML Sitemaps (`/sitemap.xml`), `robots.txt`, Schema.org Structured Data (`CarRental`, `LocalBusiness`, `TourPackage`).
* **On-Page SEO:** Dynamic metadata (`title`, `description`, `canonical`, `openGraph`), semantic HTML5 tags.
* **Local SEO City Pages:** Dedicated SEO landing pages targeting key locations (e.g., *Corporate Cab Service Delhi*, *Corporate Cab Service Noida*, *Corporate Cab Service Gurugram*, *Airport Transfer Mumbai*).
* **Content Marketing:** Strategic travel blogs, FAQ accordions, and Google Business Profile optimization guides.

---

## 12. API ARCHITECTURE

### Public APIs
* `/api/contact` - Submit/manage contact inquiries
* `/api/corporate/lead` - Submit B2B corporate commute inquiries
* `/api/corporate/lead/export` - Export corporate leads
* `/api/rental/lead` - Submit custom rental inquiries
* `/api/rental/lead/export` - Export rental leads
* `/api/bookings` - Create & list customer bookings
* `/api/fleet` & `/api/fleet/categories` - Fetch vehicle listings & rates
* `/api/tours` & `/api/tours/categories` - Fetch tour packages
* `/api/blog/posts` & `/api/blog/categories` - Fetch blog posts

### Payment APIs
* `/api/payments/order` - Create Razorpay Order
* `/api/payments/verify` - Verify Razorpay Payment Signature
* `/api/payments/webhook` - Asynchronous Razorpay Webhook Handler

---

## 13. SECURITY FEATURES

* Encrypted Authentication & Session Handling (NextAuth.js, `bcryptjs`).
* Strict Role-Based Access Control (RBAC) separating Customers, Drivers, and Admin roles.
* Input Validation via Zod Schemas.
* HTTPS / SSL Data Transmission.
* Secure Payment Data Handling (Compliant with Razorpay PCI-DSS protocols).

---

## 14. CODING STANDARDS & PROJECT DELIVERABLES

* Clean Modular Codebase adhering to Next.js App Router standards.
* Strongly typed TypeScript interfaces.
* Fully responsive, accessible, high-converting design.
* Production-ready deliverables: Complete Public Portal, Admin Panel & CRM, Razorpay Integration, Billing System, and SEO setup.
