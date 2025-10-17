export type Permission =
  | 'can_view_admin_dashboard'
  | 'can_manage_users'
  | 'can_edit_user_details'
  | 'can_suspend_users'
  | 'can_ban_users'
  | 'can_view_financials'
  | 'can_manage_notes'
  | 'can_manage_roles'
  | 'can_grant_bonuses'
  | 'can_manage_rg_limits'
  | 'can_manage_promotions'
  | 'can_manage_api_keys'
  | 'can_manage_ab_tests';

export interface UserPreferences {
    language: 'en' | 'es' | 'fr';
    timezone: string;
    notificationEmail: boolean;
    notificationSms: boolean;
    notificationPush: boolean;
    theme: 'dark' | 'light';
}

export interface RGLimits {
    depositLimit: number | null;
    lossLimit: number | null;
    sessionTimeLimit: number | null; // in minutes
}

export type NotificationType = 'new_vip' | 'large_deposit' | 'high_risk_flag' | 'new_support_ticket';

export type NotificationSettings = {
    [key in NotificationType]?: {
        email: boolean;
        inApp: boolean;
    }
};

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned' | 'anonymized';
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  createdAt: string;
  lastLoginAt: string;
  
  phone: string;
  dateOfBirth: string;
  country: string; // ISO 3166-1 alpha-2 code
  
  // Financials
  balance: number;
  bonusBalance: number;
  wageringRequirement?: {
      progress: number;
      target: number;
  };
  ltv: number; // Lifetime Value
  ggr: number; // Gross Gaming Revenue
  avgBetSize: number;

  // Risk & Compliance
  isHighRisk: boolean;
  churnPredictionScore?: number; // 0-100

  // Admin-specific
  tags: string[];
  customFields: Record<string, string | number>;
  adminRoleId?: string;
  has2FA: boolean;
  notificationSettings: NotificationSettings;
  
  // Gaming
  preferences: UserPreferences;
  responsibleGaming: RGLimits;
  achievements: string[]; // Array of achievement IDs
  loyaltyTierId: string;
  loyaltyPoints: number;
}

export interface AuthResponseData {
    token: string;
    userId: string;
}

export interface Wallet {
    id: string;
    userId: string;
    currency: 'BTC' | 'ETH' | 'USDT';
    address: string;
    isVerified: boolean;
}

export interface Note {
    id: string;
    userId: string;
    adminUsername: string;
    content: string;
    createdAt: string;
}

export interface UserSession {
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

export interface AdminRole {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
}

export interface UserDocument {
    id: string;
    userId: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy: string; // admin username
}

export interface GamingActivity {
    id: string;
    userId: string;
    type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'loss' | 'jackpot';
    amount: number;
    currency: string;
    game: string;
    timestamp: string;
    status?: 'completed' | 'pending' | 'rejected';
    paymentMethod?: string;
    fees?: number;
}

export interface Bonus {
    id: string;
    userId: string;
    type: 'Free Spins' | 'Deposit Match' | 'Cash Credit';
    amount: number;
    reason: string;
    grantedAt: string;
    adminUsername: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    adminUsername: string;
    action: string;
    targetType: 'user' | 'role' | 'system';
    targetId: string;
    details: Record<string, any>;
}

export type TimelineEvent = (GamingActivity | Note | Bonus | AuditLog | Communication) & { timelineType: 'activity' | 'note' | 'bonus' | 'audit' | 'communication'; date: string; };

export interface Communication {
    id:string;
    userId: string;
    type: 'email' | 'sms' | 'push';
    templateName: string;
    adminUsername: string;
    date: string;
}

export interface Segment {
    id: string;
    name: string;
    description: string;
    userCount?: number;
}

export type TicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TicketReply {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    isInternalNote: boolean;
}

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    userId: string;
    userUsername: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    updatedAt: string;
    assignedToAdminId?: string;
    assignedToAdminUsername?: string;
    replies: TicketReply[];
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}

export interface IPWhitelistEntry {
    id: string;
    ipAddress: string;
    description: string;
}

export interface ABTestVariant {
    name: string;
    users: number;
    conversionRate: number;
}

export interface ABTest {
    id: string;
    name: string;
    status: 'Running' | 'Paused' | 'Completed';
    variants: ABTestVariant[];
}

export interface ApiKey {
    id: string;
    key: string;
    description: string;
    createdAt: string;
    lastUsedAt: string | null;
    createdBy: string; // adminId
}

export interface Integration {
    id: 'slack' | 'sendgrid' | 'twilio';
    name: string;
    description: string;
    iconUrl: string;
    isConnected: boolean;
}

export interface LoyaltyTier {
    id: string;
    name: string;
    pointsRequired: number;
    benefits: string[];
}

export type PromotionType = 'Deposit Match' | 'Free Spins Offer' | 'Cashback Offer';
export type PromotionStatus = 'Active' | 'Scheduled' | 'Expired';
export interface Promotion {
    id: string;
    name: string;
    description: string;
    type: PromotionType;
    startDate: string;
    endDate: string;
    status: PromotionStatus;
    bonusCode?: string;
    minDeposit?: number;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export interface RiskFactor {
    id: string;
    description: string;
    severity: number;
}
export interface RiskAssessment {
    userId: string;
    level: RiskLevel;
    score: number; // 0-100
    factors: RiskFactor[];
    assessedAt: string;
}

export interface WorkflowRule {
    id: string;
    name: string;
    description: string;
    trigger: string;
    action: string;
    isEnabled: boolean;
}

export interface Task {
    id: string;
    title: string;
    relatedUserId?: string;
    relatedUserUsername?: string;
    assignedToAdminId: string;
    assignedToAdminUsername: string;
    dueDate: string;
    status: 'To Do' | 'In Progress' | 'Done';
}

export interface Affiliate {
    id: string;
    name: string;
    commissionRate: number; // e.g. 0.25 for 25%
    referredUsersCount: number;
    totalCommissionEarned: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: 'star' | 'diamond' | 'heart';
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    reward: string;
    isActive: boolean;
}

export interface Transaction {
    id: string;
    userId: string;
    username: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
}
