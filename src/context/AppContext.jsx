
// import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
// import { dbService, supabase } from '../lib/supabase.js';
// import { authService } from '../lib/auth.js';
// import { USER_STATUS } from '../types/index.js';
// // ✅ REMOVED duplicate import
// import { 
//   mockUsers, 
//   mockProjects, 
//   mockTasks, 
//   mockAttendance, 
//   mockInventory, 
//   mockLeads, 
//   mockComplaints, 
//   mockInvoices, 
//   mockNotifications 
// } from '../data/mockData.js';

// const AppContext = createContext();

// const initialState = {
//   currentUser: null,
//   users: [],
//   projects: [],
//   tasks: [],
//   attendance: [],
//   inventory: [],
//   leads: [],
//   complaints: [],
//   invoices: [],
//   notifications: [],
//   commissions: [],
//   loading: false,
//   error: null,
//   isLiveMode: true, // ✅ Changed to false to avoid initial dbService.isAvailable() call
//   realTimeSubscriptions: []
// };

// function appReducer(state, action) {
//   switch (action.type) {
//     case 'SET_LIVE_MODE':
//       return { ...state, isLiveMode: action.payload };
    
//     case 'SET_CURRENT_USER':
//       return { ...state, currentUser: action.payload };
    
//     case 'SET_USERS':
//       return { ...state, users: action.payload };
    
//     case 'SET_PROJECTS':
//       return { ...state, projects: action.payload };
    
//     case 'SET_TASKS':
//       return { ...state, tasks: action.payload };
    
//     case 'SET_ATTENDANCE':
//       return { ...state, attendance: action.payload };
    
//     case 'SET_INVENTORY':
//       return { ...state, inventory: action.payload };
    
//     case 'SET_LEADS':
//       return { ...state, leads: action.payload };
    
//     case 'SET_COMPLAINTS':
//       return { ...state, complaints: action.payload };
    
//     case 'SET_INVOICES':
//       return { ...state, invoices: action.payload };
    
//     case 'SET_NOTIFICATIONS':
//       return { ...state, notifications: action.payload };
    
//     case 'SET_COMMISSIONS':
//       return { ...state, commissions: action.payload };
    
//     case 'LOGOUT':
//       return { 
//         ...state, 
//         currentUser: null,
//         realTimeSubscriptions: []
//       };
    
//     case 'SET_LOADING':
//       return { ...state, loading: action.payload };
    
//     case 'SET_ERROR':
//       return { ...state, error: action.payload };
    
//     case 'ADD_SUBSCRIPTION':
//       return { 
//         ...state, 
//         realTimeSubscriptions: [...state.realTimeSubscriptions, action.payload] 
//       };
    
//     case 'CLEAR_SUBSCRIPTIONS':
//       return { ...state, realTimeSubscriptions: [] };
    
//     // Real-time updates
//     case 'REALTIME_UPDATE':
//       const { table, eventType, record } = action.payload;
      
//       switch (table) {
//         case 'projects':
//           if (eventType === 'INSERT') {
//             return { ...state, projects: [record, ...state.projects] };
//           } else if (eventType === 'UPDATE') {
//             return {
//               ...state,
//               projects: state.projects.map(p => p.id === record.id ? record : p)
//             };
//           } else if (eventType === 'DELETE') {
//             return {
//               ...state,
//               projects: state.projects.filter(p => p.id !== record.id)
//             };
//           }
//           break;
        
//         case 'tasks':
//           if (eventType === 'INSERT') {
//             return { ...state, tasks: [record, ...state.tasks] };
//           } else if (eventType === 'UPDATE') {
//             return {
//               ...state,
//               tasks: state.tasks.map(t => t.id === record.id ? record : t)
//             };
//           }
//           break;
        
//         case 'notifications':
//           if (eventType === 'INSERT') {
//             return { ...state, notifications: [record, ...state.notifications] };
//           } else if (eventType === 'UPDATE') {
//             return {
//               ...state,
//               notifications: state.notifications.map(n => n.id === record.id ? record : n)
//             };
//           }
//           break;
        
