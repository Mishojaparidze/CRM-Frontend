// This is a mock API service to simulate backend interactions.
// In a real application, these functions would make network requests.
import { User, Permission, AdminRole, Note, UserSession, Bonus, AuditLog, UserDocument, SupportTicket, TicketReply, EmailTemplate, Segment, GamingActivity, TimelineEvent, Task, WorkflowRule, IPWhitelistEntry, ABTest, Wallet, Affiliate, Achievement, Mission, Integration, ApiKey } from '../types';

let AUTH_TOKEN: string | null = null;

export const setAuthToken = (token: string | null) => {
  AUTH_TOKEN = token;
};

// A helper to simulate async API calls
const simulateRequest = <T,>(data: T, delay = 500): Promise<{ data: T, message?: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (false) { // 5% chance of a random error
        reject(new Error("A random network error occurred."));
      } else {
        resolve({ data });
      }
    }, delay);
  });
};

export const ALL_PERMISSIONS: Permission[] = [
    'can_view_dashboard', 'can_manage_users', 'can_suspend_users', 'can_ban_users',
    'can_edit_user_details', 'can_view_user_financials', 'can_manage_notes',
    'can_manage_wallets', 'can_grant_bonuses', 'can_manage_rg_limits',
    'can_view_audit_logs', 'can_manage_roles', 'can_manage_support_tickets',
    'can_manage_email_templates', 'can_view_analytics', 'can_manage_automation',
    'can_manage_platform_settings', 'can_manage_gdpr', 'can_manage_ab_tests',
    'can_manage_affiliates', 'can_manage_gamification', 'can_manage_api_keys',
];

