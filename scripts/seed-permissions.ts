import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const departments = [
    "Admin", "Accounts", "Sales", "IT", "Operations", "Duty Slip", "Billing", "Vendor Management"
  ];

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    console.log(`Ensured department: ${name}`);
  }

  const profiles = [
    {
      name: "Super Admin",
      permissions: [
        "DASHBOARD_VIEW", "DASHBOARD_EDIT", "USER_MGMT_VIEW", "USER_MGMT_EDIT",
        "VENDOR_MGMT_VIEW", "VENDOR_MGMT_EDIT", "ACCOUNTS_VIEW", "ACCOUNTS_EDIT",
        "DISPATCH_VIEW", "DISPATCH_EDIT", "DUTY_SLIPS_VIEW", "DUTY_SLIPS_EDIT",
        "REPORTS_VIEW", "SETTINGS_MANAGE"
      ]
    },
    {
      name: "Purchase Management",
      permissions: ["VENDOR_MGMT_VIEW", "VENDOR_MGMT_EDIT", "ACCOUNTS_VIEW"]
    },
    {
      name: "Fleet Management",
      permissions: ["VENDOR_MGMT_VIEW", "DISPATCH_VIEW", "DUTY_SLIPS_VIEW"]
    },
    {
      name: "Dispatch",
      permissions: ["DASHBOARD_VIEW", "DISPATCH_VIEW", "DISPATCH_EDIT", "DUTY_SLIPS_VIEW", "DUTY_SLIPS_EDIT"]
    }
  ];

  for (const profile of profiles) {
    await prisma.permissionProfile.upsert({
      where: { name: profile.name },
      update: { permissions: profile.permissions },
      create: profile
    });
    console.log(`Ensured permission profile: ${profile.name}`);
  }

  console.log("Seeding complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