//         default:
//           return state;
//       }
//       return state;
    
//     // Legacy actions for demo mode
//     case 'UPDATE_USER_STATUS':
//       return {
//         ...state,
//         users: state.users.map(user =>
//           user.id === action.payload.userId
//             ? { ...user, status: action.payload.status, role: action.payload.role || user.role }
//             : user
//         )
//       };
    
//     case 'ADD_ATTENDANCE':
//       return {
//         ...state,
//         attendance: [...state.attendance, action.payload]
//       };
    
//     case 'UPDATE_ATTENDANCE':
//       return {
//         ...state,
//         attendance: state.attendance.map(att =>
//           att.id === action.payload.id ? { ...att, ...action.payload } : att
//         )
//       };
    
//     case 'UPDATE_PROJECT_STATUS':
//       return {
//         ...state,
//         projects: state.projects.map(project =>
//           project.id === action.payload.projectId
//             ? { ...project, status: action.payload.status }
//             : project
//         )
//       };
    
//     case 'UPDATE_PROJECT_PIPELINE':
//       return {
//         ...state,
//         projects: state.projects.map(project =>
//           project.id === action.payload.projectId
//             ? { ...project, pipelineStage: action.payload.pipelineStage }
//             : project
//         )
//       };
    
//     case 'UPDATE_TASK_STATUS':
//       return {
//         ...state,
//         tasks: state.tasks.map(task =>
//           task.id === action.payload.taskId
//             ? { ...task, status: action.payload.status, ...action.payload.updates }
//             : task
//         )
//       };
    
//     case 'ADD_LEAD':
//       return {
//         ...state,
//         leads: [...state.leads, action.payload]
//       };
    
//     case 'UPDATE_LEAD':
//       return {
//         ...state,
//         leads: state.leads.map(lead =>
//           lead.id === action.payload.id ? { ...lead, ...action.payload.updates } : lead
//         )
//       };
    
//     case 'ADD_COMPLAINT':
//       return {
//         ...state,
//         complaints: [...state.complaints, action.payload]
//       };
    
//     case 'UPDATE_COMPLAINT_STATUS':
//       return {
//         ...state,
//         complaints: state.complaints.map(complaint =>
//           complaint.id === action.payload.complaintId
//             ? { ...complaint, status: action.payload.status }
//             : complaint
//         )
//       };
//       // Add these cases to your appReducer function (after 'CLEAR_SUBSCRIPTIONS' case)

// case 'ADD_USER':
//   return { 
//     ...state, 
//     users: [...state.users, action.payload] 
//   };

// case 'UPDATE_USER':
//   return { 
//     ...state, 
//     users: state.users.map(user => 
//       user.id === action.payload.id ? action.payload : user
//     ) 
//   };

// case 'REMOVE_USER':
//   return { 
//     ...state, 
//     users: state.users.filter(user => user.id !== action.payload.userId) 
//   };

    
//     default:
//       return state;
//   }
// }

// export function AppProvider({ children }) {
//   const [state, dispatch] = useReducer(appReducer, initialState);

//   // Initialize with demo data
//   useEffect(() => {
//     loadDemoData();
    
//     // Try to initialize live mode if available
//     if (dbService && typeof dbService.isAvailable === 'function' && dbService.isAvailable()) {
//       dispatch({ type: 'SET_LIVE_MODE', payload: true });
//       initializeAuth();
//       loadLiveData();
//       setupRealTimeSubscriptions();
//     }
//   }, []);
// // Add this NEW useEffect in your AppProvider component (around line 150, after loadDemoData)
// useEffect(() => {
//   if (!state.isLiveMode || !dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) return;

//   // ✅ Subscribe to users table changes  
//   const usersSubscription = supabase
//     .channel('users_changes')
//     .on('postgres_changes', { 
//       event: '*', 
//       schema: 'public', 
//       table: 'users' 
//     }, (payload) => {
//       console.log('🔄 User table change detected:', payload);
      
//       if (payload.eventType === 'INSERT') {
//         dispatch({ type: 'ADD_USER', payload: payload.new });
        