// --- In-memory data for demonstration ---
let MOCK_USERS: User[] = [
    // FIX: Added avgBetSize property
    { id: 'user_1', email: 'player1@test.com', username: 'PlayerOne', role: 'user', status: 'active', kycStatus: 'verified', createdAt: new Date(2023, 4, 15).toISOString(), tags: ['VIP'], isHighRisk: false, ltv: 5000, ggr: 1000, avgBetSize: 25.50, lastLoginAt: new Date().toISOString(), preferences: { language: 'en', timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' }, responsibleGaming: { depositLimit: 5000, lossLimit: null, sessionTimeLimit: null }, customFields: {}, riskScore: 10, has2FA: false, churnPredictionScore: 5, referredByAffiliateId: 'aff_1', achievements: ['ach_1', 'ach_3'] },
    // FIX: Added avgBetSize property
    { id: 'user_2', email: 'player2@test.com', username: 'PlayerTwo', role: 'user', status: 'suspended', kycStatus: 'pending', createdAt: new Date(2023, 5, 20).toISOString(), tags: [], isHighRisk: true, ltv: 100, ggr: -50, avgBetSize: 5.20, lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), preferences: { language: 'en', timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' }, responsibleGaming: { depositLimit: 100, lossLimit: 50, sessionTimeLimit: 60 }, customFields: {}, riskScore: 85, has2FA: false, churnPredictionScore: 92, achievements: [] },
    // FIX: Added avgBetSize property
    { id: 'admin_1', email: 'admin@crm.com', username: 'AdminUser', role: 'admin', adminRoleId: 'role_super_admin', status: 'active', kycStatus: 'verified', createdAt: new Date(2023, 0, 1).toISOString(), tags: [], isHighRisk: false, ltv: 0, ggr: 0, avgBetSize: 0, lastLoginAt: new Date().toISOString(), preferences: { language: 'en', timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' }, responsibleGaming: { depositLimit: null, lossLimit: null, sessionTimeLimit: null }, customFields: {}, has2FA: true, notificationSettings: { new_vip: { email: true, inApp: true }, large_deposit: { email: true, inApp: false }, high_risk_flag: { email: true, inApp: true }, new_support_ticket: { email: false, inApp: true } }, achievements: [] },
    // FIX: Added full user for findLinkedAccounts mock
    { id: 'user_3', email: 'player3@test.com', username: 'SimilarPlayer', role: 'user', status: 'active', kycStatus: 'verified', createdAt: new Date(2023, 6, 1).toISOString(), tags: [], isHighRisk: false, ltv: 150, ggr: 20, avgBetSize: 10, lastLoginAt: new Date().toISOString(), preferences: { language: 'en', timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' }, responsibleGaming: { depositLimit: 1000, lossLimit: null, sessionTimeLimit: null }, customFields: {}, riskScore: 20, has2FA: false, churnPredictionScore: 35, referredByAffiliateId: 'aff_2', achievements: ['ach_1'] },
    // FIX: Added avgBetSize property
    { id: 'admin_2', email: 'marketing@crm.com', username: 'Marketer', role: 'admin', adminRoleId: 'role_marketing_mgr', status: 'active', kycStatus: 'verified', createdAt: new Date(2023, 2, 1).toISOString(), tags: [], isHighRisk: false, ltv: 0, ggr: 0, avgBetSize: 0, lastLoginAt: new Date().toISOString(), preferences: { language: 'en', timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' }, responsibleGaming: { depositLimit: null, lossLimit: null, sessionTimeLimit: null }, customFields: {}, has2FA: false, achievements: [] },
    // FIX: Added avgBetSize property
    { id: 'admin_3', email: 'support@crm.com', username: 'SupportSam', role: 'admin', adminRoleId: 'role_support_agent', status: 'active', kycStatus: 'verified', createdAt: new Date(2023, 3, 1).toISOString(), tags: [], isHighRisk: false, ltv: 0, ggr: 0, avgBetSize: 0, lastLoginAt: new Date().toISOString(), preferences: { language: 'en', timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' }, responsibleGaming: { depositLimit: null, lossLimit: null, sessionTimeLimit: null }, customFields: {}, has2FA: false, achievements: [] },
];

let MOCK_ROLES: AdminRole[] = [
    { 
        id: 'role_super_admin', 
        name: 'Super Admin', 
        description: 'Full access to all features and settings.', 
        permissions: ALL_PERMISSIONS 
    },
    { 
        id: 'role_marketing_mgr', 
        name: 'Marketing Manager', 
        description: 'Manages campaigns, bonuses, affiliates, and analytics.', 
        permissions: [
            'can_view_dashboard', 'can_view_analytics', 'can_manage_email_templates', 
            'can_grant_bonuses', 'can_manage_affiliates', 'can_manage_gamification', 
            'can_manage_ab_tests', 'can_manage_users'
        ] 
    },
    { 
        id: 'role_support_agent', 
        name: 'Support Agent', 
        description: 'Assists users with issues via the support ticket system.', 
        permissions: [
            'can_view_dashboard', 'can_manage_users', 'can_edit_user_details', 
            'can_manage_notes', 'can_manage_support_tickets', 'can_view_user_financials'
        ] 
    },
];

let MOCK_TASKS: Task[] = [
    { id: 'task_1', title: 'Review KYC for PlayerTwo', description: 'Pending documents seem suspicious.', status: 'In Progress', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), assignedToAdminId: 'admin_1', assignedToAdminUsername: 'AdminUser', relatedUserId: 'user_2', relatedUserUsername: 'PlayerTwo', createdAt: new Date().toISOString() }
];

let MOCK_WORKFLOWS: WorkflowRule[] = [
    { id: 'wf_1', name: 'VIP Tag on High LTV', description: 'Assigns VIP tag to users whose LTV exceeds $10,000.', trigger: 'ltv_exceeds_10000', action: 'add_tag_vip', isEnabled: true },
    { id: 'wf_2', name: 'High-Risk Alert', description: 'Creates a task for review when a user is flagged as high-risk.', trigger: 'user_flagged_high_risk', action: 'create_review_task', isEnabled: false }
];

let MOCK_WHITELIST_IPS: IPWhitelistEntry[] = [
    { id: 'ip_1', ipAddress: '192.168.1.1', description: 'Office Network', createdAt: new Date().toISOString() },
    { id: 'ip_2', ipAddress: '8.8.8.8', description: 'Google DNS (Example)', createdAt: new Date().toISOString() },
];

let MOCK_AB_TESTS: ABTest[] = [
    { id: 'ab_1', name: 'Welcome Bonus Test', status: 'Running', variants: [{ name: 'A: 100 Free Spins', users: 1052, conversionRate: 0.25 }, { name: 'B: 50% Deposit Match', users: 1048, conversionRate: 0.31 }] },
    { id: 'ab_2', name: 'Registration Button Color', status: 'Completed', variants: [{ name: 'A: Blue', users: 5230, conversionRate: 0.45 }, { name: 'B: Green', users: 5190, conversionRate: 0.48 }] },
];

let MOCK_AFFILIATES: Affiliate[] = [
    { id: 'aff_1', name: 'CasinoMasters', commissionRate: 0.30, referredUsersCount: 1, totalCommissionEarned: 300 },
    { id: 'aff_2', name: 'BettingPros', commissionRate: 0.25, referredUsersCount: 1, totalCommissionEarned: 5 },
];

let MOCK_ACHIEVEMENTS: Achievement[] = [
    { id: 'ach_1', name: 'Welcome!', description: 'Completed first deposit.', icon: 'star' },
    { id: 'ach_2', name: 'High Roller', description: 'Reached $1,000 in total deposits.', icon: 'diamond' },
    { id: 'ach_3', name: 'Loyal Player', description: 'Logged in 7 days in a row.', icon: 'heart' },
];

let MOCK_MISSIONS: Mission[] = [
    { id: 'mis_1', title: 'Weekend Wager', description: 'Place 50 bets over $5 this weekend.', reward: '100 Free Spins', isActive: true },
    { id: 'mis_2', title: 'Crypto Enthusiast', description: 'Make a deposit using BTC and ETH.', reward: '$25 Cash Credit', isActive: true },
];

let MOCK_INTEGRATIONS: Integration[] = [
    { id: 'slack', name: 'Slack', description: 'Send critical notifications to your Slack channels.', iconUrl: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg', isConnected: true },
    { id: 'tableau', name: 'Tableau', description: 'Export and visualize your CRM data in Tableau.', iconUrl: 'https://cdn.worldvectorlogo.com/logos/tableau-software.svg', isConnected: false },
];

let MOCK_API_KEYS: ApiKey[] = [
    { id: 'key_1', key: 'sk_live_mock_abcdef123456', description: 'Data Warehouse Sync', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), lastUsedAt: new Date().toISOString() },
    { id: 'key_2', key: 'sk_live_mock_ghijkl789012', description: 'Affiliate Payout Script', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), lastUsedAt: null },
];
// ... other mock data stores

// --- MOCK API FUNCTIONS ---

export const login = (email: string, password: string) => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) return Promise.reject(new Error("User not found"));
    return simulateRequest({ token: 'mock-jwt-token', userId: user.id });
};
export const register = (email: string, username: string, password: string) => {
    // FIX: Added avgBetSize property
    const newUser: User = { id: `user_${Date.now()}`, email, username, role: 'user', status: 'active', kycStatus: 'none', createdAt: new Date().toISOString(), tags: [], isHighRisk: false, ltv: 0, ggr: 0, avgBetSize: 0, lastLoginAt: new Date().toISOString(), preferences: { language: 'en', timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' }, responsibleGaming: { depositLimit: null, lossLimit: null, sessionTimeLimit: null }, customFields: {}, riskScore: 5, has2FA: false, achievements: [] };
    MOCK_USERS.push(newUser);
    return simulateRequest({ token: 'mock-jwt-token', userId: newUser.id });
};
export const getUserById = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    return user ? simulateRequest(user) : Promise.reject(new Error("User not found"));
};

export const getUserPermissions = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user?.role === 'admin' && user.adminRoleId) {
        const role = MOCK_ROLES.find(r => r.id === user.adminRoleId);
        return simulateRequest({ permissions: role?.permissions || [] });
    }
    return simulateRequest({ permissions: [] });
};
export const updateUserProfile = (userId: string, data: Partial<User>) => {
    let user = MOCK_USERS.find(u => u.id === userId);
    if(user) {
        user = {...user, ...data};
        MOCK_USERS = MOCK_USERS.map(u => u.id === userId ? user! : u);
        return simulateRequest(user);
    }
    return Promise.reject(new Error("User not found"));
};

export const getAllUsers = () => simulateRequest([...MOCK_USERS]);
export const getAdminRoles = () => simulateRequest([...MOCK_ROLES]);
export const createAdminRole = (name: string, description: string, permissions: Permission[]) => {
    const newRole: AdminRole = { id: `role_${Date.now()}`, name, description, permissions };
    MOCK_ROLES.push(newRole);
    return simulateRequest(newRole);
};
export const updateAdminRole = (roleId: string, data: Partial<AdminRole>) => {
    const role = MOCK_ROLES.find(r => r.id === roleId);
    if(role) {
        Object.assign(role, data);
        return simulateRequest(role);
    }
    return Promise.reject(new Error("Role not found"));
};
export const deleteAdminRole = (roleId: string) => {
    MOCK_ROLES = MOCK_ROLES.filter(r => r.id !== roleId);
    return simulateRequest({ message: "Role deleted successfully." });
};
export const assignAdminRole = (adminUserId: string, newRoleId: string) => {
    const admin = MOCK_USERS.find(u => u.id === adminUserId);
    if (admin) {
        admin.adminRoleId = newRoleId;
        return simulateRequest(admin);
    }
    return Promise.reject(new Error("Admin not found"));
};
export const getAllTasks = () => simulateRequest([...MOCK_TASKS]);
export const getTasksForUser = (userId: string) => simulateRequest(MOCK_TASKS.filter(t => t.relatedUserId === userId));
export const createTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { ...taskData, id: `task_${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_TASKS.push(newTask);
    return simulateRequest(newTask);
};
export const updateTask = (taskId: string, updates: Partial<Task>) => {
    const task = MOCK_TASKS.find(t => t.id === taskId);
    if (task) {
        Object.assign(task, updates);
        return simulateRequest(task);
    }
    return Promise.reject(new Error("Task not found"));
};
export const getAllWorkflowRules = () => simulateRequest([...MOCK_WORKFLOWS]);
export const updateWorkflowRule = (ruleId: string, updates: Partial<WorkflowRule>) => {
    const rule = MOCK_WORKFLOWS.find(r => r.id === ruleId);
    if (rule) {
        Object.assign(rule, updates);
        return simulateRequest(rule);
    }
    return Promise.reject(new Error("Workflow rule not found"));
};
export const toggle2FA = (userId: string, enabled: boolean) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        user.has2FA = enabled;
        return simulateRequest({ message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully.` });
    }
    return Promise.reject(new Error("User not found"));
};
export const getWhitelistedIPs = () => simulateRequest([...MOCK_WHITELIST_IPS]);
export const addWhitelistedIP = (ipAddress: string, description: string) => {
    const newEntry: IPWhitelistEntry = { id: `ip_${Date.now()}`, ipAddress, description, createdAt: new Date().toISOString() };
    MOCK_WHITELIST_IPS.push(newEntry);
    return simulateRequest(newEntry);
};
export const removeWhitelistedIP = (id: string) => {
    MOCK_WHITELIST_IPS = MOCK_WHITELIST_IPS.filter(ip => ip.id !== id);
    return simulateRequest({ message: 'IP address removed from whitelist.' });
};
export const getABTests = () => simulateRequest([...MOCK_AB_TESTS]);
export const exportUserData = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        return simulateRequest({ userData: JSON.stringify(user, null, 2) });
    }
    return Promise.reject(new Error("User not found"));
};
export const anonymizeUser = (userId: string) => {
     const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        user.email = `${user.id}@anonymous.com`;
        user.username = `anonymous_${user.id.substring(0, 5)}`;
        user.status = 'anonymized';
        user.customFields = {};
        // In real app, clear notes, wallets etc.
        return simulateRequest({ message: `User ${userId} has been anonymized.` });
    }
    return Promise.reject(new Error("User not found"));
};

