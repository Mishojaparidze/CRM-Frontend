// This is a mock API service to simulate a backend.
// In a real application, these would be actual HTTP requests.

import {
  User, AuthResponseData, Wallet, Note, UserSession, Permission, AdminRole,
  UserDocument, GamingActivity, Bonus, AuditLog, TimelineEvent, Segment,
  SupportTicket, TicketReply, EmailTemplate, IPWhitelistEntry, ABTest, ApiKey,
  Integration, LoyaltyTier, Promotion, RiskAssessment, WorkflowRule, Task,
  Affiliate, Achievement, Mission, Transaction, RGLimits, UserPreferences
} from '../types';

// MOCK DATABASE
let USERS: User[] = [];
let WALLETS: Wallet[] = [];
let NOTES: Note[] = [];
let SESSIONS: UserSession[] = [];
let ADMIN_ROLES: AdminRole[] = [];
let DOCUMENTS: UserDocument[] = [];
let GAMING_ACTIVITIES: GamingActivity[] = [];
let BONUSES: Bonus[] = [];
let AUDIT_LOGS: AuditLog[] = [];
let SUPPORT_TICKETS: SupportTicket[] = [];
let EMAIL_TEMPLATES: EmailTemplate[] = [];
let IP_WHITELIST: IPWhitelistEntry[] = [];
let AB_TESTS: ABTest[] = [];
let API_KEYS: ApiKey[] = [];
let INTEGRATIONS: Integration[] = [];
let LOYALTY_TIERS: LoyaltyTier[] = [];
let PROMOTIONS: Promotion[] = [];
let RISK_ASSESSMENTS: RiskAssessment[] = [];
let WORKFLOW_RULES: WorkflowRule[] = [];
let TASKS: Task[] = [];
let AFFILIATES: Affiliate[] = [];
let ACHIEVEMENTS: Achievement[] = [];
let MISSIONS: Mission[] = [];
let TRANSACTIONS: Transaction[] = [];

let authToken: string | null = null;

// --- UTILS ---
const randomId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const apiDelay = (ms = 500) => new Promise(res => setTimeout(res, ms));

