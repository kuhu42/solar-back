import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { dbService, supabase } from '../lib/supabase.js';
import { authService } from '../lib/auth.js';
import { USER_STATUS } from '../types/index.js';
import { 
  mockUsers, 
  mockProjects, 
  mockTasks, 
  mockAttendance, 
  mockInventory, 
  mockLeads, 
  mockComplaints, 
  mockInvoices, 
  mockNotifications 
} from '../data/mockData.js';

const AppContext = createContext();

const initialState = {
  currentUser: null,
  users: [],
  projects: [],
  tasks: [],
  attendance: [],
  inventory: [],
  leads: [],
  complaints: [],
  invoices: [],
  notifications: [],
  commissions: [],
  loading: false,
  error: null,
  isLiveMode: dbService.isAvailable(), // Auto-detect based on Supabase availability
  realTimeSubscriptions: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LIVE_MODE':
      return { ...state, isLiveMode: action.payload };
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.payload };
    
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    
    case 'SET_LEADS':
      return { ...state, leads: action.payload };
    
    case 'SET_COMPLAINTS':
      return { ...state, complaints: action.payload };
    
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'SET_COMMISSIONS':
      return { ...state, commissions: action.payload };
    
    case 'LOGOUT':
      return { 
        ...state, 
        currentUser: null,
        realTimeSubscriptions: []
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_SUBSCRIPTION':
      return { 
        ...state, 
        realTimeSubscriptions: [...state.realTimeSubscriptions, action.payload] 
      };
    
    case 'CLEAR_SUBSCRIPTIONS':
      return { ...state, realTimeSubscriptions: [] };
    
    // Real-time updates
    case 'REALTIME_UPDATE':
      const { table, eventType, record } = action.payload;
      
      switch (table) {
        case 'projects':
          if (eventType === 'INSERT') {
            return { ...state, projects: [record, ...state.projects] };
          } else if (eventType === 'UPDATE') {
            return {
              ...state,
              projects: state.projects.map(p => p.id === record.id ? record : p)
            };
          } else if (eventType === 'DELETE') {
            return {
              ...state,
              projects: state.projects.filter(p => p.id !== record.id)
            };
          }
          break;
        
        case 'tasks':
          if (eventType === 'INSERT') {
            return { ...state, tasks: [record, ...state.tasks] };
          } else if (eventType === 'UPDATE') {
            return {
              ...state,
              tasks: state.tasks.map(t => t.id === record.id ? record : t)
            };
          }
          break;
        
        case 'inventory':
          if (eventType === 'UPDATE') {
            return {
              ...state,
              inventory: state.inventory.map(i => i.id === record.id ? record : i)
            };
          }
          break;
        
        case 'notifications':
          if (eventType === 'INSERT') {
            return { ...state, notifications: [record, ...state.notifications] };
          } else if (eventType === 'UPDATE') {
            return {
              ...state,
              notifications: state.notifications.map(n => n.id === record.id ? record : n)
            };
          }
          break;
        
        default:
          return state;
      }
      return state;
    
    // Legacy actions for demo mode
    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, status: action.payload.status, role: action.payload.role || user.role }
            : user
        )
      };
    
    case 'ADD_ATTENDANCE':
      return {
        ...state,
        attendance: [...state.attendance, action.payload]
      };
    
    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendance: state.attendance.map(att =>
          att.id === action.payload.id ? { ...att, ...action.payload } : att
        )
      };
    
    case 'UPDATE_PROJECT_STATUS':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { ...project, status: action.payload.status }
            : project
        )
      };
    
    case 'UPDATE_PROJECT_PIPELINE':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { ...project, pipelineStage: action.payload.pipelineStage }
            : project
        )
      };
    
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, status: action.payload.status, ...action.payload.updates }
            : task
        )
      };
    
    case 'ADD_LEAD':
      return {
        ...state,
        leads: [...state.leads, action.payload]
      };
    
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead =>
          lead.id === action.payload.id ? { ...lead, ...action.payload.updates } : lead
        )
      };
    
    case 'ADD_COMPLAINT':
      return {
        ...state,
        complaints: [...state.complaints, action.payload]
      };
    
    case 'UPDATE_COMPLAINT_STATUS':
      return {
        ...state,
        complaints: state.complaints.map(complaint =>
          complaint.id === action.payload.complaintId
            ? { ...complaint, status: action.payload.status }
            : complaint
        )
      };

    // NEW PROJECT WORKFLOW ACTIONS
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects]
      };

    case 'ASSIGN_INSTALLER_TO_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                installerId: action.payload.installerId,
                installerName: action.payload.installerName,
                installerAssigned: true
              }
            : project
        )
      };

    case 'MARK_INSTALLATION_COMPLETE':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                installationComplete: action.payload.installationComplete,
                installerNotes: action.payload.installerNotes,
                completionDate: action.payload.completionDate
              }
            : project
        )
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks]
      };

    case 'UPDATE_INVENTORY_STATUS':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.serialNumber === action.payload.serialNumber
            ? { ...item, status: action.payload.status, ...action.payload.updates }
            : item
        )
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth and load data
  useEffect(() => {
    initializeAuth();
    if (state.isLiveMode && dbService.isAvailable()) {
      loadLiveData();
      setupRealTimeSubscriptions();
    } else {
      loadDemoData();
    }

    return () => {
      // Cleanup subscriptions
      state.realTimeSubscriptions.forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    };
  }, [state.isLiveMode]);

  const initializeAuth = async () => {
    if (!dbService.isAvailable()) {
      console.log('Running in demo mode - Supabase not configured');
      return;
    }
    
    try {
      // Check for existing session
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getUserProfileById(session.user.id);
        if (profile) {
          dispatch({ type: 'SET_CURRENT_USER', payload: profile });
        }
      }

      // Listen for auth changes
      // In your initializeAuth function, add data loading after successful login
authService.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const profile = await authService.getUserProfileById(session.user.id);
    if (profile) {
      dispatch({ type: 'SET_CURRENT_USER', payload: profile });
      
      // Add this: Force reload data after login
      if (state.isLiveMode) {
        await loadLiveData();
      }
      
      // Track login event
      if (state.isLiveMode) {
        await dbService.trackEvent('user_login', {
          userId: profile.id,
          role: profile.role
        });
      }
    }
  } else if (event === 'SIGNED_OUT') {
    dispatch({ type: 'LOGOUT' });
    dispatch({ type: 'CLEAR_SUBSCRIPTIONS' });
  }
});
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  };

