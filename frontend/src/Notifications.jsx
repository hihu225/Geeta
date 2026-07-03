import React, { useState, useEffect, useContext } from 'react';
import { Bell, Clock, BookOpen, X, RotateCcw, Trash2, ArrowLeft, Sparkles, Heart, Star } from 'lucide-react';
import { backend_url } from './utils/backend';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ThemeContext } from "./ThemeContext";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useContext(ThemeContext);

  // Auth header is set globally in Layout.jsx via axios.defaults — no per-component token read needed.

  useEffect(() => {
    fetchNotifications();
    const urlParams = new URLSearchParams(location.search);
    const notificationId = urlParams.get('notificationId');
    if (notificationId) {
      markAsRead(notificationId);
    }
  }, [location]);

  function renderFormattedQuote(text) {
    const html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br /><br />');
    return { __html: html };
  }

  function formatBody(text) {
    return {
      __html: text.replace(/''/g, '<strong>$1</strong>')
    };
  }

  const formatNotificationBody = (text) => {
    return {
      __html: text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    };
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios(`${backend_url}/api/notifications/user-notifications`, {});
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
    const isDark = theme !== 'light';
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all notifications and cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF6C6C',
      cancelButtonColor: '#E6B85C',
      confirmButtonText: 'Yes, delete all',
      background: isDark ? '#221535' : '#FFFDF5',
      color: isDark ? '#FBF1DE' : '#3A2410',
    });

    if (result.isConfirmed) {
      try {
        await axios(`${backend_url}/api/notifications/clear-all`, {
          method: 'DELETE',
        });
        setNotifications([]);
        setSelectedNotification(null);
        Swal.fire({
          title: 'Deleted!',
          text: 'All notifications have been cleared.',
          icon: 'success',
          background: isDark ? '#221535' : '#FFFDF5',
          color: isDark ? '#FBF1DE' : '#3A2410',
        });
      } catch (error) {
        console.error('Error clearing all notifications:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to clear notifications.',
          icon: 'error',
          background: isDark ? '#221535' : '#FFFDF5',
          color: isDark ? '#FBF1DE' : '#3A2410',
        });
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
        return <BookOpen {...iconProps} />;
      case 'reminder':
        return <Clock {...iconProps} />;
      case 'wisdom':
        return <Sparkles {...iconProps} />;
      case 'achievement':
        return <Star {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
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
      <div className="nt-page">
        <div className="nt-bg-elements">
          <div className="nt-orb nt-orb-1"></div>
          <div className="nt-orb nt-orb-2"></div>
        </div>
        <div className="nt-loading-container">
          <div className="nt-spinner"></div>
        </div>
        {notificationStyles}
      </div>
    );
  }

  return (
    <div className="nt-page">
      <div className="nt-bg-elements">
        <div className="nt-orb nt-orb-1"></div>
        <div className="nt-orb nt-orb-2"></div>
        <div className="nt-om">🕉️</div>
      </div>

      <div className="nt-content">
        <div className="nt-header">
          <button onClick={handleBack} className="nt-back-btn">
            <ArrowLeft size={16} />
            Back to Settings
          </button>

          <div className="nt-title-section">
            <div className="nt-title-left">
              <div>
                <h1 className="nt-title">Spiritual Notifications</h1>
                <p className="nt-subtitle">Divine wisdom and reminders for your spiritual journey</p>
              </div>
              {unreadCount > 0 && (
                <div className="nt-unread-badge">
                  <Sparkles size={14} />
                  {unreadCount} new
                </div>
              )}
            </div>

            <div className="nt-action-buttons">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="nt-action-btn nt-primary-btn">
                  <RotateCcw size={14} />
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAllNotifications} className="nt-action-btn nt-danger-btn">
                  <Trash2 size={14} />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="nt-filter-section">
          <div className="nt-filter-tabs">
            {[
              { key: 'all', label: 'All Messages' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' }
            ].map(filterType => (
              <button
                key={filterType.key}
                onClick={() => setFilter(filterType.key)}
                className={`nt-filter-tab ${filter === filterType.key ? 'is-active' : ''}`}
              >
                {filterType.label}
                {filterType.key === 'unread' && unreadCount > 0 && (
                  <span className="nt-filter-count">({unreadCount})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="nt-main">
          <div className="nt-list">
            {filteredNotifications.length === 0 ? (
              <div className="nt-empty">
                <Bell className="nt-empty-icon" />
                <h3 className="nt-empty-title">
                  {filter === 'unread' ? 'No New Messages' :
                    filter === 'read' ? 'No Read Messages' : 'No Notifications Yet'}
                </h3>
                <p className="nt-empty-msg">
                  {filter === 'all' && 'Daily Bhagavad Gita wisdom and spiritual reminders will appear here.'}
                  {filter === 'unread' && 'All your messages have been read. New spiritual insights will appear here.'}
                  {filter === 'read' && 'Read messages will be shown here once you have some.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`nt-card ${!notification.isRead ? 'is-unread' : ''}`}
                  >
                    <div className="nt-card-header">
                      <div className="nt-card-icon">
                        {icon}
                      </div>
                      <div className="nt-card-content">
                        <h3 className="nt-card-title">{notification.title}</h3>
                        <p
                          className="nt-card-body"
                          dangerouslySetInnerHTML={formatNotificationBody(notification.body)}
                        />
                        <div className="nt-card-meta">
                          <div className="nt-card-meta-left">
                            <span className="nt-card-time">
                              {formatTime(notification.createdAt)}
                            </span>
                            {notification.data?.fullQuote && (
                              <div className="nt-quote-tag">
                                <BookOpen size={10} />
                                Full Verse
                              </div>
                            )}
                          </div>
                          {!notification.isRead && (
                            <div className="nt-unread-dot"></div>
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
      </div>

      {selectedNotification && (
        <div className="nt-modal-overlay" onClick={closeModal}>
          <div className="nt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nt-modal-header">
              <h2 className="nt-modal-title">
                <Sparkles size={20} />
                Sacred Message
              </h2>
              <button onClick={closeModal} className="nt-close-btn" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="nt-modal-body">
              <div className="nt-detail-section">
                <h3 className="nt-detail-section-title">
                  <BookOpen size={16} />
                  {selectedNotification.title}
                </h3>
                <p className="nt-detail-text" dangerouslySetInnerHTML={formatBody(selectedNotification.body)} />
              </div>

              {selectedNotification.data?.fullQuote && (
                <div className="nt-detail-section">
                  <h4 className="nt-detail-section-title">
                    <Star size={16} />
                    Sacred Verse
                  </h4>
                  <div className="nt-quote-box">
                    <p
                      className="nt-quote-text"
                      dangerouslySetInnerHTML={renderFormattedQuote(selectedNotification.data.fullQuote)}
                    />
                  </div>
                </div>
              )}

              <div className="nt-meta-info">
                <div className="nt-meta-row">
                  <Clock size={14} />
                  <span>Received: {new Date(selectedNotification.createdAt).toLocaleString()}</span>
                </div>
                {selectedNotification.isRead && selectedNotification.readAt && (
                  <div className="nt-meta-row">
                    <Heart size={14} />
                    <span>Read: {new Date(selectedNotification.readAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="nt-modal-footer">
              <button
                onClick={() => deleteNotification(selectedNotification._id)}
                className="nt-delete-btn"
              >
                <Trash2 size={16} />
                Remove Message
              </button>
            </div>
          </div>
        </div>
      )}

      {notificationStyles}
    </div>
  );
};

const notificationStyles = (
  <style>{`
    .nt-page {
      min-height: 100vh;
      width: 100%;
      padding: 2rem 1.25rem;
      font-family: var(--font-body);
      color: var(--text-body);
      background: var(--grad-bg);
      box-sizing: border-box;
      position: relative;
      overflow-x: hidden;
    }

    .nt-bg-elements {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    }
    .nt-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: nt-drift 60s infinite linear alternate;
    }
    .nt-orb-1 {
      width: 340px; height: 340px;
      top: 8%; left: 10%;
      background: radial-gradient(circle, var(--saffron) 0%, transparent 70%);
    }
    .nt-orb-2 {
      width: 300px; height: 300px;
      bottom: 12%; right: 6%;
      background: radial-gradient(circle, var(--gold) 0%, transparent 70%);
      animation-delay: -20s;
    }
    @keyframes nt-drift {
      from { transform: translate(-6vw, -6vh) scale(0.9); }
      to   { transform: translate(6vw, 6vh) scale(1.15); }
    }
    .nt-om {
      position: absolute;
      top: 3rem;
      right: 3rem;
      opacity: 0.1;
      font-size: 5rem;
      filter: drop-shadow(0 0 24px rgba(245, 166, 35, 0.35));
      pointer-events: none;
      animation: nt-pulse 4.5s infinite ease-in-out;
    }
    @keyframes nt-pulse { 0%,100% { opacity: 0.1; } 50% { opacity: 0.18; } }

    .nt-content {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 10;
    }

    .nt-header {
      max-width: 1200px;
      margin: 0 auto 2rem;
    }

    .nt-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-soft);
      border-radius: var(--r-full);
      padding: 10px 18px;
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      color: var(--text-body);
      transition: all var(--dur-fast) var(--ease-out);
      margin-bottom: 1.5rem;
    }
    .nt-back-btn:hover {
      color: var(--gold-bright);
      border-color: var(--border-strong);
      background: var(--bg-glass-hover);
      transform: translateY(-1px);
      box-shadow: var(--glow-gold);
    }

    .nt-title-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .nt-title-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .nt-title {
      font-family: var(--font-display);
      font-size: clamp(1.9rem, 4.2vw, 2.6rem);
      font-weight: 600;
      background: var(--grad-gold);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: var(--tracking-tight);
      line-height: 1.15;
    }
    .nt-subtitle {
      font-size: 0.95rem;
      color: var(--text-muted);
      font-weight: 400;
      margin: 4px 0 0 0;
    }

    .nt-unread-badge {
      background: var(--grad-gold);
      color: #1a0f00;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: var(--r-full);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: var(--glow-gold);
      letter-spacing: var(--tracking-wide);
    }

    .nt-action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .nt-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: var(--r-full);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease-out);
      border: 1px solid var(--border-soft);
      letter-spacing: var(--tracking-wide);
    }
    .nt-primary-btn {
      background: var(--grad-gold);
      border-color: transparent;
      color: #1a0f00;
      box-shadow: var(--shadow-sm), var(--glow-gold), inset 0 1px 0 rgba(255,255,255,0.35);
    }
    .nt-primary-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md), var(--glow-gold-strong);
      filter: brightness(1.05);
    }
    .nt-danger-btn {
      background: transparent;
      border-color: var(--error);
      color: var(--error);
    }
    .nt-danger-btn:hover {
      background: var(--error-soft);
      transform: translateY(-1px);
    }

    /* Filter tabs */
    .nt-filter-section {
      max-width: 1200px;
      margin: 0 auto 2rem;
    }
    .nt-filter-tabs {
      display: inline-flex;
      gap: 4px;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 5px;
      border-radius: var(--r-full);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-sm);
    }
    .nt-filter-tab {
      padding: 8px 18px;
      border-radius: var(--r-full);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease-out);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      letter-spacing: var(--tracking-wide);
    }
    .nt-filter-tab:hover:not(.is-active) {
      color: var(--gold-bright);
      background: var(--bg-glass-hover);
    }
    .nt-filter-tab.is-active {
      background: var(--grad-gold);
      color: #1a0f00;
      box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.35);
    }
    .nt-filter-count { margin-left: 6px; font-weight: 600; }

    .nt-main {
      max-width: 1200px;
      margin: 0 auto;
    }

    .nt-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Card */
    .nt-card {
      background: var(--grad-glass);
      backdrop-filter: blur(28px) saturate(140%);
      -webkit-backdrop-filter: blur(28px) saturate(140%);
      border-radius: var(--r-xl);
      padding: 1.15rem 1.25rem;
      cursor: pointer;
      transition: all var(--dur-med) var(--ease-out);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-sm);
    }
    .nt-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md), var(--glow-gold);
    }
    .nt-card.is-unread {
      border-color: var(--border-strong);
      background: linear-gradient(135deg, rgba(245,201,122,0.09), rgba(255,255,255,0.02));
      box-shadow: var(--shadow-md), var(--glow-gold);
    }

    .nt-card-header {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
    }
    .nt-card-icon {
      width: 42px;
      height: 42px;
      border-radius: var(--r-full);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--bg-glass);
      border: 1px solid var(--border-soft);
      color: var(--gold-bright);
    }
    .nt-card.is-unread .nt-card-icon {
      background: var(--grad-gold);
      color: #1a0f00;
      border-color: transparent;
      box-shadow: var(--glow-gold);
    }

    .nt-card-content {
      flex: 1;
      min-width: 0;
    }
    .nt-card-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px 0;
      line-height: 1.35;
    }
    .nt-card-body {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.55;
      margin: 0 0 0.5rem 0;
    }
    .nt-card-body strong { color: var(--gold-bright); font-weight: 600; }
    .nt-card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .nt-card-meta-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nt-card-time {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: var(--tracking-wide);
    }
    .nt-unread-dot {
      width: 8px;
      height: 8px;
      background: var(--gold-bright);
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: var(--glow-gold);
    }
    .nt-quote-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(245, 200, 120, 0.1);
      border: 1px solid var(--border-soft);
      color: var(--gold-bright);
      font-size: 0.7rem;
      font-weight: 500;
      padding: 3px 9px;
      border-radius: var(--r-full);
      letter-spacing: var(--tracking-wide);
    }

    /* Empty state */
    .nt-empty {
      text-align: center;
      padding: 4rem 1.25rem;
      background: var(--grad-glass);
      backdrop-filter: blur(28px) saturate(140%);
      -webkit-backdrop-filter: blur(28px) saturate(140%);
      border: 1px solid var(--border-soft);
      border-radius: var(--r-2xl);
      box-shadow: var(--shadow-lg);
    }
    .nt-empty-icon {
      width: 4rem;
      height: 4rem;
      color: var(--gold);
      opacity: 0.5;
      margin-bottom: 1rem;
    }
    .nt-empty-title {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }
    .nt-empty-msg {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
      max-width: 420px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Modal */
    .nt-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 7, 21, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.25rem;
      animation: nt-fade 0.25s var(--ease-out);
    }
    @keyframes nt-fade { from { opacity: 0; } to { opacity: 1; } }

    .nt-modal {
      background: var(--grad-glass);
      background-color: var(--bg-elevated);
      backdrop-filter: blur(28px) saturate(140%);
      -webkit-backdrop-filter: blur(28px) saturate(140%);
      border-radius: var(--r-2xl);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-xl), var(--glow-gold);
      max-width: 620px;
      width: 100%;
      max-height: 82vh;
      overflow: hidden;
      animation: nt-modal-in 0.35s var(--ease-out);
      display: flex;
      flex-direction: column;
    }
    @keyframes nt-modal-in {
      from { opacity: 0; transform: translateY(-15px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .nt-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid var(--border-soft);
      background: linear-gradient(135deg, rgba(245,201,122,0.08), transparent);
    }
    .nt-modal-title {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 0;
      letter-spacing: var(--tracking-tight);
    }
    .nt-modal-title svg { color: var(--gold-bright); }
    .nt-close-btn {
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--r-full);
      transition: all var(--dur-fast) var(--ease-out);
      background: transparent;
      border: 1px solid var(--border-soft);
      display: flex;
    }
    .nt-close-btn:hover {
      background: var(--bg-glass-hover);
      color: var(--gold-bright);
      border-color: var(--border-strong);
    }

    .nt-modal-body {
      padding: 1.5rem 1.75rem;
      max-height: 60vh;
      overflow-y: auto;
    }
    .nt-detail-section { margin-bottom: 1.5rem; }
    .nt-detail-section-title {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nt-detail-section-title svg { color: var(--gold-bright); }
    .nt-detail-text {
      font-size: 0.95rem;
      color: var(--text-body);
      line-height: 1.65;
      margin: 0;
    }
    .nt-detail-text strong { color: var(--gold-bright); font-weight: 600; }

    .nt-quote-box {
      background: rgba(245, 200, 120, 0.05);
      border: 1px solid var(--border-soft);
      border-radius: var(--r-md);
      padding: 1.15rem 1.25rem;
      border-left: 3px solid var(--gold);
      margin: 0.75rem 0;
    }
    .nt-quote-text {
      font-family: var(--font-display);
      font-size: 1.05rem;
      color: var(--text-primary);
      font-style: italic;
      line-height: 1.7;
      margin: 0;
    }
    .nt-quote-text strong { color: var(--gold-bright); font-style: normal; font-weight: 600; }

    .nt-meta-info {
      background: var(--bg-glass);
      border-radius: var(--r-md);
      padding: 0.9rem 1.1rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      border: 1px solid var(--border-soft);
    }
    .nt-meta-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }
    .nt-meta-row:last-child { margin-bottom: 0; }
    .nt-meta-row svg { color: var(--gold-bright); flex-shrink: 0; }

    .nt-modal-footer {
      padding: 1.15rem 1.75rem;
      border-top: 1px solid var(--border-soft);
      background: linear-gradient(135deg, rgba(245,201,122,0.03), transparent);
    }
    .nt-delete-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: transparent;
      color: var(--error);
      border: 1px solid var(--error);
      border-radius: var(--r-full);
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease-out);
      letter-spacing: var(--tracking-wide);
    }
    .nt-delete-btn:hover {
      background: var(--error-soft);
      transform: translateY(-1px);
    }

    /* Loading */
    .nt-loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      position: relative;
      z-index: 10;
    }
    .nt-spinner {
      width: 44px;
      height: 44px;
      border: 3px solid var(--border-soft);
      border-top: 3px solid var(--gold-bright);
      border-radius: 50%;
      animation: nt-spin 1s linear infinite;
      box-shadow: var(--glow-gold);
    }
    @keyframes nt-spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }

    @media (max-width: 640px) {
      .nt-page { padding: 1rem 0.75rem; }
      .nt-title-section { flex-direction: column; align-items: flex-start; }
      .nt-modal-header, .nt-modal-body, .nt-modal-footer { padding-left: 1.25rem; padding-right: 1.25rem; }
      .nt-om { font-size: 3rem; top: 1rem; right: 1rem; }
    }
  `}</style>
);

export default Notifications;
