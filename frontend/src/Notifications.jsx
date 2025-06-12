import React, { useState, useEffect } from 'react';
import { Bell, Clock, BookOpen, X, RotateCcw, Trash2, ArrowLeft, Sparkles, Heart, Star } from 'lucide-react';
import { backend_url } from './utils/backend';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import "./hihu.css"; 
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = Cookies.get('token');

  // Enhanced styles with Bhagavad Gita theme
  const styles = {
    

    header: {
      maxWidth: "1200px",
      margin: "0 auto",
      marginBottom: "32px",
    },

    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      color: "#9a3412",
      transition: "all 0.2s ease",
      marginBottom: "24px",
      width: "fit-content",
    },

    titleSection: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px",
    },

    titleLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    mainTitle: {
      fontSize: "32px",
      fontWeight: "800",
      color: "#9a3412",
      margin: 0,
      letterSpacing: "-0.5px",
    },

    subtitle: {
      fontSize: "16px",
      color: "#c2410c",
      fontWeight: "400",
      marginTop: "4px",
    },

    unreadBadge: {
      backgroundColor: "#f97316",
      color: "white",
      fontSize: "14px",
      fontWeight: "600",
      padding: "4px 12px",
      borderRadius: "20px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },

    actionButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },

    actionButton: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "1px solid",
    },

    primaryButton: {
      backgroundColor: "#f97316",
      borderColor: "#f97316",
      color: "white",
    },

    dangerButton: {
      backgroundColor: "#dc2626",
      borderColor: "#dc2626",
      color: "white",
    },

    filterSection: {
      maxWidth: "1200px",
      margin: "0 auto",
      marginBottom: "32px",
    },

    filterTabs: {
      display: "flex",
      gap: "4px",
      backgroundColor: "#ffffff",
      padding: "4px",
      borderRadius: "12px",
      width: "fit-content",
      border: "1px solid #fed7aa",
      boxShadow: "0 2px 8px rgba(154, 52, 18, 0.08)",
    },

    filterTab: {
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "none",
      backgroundColor: "transparent",
    },

    filterTabActive: {
      backgroundColor: "#f97316",
      color: "white",
      boxShadow: "0 2px 4px rgba(249, 115, 22, 0.3)",
    },

    filterTabInactive: {
      color: "#c2410c",
    },

    mainContent: {
      maxWidth: "1200px",
      margin: "0 auto",
    },

    notificationsList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },

    notificationCard: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "20px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "1px solid #fed7aa",
      boxShadow: "0 2px 8px rgba(154, 52, 18, 0.06)",
    },

    notificationCardUnread: {
      backgroundColor: "#fff7ed",
      borderColor: "#fb923c",
      boxShadow: "0 4px 12px rgba(154, 52, 18, 0.12)",
    },

    notificationHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      marginBottom: "8px",
    },

    notificationIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: "2px",
    },

    wisdomIcon: {
      backgroundColor: "#fef3c7",
      color: "#f59e0b",
    },

    reminderIcon: {
      backgroundColor: "#dbeafe",
      color: "#3b82f6",
    },

    defaultIcon: {
      backgroundColor: "#f3f4f6",
      color: "#6b7280",
    },

    notificationContent: {
      flex: 1,
      minWidth: 0,
    },

    notificationTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#9a3412",
      marginBottom: "4px",
      lineHeight: "1.4",
    },

    notificationBody: {
      fontSize: "14px",
      color: "#c2410c",
      lineHeight: "1.5",
      marginBottom: "8px",
    },

    notificationMeta: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
    },

    notificationTime: {
      fontSize: "12px",
      color: "#a16207",
      fontWeight: "500",
    },

    unreadDot: {
      width: "8px",
      height: "8px",
      backgroundColor: "#f97316",
      borderRadius: "50%",
      flexShrink: 0,
    },

    quoteTag: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      backgroundColor: "#fef3c7",
      color: "#a16207",
      fontSize: "11px",
      fontWeight: "500",
      padding: "2px 8px",
      borderRadius: "20px",
    },

    // Modal styles
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },

    modalContent: {
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      border: "1px solid #fed7aa",
      boxShadow: "0 20px 40px rgba(154, 52, 18, 0.15)",
      maxWidth: "600px",
      width: "100%",
      maxHeight: "80vh",
      overflow: "hidden",
      animation: "modalSlideIn 0.3s ease-out",
    },

    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "24px",
      borderBottom: "1px solid #fed7aa",
      backgroundColor: "#fff7ed",
    },

    modalTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#9a3412",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    closeButton: {
      color: "#c2410c",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "8px",
      transition: "all 0.2s ease",
      backgroundColor: "transparent",
      border: "none",
    },

    modalBody: {
      padding: "24px",
      maxHeight: "60vh",
      overflowY: "auto",
    },

    detailSection: {
      marginBottom: "24px",
    },

    detailSectionTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#9a3412",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    detailText: {
      fontSize: "15px",
      color: "#c2410c",
      lineHeight: "1.6",
    },

    quoteBox: {
      backgroundColor: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: "12px",
      padding: "20px",
      borderLeft: "4px solid #f97316",
      margin: "12px 0",
    },

    quoteText: {
      fontSize: "15px",
      color: "#9a3412",
      fontStyle: "italic",
      lineHeight: "1.7",
    },

    metaInfo: {
      backgroundColor: "#fefbf5",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "13px",
      color: "#a16207",
      border: "1px solid #fed7aa",
    },

    metaRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },

    modalFooter: {
      padding: "20px 24px",
      borderTop: "1px solid #fed7aa",
      backgroundColor: "#fefbf5",
    },

    deleteButton: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "12px 16px",
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    emptyState: {
      textAlign: "center",
      padding: "64px 20px",
      color: "#c2410c",
    },

    emptyIcon: {
      width: "80px",
      height: "80px",
      color: "#fed7aa",
      marginBottom: "16px",
    },

    emptyTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#9a3412",
      marginBottom: "8px",
    },

    emptyMessage: {
      fontSize: "14px",
      color: "#c2410c",
    },

    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
    },

    loadingSpinner: {
      width: "40px",
      height: "40px",
      border: "3px solid #fed7aa",
      borderTop: "3px solid #f97316",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

  useEffect(() => {
    // Add CSS animations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .notification-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(154, 52, 18, 0.15) !important;
      }

      .back-btn:hover {
        background-color: #fed7aa !important;
        border-color: #fb923c !important;
        transform: translateY(-1px);
      }

      .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .filter-tab:hover {
        background-color: #fff7ed !important;
      }

      .close-btn:hover {
        background-color: #fed7aa !important;
        color: #9a3412 !important;
      }

      .delete-btn:hover {
        background-color: #b91c1c !important;
      }

      .modal-overlay {
        backdrop-filter: blur(4px);
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Check if we came from a notification click
    const urlParams = new URLSearchParams(location.search);
    const notificationId = urlParams.get('notificationId');
    if (notificationId) {
      markAsRead(notificationId);
    }
  }, [location]);
function renderFormattedQuote(text) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold markdown
    .replace(/\n/g, '<br /><br />');                        // line breaks
  return { __html: html };
}
function formatBody(text) {
  return {
    __html: text
      .replace(/''/g, '<strong>$1</strong>') // Bold
  };
}
const formatNotificationBody = (text) => {
  return {
    __html: text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold
  };
};

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
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will delete all notifications and cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete all',
  });

  if (result.isConfirmed) {
    try {
      await axios(`${backend_url}/api/notifications/clear-all`, {
        method: 'DELETE',
      });

      setNotifications([]);
      setSelectedNotification(null);

      Swal.fire('Deleted!', 'All notifications have been cleared.', 'success');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      Swal.fire('Error', 'Failed to clear notifications.', 'error');
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
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'daily_quote':
        return { icon: <BookOpen {...iconProps} />, style: styles.wisdomIcon };
      case 'reminder':
        return { icon: <Clock {...iconProps} />, style: styles.reminderIcon };
      case 'wisdom':
        return { icon: <Sparkles {...iconProps} />, style: styles.wisdomIcon };
      case 'achievement':
        return { icon: <Star {...iconProps} />, style: styles.wisdomIcon };
      default:
        return { icon: <Bell {...iconProps} />, style: styles.defaultIcon };
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-not">
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={handleBack}
          style={styles.backButton}
          className="back-btn"
        >
          <ArrowLeft size={16} />
          Back to Settings
        </button>

        <div style={styles.titleSection}>
          <div style={styles.titleLeft}>
            <div>
              <h1 style={styles.mainTitle}>Spiritual Notifications</h1>
              <p style={styles.subtitle}>Divine wisdom and reminders for your spiritual journey</p>
            </div>
            {unreadCount > 0 && (
              <div style={styles.unreadBadge}>
                <Sparkles size={14} />
                {unreadCount} new
              </div>
            )}
          </div>
          
          <div style={styles.actionButtons}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{...styles.actionButton, ...styles.primaryButton}}
                className="action-btn"
              >
                <RotateCcw size={14} />
                Mark All Read
              </button>
            )}
            
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                style={{...styles.actionButton, ...styles.dangerButton}}
                className="action-btn"
              >
                <Trash2 size={14} />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterSection}>
        <div style={styles.filterTabs}>
          {[
            { key: 'all', label: 'All Messages' },
            { key: 'unread', label: 'Unread' },
            { key: 'read', label: 'Read' }
          ].map(filterType => (
            <button
              key={filterType.key}
              onClick={() => setFilter(filterType.key)}
              style={{
                ...styles.filterTab,
                ...(filter === filterType.key ? styles.filterTabActive : styles.filterTabInactive)
              }}
              className="filter-tab"
            >
              {filterType.label}
              {filterType.key === 'unread' && unreadCount > 0 && (
                <span style={{ marginLeft: '6px', fontWeight: '600' }}>({unreadCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Notifications List */}
        <div style={styles.notificationsList}>
          {filteredNotifications.length === 0 ? (
            <div style={styles.emptyState}>
              <Bell style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>
                {filter === 'unread' ? 'No New Messages' : 
                 filter === 'read' ? 'No Read Messages' : 'No Notifications Yet'}
              </h3>
              <p style={styles.emptyMessage}>
                {filter === 'all' && 'Daily Bhagavad Gita wisdom and spiritual reminders will appear here.'}
                {filter === 'unread' && 'All your messages have been read. New spiritual insights will appear here.'}
                {filter === 'read' && 'Read messages will be shown here once you have some.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { icon, style: iconStyle } = getNotificationIcon(notification.type);
              
              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    ...styles.notificationCard,
                    ...(!notification.isRead ? styles.notificationCardUnread : {})
                  }}
                  className="notification-card"
                >
                  <div style={styles.notificationHeader}>
                    <div style={{...styles.notificationIcon, ...iconStyle}}>
                      {icon}
                    </div>
                    
                    <div style={styles.notificationContent}>
                      <h3 style={styles.notificationTitle}>
                        {notification.title}
                      </h3>
                      
                      <p
  style={styles.notificationBody}
  dangerouslySetInnerHTML={formatNotificationBody(notification.body)}
/>

                      
                      <div style={styles.notificationMeta}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={styles.notificationTime}>
                            {formatTime(notification.createdAt)}
                          </span>
                          
                          {notification.data?.fullQuote && (
                            <div style={styles.quoteTag}>
                              <BookOpen size={10} />
                              Full Verse
                            </div>
                          )}
                        </div>
                        
                        {!notification.isRead && (
                          <div style={styles.unreadDot}></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal for Notification Details */}
      {selectedNotification && (
        <div style={styles.modalOverlay} className="modal-overlay" onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Sparkles size={20} />
                Sacred Message
              </h2>
              <button
                onClick={closeModal}
                style={styles.closeButton}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.detailSection}>
                <h3 style={styles.detailSectionTitle}>
                  <BookOpen size={16} />
                  {selectedNotification.title}
                </h3>
                <p style={styles.detailText} dangerouslySetInnerHTML={formatBody(selectedNotification.body)} />

              </div>
              
              {selectedNotification.data?.fullQuote && (
                <div style={styles.detailSection}>
                  <h4 style={styles.detailSectionTitle}>
                    <Star size={16} />
                    Sacred Verse
                  </h4>
                  <div style={styles.quoteBox}>
  <p
    style={styles.quoteText}
    dangerouslySetInnerHTML={renderFormattedQuote(selectedNotification.data.fullQuote)}
  />
</div>

                </div>
              )}
              
              <div style={styles.metaInfo}>
                <div style={styles.metaRow}>
                  <Clock size={14} />
                  <span>Received: {new Date(selectedNotification.createdAt).toLocaleString()}</span>
                </div>
                
                {selectedNotification.isRead && selectedNotification.readAt && (
                  <div style={styles.metaRow}>
                    <Heart size={14} />
                    <span>Read: {new Date(selectedNotification.readAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button
                onClick={() => deleteNotification(selectedNotification._id)}
                style={styles.deleteButton}
                className="delete-btn"
              >
                <Trash2 size={16} />
                Remove Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;