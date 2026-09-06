/**
 * Sample data shown when Firestore has no listings yet (fresh project) or
 * Firebase isn't configured (see firebaseConfigured in lib/firebase/client).
 * Lets the UI look and feel real from the very first `npm run dev`, before
 * any real backend setup is done. Swapped out transparently once real
 * listings exist — see lib/data/listings.ts.
 */

import type { Listing, Shop } from "@/lib/types";

const now = Date.now();
const days = (n: number) => n * 24 * 60 * 60 * 1000;

export const MOCK_SHOP: Shop = {
  id: "mock-shop-gulf-home",
  ownerUid: "mock-owner-1",
  shopName: "Gulf Home Furniture",
  subdomain: "gulfhome",
  coverPhotoUrl:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
  logoUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
  description: "Quality pre-owned furniture, verified and inspected before listing.",
  categories: ["Furniture", "Home Appliances"],
  verification: { status: "approved" },
  proTrialEndsAt: now + days(45),
  pro: false,
  rating: { avg: 4.7, count: 38 },
  createdAt: now - days(90),
  storiesConfig: { maxConcurrent: 3 },
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "l1",
    ownerUid: "mock-owner-1",
    ownerType: "shop",
    shopId: MOCK_SHOP.id,
    category: "Furniture",
    subcategory: "Sofas",
    title: "3-Seater Grey Fabric Sofa",
    description: "Barely used grey fabric sofa, smoke-free home, minor wear on one armrest.",
    descriptionLang: "en",
    descriptionEn: "Barely used grey fabric sofa, smoke-free home, minor wear on one armrest.",
    price: 550,
    currency: "AED",
    condition: "good",
    emirate: "Sharjah",
    area: "Al Nahda",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    status: "active",
    createdAt: now - days(2),
    updatedAt: now - days(2),
    searchKeywords: ["sofa", "couch", "settee", "furniture", "3 seater", "grey"],
  },
  {
    id: "l2",
    ownerUid: "mock-owner-2",
    ownerType: "individual",
    category: "Mobile Phones",
    title: "iPhone 13 Pro, 256GB, Excellent Condition",
    description: "No scratches, battery health 91%, comes with box and charger.",
    descriptionLang: "en",
    descriptionEn: "No scratches, battery health 91%, comes with box and charger.",
    price: 1800,
    currency: "AED",
    condition: "like_new",
    emirate: "Dubai",
    area: "Business Bay",
    images: [
      "https://picsum.photos/seed/iphone13pro/800/800",
    ],
    status: "active",
    createdAt: now - days(1),
    updatedAt: now - days(1),
    searchKeywords: ["iphone", "phone", "mobile", "apple", "13 pro"],
  },
  {
    id: "l3",
    ownerUid: "mock-owner-3",
    ownerType: "individual",
    category: "Home Appliances",
    title: "Samsung 8kg Front Load Washing Machine",
    description: "Working perfectly, selling due to relocation. Pickup only.",
    descriptionLang: "en",
    descriptionEn: "Working perfectly, selling due to relocation. Pickup only.",
    price: 700,
    currency: "AED",
    condition: "good",
    emirate: "Abu Dhabi",
    area: "Khalifa City",
    images: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
    ],
    status: "active",
    createdAt: now - days(4),
    updatedAt: now - days(4),
    searchKeywords: ["washing machine", "samsung", "appliance", "laundry"],
  },
  {
    id: "l4",
    ownerUid: "mock-owner-1",
    ownerType: "shop",
    shopId: MOCK_SHOP.id,
    category: "Furniture",
    subcategory: "Dining",
    title: "Solid Wood Dining Table + 6 Chairs",
    description: "Sturdy oak dining set, seats 6 comfortably, small scratch on tabletop.",
    descriptionLang: "en",
    descriptionEn: "Sturdy oak dining set, seats 6 comfortably, small scratch on tabletop.",
    price: 1200,
    currency: "AED",
    condition: "good",
    emirate: "Sharjah",
    area: "Al Majaz",
    images: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    ],
    status: "active",
    createdAt: now - days(6),
    updatedAt: now - days(6),
    searchKeywords: ["dining table", "chairs", "furniture", "wood"],
  },
  {
    id: "l5",
    ownerUid: "mock-owner-4",
    ownerType: "individual",
    category: "Sports & Outdoors",
    title: "Trek Mountain Bike, Size M",
    description: "Great condition, serviced last month, new tires.",
    descriptionLang: "en",
    descriptionEn: "Great condition, serviced last month, new tires.",
    price: 900,
    currency: "AED",
    condition: "good",
    emirate: "Dubai",
    area: "Al Barsha",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
    ],
    status: "active",
    createdAt: now - days(3),
    updatedAt: now - days(3),
    searchKeywords: ["bike", "bicycle", "mountain bike", "trek", "cycling"],
  },
  {
    id: "l6",
    ownerUid: "mock-owner-5",
    ownerType: "individual",
    category: "Kids & Baby",
    title: "Baby Crib + Mattress",
    description: "Used for one child only, clean and sturdy, easy to disassemble.",
    descriptionLang: "en",
    descriptionEn: "Used for one child only, clean and sturdy, easy to disassemble.",
    price: 300,
    currency: "AED",
    condition: "good",
    emirate: "Ajman",
    area: "Al Nuaimiya",
    images: [
      "https://picsum.photos/seed/babycrib/800/800",
    ],
    status: "active",
    createdAt: now - days(5),
    updatedAt: now - days(5),
    searchKeywords: ["crib", "baby", "cot", "nursery"],
  },
];

export function mockListingById(id: string): Listing | undefined {
  return MOCK_LISTINGS.find((l) => l.id === id);
}
