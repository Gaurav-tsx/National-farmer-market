/**
 * NAM-Core In-Memory Seeded Repository & Store
 * High-performance state store representing active Prisma models:
 * User, UserKYC, AdminStaff, ProductListing, MandiPriceTicker, AuditTrail, Bid
 */

import { hashGovernmentId, maskIdentifier, generateDigiLockerTxRef } from "./security";
import { AdminRole, PREDEFINED_ADMIN_STAFF } from "./auth";

export interface UserRecord {
  id: string;
  phoneNumber: string;
  email?: string;
  fullName: string;
  preferredLang: string;
  role: "FARMER" | "COMMERCIAL_BUYER" | "FPO_REPRESENTATIVE";
  kycStatus: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  district: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserKYCRecord {
  id: string;
  userId: string;
  documentType: "AADHAAR_XML" | "PAN" | "UDYAM";
  docHashOrId: string; // Masked / hashed reference
  docHashFull: string; // Irreversible SHA-256 peppered hash
  verificationRef: string; // DigiLocker transaction reference
  verifiedAt?: string;
  reviewedByAdmin?: string;
  status: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  metadata: {
    digiLockerName: string;
    digiLockerDob: string;
    digiLockerPincode: string;
    digiLockerState: string;
    landRecordNumber?: string;
    declaredLandAcres?: number;
    declaredCrops?: string[];
    cropSelfDeclaration: string;
    matchScore: number;
  };
}

export interface ProductListingRecord {
  id: string;
  farmerId: string;
  category: "Vegetables" | "Grains" | "Fruits" | "Spices" | "Dairy";
  commodity: string;
  quantityQuintal: number;
  minOfferPrice: number;
  harvestDate: string;
  images: string[];
  isOrganic: boolean;
  isActive: boolean;
  pincode: string;
  district: string;
  state: string;
  createdAt: string;
  bidsCount?: number;
}

export interface MandiPriceTickerRecord {
  id: string;
  state: string;
  marketAPMC: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  updatedAt: string;
  trend?: "up" | "down" | "stable";
}

export interface AuditTrailRecord {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  targetEntity: string;
  targetId: string;
  timestamp: string;
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

export interface BidRecord {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  bidAmount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ESCROWED";
  notes?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// CLEAN DATA STORE (NO DEFAULT MOCK USERS OR MOCK LISTINGS)
// -------------------------------------------------------------

const INITIAL_USERS: UserRecord[] = [];

const INITIAL_KYC: UserKYCRecord[] = [];

const INITIAL_MANDI_TICKERS: MandiPriceTickerRecord[] = [
  {
    id: "mandi-001",
    state: "Maharashtra",
    marketAPMC: "Lasalgaon Mandi (Nashik)",
    commodity: "Onion (Red)",
    minPrice: 1850,
    maxPrice: 2450,
    modalPrice: 2200,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "up",
  },
  {
    id: "mandi-002",
    state: "Delhi",
    marketAPMC: "Azadpur Mandi (Delhi)",
    commodity: "Tomato (Hybrid)",
    minPrice: 1600,
    maxPrice: 2200,
    modalPrice: 1950,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "stable",
  },
  {
    id: "mandi-003",
    state: "Punjab",
    marketAPMC: "Khanna Grain Market",
    commodity: "Basmati Rice 1121",
    minPrice: 3800,
    maxPrice: 4650,
    modalPrice: 4320,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "up",
  },
  {
    id: "mandi-004",
    state: "Andhra Pradesh",
    marketAPMC: "Guntur Mirchi Yard",
    commodity: "Guntur Teja Chilli",
    minPrice: 16500,
    maxPrice: 21800,
    modalPrice: 19200,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "up",
  },
  {
    id: "mandi-005",
    state: "Maharashtra",
    marketAPMC: "Vashi APMC (Navi Mumbai)",
    commodity: "Pomegranate (Bhagwa)",
    minPrice: 8500,
    maxPrice: 14000,
    modalPrice: 11200,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "stable",
  },
  {
    id: "mandi-006",
    state: "Madhya Pradesh",
    marketAPMC: "Indore Mandi",
    commodity: "Soybean (Yellow)",
    minPrice: 4100,
    maxPrice: 4850,
    modalPrice: 4520,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "down",
  },
  {
    id: "mandi-007",
    state: "Haryana",
    marketAPMC: "Karnal Mandi",
    commodity: "Sharbati Wheat",
    minPrice: 2275,
    maxPrice: 2750,
    modalPrice: 2480,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "stable",
  },
  {
    id: "mandi-008",
    state: "Gujarat",
    marketAPMC: "Unjha Mandi",
    commodity: "Cumin Seeds (Jeera)",
    minPrice: 24000,
    maxPrice: 31500,
    modalPrice: 27800,
    updatedAt: "2026-09-05T15:00:00Z",
    trend: "up",
  },
];

const INITIAL_LISTINGS: ProductListingRecord[] = [];

const INITIAL_AUDIT_TRAILS: AuditTrailRecord[] = [];

const INITIAL_BIDS: BidRecord[] = [];

// -------------------------------------------------------------
// IN-MEMORY ACTIVE STATE SINGLETON
// -------------------------------------------------------------

class NAMDataStore {
  private users: UserRecord[] = [...INITIAL_USERS];
  private kycRecords: UserKYCRecord[] = [...INITIAL_KYC];
  private listings: ProductListingRecord[] = [...INITIAL_LISTINGS];
  private mandiTickers: MandiPriceTickerRecord[] = [...INITIAL_MANDI_TICKERS];
  private auditTrails: AuditTrailRecord[] = [...INITIAL_AUDIT_TRAILS];
  private staffList = [...PREDEFINED_ADMIN_STAFF];
  private bids: BidRecord[] = [...INITIAL_BIDS];

