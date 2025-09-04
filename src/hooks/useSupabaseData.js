import { useState, useEffect } from 'react';
import { dbService } from '../lib/supabase.js';

// Custom hook for real-time data management
export const useSupabaseData = (table, filters = {}, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        let result = [];
        switch (table) {
          case 'users':
            result = await dbService.getUserProfiles();
            break;
          case 'projects':
            result = await dbService.getProjects();
            break;
          case 'tasks':
            result = await dbService.getTasks();
            break;
          case 'leads':
            result = await dbService.getLeads();
            break;
          case 'complaints':
            result = await dbService.getComplaints();
            break;
          case 'attendance':
            result = await dbService.getAttendance();
            break;
          case 'inventory':
            result = await dbService.getInventory();
            break;
          case 'invoices':
            result = await dbService.getInvoices();
            break;
          case 'commissions':
            result = await dbService.getCommissions(filters.freelancerId);
            break;
          case 'notifications':
            result = await dbService.getNotifications(filters.userId);
            break;
          default:
            throw new Error(`Unknown table: ${table}`);
        }

        setData(result);
      } catch (err) {
        setError(err.message);
        console.error(`Error loading ${table}:`, err);
      } finally {
        setLoading(false);
      }
    };

    const setupRealTime = () => {
      subscription = dbService.subscribeToTable(table, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        setData(currentData => {
          switch (eventType) {
            case 'INSERT':
              return [newRecord, ...currentData];
            case 'UPDATE':
              return currentData.map(item => 
                item.id === newRecord.id ? newRecord : item
              );
            case 'DELETE':
              return currentData.filter(item => item.id !== oldRecord.id);
            default:
              return currentData;
          }
        });
      }, filters);
    };

    loadData().then(() => {
      setupRealTime();
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [table, ...dependencies]);

  const refetch = async () => {
    await loadData();
  };

  return { data, loading, error, refetch };
};

// Hook for file uploads
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file, metadata) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await dbService.uploadDocument(file, metadata);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 500);

      return result;
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  return { uploadFile, uploading, uploadProgress };
};

// Hook for real-time notifications
export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let subscription = null;

    const loadNotifications = async () => {
      try {
        const data = await dbService.getNotifications(userId);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    const setupRealTime = () => {
      subscription = dbService.subscribeToTable('notifications', (payload) => {
        if (payload.new?.user_id === userId) {
          const { eventType, new: newRecord } = payload;
          
          if (eventType === 'INSERT') {
            setNotifications(prev => [newRecord, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(newRecord.title, {
                body: newRecord.message,
                icon: '/favicon.ico'
              });
            }
          } else if (eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => n.id === newRecord.id ? newRecord : n)
            );
            if (newRecord.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      }, { filter: `user_id=eq.${userId}` });
    };

    loadNotifications().then(() => {
      setupRealTime();
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await dbService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return { notifications, unreadCount, markAsRead };
};