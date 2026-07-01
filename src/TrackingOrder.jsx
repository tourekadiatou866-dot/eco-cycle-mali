import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Check,
  Package,
  ShoppingBag,
  Wrench,
  Zap,
  FileText,
  Recycle,
  User
} from 'lucide-react';
import './TrackingOrder.css';
import BottomNavigation from './BottomNavigation';

export default function TrackingOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData || {};
  const [callSimulated, setCallSimulated] = useState(false);
  const [messageSimulated, setMessageSimulated] = useState(false);

  const handleBackToReport = () => {
    navigate('/signaler');
  };

  const handleCall = () => {
  window.location.href = `tel:${collector.phone}`;
};

const handleMessage = () => {
  window.location.href = `sms:${collector.phone}`;
};

  // Données du collecteur (à remplacer par une vraie base de données plus tard)
  const wasteIcons = {
  'plastic-hard': <Recycle size={32} color="#2E7D32" />,
  'plastic-bag': <ShoppingBag size={32} color="#2E7D32" />,
  'bottle': <Package size={32} color="#2E7D32" />,
  'iron': <Wrench size={32} color="#2E7D32" />,
  'aluminium': <Zap size={32} color="#2E7D32" />,
  'paper': <FileText size={32} color="#2E7D32" />
};

  const collector = {
    name: 'Mamadou Koné',
    rating: 4.8,
    reviews: 120,
   phone: '+22371745455',
    distance: '10 min',
    distanceKm: '2,4 km',
    image: null,
  };

  return (
    <div className="tracking-container">
      {/* Header */}
      <header className="tracking-header">
        <button className="back-btn" onClick={handleBackToReport}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="tracking-title">Suivi de ma demande</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="tracking-main">
        {/* Success Message */}
        <div className="success-section">
          <div className="success-illustration">
  <User size={64} color="#2E7D32" />
</div>
          <h2 className="success-title">Nous avons trouvé un collecteur pour vous !</h2>
          <p className="success-subtitle">Nous avons trouvé un collecteur pour vous !</p>

          <div className="success-badge">
            <Check size={20} className="success-icon" />
            <div className="success-content">
              <p className="success-label">Votre demande a été envoyée avec succès !</p>
              <p className="success-text">Un collecteur a été notifié et est en route.</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="summary-section">
          <h3 className="summary-title">Récapitulatif de votre demande</h3>

          <div className="summary-card">
            <div className="summary-image">
  {wasteIcons[orderData.iconId]}
</div>
            <div className="summary-info">
              <p className="summary-type">
  {orderData.type}
</p>

<p className="summary-details">
  <span className="detail-item">
    {orderData.quantity} kg
  </span>

  <span className="detail-item">
    {orderData.pricePerKg} FCFA/kg
  </span>
</p>
            </div>
          </div>

          <div className="summary-values">
            <div className="summary-value">
              <p className="value-label">Valeur estimée</p>
              <p className="value-amount">
  {orderData.totalPrice} FCFA
</p>
            </div>
            <div className="summary-value">
              <p className="value-label">Points gagnés</p>
              <p className="value-amount">
  {Math.floor(orderData.totalPrice / 10)} pts
</p>
              
            </div>
          </div>
        </div>

        {/* Collection Status */}
        <div className="status-section">
          <h3 className="status-title">Statut de la collecte</h3>

          <div className="status-timeline">
            {/* Step 1 */}
            <div className="status-step completed">
              <div className="status-marker">
                <Check size={16} />
              </div>
              <div className="status-content">
                <p className="status-label">Demande envoyée</p>
                <p className="status-time">12 Mai 2024 à 10:30</p>
              </div>
              <p className="status-badge">Terminé</p>
            </div>

            {/* Step 2 */}
            <div className="status-step completed">
              <div className="status-marker">
                <Check size={16} />
              </div>
              <div className="status-content">
                <p className="status-label">Collecteur assigné</p>
                <p className="status-time">12 Mai 2024 à 10:35</p>
              </div>
              <p className="status-badge">Terminé</p>
            </div>

            {/* Step 3 */}
            <div className="status-step active">
              <div className="status-marker">
                <div className="status-pulse"></div>
              </div>
              <div className="status-content">
                <p className="status-label">Collecteur en route</p>
                <p className="status-time">Estimation : 10 min</p>
              </div>
              <p className="status-badge">En cours</p>
            </div>

            {/* Step 4 */}
            <div className="status-step">
              <div className="status-marker">
                <div className="status-circle"></div>
              </div>
              <div className="status-content">
                <p className="status-label">Collecte effectuée</p>
                <p className="status-time">Vous serez notifié à la fin</p>
              </div>
              <p className="status-badge">À venir</p>
            </div>
          </div>
        </div>

        {/* Collector Info */}
        <div className="collector-section">
          <h3 className="collector-title">Votre collecteur</h3>

          <div className="collector-card">
            <div className="collector-avatar">
  <User size={32} color="#2E7D32" />
</div>
            <div className="collector-info">
              <p className="collector-name">{collector.name}</p>
              <div className="collector-rating">
                <span className="rating-stars">★ {collector.rating}</span>
                <span className="rating-reviews">({collector.reviews} avis)</span>
              </div>
            </div>
            <div className="collector-distance">
              <p className="distance-time">{collector.distance}</p>
              <p className="distance-km">{collector.distanceKm}</p>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="contact-buttons">
            <button 
              className="contact-btn call-btn"
              onClick={handleCall}
            >
              <Phone size={18} />
              <span>Appeler</span>
            </button>
            <button 
              className="contact-btn message-btn"
              onClick={handleMessage}
            >
              <MessageCircle size={18} />
              <span>Message</span>
            </button>
          </div>

          <p className="notification-hint">
            ✓ Vous serez notifié lorsque la collecte sera terminée.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="report" />
    </div>
  );
}