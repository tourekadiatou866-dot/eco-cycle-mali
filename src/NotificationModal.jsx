import React, { useState } from 'react';
import {
  X,
  Settings,
  Check,
  Truck,
  Coins,
  Megaphone,
  Wallet,
  Gift,
} from 'lucide-react';
import './NotificationModal.css';

export default function NotificationModal({ isOpen, onClose }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: Check,
      title: 'Collecte effectuée avec succès',
      description: 'Votre collecte de Plastique (sachets) de 2 kg a été effectuée.',
      details: '+500 pts • +500 FCFA',
      time: '10:45',
      date: 'today',
      read: false,
    },
    {
      id: 2,
      type: 'truck',
      icon: Truck,
      title: 'Le collecteur arrive bientôt',
      description: 'Le collecteur est en route et arrivera dans 10 minutes.',
      time: '10:20',
      date: 'today',
      read: false,
    },
    {
      id: 3,
      type: 'coins',
      icon: Coins,
      title: 'Vous avez gagné des points !',
      description: 'Félicitations ! Vous avez gagné 500 pts (500 FCFA).',
      time: '10:15',
      date: 'today',
      read: false,
    },
    {
      id: 4,
      type: 'promo',
      icon: Megaphone,
      title: 'Promotion spéciale 🎉',
      description: 'Recyclez plus ce mois-ci et gagnez 20% de points en bonus !',
      time: '09:00',
      date: 'today',
      read: false,
    },
    {
      id: 5,
      type: 'wallet',
      icon: Wallet,
      title: 'Retrait effectué',
      description: 'Votre retrait de 1 000 FCFA via Orange Money a été effectué avec succès.',
      time: '16:30',
      date: 'yesterday',
      read: true,
    },
    {
      id: 6,
      type: 'welcome',
      icon: Gift,
      title: 'Bienvenue ! 👋',
      description: 'Merci de rejoindre GreenCollect. Commencez à recycler et gagnez de l\'argent !',
      time: '08:00',
      date: 'older',
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    activeFilter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

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
            className={`filter-btn <LaTex>${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Toutes ({filteredNotifications.length})
          </button>
          <button
            className={`filter-btn $</LaTex>{activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            <span className="unread-dot"></span>
            Non lues ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="notification-list">
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