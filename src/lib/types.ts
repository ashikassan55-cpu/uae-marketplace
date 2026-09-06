/**
 * Shared TypeScript types mirroring firestore-data-model.md.
 * Keep these two in sync when the schema changes.
 */

export type Emirate =
  | "Abu Dhabi"
  | "Dubai"
  | "Sharjah"
  | "Ajman"
  | "Umm Al Quwain"
  | "Ras Al Khaimah"
  | "Fujairah";

export type Condition = "new" | "like_new" | "good" | "fair" | "for_parts";

export type ListingStatus = "draft" | "active" | "sold" | "suspended" | "removed";

export type ModerationStatus = "pending" | "approved" | "flagged" | "rejected";

export interface CategoryFlags {
  realEstateEnabled: boolean;
  jobsEnabled: boolean;
}

export const CATEGORIES = [
  "Furniture",
  "Electronics",
  "Mobile Phones",
  "Home Appliances",
  "Fashion",
  "Kids & Baby",
  "Sports & Outdoors",
  "Books, Music & Hobbies",
  "Vehicles",
  "Vehicle Parts & Accessories",
  "Pets",
  "Real Estate",
  "Jobs",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const COMING_SOON_CATEGORIES: Category[] = ["Real Estate", "Jobs"];

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  createdAt: number;
  lastSeenAt: number;
  preferredArea?: { emirate: Emirate; area?: string };
  preferredLanguage?: string;
  role: "individual" | "shop";
  shopId?: string;
  suspended?: boolean;
  suspendedReason?: string;
  suspendedAt?: number;
}

export interface RealEstateDetails {
  permitNumber: string;
  permitType: "trakheesi" | "rera";
  published: false;
}

export interface Listing {
  id: string;
  ownerUid: string;
  ownerType: "individual" | "shop";
  shopId?: string;
  category: Category;
  subcategory?: string;
  title: string;
  description: string;
  descriptionLang: string;
  descriptionEn: string;
  price: number;
  currency: "AED";
  condition: Condition;
  emirate: Emirate;
  area?: string;
  images: string[];
  status: ListingStatus;
  createdAt: number;
  updatedAt: number;
  soldAt?: number;
  moderation?: {
    status: ModerationStatus;
    reasons: string[];
    checkedAt: number;
  };
  realEstate?: RealEstateDetails;
  searchKeywords: string[];
}

export type ShopVerificationStatus =
  | "submitted"
  | "ai_review"
  | "needs_attention"
  | "pending_human"
  | "approved"
  | "rejected";

export interface Shop {
  id: string;
  ownerUid: string;
  shopName: string;
  subdomain: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
  description?: string;
  categories: Category[];
  verification: {
    status: ShopVerificationStatus;
    tradeLicenseUrl?: string;
    emiratesIdFrontUrl?: string;
    emiratesIdBackUrl?: string;
    aiCheck?: {
      pass: boolean;
      reasons: string[];
      checkedAt: number;
    };
  };
  proTrialEndsAt?: number;
  pro: boolean;
  rating: { avg: number; count: number };
  createdAt: number;
  storiesConfig: { maxConcurrent: number };
}

export interface Story {
  id: string;
  shopId: string;
  imageUrl: string;
  tiedListingId: string;
  createdAt: number;
  expiresAt: number;
  soldOut: boolean;
}

export interface CartItem {
  listingId: string;
  addedAt: number;
}

export interface Cart {
  uid: string;
  shopId: string;
  items: CartItem[];
  updatedAt: number;
}

export interface SavedItem {
  uid: string;
  listingId: string;
  shopId: string | null;
  savedAt: number;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  type: "text" | "catalogue_attach" | "address_card";
  text?: string;
  textTranslations?: Record<string, string>;
  attachment?: { listingIds?: string[]; address?: Record<string, string> };
  createdAt: number;
}

export interface Chat {
  id: string;
  listingId: string;
  participantUids: [string, string];
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: Record<string, number>;
  shopOutreach?: { shopId: string; offerId: string };
}

export interface Transaction {
  id: string;
  listingId: string;
  sellerUid: string;
  buyerUid?: string;
  markedSoldBy: string;
  markedSoldAt: number;
  buyerConfirmedAt?: number;
  status: "sold_unconfirmed" | "confirmed";
  reviewId?: string;
}

export interface Review {
  id: string;
  transactionId: string;
  listingId: string;
  sellerUid: string;
  buyerUid: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: number;
}

export interface Appeal {
  id: string;
  uid: string;
  suspensionReason: string;
  message: string;
  submittedAt: number;
  status: "pending" | "reactivated" | "upheld";
  decidedAt?: number;
  decisionNote?: string;
}