//         if (payload.new.status === 'pending') {
//           showToast(`New ${payload.new.role} registration awaiting approval!`);
//         }
//       }
      
//       if (payload.eventType === 'UPDATE') {
//         dispatch({ type: 'UPDATE_USER', payload: payload.new });
//       }
      
//       if (payload.eventType === 'DELETE') {
//         dispatch({ type: 'REMOVE_USER', payload: { userId: payload.old.id } });
//       }
//     })
//     .subscribe();

//   dispatch({ type: 'ADD_SUBSCRIPTION', payload: usersSubscription });

//   return () => {
//     usersSubscription.unsubscribe();
//   };
// }, [state.isLiveMode]);

//   const initializeAuth = async () => {
//     if (!dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) {
//       console.log('Running in demo mode - Supabase not configured');
//       return;
//     }
    
//     try {
//       // Check for existing session
//       const session = await authService.getSession();
//       if (session?.user) {
//         const profile = await authService.getUserProfileById(session.user.id);
//         if (profile) {
//           dispatch({ type: 'SET_CURRENT_USER', payload: profile });
//         }
//       }

//       // Listen for auth changes
//       authService.onAuthStateChange(async (event, session) => {
//         if (event === 'SIGNED_IN' && session?.user) {
//           const profile = await authService.getUserProfileById(session.user.id);
//           if (profile) {
//             dispatch({ type: 'SET_CURRENT_USER', payload: profile });
            
//             // Track login event
//             if (state.isLiveMode) {
//               await dbService.trackEvent('user_login', {
//                 userId: profile.id,
//                 role: profile.role
//               });
//             }
//           }
//         } else if (event === 'SIGNED_OUT') {
//           dispatch({ type: 'LOGOUT' });
//           dispatch({ type: 'CLEAR_SUBSCRIPTIONS' });
//         }
//       });
//     } catch (error) {
//       console.error('Auth initialization error:', error);
//     }
//   };

//   const loadLiveData = async () => {
//     if (!dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) {
//       console.warn('Cannot load live data - Supabase not available');
//       loadDemoData();
//       return;
//     }
    
//     try {
//       dispatch({ type: 'SET_LOADING', payload: true });
      
//       const [
//         users, projects, tasks, attendance, inventory, 
//         leads, complaints, invoices, commissions
//       ] = await Promise.all([
//         dbService.getUserProfiles(),
//         dbService.getProjects(),
//         dbService.getTasks(),
//         dbService.getAttendance(),
//         dbService.getInventory(),
//         dbService.getLeads(),
//         dbService.getComplaints(),
//         dbService.getInvoices(),
//         dbService.getCommissions()
//       ]);

//       dispatch({ type: 'SET_USERS', payload: users });
//       dispatch({ type: 'SET_PROJECTS', payload: projects });
//       dispatch({ type: 'SET_TASKS', payload: tasks });
//       dispatch({ type: 'SET_ATTENDANCE', payload: attendance });
//       dispatch({ type: 'SET_INVENTORY', payload: inventory });
//       dispatch({ type: 'SET_LEADS', payload: leads });
//       dispatch({ type: 'SET_COMPLAINTS', payload: complaints });
//       dispatch({ type: 'SET_INVOICES', payload: invoices });
//       dispatch({ type: 'SET_COMMISSIONS', payload: commissions });

//       // Load notifications for current user
//       if (state.currentUser) {
//         const notifications = await dbService.getNotifications(state.currentUser.id);
//         dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
//       }
      
//     } catch (error) {
//       console.error('Error loading live data:', error);
//       dispatch({ type: 'SET_ERROR', payload: error.message });
//       // Fallback to demo data if live data fails
//       console.log('Falling back to demo data');
//       loadDemoData();
//     } finally {
//       dispatch({ type: 'SET_LOADING', payload: false });
//     }
//   };

