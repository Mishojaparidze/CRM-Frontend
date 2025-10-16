export type Permission =
  | 'can_view_dashboard'
  | 'can_manage_users'
  | 'can_suspend_users'
  | 'can_ban_users'
  | 'can_edit_user_details'
  | 'can_view_user_financials'
  | 'can_manage_notes'
  | 'can_manage_wallets'
  | 'can_grant_bonuses'
  | 'can_manage_promotions'
  | 'can_manage_rg_limits'
  | 'can_view_audit_logs'
  | 'can_manage_roles'
  | 'can_manage_support_tickets'
  | 'can_manage_email_templates'
  | 'can_view_analytics'
  | 'can_manage_automation'
  | 'can_manage_platform_settings'
  | 'can_manage_gdpr'
  | 'can_manage_ab_tests'
  | 'can_manage_affiliates'
  | 'can_manage_gamification'
  | 'can_manage_api_keys';

export interface AdminRole {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
}

export type NotificationType = 'new_vip' | 'large_deposit' | 'high_risk_flag' | 'new_support_ticket';

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

export interface LoyaltyTier {
    id: string;
    name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    pointsRequired: number;
    benefits: string[];
}

export interface User {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    status: 'active' | 'suspended' | 'banned' | 'anonymized';
    kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
    createdAt: string;
    lastLoginAt: string;
    ltv: number;
    ggr: number;
    avgBetSize: number;
    tags: string[];
    isHighRisk: boolean;
    preferences: UserPreferences;
    responsibleGaming: RGLimits;
    customFields: Record<string, string | number>;
    adminRoleId?: string;
    riskScore?: number;
    has2FA: boolean;
    notificationSettings?: Partial<Record<NotificationType, { email: boolean; inApp: boolean; }>>;
    churnPredictionScore?: number; // 0-100
    referredByAffiliateId?: string;
    achievements: string[]; // Array of achievement IDs
    loyaltyPoints?: number;
    loyaltyTierId?: string;
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
    adminId: string;
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

export interface Bonus {
    id: string;
    userId: string;
    type: 'Free Spins' | 'Deposit Match' | 'Cash Credit';
    amount: number;
    reason: string;
    grantedAt: string;
    adminId: string;
    adminUsername: string;
}

export interface AuditLog {
    id: string;
    adminId: string;
    adminUsername: string;
    action: string;
    targetType: 'user' | 'role' | 'ticket' | 'system';
    targetId: string;
    details: Record<string, any>;
    timestamp: string;
}

export interface UserDocument {
    id: string;
    userId: string;
    fileName: string;
    fileSize: number;
    fileUrl: string; // for download
    uploadedAt: string;
    uploadedBy: string; // admin username
}

export type TicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TicketReply {
    id: string;
    ticketId: string;
    authorId: string; // user id or admin id
    authorName: string;
    content: string;
    createdAt: string;
    isInternalNote: boolean;
}

export interface SupportTicket {
    id: string;
    userId: string;
    userUsername: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    updatedAt: string;
    assignedToAdminId?: string;
    assignedToAdminUsername?: string;
    replies?: TicketReply[];
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}

export interface Segment {
    id: string;
    name: string;
    description: string;
    rules: Record<string, any>;
    userCount?: number;
}

export interface GamingActivity {
    id: string;
    userId: string;
    type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'loss' | 'jackpot';
    amount?: number;
    currency?: 'USD';
    game?: string;
    timestamp: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    timelineType: 'activity' | 'note' | 'bonus' | 'audit';
    // Activity fields
    type?: string;
    amount?: number;
    currency?: string;
    game?: string;
    // Note fields
    adminUsername?: string;
    content?: string;
    // Bonus fields
    reason?: string;
    // Audit fields
    action?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate: string;
    assignedToAdminId: string;
    assignedToAdminUsername: string;
    relatedUserId?: string;
    relatedUserUsername?: string;
    createdAt: string;
}

export interface WorkflowRule {
    id: string;
    name: string;
    description: string;
    trigger: string; // e.g., "ltv_exceeds_10000"
    action: string; // e.g., "add_tag_vip"
    isEnabled: boolean;
}

export interface IPWhitelistEntry {
    id: string;
    ipAddress: string;
    description: string;
    createdAt: string;
}

export interface ABTest {
    id: string;
    name: string;
    status: 'Running' | 'Paused' | 'Completed';
    variants: {
        name: string;
        users: number;
        conversionRate: number;
    }[];
}

export interface Affiliate {
    id: string;
    name: string;
    commissionRate: number; // e.g., 0.25 for 25%
    referredUsersCount: number;
    totalCommissionEarned: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // e.g., 'trophy', 'star', 'diamond'
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    reward: string; // e.g., "50 Free Spins"
    isActive: boolean;
}

export type PromotionStatus = 'Active' | 'Scheduled' | 'Expired';
export type PromotionType = 'Deposit Match' | 'Free Spins Offer' | 'Cashback Offer';

export interface Promotion {
    id: string;
    name: string;
    description: string;
    type: PromotionType;
    status: PromotionStatus;
    startDate: string;
    endDate: string;
    bonusCode?: string;
    minDeposit?: number;
}

export interface Integration {
    id: 'slack' | 'tableau';
    name: string;
    description: string;
    iconUrl: string;
    isConnected: boolean;
}

export interface ApiKey {
    id: string;
    key: string; // The full secret key
    description: string;
    createdAt: string;
    lastUsedAt: string | null;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskFactor {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
}

export interface RiskAssessment {
    score: number;
    level: RiskLevel;
    factors: RiskFactor[];
}