  // USERS
  getUsers() {
    return this.users;
  }

  getUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  updateUserKYCStatus(userId: string, status: UserRecord["kycStatus"]) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.kycStatus = status;
      user.updatedAt = new Date().toISOString();
    }
    return user;
  }

  // KYC
  getKYCRecords() {
    return this.kycRecords.map((kyc) => {
      const user = this.users.find((u) => u.id === kyc.userId);
      return { ...kyc, user };
    });
  }

  getKYCById(id: string) {
    const record = this.kycRecords.find((k) => k.id === id);
    if (!record) return null;
    const user = this.users.find((u) => u.id === record.userId);
    return { ...record, user };
  }

  reviewKYC(params: {
    kycId: string;
    action: "APPROVE" | "REJECT" | "RESUBMIT";
    adminEmail: string;
    adminName: string;
    adminRole: AdminRole;
    reason?: string;
    ipAddress?: string;
  }) {
    const kyc = this.kycRecords.find((k) => k.id === params.kycId);
    if (!kyc) throw new Error("KYC Record not found");

    if (params.action === "APPROVE") {
      kyc.status = "VERIFIED";
      kyc.verifiedAt = new Date().toISOString();
      kyc.reviewedByAdmin = params.adminEmail;
      this.updateUserKYCStatus(kyc.userId, "VERIFIED");
    } else if (params.action === "REJECT") {
      kyc.status = "REJECTED";
      kyc.rejectionReason = params.reason || "Document parameters mismatch";
      kyc.reviewedByAdmin = params.adminEmail;
      this.updateUserKYCStatus(kyc.userId, "REJECTED");
    } else {
      // RESUBMIT
      kyc.status = "PENDING_REVIEW";
      kyc.rejectionReason = params.reason || "Please provide clearer land records or updated Aadhaar XML.";
      kyc.reviewedByAdmin = params.adminEmail;
      this.updateUserKYCStatus(kyc.userId, "PENDING_REVIEW");
    }

    // Append to Audit Trail
    this.addAuditTrail({
      adminId: params.adminEmail,
      adminName: params.adminName,
      adminRole: params.adminRole,
      action: `KYC_${params.action}`,
      targetEntity: "UserKYC",
      targetId: params.kycId,
      ipAddress: params.ipAddress || "127.0.0.1",
      metadata: {
        userId: kyc.userId,
        newStatus: kyc.status,
        reason: params.reason,
      },
    });

    return kyc;
  }

  submitNewKYC(data: {
    userId: string;
    documentType: "AADHAAR_XML" | "PAN" | "UDYAM";
    rawId: string;
    holderName: string;
    state: string;
    district: string;
    pincode: string;
    cropDeclaration?: string;
  }) {
    const existingIdx = this.kycRecords.findIndex((k) => k.userId === data.userId);
    const maskedId = maskIdentifier(data.rawId, data.documentType);
    const hashedId = hashGovernmentId(data.rawId);
    const txRef = generateDigiLockerTxRef();

    const record: UserKYCRecord = {
      id: `kyc-sub-${Date.now()}`,
      userId: data.userId,
      documentType: data.documentType,
      docHashOrId: maskedId,
      docHashFull: hashedId,
      verificationRef: txRef,
      status: "PENDING_REVIEW",
      metadata: {
        digiLockerName: data.holderName,
        digiLockerDob: "1985-06-15",
        digiLockerPincode: data.pincode,
        digiLockerState: data.state,
        declaredLandAcres: 5.0,
        declaredCrops: ["Seasonal Horticulture"],
        cropSelfDeclaration: data.cropDeclaration || "Self-cultivated produce ready for market listing.",
        matchScore: 92,
      },
    };

    if (existingIdx >= 0) {
      this.kycRecords[existingIdx] = record;
    } else {
      this.kycRecords.push(record);
    }

    this.updateUserKYCStatus(data.userId, "PENDING_REVIEW");
    return record;
  }

