import React, { useState, useEffect } from 'react';
import { Bell, Clock, BookOpen, X, RotateCcw, Trash2 } from 'lucide-react';
import { backend_url } from './utils/backend';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = Cookies.get('token');

  useEffect(() => {
    fetchNotifications();
    
    // Check if we came from a notification click
    const urlParams = new URLSearchParams(location.search);
    const notificationId = urlParams.get('notificationId');
    if (notificationId) {
      // Mark notification as read and highlight it
      markAsRead(notificationId);
    }
  }, [location]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios(`${backend_url}/api/notifications/user-notifications`, {
      });

        const data = response.data;
        setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios(`${backend_url}/api/notifications/mark-read/${notificationId}`, {
        method: 'PATCH',
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios(`${backend_url}/api/notifications/mark-all-read`, {
        method: 'PATCH',
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios(`${backend_url}/api/notifications/delete/${notificationId}`, {
        method: 'DELETE',
      });
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      if (selectedNotification?._id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await axios(`${backend_url}/api/notifications/clear-all`, {
          method: 'DELETE',
        });
        
        setNotifications([]);
        setSelectedNotification(null);
      } catch (error) {
        console.error('Error clearing all notifications:', error);
      }
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'daily_quote':
        return <BookOpen className="w-5 h-5 text-orange-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['all', 'unread', 'read'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType === 'unread' && unreadCount > 0 && (
              <span className="ml-1 text-xs">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-400">
                {filter === 'all' && 'Daily Bhagavad Gita quotes will appear here when enabled.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead
                    ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } ${
                  selectedNotification?._id === notification._id
                    ? 'ring-2 ring-orange-500'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {notification.body}
                    </p>
                    
                    {notification.data?.fullQuote && (
                      <div className="mt-2 text-xs text-orange-600">
                        📖 Contains full verse
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Detail Panel */}
        <div className="lg:col-span-1">
          {selectedNotification ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Notification Details
                </h2>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {selectedNotification.body}
                  </p>
                </div>
                
                {selectedNotification.data?.fullQuote && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Full Quote:</h4>
                    <p className="text-orange-700 text-sm leading-relaxed">
                      {selectedNotification.data.fullQuote}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    Received: {new Date(selectedNotification.createdAt).toLocaleString()}
                  </div>
                  
                  {selectedNotification.isRead && selectedNotification.readAt && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <RotateCcw className="w-3 h-3" />
                      Read: {new Date(selectedNotification.readAt).toLocaleString()}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => deleteNotification(selectedNotification._id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Notification
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Select a notification to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;