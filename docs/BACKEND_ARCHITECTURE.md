# GreenSolar Backend Architecture

## Overview
Complete Supabase integration with demo mode fallback for the GreenSolar Field Service Management system.

## Database Schema

### Core Tables

#### user_profiles
- **Purpose**: Extended user data beyond auth.users
- **Key Fields**: phone (unique), role, status, customer_ref_number
- **RLS**: Users can view/edit own profile, admin can manage all

#### projects
- **Purpose**: Solar/wind installation projects
- **Key Fields**: customer_ref_number, pipeline_stage, assigned_to, serial_numbers
- **RLS**: Customers see own projects, staff see assigned projects, admin sees all

#### tasks
- **Purpose**: Installation/maintenance work items
- **Key Fields**: project_id, assigned_to, status, type, completion_data
- **RLS**: Assigned users can view/update, customers can view project tasks

#### leads
- **Purpose**: Sales opportunities
- **Key Fields**: assigned_to, status, estimated_value, source
- **RLS**: Freelancers/agents can manage assigned leads

#### complaints
- **Purpose**: Customer service tickets
- **Key Fields**: customer_id, assigned_to, priority, resolution_notes
- **RLS**: Customers can create, technicians can resolve

#### attendance
- **Purpose**: Staff check-in/out with GPS
- **Key Fields**: user_id, date, check_in, check_out, coordinates
- **RLS**: Users manage own attendance, admin views all

#### inventory
- **Purpose**: Equipment tracking
- **Key Fields**: serial_number (unique), type, status, project_id
- **RLS**: All authenticated users can view, admin can manage

#### invoices & invoice_items
- **Purpose**: Billing system
- **Key Fields**: customer_id, project_id, invoice_number, total_amount
- **RLS**: Customers see own invoices, admin manages all

#### commissions
- **Purpose**: Freelancer earnings tracking
- **Key Fields**: freelancer_id, commission_type, commission_amount
- **RLS**: Freelancers see own commissions, admin manages all

### Storage Buckets
- **documents**: PDFs, certificates, contracts
- **photos**: Installation photos, complaint evidence
- **avatars**: User profile pictures (public)

## Authentication Flow

### Demo Mode
```javascript
// Quick login with predefined users
const loginDemo = (email) => {
  const user = DEMO_USERS[email];
  setCurrentUser(user);
  return user;
};
```

### Live Mode - Phone OTP
```javascript
// 1. Send OTP to phone
const { otp } = await authService.signUpWithPhone(phone, userData);

// 2. Verify OTP and create session
const { user } = await authService.verifyOTP(phone, otp);

// 3. Create/update user profile
await authService.createUserProfile(user.id, profileData);
```

### Live Mode - Email/Password (for existing users)
```javascript
const { user } = await authService.signIn(email, password);
const profile = await authService.getUserProfileById(user.id);
```

## State Management Patterns

### Dual Mode Context
```javascript
const AppContext = {
  isLiveMode: boolean,
  currentUser: User | null,
  // ... data arrays
  
  // Mode switching
  toggleMode: (isLive) => void,
  
  // Unified CRUD (works in both modes)
  addLead: (data) => Promise<Lead>,
  updateProject: (id, updates) => Promise<Project>,
  // ... other operations
};
```

### Real-time Subscriptions (Live Mode Only)
```javascript
useEffect(() => {
  if (!isLiveMode) return;
  
  const subscription = dbService.subscribeToTable('projects', (payload) => {
    dispatch({
      type: 'REALTIME_UPDATE',
      payload: { table: 'projects', ...payload }
    });
  });
  
  return () => subscription.unsubscribe();
}, [isLiveMode]);
```

### Demo State Management
```javascript
// Centralized demo state with event simulation
const demoStateManager = new DemoStateManager();

// Simulate async operations
await demoWorkflows.progressProject(projectId, 'installation_complete');
await demoWorkflows.completeTask(taskId, completionData);
```

## Key Workflows

### 1. User Registration & Approval
```javascript
// Customer (auto-approved)
await authService.signUpWithPhone(phone, { role: 'customer' });
await authService.updateUserProfile(userId, { status: 'active' });

// Professional (needs approval)
await authService.signUpWithPhone(phone, { role: 'installer' });
// Status remains 'pending' until admin approval
await dbService.updateUserProfile(userId, { status: 'active', role: 'installer' });
```

