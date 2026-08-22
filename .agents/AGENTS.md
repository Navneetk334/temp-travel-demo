# PROJECT CONTEXT & AGENT RULES

## Project Blueprint & PRD Baseline
The master Project Proposal & PRD is saved at [PROJECT_PRD.md](file:///e:/Antigravity/Temp-travel/PROJECT_PRD.md).

All features, modules, API routes, database schemas, lead management pipelines, billing systems, and SEO implementations must conform to the specifications outlined in `PROJECT_PRD.md`.

### Core Requirements Key Points:
1. **Brand:** TEMP TRAVEL CAR RENTALS PVT LTD
2. **Modules:** Public Portal, Admin Panel & CRM (Corporate, Rental & Contact Leads), Fleet & Tariff Management, Tour Packages Engine, Razorpay Payment Gateway, Billing & GST Invoice Management System, and SEO Digital Growth Package.
3. **Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Razorpay.

### Fleet & Driver Rules (MANDATORY):
1. **Category & Class Hierarchy**:
   - Vehicle Category: `Sedan` and `SUV` ONLY.
   - Sedan Vehicle Classes: `Compact`, `Executive`, `Premium Executive`, `Luxury`.
   - SUV Vehicle Classes: `Subcompact/Urban`, `Mid-Premium`, `Premium`, `Luxury`.
   - Vehicle models must filter according to category and class.

2. **Fleet Vehicle Modal Fields (`/master-admin/fleet-roster`)**:
   - Brand, Category, Class, Model Name, Registration Number, Transmission, Fuel Type, Seating Capacity.
   - Per Km Rate, Per Hour Rate, Base Daily Slab, Driver Day Allowance, Night Halt Allowance.
   - Insurance Provider Name, Insurance Policy Number, Insurance Expiry Date, Fitness Expiry Date, Commercial Permit Expiry Date.
   - Image Upload from Device.

3. **Driver Roster Modal Fields (`/master-admin/drivers`)**:
   - Section A (Personal & KYC): Driver Photo Upload, Driver Name, Mobile Number, Aadhaar Number + Aadhaar Upload, PAN Number + PAN Upload.
   - Section B (Banking): Bank Name, Account Holder Name, Account Number, Confirm Account Number, IFSC Code.
   - Section C (Vehicle Assignment): Category, Class, Model.