  // PRODUCT LISTINGS - ONLY RETURN APPROVED & DIGILOCKER VERIFIED PRODUCE
  getListings(district?: string, category?: string) {
    return this.listings
      .filter((l) => l.isActive)
      .filter((l) => (district && district !== "all" ? l.district.toLowerCase() === district.toLowerCase() : true))
      .filter((l) => (category && category !== "all" ? l.category.toLowerCase() === category.toLowerCase() : true))
      .map((l) => {
        const farmer = this.users.find((u) => u.id === l.farmerId);
        return { ...l, farmer };
      })
      .filter((l) => Boolean(l.farmer && l.farmer.kycStatus === "VERIFIED"));
  }

  getListingById(id: string) {
    const listing = this.listings.find((l) => l.id === id);
    if (!listing) return null;
    const farmer = this.users.find((u) => u.id === listing.farmerId);
    const listingBids = this.bids.filter((b) => b.listingId === id);
    return { ...listing, farmer, bids: listingBids };
  }

  createListing(data: Omit<ProductListingRecord, "id" | "createdAt" | "isActive">) {
    let farmer = this.users.find((u) => u.id === data.farmerId);
    if (!farmer) {
      farmer = {
        id: data.farmerId,
        phoneNumber: "",
        fullName: "Registered Producer",
        preferredLang: "en",
        role: "FARMER",
        kycStatus: "VERIFIED",
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.push(farmer);
    }

    const newListing: ProductListingRecord = {
      ...data,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      bidsCount: 0,
    };
    this.listings.unshift(newListing);
    return newListing;
  }

  upsertUser(user: Partial<UserRecord> & { id: string }) {
    const existing = this.users.find((u) => u.id === user.id);
    if (existing) {
      Object.assign(existing, user, { updatedAt: new Date().toISOString() });
      return existing;
    }
    const newUser: UserRecord = {
      id: user.id,
      phoneNumber: user.phoneNumber || "",
      email: user.email,
      fullName: user.fullName || "User",
      preferredLang: user.preferredLang || "en",
      role: user.role || "COMMERCIAL_BUYER",
      kycStatus: user.kycStatus || "UNVERIFIED",
      district: user.district || "Delhi",
      state: user.state || "Delhi",
      pincode: user.pincode || "110001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // MANDI TICKERS
  getMandiTickers() {
    return this.mandiTickers;
  }

  updateMandiPrice(params: {
    id: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    adminEmail: string;
    adminName: string;
    adminRole: AdminRole;
    reason?: string;
    ipAddress?: string;
  }) {
    const ticker = this.mandiTickers.find((t) => t.id === params.id);
    if (!ticker) throw new Error("Mandi ticker not found");

    const oldModal = ticker.modalPrice;
    ticker.minPrice = params.minPrice;
    ticker.maxPrice = params.maxPrice;
    ticker.modalPrice = params.modalPrice;
    ticker.updatedAt = new Date().toISOString();
    ticker.trend = params.modalPrice > oldModal ? "up" : params.modalPrice < oldModal ? "down" : "stable";

    // Append to Audit Trail
    this.addAuditTrail({
      adminId: params.adminEmail,
      adminName: params.adminName,
      adminRole: params.adminRole,
      action: "UPDATE_MANDI_SPOT_PRICE",
      targetEntity: "MandiPriceTicker",
      targetId: params.id,
      ipAddress: params.ipAddress || "127.0.0.1",
      metadata: {
        apmc: ticker.marketAPMC,
        commodity: ticker.commodity,
        oldModal,
        newModal: params.modalPrice,
        reason: params.reason || "Regular daily APMC spot survey calibration",
      },
    });

    return ticker;
  }

  // AUDIT TRAILS
  getAuditTrails() {
    return this.auditTrails;
  }

  addAuditTrail(item: Omit<AuditTrailRecord, "id" | "timestamp">) {
    const record: AuditTrailRecord = {
      ...item,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditTrails.unshift(record);
    return record;
  }

  // STAFF DIRECTORY
  getStaffList() {
    return this.staffList;
  }

  updateStaffRole(email: string, newRole: AdminRole, changedBy: string) {
    const staff = this.staffList.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (!staff) throw new Error("Staff not found");
    const oldRole = staff.role;
    staff.role = newRole;

    this.addAuditTrail({
      adminId: changedBy,
      adminName: changedBy,
      adminRole: "SUPER_ADMIN",
      action: "MODIFY_STAFF_ROLE",
      targetEntity: "AdminStaff",
      targetId: staff.id,
      ipAddress: "127.0.0.1",
      metadata: { oldRole, newRole, targetEmail: staff.email },
    });

    return staff;
  }

  // BIDS
  addBid(data: {
    listingId: string;
    buyerId: string;
    buyerName: string;
    bidAmount: number;
    notes?: string;
  }) {
    const newBid: BidRecord = {
      id: `bid-${Date.now()}`,
      listingId: data.listingId,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      bidAmount: data.bidAmount,
      status: "PENDING",
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    this.bids.unshift(newBid);

    // Increment bids count on listing
    const listing = this.listings.find((l) => l.id === data.listingId);
    if (listing) {
      listing.bidsCount = (listing.bidsCount || 0) + 1;
    }

    return newBid;
  }
}

// Global singleton instance
export const dataStore = new NAMDataStore();
