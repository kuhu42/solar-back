import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { dbService } from '../lib/supabase.js';
import { authService } from '../lib/auth.js';

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
  realTimeSubscriptions: []
};

function appReducer(state, action) {
  switch (action.type) {
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
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth and load data
  useEffect(() => {
    initializeAuth();
    loadData();
    setupRealTimeSubscriptions();

    return () => {
      // Cleanup subscriptions
      state.realTimeSubscriptions.forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    };
  }, []);

  const initializeAuth = async () => {
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
            await dbService.trackEvent('user_login', {
              userId: profile.id,
              role: profile.role
            });
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
          dispatch({ type: 'CLEAR_SUBSCRIPTIONS' });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadData = async () => {
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
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setupRealTimeSubscriptions = () => {
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

  // Authentication methods
  const setCurrentUser = (user) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  };

  const logout = async () => {
    try {
      await authService.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // CRUD operations
  const addLead = async (leadData) => {
    try {
      const newLead = await dbService.createLead(leadData);
      return newLead;
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  const updateLead = async (id, updates) => {
    try {
      const updatedLead = await dbService.updateLead(id, updates);
      return updatedLead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const addComplaint = async (complaintData) => {
    try {
      const newComplaint = await dbService.createComplaint(complaintData);
      return newComplaint;
    } catch (error) {
      console.error('Error adding complaint:', error);
      throw error;
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const updatedProject = await dbService.updateProject(id, updates);
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const updatedTask = await dbService.updateTask(id, updates);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const addAttendance = async (attendanceData) => {
    try {
      const newAttendance = await dbService.createAttendance(attendanceData);
      return newAttendance;
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  };

  const updateAttendance = async (id, updates) => {
    try {
      const updatedAttendance = await dbService.updateAttendance(id, updates);
      return updatedAttendance;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  };

  const updateUserStatus = async (userId, status, role = null) => {
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
  };

  // File upload
  const uploadFile = async (file, metadata) => {
    try {
      return await dbService.uploadDocument(file, metadata);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Analytics tracking
  const trackEvent = async (eventType, eventData = {}) => {
    await dbService.trackEvent(eventType, {
      ...eventData,
      userId: state.currentUser?.id
    });
  };

  const showToast = (message, type = 'success') => {
    console.log(`Toast: ${message} (${type})`);
    // In production, integrate with your toast library
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const value = {
    ...state,
    dispatch,
    
    // Auth methods
    setCurrentUser,
    logout,
    
    // Data methods
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