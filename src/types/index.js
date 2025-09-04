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
  REJECTED: 'rejected'
};

export const PROJECT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
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

export const PROJECT_WORKFLOW_STATUS = {
  COMPLAINT_LOGGED: 'complaint_logged',
  ADMIN_REVIEW: 'admin_review',
  AGENT_ASSIGNED: 'agent_assigned',
  INSTALLER_ASSIGNED: 'installer_assigned',
  OTP_PENDING: 'otp_pending',
  WORK_IN_PROGRESS: 'work_in_progress',
  WORK_COMPLETED: 'work_completed',
  CUSTOMER_VERIFIED: 'customer_verified',
  CLOSED: 'closed'
};

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue'
};