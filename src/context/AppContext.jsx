import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockUsers, mockProjects, mockTasks, mockAttendance, mockInventory, mockLeads, mockComplaints, mockInvoices, mockNotifications } from '../data/mockData.js';

const AppContext = createContext();

const initialState = {
  currentUser: null,
  users: mockUsers,
  projects: mockProjects,
  tasks: mockTasks,
  attendance: mockAttendance,
  inventory: mockInventory,
  leads: mockLeads,
  complaints: mockComplaints,
  invoices: mockInvoices,
  notifications: mockNotifications,
  loading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
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
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
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
            ? { 
                ...complaint, 
                status: action.payload.status,
                assignedTo: action.payload.assignedTo || complaint.assignedTo,
                assignedToName: action.payload.assignedToName || complaint.assignedToName
              }
            : complaint
        )
      };
    
    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload]
      };
    
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        )
      };
    
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload.itemId)
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
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
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

  // Mock authentication check
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      dispatch({ type: 'SET_CURRENT_USER', payload: JSON.parse(savedUser) });
    }
  }, []);

  const login = (email, role) => {
    const user = state.users.find(u => u.email === email || u.role === role);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      return user;
    }
    return null;
  };

  const generateCustomerRefNumber = () => {
    const year = new Date().getFullYear();
    const existingCustomers = state.users.filter(u => u.role === 'customer' && u.customerRefNumber);
    const nextNumber = existingCustomers.length + 1;
    return `CUST-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const registerUser = (userData, userType) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      status: USER_STATUS.PENDING,
      customerRefNumber: userType === 'customer' ? generateCustomerRefNumber() : null
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    dispatch({ type: 'LOGOUT' });
  };

  const showToast = (message, type = 'success') => {
    // In a real app, this would trigger a toast notification
    console.log(`Toast: ${message} (${type})`);
    // For demo purposes, we'll use a simple alert
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const value = {
    ...state,
    dispatch,
    login,
    registerUser,
    logout,
    showToast
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