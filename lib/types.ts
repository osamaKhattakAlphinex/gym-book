export type Gender = "Male" | "Female" | "Other";

export type Plan = "Monthly" | "3 Months" | "6 Months" | "Yearly";

/**
 * Cash stays first — the spec is explicit that cash still dominates and digital
 * must never be a requirement. The digital rails are additive.
 */
export type PaymentMethod = "Cash" | "JazzCash" | "Easypaisa" | "Raast" | "Bank Transfer" | "Other";

export const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "JazzCash", "Easypaisa", "Raast", "Bank Transfer", "Other"];

export type PaymentStatus = "Paid" | "Partial" | "Pending";

export type MembershipStatus = "active" | "expiring" | "expired";

export type PaymentType = "New Membership" | "Renewal" | "Payment";

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  type: PaymentType;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  gender: Gender;
  dob?: string;
  address?: string;
  photoUrl?: string;
  notes?: string;
  memberSince: string;
  plan: Plan;
  startDate: string;
  expiryDate: string;
  fee: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  lastPaymentAmount: number;
  lastPaymentDate: string;
  lastPaymentMethod: PaymentMethod;
  paymentHistory: PaymentRecord[];
}

export type ActivityKind = "renewal" | "payment" | "expired" | "joined" | "reminder" | "equipment";

export interface ActivityEntry {
  id: string;
  text: string;
  timestamp: string;
  kind: ActivityKind;
}

export type NotificationKind = "expiring" | "expired" | "payment" | "equipment" | "info";

export interface NotificationEntry {
  id: string;
  text: string;
  timestamp: string;
  read: boolean;
  kind: NotificationKind;
}

export interface GymSettings {
  gymName: string;
  gymLogo?: string;
  ownerName: string;
  phone: string;
  currency: "PKR";
  reminderMessage: string;
  notifyExpiring: boolean;
  notifyPayments: boolean;
}

export type EquipmentCategory = "Cardio" | "Strength Machines" | "Free Weights" | "Accessories" | "Other";

export type EquipmentCondition = "Good" | "Needs Repair" | "Out of Service";

export interface MaintenanceRecord {
  id: string;
  date: string;
  note: string;
  cost?: number;
  condition: EquipmentCondition;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  quantity: number;
  condition: EquipmentCondition;
  location?: string;
  purchaseDate?: string;
  lastServiceDate?: string;
  notes?: string;
  maintenanceHistory: MaintenanceRecord[];
}

export interface GymState {
  members: Member[];
  payments: PaymentRecord[];
  activity: ActivityEntry[];
  notifications: NotificationEntry[];
  settings: GymSettings;
  inventory: InventoryItem[];
  hydrated: boolean;
}