const initMockData = () => {
  if (USERS.length > 0) return; // Already initialized

  // --- Roles & Permissions ---
  ADMIN_ROLES = [
    { id: 'role_super_admin', name: 'Super Admin', description: 'Full access to all features.', permissions: [
      'can_view_admin_dashboard', 'can_manage_users', 'can_edit_user_details', 'can_suspend_users', 'can_ban_users',
      'can_view_financials', 'can_manage_notes', 'can_manage_roles', 'can_grant_bonuses', 'can_manage_rg_limits',
      'can_manage_promotions', 'can_manage_api_keys', 'can_manage_ab_tests'
    ] },
    { id: 'role_support_lead', name: 'Support Lead', description: 'Manages support tickets and agents.', permissions: [
      'can_view_admin_dashboard', 'can_manage_users', 'can_edit_user_details', 'can_manage_notes', 'can_grant_bonuses'
    ] },
    { id: 'role_risk_analyst', name: 'Risk Analyst', description: 'Monitors user activity for risk.', permissions: [
        'can_view_admin_dashboard', 'can_manage_users', 'can_suspend_users', 'can_view_financials'
    ] },
  ];
  
  // --- Users ---
  USERS = [
    { 
      id: 'admin_1', email: 'admin@crm.com', username: 'superadmin', fullName: "Super Admin", role: 'admin' as const, status: 'active', kycStatus: 'verified', createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), lastLoginAt: new Date().toISOString(), phone: '+1234567890', dateOfBirth: '1990-01-01', country: 'US', ltv: 0, ggr: 0, avgBetSize: 0, isHighRisk: false, tags: [], customFields: {}, adminRoleId: 'role_super_admin', has2FA: true, 
      // FIX: Add 'as const' to theme property to ensure correct type inference.
      preferences: { language: 'en' as const, timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' as const }, responsibleGaming: { depositLimit: null, lossLimit: null, sessionTimeLimit: null }, achievements: [], loyaltyTierId: 'tier_4', loyaltyPoints: 10000, notificationSettings: {}, balance: 0, bonusBalance: 0,
    },
    ...Array.from({ length: 50 }, (_, i) => {
      const status: User['status'][] = ['active', 'suspended', 'banned'];
      const kycStatus: User['kycStatus'][] = ['none', 'pending', 'verified', 'rejected'];
      const ltv = Math.random() * 10000;
      const balance = Math.random() * 5000;
      const bonusBalance = Math.random() * 500;
      const hasWagering = Math.random() > 0.5;

      return {
        id: `user_${i}`,
        email: `player${i}@example.com`,
        username: `Player${i}`,
        fullName: `Player ${i} Fullname`,
        role: 'user' as const,
        status: status[i % 3],
        kycStatus: kycStatus[i % 4],
        createdAt: new Date(Date.now() - (i + 1) * 2 * 86400000).toISOString(),
        lastLoginAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        phone: `+1555000${1000 + i}`,
        dateOfBirth: `${1980 + (i % 20)}-0${1 + (i % 9)}-${10 + (i % 18)}`,
        country: 'US',
        balance,
        bonusBalance,
        wageringRequirement: hasWagering ? { progress: Math.random() * 2000, target: 2000 } : undefined,
        ltv,
        ggr: ltv * (0.1 + Math.random() * 0.2),
        avgBetSize: Math.random() * 100,
        isHighRisk: Math.random() > 0.9,
        churnPredictionScore: Math.floor(Math.random() * 101),
        tags: i % 5 === 0 ? ['HighValue', 'BonusHunter'] : i % 3 === 0 ? ['Newbie'] : [],
        customFields: i % 10 === 0 ? { legacy_id: 1000 + i } : {},
        has2FA: i % 4 === 0,
        // FIX: Add 'as const' to theme property to ensure correct type inference.
        preferences: { language: 'en' as const, timezone: 'America/New_York', notificationEmail: true, notificationSms: i % 2 === 0, notificationPush: true, theme: 'dark' as const },
        responsibleGaming: { depositLimit: i % 7 === 0 ? 500 : null, lossLimit: i % 8 === 0 ? 200 : null, sessionTimeLimit: null },
        achievements: [],
        loyaltyTierId: 'tier_1',
        loyaltyPoints: Math.floor(Math.random() * 10000),
        notificationSettings: {}
      }
    })
  ];
  
  // --- Other data ---
  USERS.forEach(u => {
    if (u.role === 'user') {
      WALLETS.push({ id: randomId('wallet'), userId: u.id, currency: 'BTC', address: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa${u.id}`, isVerified: true });
      NOTES.push({ id: randomId('note'), userId: u.id, adminUsername: 'superadmin', content: `Initial account review for ${u.username}.`, createdAt: new Date().toISOString() });
      GAMING_ACTIVITIES.push({ id: randomId('activity'), userId: u.id, type: 'deposit', amount: 100, currency: 'USD', game: 'N/A', timestamp: new Date().toISOString(), status: 'completed', paymentMethod: 'Credit Card' });
      GAMING_ACTIVITIES.push({ id: randomId('activity'), userId: u.id, type: 'win', amount: 25, currency: 'USD', game: 'Slots', timestamp: new Date(Date.now() - 3600000).toISOString() });
      TRANSACTIONS.push({ id: randomId('txn'), userId: u.id, username: u.username, type: 'deposit', amount: 100, currency: 'USD', status: 'completed', timestamp: new Date().toISOString() })
    }
  });

  // Add some pending transactions for the demo
  GAMING_ACTIVITIES.push({ id: randomId('activity'), userId: 'user_1', type: 'withdrawal', amount: 250, currency: 'USD', game: 'N/A', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'pending', paymentMethod: 'Bitcoin' });
  GAMING_ACTIVITIES.push({ id: randomId('activity'), userId: 'user_2', type: 'deposit', amount: 500, currency: 'USD', game: 'N/A', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'pending', paymentMethod: 'Credit Card' });
  GAMING_ACTIVITIES.push({ id: randomId('activity'), userId: 'user_5', type: 'withdrawal', amount: 1200, currency: 'USD', game: 'N/A', timestamp: new Date().toISOString(), status: 'pending', paymentMethod: 'Bank Transfer' });


  LOYALTY_TIERS = [
    { id: 'tier_1', name: 'Bronze', pointsRequired: 0, benefits: ['Standard Support', 'Weekly Newsletter'] },
    { id: 'tier_2', name: 'Silver', pointsRequired: 1000, benefits: ['Priority Support', '5% Weekly Cashback'] },
    { id: 'tier_3', name: 'Gold', pointsRequired: 5000, benefits: ['Dedicated Account Manager', '10% Weekly Cashback', 'Exclusive Bonuses'] },
    { id: 'tier_4', name: 'Platinum', pointsRequired: 20000, benefits: ['VIP Host', '15% Weekly Cashback', 'Invitations to Events'] },
  ];

  SUPPORT_TICKETS = [
      { id: 'ticket_1', subject: 'Problem with my withdrawal', description: 'I requested a withdrawal 3 days ago and it is still pending.', userId: 'user_1', userUsername: 'Player1', status: 'Open', priority: 'High', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), replies: [] },
      { id: 'ticket_2', subject: 'Bonus not credited', description: 'I used the code WELCOME100 but did not receive the bonus.', userId: 'user_2', userUsername: 'Player2', status: 'Pending', priority: 'Medium', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(), assignedToAdminId: 'admin_1', assignedToAdminUsername: 'superadmin', replies: [] }
  ]
};

initMockData();

// --- API FUNCTIONS ---
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const ALL_PERMISSIONS: Permission[] = [
    'can_view_admin_dashboard', 'can_manage_users', 'can_edit_user_details', 'can_suspend_users', 'can_ban_users', 
    'can_view_financials', 'can_manage_notes', 'can_manage_roles', 'can_grant_bonuses', 'can_manage_rg_limits',
    'can_manage_promotions', 'can_manage_api_keys', 'can_manage_ab_tests'
];

export const login = async (email: string, password: string): Promise<{ data: AuthResponseData }> => {
  await apiDelay();
  const user = USERS.find(u => u.email === email);
  if (user && password) { // Mock password check
    return { data: { token: `mock_token_${user.id}`, userId: user.id } };
  }
  throw new Error('Invalid email or password.');
};

export const register = async (email: string, username: string, fullName: string, password: string): Promise<{ data: AuthResponseData }> => {
    await apiDelay();
    if (USERS.some(u => u.email === email || u.username === username)) {
        throw new Error('User with this email or username already exists.');
    }
    const newUser: User = {
        id: randomId('user'),
        email,
        username,
        fullName,
        role: 'user',
        status: 'active',
        kycStatus: 'none',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        phone: '',
        dateOfBirth: '',
        country: '',
        balance: 0,
        bonusBalance: 0,
        ltv: 0,
        ggr: 0,
        avgBetSize: 0,
        isHighRisk: false,
        tags: [],
        customFields: {},
        has2FA: false,
        // FIX: Add 'as const' to language and theme properties to ensure correct type inference.
        preferences: { language: 'en' as const, timezone: 'UTC', notificationEmail: true, notificationSms: false, notificationPush: true, theme: 'dark' as const },
        responsibleGaming: { depositLimit: null, lossLimit: null, sessionTimeLimit: null },
        achievements: [],
        loyaltyTierId: 'tier_1',
        loyaltyPoints: 0,
        notificationSettings: {},
    };
    USERS.push(newUser);
    return { data: { token: `mock_token_${newUser.id}`, userId: newUser.id } };
};

export const getUserById = async (userId: string): Promise<{ data: User }> => {
    await apiDelay();
    const user = USERS.find(u => u.id === userId);
    if (user) return { data: user };
    throw new Error('User not found.');
};

export const getAllUsers = async (): Promise<{ data: User[] }> => {
    await apiDelay();
    return { data: USERS };
};

export const getUserPermissions = async (userId: string): Promise<{ data: { permissions: Permission[] } }> => {
    await apiDelay();
    const user = USERS.find(u => u.id === userId);
    if (user?.role !== 'admin' || !user.adminRoleId) return { data: { permissions: [] } };
    const role = ADMIN_ROLES.find(r => r.id === user.adminRoleId);
    return { data: { permissions: role?.permissions || [] } };
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<{ data: User }> => {
    await apiDelay();
    let user = USERS.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');
    
    // In a real API, you'd be careful about what can be updated.
    user = { ...user, ...updates };
    USERS = USERS.map(u => u.id === userId ? user! : u);
    
    return { data: user };
};

export const changePassword = async (userId: string, current: string, newPass: string): Promise<{ message: string }> => {
    await apiDelay();
    if (!userId || !current || !newPass) throw new Error('Invalid request');
    return { message: 'Password updated successfully.' };
}

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    await apiDelay();
    const user = USERS.find(u => u.email === email);
    if (user) {
        const token = `reset_token_${user.id}_${Date.now()}`;
        console.log(`Password reset link for ${email}: /#/reset-password/${token}`);
    }
    return { message: 'If an account with that email exists, a password reset link has been sent.' };
};

export const resetPassword = async (token: string, newPass: string): Promise<{ message: string }> => {
    await apiDelay();
    if (!token || !newPass || !token.startsWith('reset_token_')) throw new Error('Invalid token.');
    return { message: 'Your password has been reset successfully.' };
};

export const getUserWallets = async (userId: string): Promise<{ data: Wallet[] }> => {
    await apiDelay();
    return { data: WALLETS.filter(w => w.userId === userId) };
};

export const addWallet = async (userId: string, currency: Wallet['currency'], address: string): Promise<{ data: Wallet }> => {
    await apiDelay();
    const newWallet: Wallet = { id: randomId('wallet'), userId, currency, address, isVerified: false };
    WALLETS.push(newWallet);
    return { data: newWallet };
};

export const removeWallet = async (userId: string, walletId: string): Promise<{ message: string }> => {
    await apiDelay();
    WALLETS = WALLETS.filter(w => !(w.id === walletId && w.userId === userId));
    return { message: 'Wallet removed.' };
};

export const getCustomerNotes = async (userId: string): Promise<{data: Note[]}> => {
    await apiDelay();
    return { data: NOTES.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
};

export const addCustomerNote = async (userId: string, content: string): Promise<{ data: Note }> => {
    await apiDelay();
    const admin = USERS.find(u => u.id === 'admin_1')!;
    const note: Note = { id: randomId('note'), userId, content, adminUsername: admin.username, createdAt: new Date().toISOString() };
    NOTES.push(note);
    return { data: note };
};

export const deleteCustomerNote = async (noteId: string): Promise<{ message: string }> => {
    await apiDelay();
    NOTES = NOTES.filter(n => n.id !== noteId);
    return { message: "Note deleted." };
};

// Add other mock functions here based on what's needed by components...
// This will be a large file. I will add more functions as needed.
export const getUserSessions = async (userId: string): Promise<{ data: UserSession[] }> => {
    await apiDelay();
    // mock some sessions
    return { data: [
        { id: randomId('session'), userId, ipAddress: '192.168.1.1', userAgent: 'Chrome on macOS', createdAt: new Date().toISOString()},
        { id: randomId('session'), userId, ipAddress: '10.0.0.1', userAgent: 'Safari on iPhone', createdAt: new Date(Date.now() - 3600000).toISOString()}
    ]};
}

export const terminateUserSession = async (sessionId: string): Promise<{ message: string }> => {
    await apiDelay();
    return { message: `Session ${sessionId} terminated.` };
}

export const getAuditLogs = async (): Promise<{ data: AuditLog[] }> => {
    await apiDelay();
    if (AUDIT_LOGS.length === 0) {
        AUDIT_LOGS = [
            { id: randomId('audit'), timestamp: new Date().toISOString(), adminUsername: 'superadmin', action: 'update_user_status', targetType: 'user', targetId: 'user_2', details: { from: 'active', to: 'suspended' } },
            { id: randomId('audit'), timestamp: new Date(Date.now() - 86400000).toISOString(), adminUsername: 'superadmin', action: 'grant_bonus', targetType: 'user', targetId: 'user_5', details: { type: 'Free Spins', amount: 50 } },
        ];
    }
    return { data: AUDIT_LOGS };
}

export const getAdminRoles = async (): Promise<{ data: AdminRole[] }> => {
    await apiDelay();
    return { data: ADMIN_ROLES };
}

export const assignAdminRole = async (adminUserId: string, newRoleId: string): Promise<{ data: User }> => {
    await apiDelay();
    const admin = USERS.find(u => u.id === adminUserId);
    if (!admin || admin.role !== 'admin') throw new Error('Admin user not found.');
    admin.adminRoleId = newRoleId;
    return { data: admin };
}
export const deleteAdminRole = async (roleId: string): Promise<{message: string}> => {
  await apiDelay();
  if (roleId === 'role_super_admin') throw new Error('Cannot delete Super Admin role.');
  ADMIN_ROLES = ADMIN_ROLES.filter(r => r.id !== roleId);
  USERS.forEach(u => {
      if (u.adminRoleId === roleId) {
          u.adminRoleId = undefined;
      }
  });
  return { message: "Role deleted successfully." }
}

export const updateAdminRole = async (roleId: string, updates: Partial<AdminRole>): Promise<{ data: AdminRole }> => {
  await apiDelay();
  const role = ADMIN_ROLES.find(r => r.id === roleId);
  if (!role) throw new Error('Role not found.');
  Object.assign(role, updates);
  return { data: role };
}
export const createAdminRole = async (name: string, description: string, permissions: Permission[]): Promise<{ data: AdminRole }> => {
  await apiDelay();
  const newRole: AdminRole = { id: randomId('role'), name, description, permissions };
  ADMIN_ROLES.push(newRole);
  return { data: newRole };
}
export const getUserDocuments = async (userId: string): Promise<{ data: UserDocument[] }> => {
    await apiDelay();
    return { data: DOCUMENTS.filter(d => d.userId === userId) };
}
export const addUserDocument = async (userId: string, file: File): Promise<{ data: UserDocument }> => {
    await apiDelay();
    const doc: UserDocument = { id: randomId('doc'), userId, fileName: file.name, fileSize: file.size, uploadedAt: new Date().toISOString(), uploadedBy: 'superadmin' };
    DOCUMENTS.push(doc);
    return { data: doc };
}
export const deleteUserDocument = async (docId: string): Promise<{ message: string }> => {
    await apiDelay();
    DOCUMENTS = DOCUMENTS.filter(d => d.id !== docId);
    return { message: 'Document deleted.' };
}

export const findLinkedAccounts = async (userId: string): Promise<{ data: { user: User, reason: string }[] }> => {
    await apiDelay();
    // Mock logic: find another user with high LTV to link
    const targetUser = USERS.find(u => u.id === userId);
    if (!targetUser) return { data: [] };

    const linked = USERS.find(u => u.id !== userId && u.ltv > 5000);
    if (linked) {
        return { data: [{ user: linked, reason: 'Shared IP Address: 192.168.1.100' }] };
    }
    return { data: [] };
}

export const getUserTimeline = async (userId: string): Promise<{ data: TimelineEvent[] }> => {
    await apiDelay();
    const activities = GAMING_ACTIVITIES.filter(a => a.userId === userId).map(a => ({ ...a, timelineType: 'activity' as const, date: a.timestamp }));
    const notes = NOTES.filter(n => n.userId === userId).map(n => ({...n, timelineType: 'note' as const, date: n.createdAt }));
    
    // Combine and sort
    // @ts-ignore
    const timeline: TimelineEvent[] = [...activities, ...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { data: timeline };
}

export const getSegments = async(): Promise<{data: Segment[]}> => {
    await apiDelay();
    return {data: [
        { id: 'seg_1', name: 'High Rollers', description: 'Users with LTV > $5,000', userCount: USERS.filter(u => u.ltv > 5000).length },
        { id: 'seg_2', name: 'New Players', description: 'Users who signed up in the last 7 days', userCount: USERS.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 86400000)).length },
    ]};
}

export const getSupportTickets = async (): Promise<{ data: SupportTicket[] }> => {
    await apiDelay();
    return { data: SUPPORT_TICKETS };
}
export const getTicketById = async (ticketId: string): Promise<{ data: SupportTicket }> => {
    await apiDelay();
    const ticket = SUPPORT_TICKETS.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found.");
    return { data: ticket };
}
export const updateTicket = async(ticketId: string, updates: Partial<SupportTicket>): Promise<{data: SupportTicket}> => {
    await apiDelay();
    const ticket = SUPPORT_TICKETS.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found.");
    Object.assign(ticket, updates, { updatedAt: new Date().toISOString() });
    return { data: ticket };
}
export const addTicketReply = async(ticketId: string, content: string, isInternalNote: boolean): Promise<{ data: TicketReply }> => {
    await apiDelay();
    const ticket = SUPPORT_TICKETS.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found.");
    const admin = USERS.find(u => u.id === 'admin_1')!;
    const reply: TicketReply = {
        id: randomId('reply'),
        authorId: admin.id,
        authorName: admin.username,
        content,
        createdAt: new Date().toISOString(),
        isInternalNote
    };
    ticket.replies.push(reply);
    ticket.updatedAt = new Date().toISOString();
    return { data: reply };
}
export const getEmailTemplates = async (): Promise<{ data: EmailTemplate[] }> => {
    await apiDelay();
    if(EMAIL_TEMPLATES.length === 0) {
        EMAIL_TEMPLATES = [{id: 'tpl_1', name: 'Welcome Email', subject: 'Welcome to the Casino!', body: 'Hello {{username}}, welcome!', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}];
    }
    return { data: EMAIL_TEMPLATES };
}

export const deleteEmailTemplate = async (id: string): Promise<{message: string}> => {
    await apiDelay();
    EMAIL_TEMPLATES = EMAIL_TEMPLATES.filter(t => t.id !== id);
    return { message: "Template deleted." };
}

export const updateEmailTemplate = async (id: string, data: Partial<EmailTemplate>): Promise<{data: EmailTemplate}> => {
    await apiDelay();
    let tpl = EMAIL_TEMPLATES.find(t => t.id === id);
    if (!tpl) throw new Error("Template not found");
    Object.assign(tpl, data, { updatedAt: new Date().toISOString() });
    return { data: tpl };
}
export const createEmailTemplate = async (data: Omit<EmailTemplate, 'id'|'createdAt'|'updatedAt'>): Promise<{data: EmailTemplate}> => {
    await apiDelay();
    const newTpl: EmailTemplate = { ...data, id: randomId('tpl'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    EMAIL_TEMPLATES.push(newTpl);
    return { data: newTpl };
}
export const getAllGamingActivities = async (): Promise<{ data: GamingActivity[] }> => {
    await apiDelay();
    return { data: GAMING_ACTIVITIES };
}
export const getWhitelistedIPs = async (): Promise<{ data: IPWhitelistEntry[] }> => {
    await apiDelay();
    if (IP_WHITELIST.length === 0) {
        IP_WHITELIST.push({ id: randomId('ip'), ipAddress: '127.0.0.1', description: 'Localhost' });
    }
    return { data: IP_WHITELIST };
}
export const addWhitelistedIP = async(ipAddress: string, description: string): Promise<{data: IPWhitelistEntry}> => {
    await apiDelay();
    const entry: IPWhitelistEntry = { id: randomId('ip'), ipAddress, description };
    IP_WHITELIST.push(entry);
    return { data: entry };
}
export const removeWhitelistedIP = async(id: string): Promise<{message: string}> => {
    await apiDelay();
    IP_WHITELIST = IP_WHITELIST.filter(ip => ip.id !== id);
    return { message: 'IP Removed' };
}

export const getABTests = async (): Promise<{ data: ABTest[] }> => {
    await apiDelay();
    if (AB_TESTS.length === 0) {
        AB_TESTS.push({
            id: 'ab_1',
            name: 'New User Welcome Bonus',
            status: 'Running',
            variants: [
                { name: 'Control (100% Match)', users: 1024, conversionRate: 0.25 },
                { name: 'Variant A (200 Free Spins)', users: 1012, conversionRate: 0.28 }
            ]
        });
    }
    return { data: AB_TESTS };
}
export const toggle2FA = async (userId: string, enable: boolean): Promise<{ message: string }> => {
    await apiDelay();
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.has2FA = enable;
    return { message: `2FA has been ${enable ? 'enabled' : 'disabled'}.` };
}

export const getIntegrations = async (): Promise<{ data: Integration[] }> => {
    await apiDelay();
    if (INTEGRATIONS.length === 0) {
        INTEGRATIONS = [
            { id: 'sendgrid', name: 'SendGrid', description: 'Email delivery service.', iconUrl: 'https://ui-avatars.com/api/?name=SG', isConnected: true },
            { id: 'twilio', name: 'Twilio', description: 'SMS and voice service.', iconUrl: 'https://ui-avatars.com/api/?name=TW', isConnected: false },
            { id: 'slack', name: 'Slack', description: 'Team communication.', iconUrl: 'https://ui-avatars.com/api/?name=SL', isConnected: true },
        ]
    }
    return { data: INTEGRATIONS };
}
export const updateIntegration = async (id: Integration['id'], isConnected: boolean): Promise<{ data: Integration }> => {
    await apiDelay();
    const integration = INTEGRATIONS.find(i => i.id === id);
    if (!integration) throw new Error("Integration not found");
    integration.isConnected = isConnected;
    return { data: integration };
}
export const getApiKeys = async (): Promise<{ data: ApiKey[] }> => {
    await apiDelay();
    if (API_KEYS.length === 0) {
        API_KEYS.push({ id: randomId('key'), key: randomId('secret'), description: 'Initial Key', createdAt: new Date().toISOString(), lastUsedAt: null, createdBy: 'admin_1' });
    }
    return { data: API_KEYS };
}
export const createApiKey = async (description: string): Promise<{ data: ApiKey }> => {
    await apiDelay();
    const key: ApiKey = { id: randomId('key'), key: randomId('secret'), description, createdAt: new Date().toISOString(), lastUsedAt: null, createdBy: 'admin_1' };
    API_KEYS.push(key);
    return { data: key };
}
export const revokeApiKey = async (keyId: string): Promise<{ message: string }> => {
    await apiDelay();
    API_KEYS = API_KEYS.filter(k => k.id !== keyId);
    return { message: 'API Key revoked.' };
}

export const getLoyaltyTiers = async (): Promise<{ data: LoyaltyTier[] }> => {
    await apiDelay();
    return { data: LOYALTY_TIERS };
}
export const getUserBonuses = async (userId: string): Promise<{ data: Bonus[] }> => {
    await apiDelay();
    return { data: BONUSES.filter(b => b.userId === userId) };
}

export const grantBonus = async (userId: string, type: Bonus['type'], amount: number, reason: string): Promise<{ data: Bonus }> => {
    await apiDelay();
    const bonus: Bonus = {
        id: randomId('bonus'),
        userId,
        type,
        amount,
        reason,
        grantedAt: new Date().toISOString(),
        adminUsername: 'superadmin'
    };
    BONUSES.push(bonus);
    return { data: bonus };
}
export const getRiskAssessmentForUser = async (userId: string): Promise<{ data: RiskAssessment }> => {
    await apiDelay();
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    // Mock assessment
    const score = user.isHighRisk ? 85 : Math.floor(Math.random() * 60);
    let level: RiskAssessment['level'] = 'Low';
    if (score > 80) level = 'Critical';
    else if (score > 60) level = 'High';
    else if (score > 30) level = 'Medium';
    
    const factors = [];
    if (user.isHighRisk) factors.push({id: 'f1', description: 'Multiple accounts from same IP.', severity: 3});

    const assessment: RiskAssessment = { userId, score, level, factors, assessedAt: new Date().toISOString() };
    return { data: assessment };
}
export const exportUserData = async (userId: string): Promise<{ data: { userData: any } }> => {
    await apiDelay();
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    return { data: { userData: user } };
}
export const anonymizeUser = async (userId: string): Promise<{ message: string }> => {
    await apiDelay();
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.email = `${user.id}@anonymous.com`;
    user.username = `anonymous_${user.id.split('_')[1]}`;
    user.fullName = 'Anonymous User';
    user.phone = '';
    user.status = 'anonymized';
    return { message: 'User has been anonymized.' };
}
export const getAffiliates = async (): Promise<{data: Affiliate[]}> => {
    await apiDelay();
    if (AFFILIATES.length === 0) {
        AFFILIATES = [
            { id: 'aff_1', name: 'Casino Masters', commissionRate: 0.3, referredUsersCount: 120, totalCommissionEarned: 15000 },
            { id: 'aff_2', name: 'Bet Buddies', commissionRate: 0.25, referredUsersCount: 80, totalCommissionEarned: 8500 },
        ]
    }
    return { data: AFFILIATES };
}
export const getAchievements = async (): Promise<{data: Achievement[]}> => {
    await apiDelay();
     if (ACHIEVEMENTS.length === 0) {
        ACHIEVEMENTS = [
            { id: 'ach_1', name: 'First Deposit', description: 'Made your first deposit.', icon: 'star' },
            { id: 'ach_2', name: 'Big Winner', description: 'Won over $1000 in a single bet.', icon: 'diamond' },
            { id: 'ach_3', name: 'Loyal Player', description: 'Logged in for 7 consecutive days.', icon: 'heart' }
        ]
    }
    return { data: ACHIEVEMENTS };
}
export const getMissions = async (): Promise<{data: Mission[]}> => {
    await apiDelay();
    if (MISSIONS.length === 0) {
        MISSIONS = [
            { id: 'mis_1', title: 'Spin Master', description: 'Play 100 spins on any slot game.', reward: '50 Free Spins', isActive: true },
            { id: 'mis_2', title: 'Weekend Warrior', description: 'Deposit $100 over the weekend.', reward: '$20 Bonus Cash', isActive: true },
        ]
    }
    return { data: MISSIONS };
}
export const getPromotions = async (): Promise<{data: Promotion[]}> => {
    await apiDelay();
    if(PROMOTIONS.length === 0) {
        PROMOTIONS = [
            {id: 'promo_1', name: 'Welcome Bonus', description: '100% match on first deposit', type: 'Deposit Match', startDate: new Date(Date.now() - 86400000 * 10).toISOString(), endDate: new Date(Date.now() + 86400000 * 20).toISOString(), status: 'Active' },
            {id: 'promo_2', name: 'Summer Spins', description: '50 free spins on weekends', type: 'Free Spins Offer', startDate: new Date(Date.now() + 86400000 * 5).toISOString(), endDate: new Date(Date.now() + 86400000 * 35).toISOString(), status: 'Scheduled' },
        ];
    }
    return { data: PROMOTIONS };
}
export const createPromotion = async(data: Omit<Promotion, 'id'>): Promise<{data: Promotion}> => {
    await apiDelay();
    const newPromo = { ...data, id: randomId('promo') };
    PROMOTIONS.push(newPromo);
    return { data: newPromo };
}
export const updatePromotion = async(id: string, data: Partial<Promotion>): Promise<{data: Promotion}> => {
    await apiDelay();
    const promo = PROMOTIONS.find(p => p.id === id);
    if (!promo) throw new Error("Promotion not found.");
    Object.assign(promo, data);
    return { data: promo };
}
export const deletePromotion = async(id: string): Promise<{message: string}> => {
    await apiDelay();
    PROMOTIONS = PROMOTIONS.filter(p => p.id !== id);
    return { message: "Promotion deleted" };
}
export const createUserByAdmin = async (email: string, username: string, fullName: string, password: string): Promise<{data: User}> => {
    await apiDelay();
    const { data } = await register(email, username, fullName, password);
    return getUserById(data.userId);
}

export const getAllWorkflowRules = async(): Promise<{data: WorkflowRule[]}> => {
    await apiDelay();
     if (WORKFLOW_RULES.length === 0) {
        WORKFLOW_RULES = [
            { id: 'wf_1', name: 'High Roller Alert', description: 'Notify admins on large deposits.', trigger: 'User deposits > $1000', action: 'Send email to risk team', isEnabled: true },
            { id: 'wf_2', name: 'Inactive User Nudge', description: 'Send a bonus to users inactive for 14 days.', trigger: 'User inactive for 14 days', action: 'Grant 20 Free Spins bonus', isEnabled: false }
        ]
    }
    return { data: WORKFLOW_RULES };
}

export const updateWorkflowRule = async(ruleId: string, updates: Partial<WorkflowRule>): Promise<{data: WorkflowRule}> => {
    await apiDelay();
    const rule = WORKFLOW_RULES.find(r => r.id === ruleId);
    if (!rule) throw new Error("Workflow not found.");
    Object.assign(rule, updates);
    return { data: rule };
}
export const getAllTasks = async(): Promise<{data: Task[]}> => {
    await apiDelay();
     if (TASKS.length === 0) {
        TASKS = [
            { id: 'task_1', title: 'Follow up on KYC for Player_5', relatedUserId: 'user_5', relatedUserUsername: 'Player5', assignedToAdminId: 'admin_1', assignedToAdminUsername: 'superadmin', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'In Progress' },
            { id: 'task_2', title: 'Review high-risk activity for Player_12', relatedUserId: 'user_12', relatedUserUsername: 'Player12', assignedToAdminId: 'admin_1', assignedToAdminUsername: 'superadmin', dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'To Do' }
        ]
    }
    return { data: TASKS };
}
export const getTasksForUser = async(userId: string): Promise<{data: Task[]}> => {
    await apiDelay();
    return { data: TASKS.filter(t => t.relatedUserId === userId) };
}
export const updateTask = async(taskId: string, updates: Partial<Task>): Promise<{data: Task}> => {
    await apiDelay();
    const task = TASKS.find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");
    Object.assign(task, updates);
    return { data: task };
}

export const getFinancialTransactions = async (type: 'deposit' | 'withdrawal'): Promise<{ data: GamingActivity[] }> => {
    await apiDelay();
    return { data: GAMING_ACTIVITIES.filter(a => a.type === type).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
};

export const updateTransactionStatus = async (transactionId: string, status: 'completed' | 'rejected'): Promise<{ data: GamingActivity }> => {
    await apiDelay();
    const transaction = GAMING_ACTIVITIES.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found.');
    transaction.status = status;
    return { data: transaction };
};