// --- PLATFORM ---
export const getApiKeys = () => simulateRequest([...MOCK_API_KEYS]);
export const createApiKey = (description: string) => {
    const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        key: `sk_live_mock_${Math.random().toString(36).substring(2, 15)}`,
        description,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
    };
    MOCK_API_KEYS.push(newKey);
    return simulateRequest(newKey);
}
export const revokeApiKey = (keyId: string) => {
    MOCK_API_KEYS = MOCK_API_KEYS.filter(k => k.id !== keyId);
    return simulateRequest({ message: 'API Key revoked successfully.' });
}


// --- ADVANCED INTEGRATIONS ---
export const getAffiliates = () => simulateRequest([...MOCK_AFFILIATES]);
export const getAchievements = () => simulateRequest([...MOCK_ACHIEVEMENTS]);
export const getMissions = () => simulateRequest([...MOCK_MISSIONS]);
export const getIntegrations = () => simulateRequest([...MOCK_INTEGRATIONS]);
export const updateIntegration = (id: 'slack' | 'tableau', isConnected: boolean) => {
    const integration = MOCK_INTEGRATIONS.find(i => i.id === id);
    if (integration) {
        integration.isConnected = isConnected;
        return simulateRequest(integration);
    }
    return Promise.reject(new Error("Integration not found"));
};