//   const loadDemoData = () => {
//     console.log('Loading demo data');
//     dispatch({ type: 'SET_USERS', payload: mockUsers });
//     dispatch({ type: 'SET_PROJECTS', payload: mockProjects });
//     dispatch({ type: 'SET_TASKS', payload: mockTasks });
//     dispatch({ type: 'SET_ATTENDANCE', payload: mockAttendance });
//     dispatch({ type: 'SET_INVENTORY', payload: mockInventory });
//     dispatch({ type: 'SET_LEADS', payload: mockLeads });
//     dispatch({ type: 'SET_COMPLAINTS', payload: mockComplaints });
//     dispatch({ type: 'SET_INVOICES', payload: mockInvoices });
//     dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
//     dispatch({ type: 'SET_COMMISSIONS', payload: [] });
//   };

//   const setupRealTimeSubscriptions = () => {
//     if (!state.isLiveMode || !dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) return;

//     // Subscribe to projects changes
//     const projectsSub = dbService.subscribeToTable('projects', (payload) => {
//       dispatch({
//         type: 'REALTIME_UPDATE',
//         payload: {
//           table: 'projects',
//           eventType: payload.eventType,
//           record: payload.new || payload.old
//         }
//       });
//     });

//     // Subscribe to tasks changes
//     const tasksSub = dbService.subscribeToTable('tasks', (payload) => {
//       dispatch({
//         type: 'REALTIME_UPDATE',
//         payload: {
//           table: 'tasks',
//           eventType: payload.eventType,
//           record: payload.new || payload.old
//         }
//       });
//     });

//     // Subscribe to notifications for current user
//     if (state.currentUser) {
//       const notificationsSub = dbService.subscribeToTable('notifications', (payload) => {
//         if (payload.new?.user_id === state.currentUser.id) {
//           dispatch({
//             type: 'REALTIME_UPDATE',
//             payload: {
//               table: 'notifications',
//               eventType: payload.eventType,
//               record: payload.new || payload.old
//             }
//           });
//         }
//       }, { filter: `user_id=eq.${state.currentUser.id}` }); // ✅ Fixed template string

//       dispatch({ type: 'ADD_SUBSCRIPTION', payload: notificationsSub });
//     }

//     dispatch({ type: 'ADD_SUBSCRIPTION', payload: projectsSub });
//     dispatch({ type: 'ADD_SUBSCRIPTION', payload: tasksSub });
//   };

//   // Mode switching
//   const toggleMode = async (isLive) => {
//     // Only allow live mode if Supabase is available
//     if (isLive && (!dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable())) {
//       showToast('Live mode not available - Supabase not configured', 'error');
//       return;
//     }
    
//     dispatch({ type: 'SET_LIVE_MODE', payload: isLive });
    
//     if (isLive) {
//       await loadLiveData();
//       setupRealTimeSubscriptions();
//     } else {
//       loadDemoData();
//       // Clear subscriptions
//       state.realTimeSubscriptions.forEach(sub => {
//         if (sub && typeof sub.unsubscribe === 'function') {
//           sub.unsubscribe();
//         }
//       });
//       dispatch({ type: 'CLEAR_SUBSCRIPTIONS' });
//     }
//   };

//   // Authentication methods
//   const setCurrentUser = (user) => {
//     dispatch({ type: 'SET_CURRENT_USER', payload: user });
//   };

