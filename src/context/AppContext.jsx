import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { dbService, supabase } from '../lib/supabase.js';
import { authService } from '../lib/auth.js';
import { USER_STATUS } from '../types/index.js';
import { demoStateManager } from '../utils/demoMode.js';
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
      authService.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.getUserProfileById(session.user.id);
          if (profile) {
            dispatch({ type: 'SET_CURRENT_USER', payload: profile });
            
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

  const loadLiveData = async () => {
    if (!dbService.isAvailable()) {
      console.warn('Cannot load live data - Supabase not available');
      loadDemoData();
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
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

      dispatch({ type: 'SET_USERS', payload: users });
      dispatch({ type: 'SET_PROJECTS', payload: projects });
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_ATTENDANCE', payload: attendance });
      dispatch({ type: 'SET_INVENTORY', payload: inventory });
      dispatch({ type: 'SET_LEADS', payload: leads });
      dispatch({ type: 'SET_COMPLAINTS', payload: complaints });
      dispatch({ type: 'SET_INVOICES', payload: invoices });
      dispatch({ type: 'SET_COMMISSIONS', payload: commissions });

      // Load notifications for current user
      if (state.currentUser) {
        const notifications = await dbService.getNotifications(state.currentUser.id);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      }
      
    } catch (error) {
      console.error('Error loading live data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      // Fallback to demo data if live data fails
      console.log('Falling back to demo data');
      loadDemoData();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadDemoData = () => {
    console.log('Loading demo data');
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
      if (state.isLiveMode) {
        await authService.signOut();
      }
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
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
        const updates = { status };
        if (role) updates.role = role;
        
        await dbService.updateUserProfile(userId, updates);
        
        // Refresh users list
        const users = await dbService.getUserProfiles();
        dispatch({ type: 'SET_USERS', payload: users });
        
      } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
      }
    } else {
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
    
    // Utilities
    showToast,
    authService,
    dbService
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