import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Supabase PostgreSQL database with NAM-Core datasets...");

  // 1. Admin Staff
  const staff = [
    {
      id: "admin-super-001",
      email: "super.admin@agri.gov.in",
      name: "Dr. Rajeshwar Sharma (IAS)",
      role: "SUPER_ADMIN" as const,
      isActive: true,
      lastLoginAt: new Date(),
    },
    {
      id: "admin-comp-002",
      email: "compliance.officer@nam.gov.in",
      name: "Sunita Deshmukh",
      role: "COMPLIANCE_OFFICER" as const,
      isActive: true,
      lastLoginAt: new Date(),
    },
    {
      id: "admin-mandi-003",
      email: "mandi.auditor@nam.gov.in",
      name: "Virender Pal Singh",
      role: "MANDI_AUDITOR" as const,
      isActive: true,
      lastLoginAt: new Date(),
    },
    {
      id: "admin-disp-004",
      email: "dispute.officer@nam.gov.in",
      name: "Ananya Iyer",
      role: "DISPUTE_MANAGER" as const,
      isActive: true,
      lastLoginAt: new Date(),
    },
    {
      id: "admin-gmail-005",
      email: "gaurav.verma.admin@gmail.com",
      name: "Gaurav Verma (Staff Auditor)",
      role: "SUPER_ADMIN" as const,
      isActive: true,
      lastLoginAt: new Date(),
    },
  ];

  for (const s of staff) {
    await prisma.adminStaff.upsert({
      where: { email: s.email },
      update: s,
      create: s,
    });
  }
  console.log(`✓ Seeded ${staff.length} allowlisted administrative staff.`);

  // 2. Mandi Price Tickers
  const tickers = [
    {
      state: "Maharashtra",
      marketAPMC: "Lasalgaon Mandi (Nashik)",
      commodity: "Onion (Red)",
      minPrice: 1850,
      maxPrice: 2450,
      modalPrice: 2200,
    },
    {
      state: "Delhi",
      marketAPMC: "Azadpur Mandi (Delhi)",
      commodity: "Tomato (Hybrid)",
      minPrice: 1600,
      maxPrice: 2200,
      modalPrice: 1950,
    },
    {
      state: "Punjab",
      marketAPMC: "Khanna Grain Market",
      commodity: "Basmati Rice 1121",
      minPrice: 3800,
      maxPrice: 4650,
      modalPrice: 4320,
    },
    {
      state: "Andhra Pradesh",
      marketAPMC: "Guntur Mirchi Yard",
      commodity: "Guntur Teja Chilli",
      minPrice: 16500,
      maxPrice: 21800,
      modalPrice: 19200,
    },
    {
      state: "Maharashtra",
      marketAPMC: "Vashi APMC (Navi Mumbai)",
      commodity: "Pomegranate (Bhagwa)",
      minPrice: 8500,
      maxPrice: 14000,
      modalPrice: 11200,
    },
    {
      state: "Madhya Pradesh",
      marketAPMC: "Indore Mandi",
      commodity: "Soybean (Yellow)",
      minPrice: 4100,
      maxPrice: 4850,
      modalPrice: 4520,
    },
    {
      state: "Haryana",
      marketAPMC: "Karnal Mandi",
      commodity: "Sharbati Wheat",
      minPrice: 2275,
      maxPrice: 2750,
      modalPrice: 2480,
    },
    {
      state: "Gujarat",
      marketAPMC: "Unjha Mandi",
      commodity: "Cumin Seeds (Jeera)",
      minPrice: 24000,
      maxPrice: 31500,
      modalPrice: 27800,
    },
  ];

  for (const t of tickers) {
    await prisma.mandiPriceTicker.upsert({
      where: {
        marketAPMC_commodity: {
          marketAPMC: t.marketAPMC,
          commodity: t.commodity,
        },
      },
      update: t,
      create: t,
    });
  }
  console.log(`✓ Seeded ${tickers.length} APMC Mandi spot price tickers.`);

  // 3. Farmers & Listings
  const farmer1 = await prisma.user.upsert({
    where: { phoneNumber: "+91 98234 11201" },
    update: {},
    create: {
      id: "usr-farmer-101",
      phoneNumber: "+91 98234 11201",
      email: "ramesh.patil@kisanmail.in",
      fullName: "Ramesh Tukaram Patil",
      preferredLang: "mr",
      role: "FARMER",
      kycStatus: "VERIFIED",
      district: "Nashik",
      state: "Maharashtra",
      pincode: "422003",
    },
  });

  await prisma.userKYC.upsert({
    where: { userId: farmer1.id },
    update: {},
    create: {
      userId: farmer1.id,
      documentType: "AADHAAR_XML",
      docHashOrId: "XXXX-XXXX-4819",
      verificationRef: "DL-IND-2026-9F8A21",
      status: "VERIFIED",
      verifiedAt: new Date(),
      reviewedByAdmin: "compliance.officer@nam.gov.in",
      metadata: {
        digiLockerName: "Ramesh Tukaram Patil",
        digiLockerPincode: "422003",
        landRecordNumber: "7/12-NSK-88410",
        declaredLandAcres: 6.5,
        matchScore: 98,
      },
    },
  });

  const listings = [
    {
      farmerId: farmer1.id,
      category: "Vegetables",
      commodity: "Tomato (Hybrid Super Red)",
      quantityQuintal: 120,
      minOfferPrice: 1900,
      harvestDate: new Date(),
      images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"],
      isOrganic: true,
      isActive: true,
      pincode: "422003",
      district: "Nashik",
    },
    {
      farmerId: farmer1.id,
      category: "Vegetables",
      commodity: "Nashik Garva Red Onion",
      quantityQuintal: 250,
      minOfferPrice: 2150,
      harvestDate: new Date(),
      images: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80"],
      isOrganic: false,
      isActive: true,
      pincode: "422003",
      district: "Nashik",
    },
  ];

  for (const l of listings) {
    await prisma.productListing.create({ data: l });
  }
  console.log(`✓ Seeded sample farmers, KYC records, and crop listings.`);

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