//   const logout = async () => {
//     try {
//       if (state.isLiveMode && authService) {
//         await authService.signOut();
//       }
//       dispatch({ type: 'LOGOUT' });
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   const loginDemo = (email) => {
//     const user = mockUsers.find(u => u.email === email);
//     if (user) {
//       dispatch({ type: 'SET_CURRENT_USER', payload: user });
//       return user;
//     }
//     return null;
//   };

//   const loginLive = async (email, password) => {
//     if (!authService || typeof authService.isAvailable !== 'function' || !authService.isAvailable()) {
//       throw new Error('Live mode not available - use demo mode');
//     }
    
//     try {
//       const { user } = await authService.signIn(email, password);
      
//       if (user) {
//         const profile = await authService.getUserProfileById(user.id);
//         if (profile) {
//           if (profile.status === 'rejected') {
//             throw new Error('Your account has been rejected. Please contact support.');
//           }
          
//           dispatch({ type: 'SET_CURRENT_USER', payload: profile });
//           return profile;
//         }
//       }
//     } catch (error) {
//       console.error('Live login error:', error);
//       throw error;
//     }
//   };

//   // Data management methods
//   const createDemoUsers = async () => {
//     try {
//       const results = await authService.createDemoUsers();
//       console.log('Demo users creation results:', results);
//       return results;
//     } catch (error) {
//       console.error('Error creating demo users:', error);
//       throw error;
//     }
//   };

//   // CRUD operations that work in both modes
//   const addLead = async (leadData) => {
//     if (state.isLiveMode) {
//       try {
//         const newLead = await dbService.createLead(leadData);
//         // Real-time subscription will handle state update
//         return newLead;
//       } catch (error) {
//         console.error('Error adding lead:', error);
//         throw error;
//       }
//     } else {
//       // Demo mode - update local state
//       const lead = {
//         id: `lead-${Date.now()}`, // ✅ Fixed template string
//         ...leadData,
//         createdAt: new Date().toISOString().split('T')[0]
//       };
//       dispatch({ type: 'ADD_LEAD', payload: lead });
//       return lead;
//     }
//   };

//   const updateLead = async (id, updates) => {
//     if (state.isLiveMode) {
//       try {
//         const updatedLead = await dbService.updateLead(id, updates);
//         // Real-time subscription will handle state update
//         return updatedLead;
//       } catch (error) {
//         console.error('Error updating lead:', error);
//         throw error;
//       }
//     } else {
//       // Demo mode
//       dispatch({
//         type: 'UPDATE_LEAD',
//         payload: { id, updates }
//       });
//     }
//   };

//   const addComplaint = async (complaintData) => {
//     if (state.isLiveMode) {
//       try {
//         const newComplaint = await dbService.createComplaint(complaintData);
//         return newComplaint;
//       } catch (error) {
//         console.error('Error adding complaint:', error);
//         throw error;
//       }
//     } else {
//       const complaint = {
//         id: `comp-${Date.now()}`, // ✅ Fixed template string
//         ...complaintData,
//         createdAt: new Date().toISOString().split('T')[0]
//       };
//       dispatch({ type: 'ADD_COMPLAINT', payload: complaint });
//       return complaint;
//     }
//   };

//   const updateProject = async (id, updates) => {
//     if (state.isLiveMode) {
//       try {
//         const updatedProject = await dbService.updateProject(id, updates);
//         return updatedProject;
//       } catch (error) {
//         console.error('Error updating project:', error);
//         throw error;
//       }
//     } else {
//       dispatch({
//         type: 'UPDATE_PROJECT_STATUS',
//         payload: { projectId: id, ...updates }
//       });
//     }
//   };

//   const updateTask = async (id, updates) => {
//     if (state.isLiveMode) {
//       try {
//         const updatedTask = await dbService.updateTask(id, updates);
//         return updatedTask;
//       } catch (error) {
//         console.error('Error updating task:', error);
//         throw error;
//       }
//     } else {
//       dispatch({
//         type: 'UPDATE_TASK_STATUS',
//         payload: { taskId: id, ...updates }
//       });
//     }
//   };

//   const addAttendance = async (attendanceData) => {
//     if (state.isLiveMode) {
//       try {
//         const newAttendance = await dbService.createAttendance(attendanceData);
//         return newAttendance;
//       } catch (error) {
//         console.error('Error adding attendance:', error);
//         throw error;
//       }
//     } else {
//       dispatch({ type: 'ADD_ATTENDANCE', payload: attendanceData });
//     }
//   };

//   const updateAttendance = async (id, updates) => {
//     if (state.isLiveMode) {
//       try {
//         const updatedAttendance = await dbService.updateAttendance(id, updates);
//         return updatedAttendance;
//       } catch (error) {
//         console.error('Error updating attendance:', error);
//         throw error;
//       }
//     } else {
//       dispatch({
//         type: 'UPDATE_ATTENDANCE',
//         payload: { id, ...updates }
//       });
//     }
//   };

//   const updateUserStatus = async (userId, status, role = null) => {
//     if (state.isLiveMode) {
//       try {
//         const updates = { status };
//         if (role) updates.role = role;
        
//         await dbService.updateUserProfile(userId, updates);
        
//         // Refresh users list
//         const users = await dbService.getUserProfiles();
//         dispatch({ type: 'SET_USERS', payload: users });
        
//       } catch (error) {
//         console.error('Error updating user status:', error);
//         throw error;
//       }
//     } else {
//       dispatch({
//         type: 'UPDATE_USER_STATUS',
//         payload: { userId, status, role }
//       });
//     }
//   };

//   // File upload
//   const uploadFile = async (file, metadata) => {
//     if (state.isLiveMode) {
//       try {
//         return await dbService.uploadDocument(file, metadata);
//       } catch (error) {
//         console.error('Error uploading file:', error);
//         throw error;
//       }
//     } else {
//       // Demo mode - simulate upload
//       return {
//         id: `doc-${Date.now()}`, // ✅ Fixed template string
//         name: file.name,
//         type: metadata.type,
//         file_path: `demo/${file.name}`, // ✅ Fixed template string
//         uploaded_by: metadata.uploadedBy
//       };
//     }
//   };

//   // Analytics tracking
//   const trackEvent = async (eventType, eventData = {}) => {
//     if (state.isLiveMode) {
//       await dbService.trackEvent(eventType, {
//         ...eventData,
//         userId: state.currentUser?.id
//       });
//     } else {
//       console.log('Demo Analytics Event:', eventType, eventData);
//     }
//   };

//   const showToast = (message, type = 'success') => {
//     console.log(`Toast: ${message} (${type})`); // ✅ Fixed template string
//     // In production, integrate with your toast library
//     alert(`${type.toUpperCase()}: ${message}`); // ✅ Fixed template string
//   };

//   const value = {
//     ...state,
//     dispatch,
    
//     // Mode management
//     toggleMode,
    
//     // Auth methods
//     setCurrentUser,
//     logout,
//     loginDemo,
//     loginLive,
//     createDemoUsers,
    
//     // Data methods (work in both modes)
//     addLead,
//     updateLead,
//     addComplaint,
//     updateProject,
//     updateTask,
//     addAttendance,
//     updateAttendance,
//     updateUserStatus,
//     uploadFile,
//     trackEvent,
    
//     // Utilities
//     showToast,
//     authService,
//     dbService
//   };

//   return (
//     <AppContext.Provider value={value}>
//       {children}
//     </AppContext.Provider>
//   );
// }

// export function useApp() {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error('useApp must be used within an AppProvider');
//   }
//   return context;
// }

//new app yyy

import React, { createContext, useReducer, useEffect } from 'react';
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

// Export the context so the hook can access it
export const AppContext = createContext();

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
  isLiveMode: true,
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

    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload]
      };

    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        )
      };
    
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

    case 'ADD_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload] 
      };

    case 'UPDATE_USER':
      return { 
        ...state, 
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ) 
      };

    case 'REMOVE_USER':
      return { 
        ...state, 
        users: state.users.filter(user => user.id !== action.payload.userId) 
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadDemoData();
    
    if (dbService && typeof dbService.isAvailable === 'function' && dbService.isAvailable()) {
      dispatch({ type: 'SET_LIVE_MODE', payload: true });
      initializeAuth();
      loadLiveData();
      setupRealTimeSubscriptions();
    }
  }, []);

  useEffect(() => {
    if (!state.isLiveMode || !dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) return;

    const usersSubscription = supabase
      .channel('users_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, (payload) => {
        console.log('🔄 User table change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          dispatch({ type: 'ADD_USER', payload: payload.new });
          
          if (payload.new.status === 'pending') {
            showToast(`New ${payload.new.role} registration awaiting approval!`);
          }
        }
        
        if (payload.eventType === 'UPDATE') {
          dispatch({ type: 'UPDATE_USER', payload: payload.new });
        }
        
        if (payload.eventType === 'DELETE') {
          dispatch({ type: 'REMOVE_USER', payload: { userId: payload.old.id } });
        }
      })
      .subscribe();

    dispatch({ type: 'ADD_SUBSCRIPTION', payload: usersSubscription });

    return () => {
      usersSubscription.unsubscribe();
    };
  }, [state.isLiveMode]);

  const initializeAuth = async () => {
    if (!dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) {
      console.log('Running in demo mode - Supabase not configured');
      return;
    }
    
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getUserProfileById(session.user.id);
        if (profile) {
          dispatch({ type: 'SET_CURRENT_USER', payload: profile });
        }
      }

      authService.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.getUserProfileById(session.user.id);
          if (profile) {
            dispatch({ type: 'SET_CURRENT_USER', payload: profile });
            
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
    if (!dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) {
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

      if (state.currentUser) {
        const notifications = await dbService.getNotifications(state.currentUser.id);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      }
      
    } catch (error) {
      console.error('Error loading live data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
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
    if (!state.isLiveMode || !dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable()) return;

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

  const toggleMode = async (isLive) => {
    if (isLive && (!dbService || typeof dbService.isAvailable !== 'function' || !dbService.isAvailable())) {
      showToast('Live mode not available - Supabase not configured', 'error');
      return;
    }
    
    dispatch({ type: 'SET_LIVE_MODE', payload: isLive });
    
    if (isLive) {
      await loadLiveData();
      setupRealTimeSubscriptions();
    } else {
      loadDemoData();
      state.realTimeSubscriptions.forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
      dispatch({ type: 'CLEAR_SUBSCRIPTIONS' });
    }
  };

  const setCurrentUser = (user) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  };

  const logout = async () => {
    try {
      if (state.isLiveMode && authService) {
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
    if (!authService || typeof authService.isAvailable !== 'function' || !authService.isAvailable()) {
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

  const addLead = async (leadData) => {
    if (state.isLiveMode) {
      try {
        const newLead = await dbService.createLead(leadData);
        return newLead;
      } catch (error) {
        console.error('Error adding lead:', error);
        throw error;
      }
    } else {
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
        return updatedLead;
      } catch (error) {
        console.error('Error updating lead:', error);
        throw error;
      }
    } else {
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

  const uploadFile = async (file, metadata) => {
    if (state.isLiveMode) {
      try {
        return await dbService.uploadDocument(file, metadata);
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    } else {
      return {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: metadata.type,
        file_path: `demo/${file.name}`,
        uploaded_by: metadata.uploadedBy
      };
    }
  };

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
  // const addInventoryItem = async (inventoryData) => {
  //   try {
  //     if (state.isLiveMode) {
  //       // Add to Supabase database
  //       const { data, error } = await supabase
  //         .from('inventory') // Make sure this matches your table name
  //         .insert([inventoryData])
  //         .select();

  //       if (error) {
  //         console.error('Error adding inventory to database:', error);
  //         throw error;
  //       }

  //       console.log('✅ Inventory added to database:', data[0]);

  //       // ✅ UPDATE LOCAL STATE - This is what was missing!
  //       dispatch({ 
  //         type: 'ADD_INVENTORY_ITEM', 
  //         payload: data[0] 
  //       });

  //       showToast('Inventory item added successfully!');
  //       return data[0];
        
  //     } else {
  //       // Demo mode
  //       const newItem = {
  //         id: `inv-${Date.now()}`,
  //         ...inventoryData,
  //         createdAt: new Date().toISOString(),
  //         status: 'in_stock' // Default status
  //       };

  //       // ✅ UPDATE LOCAL STATE for demo mode
  //       dispatch({ 
  //         type: 'ADD_INVENTORY_ITEM', 
  //         payload: newItem 
  //       });

  //       showToast('Inventory item added successfully! (Demo Mode)');
  //       return newItem;
  //     }
  //   } catch (error) {
  //     console.error('Error adding inventory item:', error);
  //     showToast(`Error adding inventory: ${error.message}`, 'error');
  //     throw error;
  //   }
  // };
  const addInventoryItem = async (inventoryData) => {
  try {
    if (state.isLiveMode) {
      // ✅ Match your actual database schema
      const dbData = {
        serial_number: inventoryData.serialNumber,
        type: inventoryData.type,
        model: inventoryData.model,
        status: inventoryData.status || 'in_stock',
        location: inventoryData.location,
        cost: inventoryData.cost ? parseFloat(inventoryData.cost) : null,
        warranty_expiry: inventoryData.warrantyExpiry || null,
        purchase_date: inventoryData.purchaseDate || null,
        // ✅ Store extra info in metadata JSON field
        metadata: {
          company: inventoryData.company,
          companyName: inventoryData.companyName,
          addedBy: inventoryData.addedBy,
          addedByName: inventoryData.addedByName,
          specifications: inventoryData.specifications || {}
        }
      };

      console.log('📤 Sending to database:', dbData);

      const { data, error } = await supabase
        .from('inventory')
        .insert([dbData])
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Database response:', data);

      // ✅ Convert back to frontend format
      const savedItem = data[0];
      const frontendData = {
        id: savedItem.id,
        serialNumber: savedItem.serial_number,
        type: savedItem.type,
        model: savedItem.model,
        status: savedItem.status,
        location: savedItem.location,
        cost: savedItem.cost,
        warrantyExpiry: savedItem.warranty_expiry,
        purchaseDate: savedItem.purchase_date,
        createdAt: savedItem.created_at,
        // ✅ Extract from metadata
        company: savedItem.metadata?.company,
        companyName: savedItem.metadata?.companyName,
        addedBy: savedItem.metadata?.addedBy,
        addedByName: savedItem.metadata?.addedByName,
        addedAt: savedItem.created_at, // Use created_at as addedAt
        specifications: savedItem.metadata?.specifications || {}
      };

      dispatch({ 
        type: 'ADD_INVENTORY_ITEM', 
        payload: frontendData 
      });

      showToast('Inventory item added successfully!');
      return frontendData;
      
    } else {
      // Demo mode stays the same
      const newItem = {
        id: `inv-${Date.now()}`,
        ...inventoryData,
        createdAt: new Date().toISOString(),
        status: 'in_stock'
      };

      dispatch({ 
        type: 'ADD_INVENTORY_ITEM', 
        payload: newItem 
      });

      showToast('Inventory item added successfully! (Demo Mode)');
      return newItem;
    }
  } catch (error) {
    console.error('Error adding inventory item:', error);
    showToast(`Error adding inventory: ${error.message}`, 'error');
    throw error;
  }
};


  const updateInventoryItem = async (id, updates) => {
    try {
      if (state.isLiveMode) {
        const { data, error } = await supabase
          .from('inventory')
          .update(updates)
          .eq('id', id)
          .select();

        if (error) throw error;

        dispatch({ 
          type: 'UPDATE_INVENTORY_ITEM', 
          payload: data[0] 
        });

        showToast('Inventory item updated successfully!');
        return data[0];
      } else {
        // Demo mode
        const updatedItem = { id, ...updates };
        dispatch({ 
          type: 'UPDATE_INVENTORY_ITEM', 
          payload: updatedItem 
        });
        showToast('Inventory item updated successfully! (Demo Mode)');
        return updatedItem;
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      showToast(`Error updating inventory: ${error.message}`, 'error');
      throw error;
    }
  };


  const showToast = (message, type = 'success') => {
    console.log(`Toast: ${message} (${type})`);
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const value = {
    ...state,
    dispatch,
    toggleMode,
    setCurrentUser,
    logout,
    loginDemo,
    loginLive,
    createDemoUsers,
    addLead,
    updateLead,
    addComplaint,
    updateProject,
    updateTask,
    addAttendance,
    updateAttendance,
    updateUserStatus,
    addInventoryItem,        // ✅ Add this
    updateInventoryItem,  
    uploadFile,
    trackEvent,
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