// Replace your loadLiveData function in AppContext.jsx with this version:

// Replace your deactivateUser and reactivateUser functions in AppContext.jsx with these corrected versions:

const deactivateUser = async (userId) => {
  try {
    if (state.isLiveMode) {  // Changed from isLiveMode to state.isLiveMode
      await authService.deactivateUser(userId);
      // Reload users to get updated data
      const updatedUsers = await dbService.getUserProfiles();
      dispatch({ type: 'SET_USERS', payload: updatedUsers });
    } else {
      // Demo mode - just update local state
      dispatch({
        type: 'UPDATE_USER_STATUS',
        payload: { userId, status: 'inactive' }
      });
    }
  } catch (error) {
    console.error('Failed to deactivate user:', error);
    throw error;
  }
};

const reactivateUser = async (userId) => {
  try {
    if (state.isLiveMode) {  // Changed from isLiveMode to state.isLiveMode
      await authService.reactivateUser(userId);
      // Reload users to get updated data
      const updatedUsers = await dbService.getUserProfiles();
      dispatch({ type: 'SET_USERS', payload: updatedUsers });
    } else {
      // Demo mode - just update local state
      dispatch({
        type: 'UPDATE_USER_STATUS',
        payload: { userId, status: 'active' }
      });
    }
  } catch (error) {
    console.error('Failed to reactivate user:', error);
    throw error;
  }
};
const loadLiveData = async () => {
  if (!dbService.isAvailable()) {
    console.warn('Supabase not available - staying in demo mode');
    dispatch({ type: 'SET_ERROR', payload: 'Supabase not configured. Please check your environment variables.' });
    loadDemoData();
    return;
  }
  
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    console.log('🔄 Loading LIVE data from Supabase...');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }
    
    console.log('✅ Supabase connection successful');
    
    const [
      users, projects, tasks, attendance, inventory, 
      leads, complaints, invoices, commissions
    ] = await Promise.all([
      dbService.getUserProfiles(),
      dbService.getProjects(),
      dbService.getTasks(),
      dbService.getAttendance(),
      dbService.getInventory(),
      dbService.getLeads(),
      dbService.getComplaints(),
      dbService.getInvoices(),
      dbService.getCommissions()
    ]);

    console.log('📊 Live data loaded:', {
      users: users?.length || 0,
      projects: projects?.length || 0,
      tasks: tasks?.length || 0,
      attendance: attendance?.length || 0,
      inventory: inventory?.length || 0,
      leads: leads?.length || 0,
      complaints: complaints?.length || 0,
      invoices: invoices?.length || 0,
      commissions: commissions?.length || 0
    });

    dispatch({ type: 'SET_USERS', payload: users || [] });
    dispatch({ type: 'SET_PROJECTS', payload: projects || [] });
    dispatch({ type: 'SET_TASKS', payload: tasks || [] });
    dispatch({ type: 'SET_ATTENDANCE', payload: attendance || [] });
    dispatch({ type: 'SET_INVENTORY', payload: inventory || [] });
    dispatch({ type: 'SET_LEADS', payload: leads || [] });
    dispatch({ type: 'SET_COMPLAINTS', payload: complaints || [] });
    dispatch({ type: 'SET_INVOICES', payload: invoices || [] });
    dispatch({ type: 'SET_COMMISSIONS', payload: commissions || [] });

    // Load notifications for current user
    if (state.currentUser) {
      const notifications = await dbService.getNotifications(state.currentUser.id);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications || [] });
    }
    
    dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors
    console.log('✅ Live mode fully loaded - NO DEMO DATA');
    
  } catch (error) {
    console.error('❌ Live data loading failed:', error);
    dispatch({ type: 'SET_ERROR', payload: `Live mode failed: ${error.message}. Switch to Demo mode to continue.` });
    
    // DON'T fallback to demo data - force user to choose
    dispatch({ type: 'SET_USERS', payload: [] });
    dispatch({ type: 'SET_PROJECTS', payload: [] });
    dispatch({ type: 'SET_TASKS', payload: [] });
    dispatch({ type: 'SET_ATTENDANCE', payload: [] });
    dispatch({ type: 'SET_INVENTORY', payload: [] });
    dispatch({ type: 'SET_LEADS', payload: [] });
    dispatch({ type: 'SET_COMPLAINTS', payload: [] });
    dispatch({ type: 'SET_INVOICES', payload: [] });
    dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
    dispatch({ type: 'SET_COMMISSIONS', payload: [] });
    
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

// Also update your loadDemoData function to be more explicit:
const loadDemoData = () => {
  console.log('Loading DEMO data (mock data only)');
  dispatch({ type: 'SET_USERS', payload: mockUsers });
  dispatch({ type: 'SET_PROJECTS', payload: mockProjects });
  dispatch({ type: 'SET_TASKS', payload: mockTasks });
  dispatch({ type: 'SET_ATTENDANCE', payload: mockAttendance });
  dispatch({ type: 'SET_INVENTORY', payload: mockInventory });
  dispatch({ type: 'SET_LEADS', payload: mockLeads });
  dispatch({ type: 'SET_COMPLAINTS', payload: mockComplaints });
  dispatch({ type: 'SET_INVOICES', payload: mockInvoices });
  dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
  dispatch({ type: 'SET_COMMISSIONS', payload: [] });
  dispatch({ type: 'SET_COMPANIES', payload: mockCompanies }); // Add companies
  
  // Group inventory by company for demo mode
  const inventoryGrouped = mockInventory.reduce((acc, item) => {
    const companyName = item.company_name || 'Unknown';
    if (!acc[companyName]) acc[companyName] = [];
    acc[companyName].push(item);
    return acc;
  }, {});
  dispatch({ type: 'SET_INVENTORY_BY_COMPANY', payload: inventoryGrouped });
  
  dispatch({ type: 'SET_ERROR', payload: null });
  console.log('Demo mode loaded - using mock data');
};

  const setupRealTimeSubscriptions = () => {
    if (!state.isLiveMode || !dbService.isAvailable()) return;

    // Subscribe to projects changes
    const projectsSub = dbService.subscribeToTable('projects', (payload) => {
      dispatch({
        type: 'REALTIME_UPDATE',
        payload: {
          table: 'projects',
          eventType: payload.eventType,
          record: payload.new || payload.old
        }
      });
    });

    // Subscribe to tasks changes
    const tasksSub = dbService.subscribeToTable('tasks', (payload) => {
      dispatch({
        type: 'REALTIME_UPDATE',
        payload: {
          table: 'tasks',
          eventType: payload.eventType,
          record: payload.new || payload.old
        }
      });
    });

    // Subscribe to inventory changes
    const inventorySub = dbService.subscribeToTable('inventory', (payload) => {
      dispatch({
        type: 'REALTIME_UPDATE',
        payload: {
          table: 'inventory',
          eventType: payload.eventType,
          record: payload.new || payload.old
        }
      });
    });

    // Subscribe to notifications for current user
    if (state.currentUser) {
      const notificationsSub = dbService.subscribeToTable('notifications', (payload) => {
        if (payload.new?.user_id === state.currentUser.id) {
          dispatch({
            type: 'REALTIME_UPDATE',
            payload: {
              table: 'notifications',
              eventType: payload.eventType,
              record: payload.new || payload.old
            }
          });
        }
      }, { filter: `user_id=eq.${state.currentUser.id}` });

      dispatch({ type: 'ADD_SUBSCRIPTION', payload: notificationsSub });
    }

    dispatch({ type: 'ADD_SUBSCRIPTION', payload: projectsSub });
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: tasksSub });
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: inventorySub });
  };

  // Mode switching
  const toggleMode = async (isLive) => {
    // Only allow live mode if Supabase is available
    if (isLive && !dbService.isAvailable()) {
      showToast('Live mode not available - Supabase not configured', 'error');
      return;
    }
    
    dispatch({ type: 'SET_LIVE_MODE', payload: isLive });
    
    if (isLive) {
      await loadLiveData();
      setupRealTimeSubscriptions();
    } else {
      loadDemoData();
      // Clear subscriptions
      state.realTimeSubscriptions.forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
      dispatch({ type: 'CLEAR_SUBSCRIPTIONS' });
    }
  };

  // Authentication methods
  const setCurrentUser = (user) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  };

