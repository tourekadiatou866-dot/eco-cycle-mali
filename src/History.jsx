import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Recycle,
  Star,
  Wallet,
  Package,
  Calendar,
  MapPin,
  ChevronRight,
  List,
  Banknote
} from 'lucide-react';
import './History.css';
import BottomNavigation from './BottomNavigation';
import { supabase } from './supabaseClient';

export default function History() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [activeNavTab, setActiveNavTab] = useState('history');

  const [activities, setActivities] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async () => {
      try {
        // Charger les collectes de déchets
        const { data: collections, error: collectionsError } = await supabase
          .from('waste_reports')
          .select('*')
          .eq('user_id', user.id);

        if (collectionsError) throw collectionsError;

        // Charger les demandes de retrait de récompenses
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', user.id);

        if (withdrawalsError) throw withdrawalsError;

        // Formater les collectes
        const formattedCollections = collections.map(item => ({
          id: item.id,
          type: 'collection',
          name: item.waste_type,
          weight: `${item.weight} kg`,
          status: item.status,
          date: new Date(item.created_at).toLocaleString('fr-FR'),
          timestamp: new Date(item.created_at).getTime(),
          points: item.points,
          fcfa: item.points * 10,
          icon: '♻️'
        }));

        // Formater les retraits
        const formattedWithdrawals = withdrawals.map(item => ({
          id: item.id,
          type: 'withdrawal',
          name: `Retrait ${item.method}`,
          weight: item.phone,
          status: item.status,
          date: new Date(item.created_at).toLocaleString('fr-FR'),
          timestamp: new Date(item.created_at).getTime(),
          points: -item.points_debited,
          fcfa: -item.amount_fcfa,
          icon: '💵'
        }));

        // Fusionner et trier par date décroissante
        const mergedActivities = [...formattedCollections, ...formattedWithdrawals]
          .sort((a, b) => b.timestamp - a.timestamp);

        setActivities(mergedActivities);
      } catch (err) {
        console.error('Erreur de chargement de l\'historique :', err);
      }
    };

    fetchHistory();
  }, [user?.id]);

  // Filtrer les activités selon l'onglet
  const filteredActivities = activeTab === 'all' 
    ? activities 
    : activeTab === 'collections'
    ? activities.filter(a => a.type === 'collection')
    : activities.filter(a => a.type === 'withdrawal');

  // Calculer les statistiques
  const stats = {
    totalCollections: activities.filter(a => a.type === 'collection').length,
    totalPoints: activities.reduce((sum, a) => sum + a.points, 0),
    totalFcfa: activities
  .filter(a => a.type === 'withdrawal')
  .reduce((sum, a) => sum + a.fcfa, 0),
  };

  const handleNavigate = (path, tab) => {
    setActiveNavTab(tab);
    navigate(path);
  };

  return (
    <div className="history-container">
      {/* Header */}
      <header className="history-header">
  <button
    className="back-btn"
    onClick={() => navigate('/dashboard')}
  >
    <ArrowLeft size={24} />
  </button>

  <div className="header-content">
    <h1 className="history-title">Historique</h1>
    <p className="history-subtitle">
      Suivez toutes vos activités
    </p>
  </div>
</header>

      {/* Main Content */}
      <main className="history-main">
        {/* Tabs */}
        <div className="tabs-container">
          <button
           className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <List size={18} />
            <span className="tab-label">Toutes</span>
          </button>
          <button
           className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            <Recycle size={18} />
            <span className="tab-label">Collectes</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            <Banknote size={18} />
            <span className="tab-label">Retraits</span>
          </button>
        </div>

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-card">
            <div className="summary-icon">
  <Recycle size={34} />
</div>
            <p className="summary-value">{stats.totalCollections}</p>
            <p className="summary-label">Collectes au total</p>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
  <Star size={34} />
</div>
            <p className="summary-value">{stats.totalPoints.toLocaleString('fr-FR')}</p>
            <p className="summary-label">pts</p>
            <p className="summary-sublabel">Points gagnés</p>
          </div>
          <div className="summary-card">
           <div className="summary-icon">
  <Wallet size={34} />
</div>
            <p className="summary-value">{stats.totalFcfa.toLocaleString('fr-FR')}</p>
            <p className="summary-label">FCFA</p>
            <p className="summary-sublabel">Retraits</p>
          </div>
        </div>

        {/* Activities List */}
        <div className="activities-section">
          <h2 className="activities-title">Liste des activités</h2>

          <div className="activities-list">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-info">
                  <h3 className="activity-name">{activity.name}</h3>
                  <p className="activity-details">
                    <span>{activity.weight}</span>
                    <span className="separator">•</span>
                    <span>{activity.status}</span>
                  </p>
                  <p className="activity-date">
                    <span className="clock-icon">🕐</span>
                    {activity.date}
                  </p>
                </div>
                <div className="activity-reward">
                  <p className={`activity-points ${activity.points < 0 ? 'negative' : ''}`}>
                    {activity.points > 0 ? '+' : ''}{activity.points} pts
                  </p>
                  <p className={`activity-fcfa ${activity.fcfa < 0 ? 'negative' : ''}`}>
                    {activity.fcfa > 0 ? '+' : ''}{activity.fcfa} FCFA
                  </p>
                </div>
                <ChevronRight size={20} className="activity-arrow" />
              </div>
            ))}
          </div>
        </div>

        {/* Motivation Message */}
        <div className="motivation-card">
          <div className="motivation-icon">🌱</div>
          <div className="motivation-content">
            <h3 className="motivation-title">Merci pour votre geste pour l'environnement !</h3>
            <p className="motivation-text">Continuez à trier, vous gagnez plus.</p>
          </div>
          <div className="motivation-heart">❤️</div>
        </div>
      </main>

      {/* Bottom Navigation */}
      
     <BottomNavigation activeTab="history" />
    </div>
  );
}