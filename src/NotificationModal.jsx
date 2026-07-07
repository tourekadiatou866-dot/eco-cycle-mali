import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Settings,
  Check,
  Truck,
  Coins,
  Wallet,
  Gift,
} from 'lucide-react';
import './NotificationModal.css';
import { supabase } from './supabaseClient';

export default function NotificationModal({ isOpen, onClose }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const createTimeBucket = (dateInput) => {
    if (!dateInput) return 'older';
    const date = new Date(dateInput);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'today';
    if (date.toDateString() === yesterday.toDateString()) return 'yesterday';
    return 'older';
  };

  const createTimeText = (dateInput) => {
    if (!dateInput) return '--:--';
    return new Date(dateInput).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [{ data: reports, error: reportsError }, { data: withdrawals, error: withdrawalsError }] =
        await Promise.all([
          supabase
            .from('waste_reports')
            .select('id, waste_type, weight, status, points, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('withdrawals')
            .select('id, amount_fcfa, method, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)
        ]);

      if (reportsError) throw reportsError;
      if (withdrawalsError) throw withdrawalsError;

      const reportNotifications = (reports || []).map((report) => {
        const isDone = report.status === 'complete';
        const isPending = report.status === 'en_attente' || report.status === 'en_cours';

        return {
          id: `report-${report.id}`,
          type: isDone ? 'success' : isPending ? 'truck' : 'coins',
          icon: isDone ? Check : isPending ? Truck : Coins,
          title: isDone ? 'Collecte effectuée' : 'Demande de collecte enregistrée',
          description: `${report.waste_type} • ${report.weight} kg`,
          details: `+${report.points || 0} pts`,
          created_at: report.created_at,
          time: createTimeText(report.created_at),
          date: createTimeBucket(report.created_at),
          read: createTimeBucket(report.created_at) !== 'today'
        };
      });

      const withdrawalNotifications = (withdrawals || []).map((withdrawal) => ({
        id: `withdrawal-${withdrawal.id}`,
        type: 'wallet',
        icon: Wallet,
        title: 'Retrait effectué',
        description: `${withdrawal.amount_fcfa || 0} FCFA via ${withdrawal.method}`,
        details: 'Transaction validée',
        created_at: withdrawal.created_at,
        time: createTimeText(withdrawal.created_at),
        date: createTimeBucket(withdrawal.created_at),
        read: createTimeBucket(withdrawal.created_at) !== 'today'
      }));

      const welcomeNotification = {
        id: 'welcome',
        type: 'welcome',
        icon: Gift,
        title: 'Bienvenue sur EcoCycle Mali',
        description: 'Chaque collecte améliore votre quartier et augmente vos points.',
        details: null,
        created_at: null,
        time: '--:--',
        date: 'older',
        read: true
      };

      const mergedNotifications = [...reportNotifications, ...withdrawalNotifications, welcomeNotification]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setNotifications(mergedNotifications);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications();
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notification-updates-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waste_reports', filter: `user_id=eq.${user.id}` },
        () => loadNotifications()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals', filter: `user_id=eq.${user.id}` },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = useMemo(
    () =>
    activeFilter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications,
    [activeFilter, notifications]
  );

  const todayNotifications = filteredNotifications.filter((n) => n.date === 'today');
  const yesterdayNotifications = filteredNotifications.filter((n) => n.date === 'yesterday');
  const olderNotifications = filteredNotifications.filter((n) => n.date === 'older');

  if (!isOpen) return null;

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notification-header">
          <div className="notification-title-section">
            <h2 className="notification-title">Notifications</h2>
            <p className="notification-subtitle">Restez informé en temps réel.</p>
          </div>
          <div className="notification-header-actions">
            <button className="settings-btn">
              <Settings size={20} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="notification-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Toutes ({notifications.length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            <span className="unread-dot"></span>
            Non lues ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="notification-list">
          {loading && (
            <div className="notification-section">
              <h3 className="section-title">Chargement...</h3>
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="notification-section">
              <h3 className="section-title">Aucune notification pour le moment</h3>
            </div>
          )}

          {todayNotifications.length > 0 && (
            <div className="notification-section">
              <h3 className="section-title">Aujourd'hui</h3>
              {todayNotifications.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </div>
          )}

          {yesterdayNotifications.length > 0 && (
            <div className="notification-section">
              <h3 className="section-title">Hier</h3>
              {yesterdayNotifications.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </div>
          )}

          {olderNotifications.length > 0 && (
            <div className="notification-section">
              <h3 className="section-title">Plus tôt</h3>
              {olderNotifications.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ notification }) {
  const IconComponent = notification.icon;
  const iconColors = {
    success: '#2E7D32',
    truck: '#1976D2',
    coins: '#F57C00',
    promo: '#7B1FA2',
    wallet: '#F57F17',
    welcome: '#E91E63',
  };

  const bgColors = {
    success: '#E8F5E9',
    truck: '#E3F2FD',
    coins: '#FFF3E0',
    promo: '#F3E5F5',
    wallet: '#FFFDE7',
    welcome: '#FCE4EC',
  };

  return (
    <div className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
      <div
        className="notification-icon"
        style={{ backgroundColor: bgColors[notification.type] }}
      >
        <IconComponent size={24} color={iconColors[notification.type]} />
      </div>
      <div className="notification-content">
        <h4 className="notification-item-title">{notification.title}</h4>
        <p className="notification-item-description">{notification.description}</p>
        {notification.details && (
          <p className="notification-item-details">{notification.details}</p>
        )}
      </div>
      <div className="notification-meta">
        <span className="notification-time">{notification.time}</span>
        {!notification.read && <span className="unread-indicator"></span>}
      </div>
    </div>
  );
}