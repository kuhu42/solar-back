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
  loading: false,
  error: null
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
    
    case 'LOGOUT':
      return { ...state, currentUser: null };
    
    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, status: action.payload.status }
            : user
        )
      };
    
    case 'UPDATE_USER_ROLE_AND_STATUS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, role: action.payload.role, status: action.payload.status }
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
    
    case 'ASSIGN_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, assignedTo: action.payload.assignedTo, assignedToName: action.payload.assignedToName }
            : task
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
    
    case 'UPDATE_INVENTORY_STATUS':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.serialNumber === action.payload.serialNumber
            ? { ...item, status: action.payload.status, ...action.payload.updates }
            : item
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
    
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload.updates } : project
        )
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
    
    case 'ADD_INVOICE':
      return {
        ...state,
        invoices: [...state.invoices, action.payload]
      };
    
    case 'UPDATE_INVOICE_STATUS':
      return {
        ...state,
        invoices: state.invoices.map(invoice =>
          invoice.id === action.payload.invoiceId
            ? { ...invoice, status: action.payload.status }
            : invoice
        )
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.notificationId
            ? { ...notif, read: true }
            : notif
        )
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth and load data
  useEffect(() => {
    initializeAuth();
    loadAllData();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await dbService.getUserProfileById(session.user.id);
        if (profile) {
          dispatch({ type: 'SET_CURRENT_USER', payload: profile });
        }
      }

      // Listen for auth changes
      authService.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await dbService.getUserProfileById(session.user.id);
          if (profile) {
            dispatch({ type: 'SET_CURRENT_USER', payload: profile });
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  };
  const loadAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Try to load from database first, fallback to mock data
      try {
        const [users, projects, tasks, attendance, inventory, leads, complaints, invoices] = await Promise.all([
          dbService.getUserProfiles(),
          dbService.getProjects(),
          dbService.getTasks(),
          dbService.getAttendance(),
          dbService.getInventory(),
          dbService.getLeads(),
          dbService.getComplaints(),
          dbService.getInvoices()
        ]);

        // Use database data if available, otherwise use mock data
        dispatch({ type: 'SET_USERS', payload: users.length > 0 ? users : mockUsers });
        dispatch({ type: 'SET_PROJECTS', payload: projects.length > 0 ? projects : mockProjects });
        dispatch({ type: 'SET_TASKS', payload: tasks.length > 0 ? tasks : mockTasks });
        dispatch({ type: 'SET_ATTENDANCE', payload: attendance.length > 0 ? attendance : mockAttendance });
        dispatch({ type: 'SET_INVENTORY', payload: inventory.length > 0 ? inventory : mockInventory });
        dispatch({ type: 'SET_LEADS', payload: leads.length > 0 ? leads : mockLeads });
        dispatch({ type: 'SET_COMPLAINTS', payload: complaints.length > 0 ? complaints : mockComplaints });
        dispatch({ type: 'SET_INVOICES', payload: invoices.length > 0 ? invoices : mockInvoices });
        dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
        
      } catch (dbError) {
        console.log('Database not available, using mock data:', dbError);
        // Fallback to mock data if database fails
        dispatch({ type: 'SET_USERS', payload: mockUsers });
        dispatch({ type: 'SET_PROJECTS', payload: mockProjects });
        dispatch({ type: 'SET_TASKS', payload: mockTasks });
        dispatch({ type: 'SET_ATTENDANCE', payload: mockAttendance });
        dispatch({ type: 'SET_INVENTORY', payload: mockInventory });
        dispatch({ type: 'SET_LEADS', payload: mockLeads });
        dispatch({ type: 'SET_COMPLAINTS', payload: mockComplaints });
        dispatch({ type: 'SET_INVOICES', payload: mockInvoices });
        dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Final fallback to mock data
      dispatch({ type: 'SET_USERS', payload: mockUsers });
      dispatch({ type: 'SET_PROJECTS', payload: mockProjects });
      dispatch({ type: 'SET_TASKS', payload: mockTasks });
      dispatch({ type: 'SET_ATTENDANCE', payload: mockAttendance });
      dispatch({ type: 'SET_INVENTORY', payload: mockInventory });
      dispatch({ type: 'SET_LEADS', payload: mockLeads });
      dispatch({ type: 'SET_COMPLAINTS', payload: mockComplaints });
      dispatch({ type: 'SET_INVOICES', payload: mockInvoices });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

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

  const registerUser = async (userData, userType) => {
    try {
      const newUser = {
        ...userData,
        status: USER_STATUS.PENDING,
        role: userType === 'customer' ? 'customer' : userData.role
      };

      const createdUser = await dbService.createUser(newUser);
      
      // Refresh users list
      const users = await dbService.getUsers();
      dispatch({ type: 'SET_USERS', payload: users });
      
      return createdUser;
    } catch (error) {
      console.error('Registration error:', error);
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

  const addLead = async (leadData) => {
    try {
      await dbService.createLead(leadData);
      
      // Refresh leads list
      const leads = await dbService.getLeads();
      dispatch({ type: 'SET_LEADS', payload: leads });
      
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  const updateLead = async (id, updates) => {
    try {
      await dbService.updateLead(id, updates);
      
      // Refresh leads list
      const leads = await dbService.getLeads();
      dispatch({ type: 'SET_LEADS', payload: leads });
      
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const addComplaint = async (complaintData) => {
    try {
      await dbService.createComplaint(complaintData);
      
      // Refresh complaints list
      const complaints = await dbService.getComplaints();
      dispatch({ type: 'SET_COMPLAINTS', payload: complaints });
      
    } catch (error) {
      console.error('Error adding complaint:', error);
      throw error;
    }
  };

  const updateComplaint = async (id, updates) => {
    try {
      await dbService.updateComplaint(id, updates);
      
      // Refresh complaints list
      const complaints = await dbService.getComplaints();
      dispatch({ type: 'SET_COMPLAINTS', payload: complaints });
      
    } catch (error) {
      console.error('Error updating complaint:', error);
      throw error;
    }
  };

  const updateProject = async (id, updates) => {
    try {
      await dbService.updateProject(id, updates);
      
      // Refresh projects list
      const projects = await dbService.getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: projects });
      
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      await dbService.updateTask(id, updates);
      
      // Refresh tasks list
      const tasks = await dbService.getTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
      
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const addAttendance = async (attendanceData) => {
    try {
      await dbService.createAttendance(attendanceData);
      
      // Refresh attendance list
      const attendance = await dbService.getAttendance();
      dispatch({ type: 'SET_ATTENDANCE', payload: attendance });
      
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  };

  const updateAttendance = async (id, updates) => {
    try {
      await dbService.updateAttendance(id, updates);
      
      // Refresh attendance list
      const attendance = await dbService.getAttendance();
      dispatch({ type: 'SET_ATTENDANCE', payload: attendance });
      
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  };

  const updateInventory = async (serialNumber, updates) => {
    try {
      await dbService.updateInventory(serialNumber, updates);
      
      // Refresh inventory list
      const inventory = await dbService.getInventory();
      dispatch({ type: 'SET_INVENTORY', payload: inventory });
      
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  };

  // Legacy dispatch actions for backward compatibility
  const legacyDispatch = (action) => {
    switch (action.type) {
      case 'UPDATE_USER_STATUS':
        updateUserStatus(action.payload.userId, action.payload.status, action.payload.role);
        break;
      case 'ADD_LEAD':
        addLead(action.payload);
        break;
      case 'UPDATE_LEAD':
        updateLead(action.payload.id, action.payload.updates);
        break;
      case 'ADD_COMPLAINT':
        addComplaint(action.payload);
        break;
      case 'UPDATE_COMPLAINT_STATUS':
        updateComplaint(action.payload.complaintId, { status: action.payload.status });
        break;
      case 'UPDATE_PROJECT_STATUS':
        updateProject(action.payload.projectId, { status: action.payload.status });
        break;
      case 'UPDATE_PROJECT_PIPELINE':
        updateProject(action.payload.projectId, { pipeline_stage: action.payload.pipelineStage });
        break;
      case 'UPDATE_PROJECT':
        updateProject(action.payload.id, action.payload.updates);
        break;
      case 'UPDATE_TASK_STATUS':
        updateTask(action.payload.taskId, { status: action.payload.status, ...action.payload.updates });
        break;
      case 'ADD_ATTENDANCE':
        addAttendance(action.payload);
        break;
      case 'UPDATE_ATTENDANCE':
        updateAttendance(action.payload.id, action.payload);
        break;
      case 'UPDATE_INVENTORY_STATUS':
        updateInventory(action.payload.serialNumber, { status: action.payload.status, ...action.payload.updates });
        break;
      default:
        dispatch(action);
    }
  };

  const login_old = (email, role) => {
    const user = state.users.find(u => u.email === email || u.role === role);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      return user;
    }
    return null;
  };


  const showToast = (message, type = 'success') => {
    // In a real app, this would trigger a toast notification
    console.log(`Toast: ${message} (${type})`);
    // For demo purposes, we'll use a simple alert
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const value = {
    ...state,
    dispatch: legacyDispatch,
    setCurrentUser,
    registerUser,
    updateUserStatus,
    logout,
    showToast,
    loadAllData,
    authService
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