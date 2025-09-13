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
  
  // Flow #2: Freelancer -> Agent -> Admin
  PENDING_AGENT_REVIEW: 'pending_agent_review',
  AGENT_APPROVED: 'agent_approved',
  PENDING_ADMIN_REVIEW: 'pending_admin_review',
  ADMIN_REJECTED: 'admin_rejected',
  
  // Flow #1: Admin creates directly
  ADMIN_CREATED: 'admin_created',
  READY_FOR_ASSIGNMENT: 'ready_for_assignment'
};

// Enhanced pipeline stages to support both flows
export const PIPELINE_STAGES = {
  // Common stages
  LEAD_GENERATED: 'lead_generated',
  QUOTATION_SENT: 'quotation_sent',
  BANK_PROCESS: 'bank_process',
  METER_APPLIED: 'meter_applied',
  READY_FOR_INSTALLATION: 'ready_for_installation',
  INSTALLATION_COMPLETE: 'installation_complete',
  COMMISSIONED: 'commissioned',
  ACTIVE: 'active',
  
  // Flow #2 specific stages
  FREELANCER_CREATED: 'freelancer_created',
  AGENT_APPROVED: 'agent_approved',
  PENDING_ADMIN_REVIEW: 'pending_admin_review',
  
  // Flow #1 specific stages
  ADMIN_CREATED: 'admin_created',
  AGENT_ASSIGNED: 'agent_assigned',
  INSTALLER_ASSIGNED: 'installer_assigned'
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