// --- EXISTING MOCK FUNCTIONS (abbreviated) ---
export const changePassword = (userId: string, current: string, newPass: string) => simulateRequest({ message: 'Password changed successfully.' });
export const requestPasswordReset = (email: string) => simulateRequest({ message: 'If an account exists for this email, a reset link has been sent.' });
export const resetPassword = (token: string, newPass: string) => simulateRequest({ message: 'Your password has been reset successfully.' });
// FIX: Correctly typed mock return value
export const getUserWallets = (userId: string) => simulateRequest<Wallet[]>([{ id: 'wallet_1', userId, currency: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', isVerified: true }]);
// FIX: Correctly typed mock return value and parameters
export const addWallet = (userId: string, currency: Wallet['currency'], address: string) => simulateRequest<Wallet>({ id: `wallet_${Math.random()}`, userId, currency, address, isVerified: false });
export const removeWallet = (userId: string, walletId: string) => simulateRequest({ message: 'Wallet removed' });
export const getCustomerNotes = (userId: string) => simulateRequest<Note[]>([{ id: 'note_1', userId, adminId: 'admin_1', adminUsername: 'AdminUser', content: 'This is a test note.', createdAt: new Date().toISOString() }]);
export const addCustomerNote = (userId: string, content: string) => simulateRequest<Note>({ id: `note_${Math.random()}`, userId, adminId: 'admin_1', adminUsername: 'AdminUser', content, createdAt: new Date().toISOString() });
export const deleteCustomerNote = (noteId: string) => simulateRequest({ message: 'Note deleted' });
export const getUserSessions = (userId: string) => simulateRequest<UserSession[]>([{ id: 'session_1', userId, ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0 ...', createdAt: new Date().toISOString() }]);
export const terminateUserSession = (sessionId: string) => simulateRequest({ message: 'Session terminated' });
// FIX: Correctly typed mock return value
export const getUserBonuses = (userId: string) => simulateRequest<Bonus[]>([{ id: 'bonus_1', userId, type: 'Free Spins', amount: 50, reason: 'Welcome bonus', grantedAt: new Date().toISOString(), adminId: 'admin_1', adminUsername: 'AdminUser' }]);
// FIX: Correctly typed mock parameters
export const grantBonus = (userId: string, type: Bonus['type'], amount: number, reason: string) => simulateRequest({ message: 'Bonus granted' });
// FIX: Correctly typed mock return value
export const getAuditLogs = () => simulateRequest<AuditLog[]>([{ id: 'log_1', adminId: 'admin_1', adminUsername: 'AdminUser', action: 'update_user_status', targetType: 'user', targetId: 'user_2', details: { from: 'active', to: 'suspended' }, timestamp: new Date().toISOString() }]);
export const getUserDocuments = (userId: string) => simulateRequest<UserDocument[]>([{ id: 'doc_1', userId, fileName: 'passport.jpg', fileSize: 1024 * 500, fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'AdminUser' }]);
export const addUserDocument = (userId: string, file: File) => simulateRequest({ message: 'Document uploaded' });
export const deleteUserDocument = (docId: string) => simulateRequest({ message: 'Document deleted' });
// FIX: Return a full user object to satisfy the User type
export const findLinkedAccounts = (userId: string) => {
    const linkedUser = MOCK_USERS.find(u => u.id === 'user_3');
    if (linkedUser) {
        return simulateRequest<{ user: User; reason: string; }[]>([{ user: linkedUser, reason: 'Shared IP: 192.168.1.100' }]);
    }
    return simulateRequest<{ user: User; reason: string; }[]>([]);
};
// FIX: Correctly typed mock return value
export const getUserTimeline = (userId: string) => simulateRequest<TimelineEvent[]>([{ id: 'event_1', date: new Date().toISOString(), timelineType: 'activity', type: 'deposit', amount: 100, currency: 'USD' }]);
// FIX: Add 'rules' to satisfy Segment type
export const getSegments = () => simulateRequest<Segment[]>([{ id: 'seg_1', name: 'VIP Players', description: 'Users with LTV > $10,000', userCount: 42, rules: {} }]);
// FIX: Correctly typed mock return value
export const getSupportTickets = () => simulateRequest<SupportTicket[]>([{ id: 'ticket_1', userId: 'user_1', userUsername: 'PlayerOne', subject: 'Withdrawal issue', description: '...', status: 'Open', priority: 'High', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), assignedToAdminUsername: 'SupportAdmin' }]);
// FIX: Correctly typed mock return value
export const getTicketById = (ticketId: string) => simulateRequest<SupportTicket>({ id: ticketId, userId: 'user_1', userUsername: 'PlayerOne', subject: 'Withdrawal issue', description: 'My withdrawal is stuck.', status: 'Open', priority: 'High', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), replies: [] });
// FIX: Correctly typed mock return value
export const updateTicket = (ticketId: string, updates: any) => simulateRequest({ id: ticketId, ...updates } as SupportTicket);
export const addTicketReply = (ticketId: string, content: string, isInternal: boolean) => simulateRequest<TicketReply>({ id: `reply_${Date.now()}`, ticketId, authorId: 'admin_1', authorName: 'AdminUser', content, createdAt: new Date().toISOString(), isInternalNote: isInternal });
export const getEmailTemplates = () => simulateRequest<EmailTemplate[]>([{ id: 'tpl_1', name: 'Welcome Email', subject: 'Welcome to Our Casino!', body: 'Hello {{username}}...', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
export const createEmailTemplate = (data: any) => simulateRequest<EmailTemplate>({ id: `tpl_${data.name}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
export const updateEmailTemplate = (templateId: string, data: any) => simulateRequest<EmailTemplate>({ id: templateId, ...data, updatedAt: new Date().toISOString() });
export const deleteEmailTemplate = (templateId: string) => simulateRequest({ message: 'Template deleted' });
// FIX: Correctly typed mock return value
export const getAllGamingActivities = () => simulateRequest<GamingActivity[]>([{ id: 'act_1', userId: 'user_1', type: 'win', amount: 250, game: 'Slots', timestamp: new Date().toISOString() }]);

export default {
    setAuthToken, login, register, getUserById, getUserPermissions, updateUserProfile,
    changePassword, requestPasswordReset, resetPassword, getAllUsers, getAdminRoles,
    createAdminRole, updateAdminRole, deleteAdminRole, assignAdminRole,
    getAllTasks, getTasksForUser, createTask, updateTask, getAllWorkflowRules,
    updateWorkflowRule, toggle2FA, getWhitelistedIPs, addWhitelistedIP, removeWhitelistedIP,
    getABTests, exportUserData, anonymizeUser, getApiKeys, createApiKey, revokeApiKey,
    getUserWallets, addWallet, removeWallet, getCustomerNotes, addCustomerNote,
    deleteCustomerNote, getUserSessions, terminateUserSession, getUserBonuses,
    grantBonus, getAuditLogs, getUserDocuments, addUserDocument, deleteUserDocument,
    findLinkedAccounts, getUserTimeline, getSegments, getSupportTickets, getTicketById,
    updateTicket, addTicketReply, getEmailTemplates, createEmailTemplate,
    updateEmailTemplate, deleteEmailTemplate, getAllGamingActivities, ALL_PERMISSIONS,
    getAffiliates, getAchievements, getMissions, getIntegrations, updateIntegration
};