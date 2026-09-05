# National Agricultural Marketplace (NAM-Core)

> High-performance, fault-tolerant, localized National Agricultural Marketplace with a granular Role-Based Access Control (RBAC) Administrative Governance Console.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![i18n](https://img.shields.io/badge/i18n-5%20Indian%20Languages-15803d)](#zero-roundtrip-i18n)

---

## 🌟 Key Features

### 1. Consumer & Farmer Marketplace
- **Live APMC Spot Price Marquee**: Real-time scrolling ticker showing daily spot rates across major Indian APMCs (Lasalgaon, Azadpur, Vashi, Khanna, Guntur).
- **Sub-50ms Feed Discovery**: District-cached queries via Redis (`SET listing:district:[id] EX 180`).
- **Mobile-First Category Grid**: High-contrast, thumb-friendly tap grid for *Vegetables*, *Grains*, *Fruits*, *Spices*, and *Dairy*.
- **Direct Farmgate Bidding**: Instant commercial buy bid placement with lot settlement value and escrow protection.
- **Farmer Crop Listing Portal**: Dynamic APMC benchmark comparison and live buyer card preview.

### 2. Zero-Roundtrip i18n Localization
Pre-compiled static dictionaries bundled into client state for instant language switching without network roundtrips:
- **English** (`en`)
- **हिन्दी (Hindi)** (`hi`)
- **मराठी (Marathi)** (`mr`)
- **ਪੰਜਾਬੀ (Punjabi)** (`pa`)
- **తెలుగు (Telugu)** (`te`)

### 3. Regulatory Safety & DigiLocker e-KYC
- **Zero Cleartext Identity Storage**: 12-digit Aadhaar and PAN numbers are never stored in plain text.
- **Cryptographic Hashing**: Salted SHA-256 + pepper irreversible hashes.
- **Masked Token Display**: Standardized masked display format (`XXXX-XXXX-4819`).
- **DigiLocker Integration**: Transaction reference tracking (`DL-IND-2026-XXXX`).

### 4. Granular RBAC Administrative Console (`/admin`)
Separated institutional console with Google Workspace OAuth allowlist enforcement:
- **`SUPER_ADMIN`**: Full access, financial settlement overrides, staff provisioning.
- **`COMPLIANCE_OFFICER`**: Side-by-side KYC review queue (Farmer declaration vs. DigiLocker parameters) with single-click *Approve*, *Request Resubmission*, and *Reject* actions.
- **`MANDI_AUDITOR`**: Real-time tabular editor to push daily APMC spot rates with immediate Redis cache invalidation.
- **`DISPUTE_MANAGER`**: Trade dispute oversight and communications audit.
- **Strict 403 Forbidden Screen**: Unauthorized Google users are blocked with an immediate HTTP 403 screen and tamper-evident audit trail entry.
- **Immutable Audit Log Explorer**: Read-only history tracking staff actions, target entities, timestamps, IP addresses, and JSON diff payloads.

---

## 🏗️ Architecture & Relational Schema

```prisma
model User {
  id              String         @id @default(uuid())
  phoneNumber     String         @unique
  email           String?        @unique
  fullName        String
  preferredLang   String         @default("en")
  role            UserRole       @default(FARMER)
  kycStatus       KYCStatus      @default(UNVERIFIED)
  district        String
  state           String
  pincode         String
  ...
}

model UserKYC {
  id              String       @id @default(uuid())
  userId          String       @unique
  documentType    String       // "AADHAAR_XML", "PAN", "UDYAM"
  docHashOrId     String       // Masked reference
  verificationRef String       // DigiLocker transaction reference
  status          KYCStatus    @default(PENDING_REVIEW)
  metadata        Json?
  ...
}

model MandiPriceTicker {
  id              String      @id @default(uuid())
  state           String
  marketAPMC      String
  commodity       String
  minPrice        Decimal     @db.Decimal(10, 2)
  maxPrice        Decimal     @db.Decimal(10, 2)
  modalPrice      Decimal     @db.Decimal(10, 2)
  updatedAt       DateTime    @default(now())
  ...
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm / yarn / pnpm

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application:
- Marketplace: `/`
- Live Mandi Rate Cards: `/mandi`
- Farmer DigiLocker e-KYC: `/kyc`
- Sell Crop: `/listings/new`
- Admin Governance Console: `/admin`
- Strict 403 Screen: `/admin/unauthorized`

### Verification Suite

Run the automated test suite to verify Redis caching, 403 security gates, and audit trails:

```bash
node test-api.mjs
```

---

## 📜 License
MIT License
