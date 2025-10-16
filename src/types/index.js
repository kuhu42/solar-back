// User roles and status types
export const USER_ROLES = {
  COMPANY: 'company',
  AGENT: 'agent',
  FREELANCER: 'freelancer',
  INSTALLER: 'installer',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  INACTIVE: 'inactive'
};

// Enhanced project statuses to support both flows
export const PROJECT_STATUS = {
  // Common statuses
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold',
  
  // Flow #2: Freelancer -> Agent -> Admin
  PENDING_AGENT_REVIEW: 'pending_agent_review',
  AGENT_APPROVED: 'agent_approved',
  PENDING_ADMIN_REVIEW: 'pending_admin_review',
  ADMIN_REJECTED: 'admin_rejected',
  AGENTAPPROVED: 'agent_approved',
PENDINGADMINREVIEW: 'pending_admin_review',
  
  // Flow #1: Admin creates directly
  ADMIN_CREATED: 'admin_created',
  READY_FOR_ASSIGNMENT: 'ready_for_assignment'
};

// Enhanced pipeline stages to support both flows
export const PIPELINE_STAGES = {
 LEAD_GENERATED: 'lead_generated',
  QUOTATION_GENERATED: 'quotation_generated', 
  BANK_PROCESS: 'bank_process',
  PAYMENT_70_DONE: 'payment_70_done',
  READY_FOR_INSTALLATION: 'ready_for_installation',
  INSTALLATION_DONE: 'installation_done',
  METER_APPLIED: 'meter_applied', 
  PAYMENT_30_DONE: 'payment_30_done',
  COMPLETED: 'completed',
  ACTIVATED: 'activated',
  ON_HOLD: 'on_hold',  // ✅ NEW
  PENDING: 'pending',
  
  // Flow #2 specific stages
  FREELANCER_CREATED: 'freelancer_created',
  AGENT_APPROVED: 'agent_approved',
  PENDING_ADMIN_REVIEW: 'pending_admin_review',
  
  // Flow #1 specific stages
  ADMIN_CREATED: 'admin_created',
  AGENT_ASSIGNED: 'agent_assigned',
  INSTALLER_ASSIGNED: 'installer_assigned'
};
export const STAGE_PERMISSIONS = {
  company: [
    'lead_generated', 'quotation_generated', 'bank_process', 'payment_70_done',
    'ready_for_installation', 'installation_done', 'meter_applied', 'payment_30_done',
    'completed', 'activated','on_hold', 'pending'
  ],
  agent: [
    'lead_generated', 'quotation_generated', 'bank_process', 'payment_70_done',
    'ready_for_installation'
  ]
};

export const STAGE_LABELS = {
  lead_generated: 'Lead Generated',
  quotation_generated: 'Quotation Generated',
  bank_process: 'Bank Process',
  payment_70_done: '70% Payment Done',
  ready_for_installation: 'Ready for Installation',
  installation_done: 'Installation Done',
  meter_applied: 'Meter Applied',
  payment_30_done: '30% Payment Done',
  completed: 'Completed',
  activated: 'Activated',
  on_hold: 'On Hold',  // ✅ NEW
  pending: 'Pending'
};

export const STAGE_COLORS = {
  lead_generated: 'bg-blue-100 text-blue-800',
  quotation_generated: 'bg-indigo-100 text-indigo-800',
  bank_process: 'bg-purple-100 text-purple-800',
  payment_70_done: 'bg-green-100 text-green-800',
  ready_for_installation: 'bg-yellow-100 text-yellow-800',
  installation_done: 'bg-orange-100 text-orange-800',
  meter_applied: 'bg-pink-100 text-pink-800',
  payment_30_done: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-teal-100 text-teal-800',
  activated: 'bg-green-200 text-green-900',
   on_hold: 'bg-red-100 text-red-800',      // ✅ NEW
  pending: 'bg-yellow-100 text-yellow-800'
};

// Project creation source/flow tracking
export const PROJECT_SOURCE = {
  FREELANCER: 'freelancer',
  ADMIN: 'admin',
  AGENT: 'agent'
};

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

export const INVENTORY_STATUS = {
  IN_STOCK: 'in_stock',
  ASSIGNED: 'assigned',
  INSTALLED: 'installed',
  MAINTENANCE: 'maintenance',
  DECOMMISSIONED: 'decommissioned'
};

export const INVENTORY_COMPANIES = {
  TATA_SOLAR: 'tata_solar',
  ADANI_SOLAR: 'adani_solar',
  VIKRAM_SOLAR: 'vikram_solar',
  WAAREE_ENERGIES: 'waaree_energies',
  LUMINOUS: 'luminous',
  EXIDE: 'exide',
  HAVELLS: 'havells',
  MICROTEK: 'microtek',
  SUKAM: 'sukam'
};

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUOTED: 'quoted',
  CONVERTED: 'converted',
  LOST: 'lost'
};

export const COMPLAINT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue'
};