### 2. Project Lifecycle
```javascript
// Lead → Project conversion
await dbService.updateLead(leadId, { status: 'converted' });
await dbService.createProject(projectData);

// Pipeline progression
await dbService.updateProject(projectId, { 
  pipeline_stage: 'installation_complete' 
});

// Task assignment and completion
await dbService.createTask(taskData);
await dbService.updateTask(taskId, { 
  status: 'completed',
  completion_data: { photos, notes }
});
```

### 3. File Upload & Document Management
```javascript
// Upload with metadata
const document = await dbService.uploadDocument(file, {
  type: 'certificate',
  projectId,
  customerId,
  uploadedBy: currentUser.id
});

// Get file URL
const url = await dbService.getFileUrl('documents', document.file_path);
```

### 4. Real-time Notifications
```javascript
// Auto-triggered by database triggers
CREATE TRIGGER notify_task_assignment
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assignment();

// Frontend subscription
const { notifications, unreadCount } = useNotifications(currentUser.id);
```

### 5. Commission Calculation
```javascript
// Auto-triggered when lead converts
CREATE TRIGGER trigger_lead_conversion
  AFTER UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION handle_lead_conversion();

// Manual commission creation
await dbService.calculateCommission(freelancerId, leadId, 'lead_conversion');
```

## Security (RLS Policies)

### Role-based Access
```sql
-- Users can only see own data
CREATE POLICY "users_own_data" ON user_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id);

-- Admin can see everything
CREATE POLICY "admin_all_access" ON user_profiles
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Project access based on relationship
CREATE POLICY "project_access" ON projects
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    is_admin(auth.uid())
  );
```

### Data Isolation
- Customers only see their own projects/complaints/invoices
- Staff only see assigned tasks/projects
- Freelancers only see their leads/commissions
- Admin has full access with audit logging

## File Organization

```
src/
├── lib/
│   ├── supabase.js          # Database service layer
│   ├── auth.js              # Authentication service
│   └── storage.js           # File upload utilities
├── hooks/
│   ├── useSupabaseData.js   # Real-time data hooks
│   ├── useFileUpload.js     # File upload hook
│   └── useNotifications.js  # Real-time notifications
├── utils/
│   ├── demoMode.js          # Demo state management
│   └── workflows.js         # Business logic workflows
├── context/
│   └── AppContext.jsx       # Unified state management
└── components/
    ├── Auth/                # Authentication components
    ├── Dashboard/           # Role-specific dashboards
    ├── Common/              # Shared components
    └── Layout/              # App layout with mode toggle
```

## Setup Checklist

### Supabase Configuration
- [ ] Create new Supabase project
- [ ] Run migration files in order
- [ ] Configure storage buckets
- [ ] Set up authentication providers
- [ ] Configure RLS policies
- [ ] Test demo user creation

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Demo Mode Setup
- [ ] Initialize demo state manager
- [ ] Create mock data generators
- [ ] Set up workflow simulators
- [ ] Test mode switching

### Production Considerations
- [ ] Integrate real SMS service for OTP
- [ ] Set up file upload limits and validation
- [ ] Configure backup and monitoring
- [ ] Implement proper error handling
- [ ] Add rate limiting for API calls

## Best Practices

### Code Quality
- Modular service layer with clear separation
- Consistent error handling across all operations
- Type safety with TypeScript interfaces
- Comprehensive testing for both modes

### Security
- All sensitive operations use RLS policies
- File uploads are validated and scanned
- User input is sanitized
- Audit logging for admin actions

### Performance
- Efficient database queries with proper indexing
- Real-time subscriptions only for necessary data
- Lazy loading for large datasets
- Optimistic updates for better UX

### Maintainability
- Clear separation between demo and live logic
- Consistent naming conventions
- Comprehensive documentation
- Easy onboarding for new developers

## Testing Strategy

### Demo Mode Testing
- All workflows work without backend
- Mock data is realistic and comprehensive
- Easy switching between user roles
- Simulated delays for realistic UX

### Live Mode Testing
- Database operations work correctly
- Real-time updates function properly
- File uploads and downloads work
- RLS policies enforce correct access

### Integration Testing
- Mode switching preserves state correctly
- Authentication flows work in both modes
- Error handling is consistent
- Performance is acceptable under load