const logout = async () => {
  try {
    console.log('AppContext logout called');
    console.log('isLiveMode:', state.isLiveMode);
    
    if (state.isLiveMode) {
      console.log('Calling authService.signOut()');
      await authService.signOut();
      console.log('authService.signOut() completed');
    }
    
    console.log('Dispatching LOGOUT action');
    dispatch({ type: 'LOGOUT' });
    console.log('Logout dispatch completed');
    
  } catch (error) {
    console.error('Logout error in AppContext:', error);
    // Force logout even if auth service fails
    dispatch({ type: 'LOGOUT' });
  }
};

  const loginDemo = (email) => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      return user;
    }
    return null;
  };

  const loginLive = async (email, password) => {
    if (!authService.isAvailable()) {
      throw new Error('Live mode not available - use demo mode');
    }
    
    try {
      const { user } = await authService.signIn(email, password);
      
      if (user) {
        const profile = await authService.getUserProfileById(user.id);
        if (profile) {
          if (profile.status === 'rejected') {
            throw new Error('Your account has been rejected. Please contact support.');
          }
          
          dispatch({ type: 'SET_CURRENT_USER', payload: profile });
          return profile;
        }
      }
    } catch (error) {
      console.error('Live login error:', error);
      throw error;
    }
  };

  // Data management methods
  const createDemoUsers = async () => {
    try {
      const results = await authService.createDemoUsers();
      console.log('Demo users creation results:', results);
      return results;
    } catch (error) {
      console.error('Error creating demo users:', error);
      throw error;
    }
  };

  // NEW PROJECT WORKFLOW METHODS
  const createProject = async (projectData) => {
    if (state.isLiveMode) {
      try {
        const newProject = await dbService.createProject(projectData);
        // Real-time subscription will handle the state update
        return newProject;
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    } else {
      // Demo mode
      const project = {
        id: `project-${Date.now()}`,
        ...projectData,
        createdAt: new Date().toISOString().split('T')[0],
        installerAssigned: false,
        installationComplete: false
      };
      dispatch({ type: 'ADD_PROJECT', payload: project });
      return project;
    }
  };

const assignInstallerToProject = async (projectId, installerId, installerName) => {
  if (state.isLiveMode) {
    try {
      console.log('Direct project update attempt...');
      console.log('Supabase client status:', !!supabase);
      console.log('Project ID:', projectId);
      console.log('Update data:', { installer_id: installerId, installer_name: installerName });
      
      // Test basic connectivity first
      console.log('Testing basic Supabase connectivity...');
      const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();
      
      console.log('Connectivity test result:', { testData, testError });
      
      if (testError) {
        throw new Error(`Connectivity test failed: ${testError.message}`);
      }
      
      console.log('Connectivity OK, proceeding with update...');
      
      // Now try the actual update
      const { data, error } = await supabase
        .from('projects')
        .update({
          installer_id: installerId,
          installer_name: installerName,
          installer_assigned: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      console.log('Update completed - data:', data);
      console.log('Update completed - error:', error);

      if (error) {
        console.error('Direct update error:', error);
        throw error;
      }

      console.log('Direct update success:', data);
      
      // ADD THIS: Update local state immediately
      dispatch({
        type: 'UPDATE_PROJECT_STATUS', 
        payload: { 
          projectId, 
          installer_id: installerId,
          installer_name: installerName,
          installer_assigned: true
        }
      });
      
      // Manually refresh projects state
      const allProjects = await dbService.getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: allProjects });
      
      return data;
    } catch (error) {
      console.error('Direct assignment error:', error);
      throw error;
    }
  } else {
    // Demo mode
    dispatch({
      type: 'ASSIGN_INSTALLER_TO_PROJECT',
      payload: { projectId, installerId, installerName }
    });
  }
};

  const markInstallationComplete = async (projectId, notes) => {
    if (state.isLiveMode) {
      try {
        const updatedProject = await dbService.updateProject(projectId, {
          installation_complete: true,
          installer_notes: notes,
          completion_date: new Date().toISOString().split('T')[0]
        });
        return updatedProject;
      } catch (error) {
        console.error('Error marking installation complete:', error);
        throw error;
      }
    } else {
      dispatch({
        type: 'MARK_INSTALLATION_COMPLETE',
        payload: {
          projectId,
          installationComplete: true,
          installerNotes: notes,
          completionDate: new Date().toISOString().split('T')[0]
        }
      });
    }
  };

  const createTask = async (taskData) => {
    if (state.isLiveMode) {
      try {
        const newTask = await dbService.createTask(taskData);
        return newTask;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
    }
  };

  const updateInventoryStatus = async (serialNumber, status, updates = {}) => {
    if (state.isLiveMode) {
      try {
        const updatedInventory = await dbService.updateInventory(serialNumber, {
          status,
          ...updates
        });
        return updatedInventory;
      } catch (error) {
        console.error('Error updating inventory:', error);
        throw error;
      }
    } else {
      dispatch({
        type: 'UPDATE_INVENTORY_STATUS',
        payload: { serialNumber, status, updates }
      });
    }
  };

  // CRUD operations that work in both modes
  const addLead = async (leadData) => {
    if (state.isLiveMode) {
      try {
        const newLead = await dbService.createLead(leadData);
        // Real-time subscription will handle state update
        return newLead;
      } catch (error) {
        console.error('Error adding lead:', error);
        throw error;
      }
    } else {
      // Demo mode - update local state
      const lead = {
        id: `lead-${Date.now()}`,
        ...leadData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      dispatch({ type: 'ADD_LEAD', payload: lead });
      return lead;
    }
  };

  const updateLead = async (id, updates) => {
    if (state.isLiveMode) {
      try {
        const updatedLead = await dbService.updateLead(id, updates);
        // Real-time subscription will handle state update
        return updatedLead;
      } catch (error) {
        console.error('Error updating lead:', error);
        throw error;
      }
    } else {
      // Demo mode
      dispatch({
        type: 'UPDATE_LEAD',
        payload: { id, updates }
      });
    }
  };

  const addComplaint = async (complaintData) => {
    if (state.isLiveMode) {
      try {
        const newComplaint = await dbService.createComplaint(complaintData);
        return newComplaint;
      } catch (error) {
        console.error('Error adding complaint:', error);
        throw error;
      }
    } else {
      const complaint = {
        id: `comp-${Date.now()}`,
        ...complaintData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      dispatch({ type: 'ADD_COMPLAINT', payload: complaint });
      return complaint;
    }
  };

  const updateProject = async (id, updates) => {
    if (state.isLiveMode) {
      try {
        const updatedProject = await dbService.updateProject(id, updates);
        return updatedProject;
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    } else {
      dispatch({
        type: 'UPDATE_PROJECT_STATUS',
        payload: { projectId: id, ...updates }
      });
    }
  };

  const updateTask = async (id, updates) => {
    if (state.isLiveMode) {
      try {
        const updatedTask = await dbService.updateTask(id, updates);
        return updatedTask;
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    } else {
      dispatch({
        type: 'UPDATE_TASK_STATUS',
        payload: { taskId: id, ...updates }
      });
    }
  };

  const addAttendance = async (attendanceData) => {
    if (state.isLiveMode) {
      try {
        const newAttendance = await dbService.createAttendance(attendanceData);
        return newAttendance;
      } catch (error) {
        console.error('Error adding attendance:', error);
        throw error;
      }
    } else {
      dispatch({ type: 'ADD_ATTENDANCE', payload: attendanceData });
    }
  };

  const updateAttendance = async (id, updates) => {
    if (state.isLiveMode) {
      try {
        const updatedAttendance = await dbService.updateAttendance(id, updates);
        return updatedAttendance;
      } catch (error) {
        console.error('Error updating attendance:', error);
        throw error;
      }
    } else {
      dispatch({
        type: 'UPDATE_ATTENDANCE',
        payload: { id, ...updates }
      });
    }
  };

const updateUserStatus = async (userId, status, role = null) => {
  if (state.isLiveMode) {
    try {
      console.log(`Updating user ${userId} to status: ${status}, role: ${role}`);
      
      const updates = { status };
      if (role) updates.role = role;
      
      console.log('Updates object:', updates);
      
      // Update in Supabase database
      const result = await dbService.updateUserProfile(userId, updates);
      
      console.log('Database update result:', result);
      
      // Refresh users list from database
      const users = await dbService.getUserProfiles();
      console.log('Refreshed users list:', users);
      dispatch({ type: 'SET_USERS', payload: users });
      
      console.log('Users list refreshed');
      
    } catch (error) {
      console.error('Error updating user status:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  } else {
    // Demo mode - just update local state
    dispatch({
      type: 'UPDATE_USER_STATUS',
      payload: { userId, status, role }
    });
  }
};

  // File upload
  const uploadFile = async (file, metadata) => {
    if (state.isLiveMode) {
      try {
        return await dbService.uploadDocument(file, metadata);
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    } else {
      // Demo mode - simulate upload
      return {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: metadata.type,
        file_path: `demo/${file.name}`,
        uploaded_by: metadata.uploadedBy
      };
    }
  };

  // Analytics tracking
  const trackEvent = async (eventType, eventData = {}) => {
    if (state.isLiveMode) {
      await dbService.trackEvent(eventType, {
        ...eventData,
        userId: state.currentUser?.id
      });
    } else {
      console.log('Demo Analytics Event:', eventType, eventData);
    }
  };

  const showToast = (message, type = 'success') => {
    console.log(`Toast: ${message} (${type})`);
    // In production, integrate with your toast library
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // Add this register function to your AppContext.jsx, right after the loginLive function:

const register = async (userData) => {
  if (!authService.isAvailable()) {
    throw new Error('Authentication service not available');
  }
  
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const result = await authService.signUp(
      userData.email,
      userData.password,
      userData
    );

    return result;
  } catch (error) {
    console.error('Registration error:', error);
    dispatch({ type: 'SET_ERROR', payload: error.message });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

// And make sure your context value includes the register function:
const value = {
  ...state,
  dispatch,
  
  // Mode management
  toggleMode,
  
  // Auth methods
  setCurrentUser,
  logout,
  loginDemo,
  loginLive,
  register, // ADD THIS LINE
  createDemoUsers,
  
  // Data methods (work in both modes)
  addLead,
  updateLead,
  addComplaint,
  updateProject,
  updateTask,
  addAttendance,
  updateAttendance,
  updateUserStatus,
  uploadFile,
  trackEvent,
  
  // NEW PROJECT WORKFLOW METHODS
  createProject,
  assignInstallerToProject,
  markInstallationComplete,
  createTask,
  updateInventoryStatus,
  
  // Utilities
  showToast,
  authService,
  dbService,
  deactivateUser,
  reactivateUser
};
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}