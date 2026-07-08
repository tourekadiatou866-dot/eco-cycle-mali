import EcoCycleAI from "./EcoCycleAI";
import actu1 from './assets/actu1.jpeg';
import actu2 from './assets/actu2.jpeg';
import actu3 from './assets/actu3.jpeg';
import actu4 from './assets/actu4.jpeg'; 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import {
  Bell,
  MapPin,
  Star,
  TrendingUp,
  BarChart2,
  Target,
  Cloud,
  Leaf,
  Users,
  Newspaper,
  Clock,
  Recycle,
  Droplets,
  Bike,
  TreePine,
  Package,
  ShoppingBag,
  Battery,
  Lightbulb,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import NotificationModal from './NotificationModal';
import BottomNavigation from './BottomNavigation';
import './Dashboard.css';


export default function Dashboard() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  };
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();
const [stats, setStats] = useState({
  points: 0,
  balance: 0,
  total_weight: 0,
  collections: 0,
  pending: 0
});

const GOAL_KG = 20;
const LEVEL_STEP = 2000;

const safePoints = Number(stats.points) || 0;
const safeBalance = Number(stats.balance) || 0;
const safeWeight = Number(stats.total_weight) || 0;

const currentLevel = Math.floor(safePoints / LEVEL_STEP) + 1;
const nextLevelThreshold = currentLevel * LEVEL_STEP;
const pointsToNextLevel = Math.max(0, nextLevelThreshold - safePoints);
const levelProgress = Math.min(
  100,
  Math.round(((safePoints % LEVEL_STEP) / LEVEL_STEP) * 100)
);
const goalProgress = Math.min(100, Math.round((safeWeight / GOAL_KG) * 100));

const estimatedCo2Saved = safeWeight * 1.8;
const estimatedTreesSaved = safeWeight / 25;
const estimatedPlasticBagsAvoided = Math.round(safeWeight * 12);

const numberFormatter = new Intl.NumberFormat('fr-FR');
const decimalFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1
});

useEffect(() => {
  const syncUser = () => {
    setUser(getStoredUser());
  };

  window.addEventListener('storage', syncUser);
  window.addEventListener('ecocycle:user-updated', syncUser);
  return () => {
    window.removeEventListener('storage', syncUser);
    window.removeEventListener('ecocycle:user-updated', syncUser);
  };
}, []);

useEffect(() => {
  if (!user?.id) return;

  const fetchStats = async () => {
    try {
      const [
        { data: profileStats, error: profileError },
        { count: collectionsCount, error: collectionsError },
        { count: pendingCount, error: pendingError }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('points,balance,total_weight')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('waste_reports')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('waste_reports')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['en_attente', 'en_cours'])
      ]);

      if (profileError) throw profileError;
      if (collectionsError) throw collectionsError;
      if (pendingError) throw pendingError;

      setStats({
        points: Number(profileStats?.points) || 0,
        balance: Number(profileStats?.balance) || 0,
        total_weight: Number(profileStats?.total_weight) || 0,
        collections: collectionsCount || 0,
        pending: pendingCount || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();

  const realtimeSubscription = supabase
    .channel(`dashboard-changes-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'waste_reports',
        filter: `user_id=eq.${user.id}`
      },
      () => fetchStats()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'withdrawals',
        filter: `user_id=eq.${user.id}`
      },
      () => fetchStats()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(realtimeSubscription);
  };
}, [user?.id]);
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
  <p className="header-greeting">Bienvenue 👋</p>
  <h1 className="header-name">{user?.name}</h1>
</div>
          <div className="header-right">
            <button className="notification-btn" onClick={() => setIsNotificationOpen(true)}>
              <Bell size={20} />
              <span className="notification-badge"></span>
            </button>
            <div
  className="profile-avatar"
  onClick={() => navigate('/profile')}
>
  <img
    src={
      user?.photo ||
      `https://ui-avatars.com/api/?name=${user?.name}&background=2E7D32&color=fff&size=128`
    }
    alt="Profil"
    className="dashboard-profile-image"
  />
</div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
       
{/* Points Card */}
<div className="points-card">

  <div className="points-left">

    <div className="points-badge">
      <Star size={16} color="#FF9800" fill="#FF9800" />
      <span>Mes points</span>
    </div>

    <h1 className="big-points">
  {numberFormatter.format(safePoints)}<span> pts</span>
</h1>

    <p className="points-equivalent">
  ≈ {numberFormatter.format(safeBalance)} FCFA
</p>

    <div className="points-motivation">
      🌱 Continue, chaque geste compte
    </div>

  </div>

  <div className="points-right">

    <div className="level-header">
      <span>Niveau {currentLevel} 🌿</span>
      <span>{levelProgress}%</span>
    </div>

    <div className="level-bar">
      <div className="level-fill" style={{ width: `${levelProgress}%` }}></div>
    </div>

    <p className="level-next">
      Prochain niveau : {numberFormatter.format(pointsToNextLevel)} pts
    </p>

  </div>

</div>
        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={22} color="#2E7D32" /></div>
            <h3 className="stat-title">Déchets collectés</h3>
           <p className="stat-value">
  {numberFormatter.format(safeWeight)} kg
</p>
            <p className="stat-period">Depuis ton inscription</p>
            <p className="stat-trend">{numberFormatter.format(stats.collections)} demandes</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Star size={22} color="#FF9800" fill="#FF9800" /></div>
            <h3 className="stat-title">Équivalent gagné</h3>
            <p className="stat-value">
  {numberFormatter.format(safeBalance)}
</p>
            <p className="stat-period">FCFA</p>
            <p className="stat-trend">Valeur issue de tes collectes</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><BarChart2 size={22} color="#1565C0" /></div>
            <h3 className="stat-title">Points cumulés</h3>
            <p className="stat-value">{numberFormatter.format(safePoints)} pts</p>
            <p className="stat-period">Niveau {currentLevel}</p>
            <p className="stat-trend">{numberFormatter.format(stats.pending)} en attente</p>
          </div>
        </div>

        {/* Monthly Goal */}
        <div className="goal-section">
          <div className="goal-header">
            <div className="goal-icon"><Target size={28} color="#2E7D32" /></div>
            <div className="goal-info">
              <h3 className="goal-title">Mon objectif du mois</h3>
              <p className="goal-description">Collecter 20 kg de déchets</p>
            </div>
            <span className="goal-arrow">›</span>
          </div>
          <div className="goal-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${goalProgress}%` }}></div>
            </div>
            <div className="progress-info">
              <span className="progress-text">{numberFormatter.format(safeWeight)} / {GOAL_KG} kg</span>
              <span className="progress-percent">{goalProgress}%</span>
            </div>
          </div>
        </div>
{/* Recommandations EcoCycle */}
<div className="recommendations-section">

  <div className="recommendations-header">
    <h3>💡 Recommandations EcoCycle</h3>
  </div>

  <div className="recommendations-grid">

    <div className="recommendation-card">
      <Recycle size={32} color="#2E7D32" />
      <h4>Triez vos déchets</h4>
      <p>Séparez plastique, carton et métal.</p>
    </div>

    <div className="recommendation-card">
      <Droplets size={32} color="#2196F3" />
      <h4>Économisez l'eau</h4>
      <p>Fermez le robinet quand inutile.</p>
    </div>

    <div className="recommendation-card">
      <Bike size={32} color="#FF9800" />
      <h4>Privilégiez le vélo</h4>
      <p>Réduisez votre empreinte carbone.</p>
    </div>

    <div className="recommendation-card">
      <TreePine size={32} color="#4CAF50" />
      <h4>Plantez un arbre</h4>
      <p>Chaque arbre aide l'environnement.</p>
    </div>

    <div className="recommendation-card">
      <Package size={32} color="#795548" />
      <h4>Réutilisez vos cartons</h4>
      <p>Donnez une seconde vie aux emballages.</p>
    </div>

    <div className="recommendation-card">
      <ShoppingBag size={32} color="#E91E63" />
      <h4>Sacs réutilisables</h4>
      <p>Réduisez les sacs plastiques.</p>
    </div>

    <div className="recommendation-card">
      <Battery size={32} color="#607D8B" />
      <h4>Recyclez les piles</h4>
      <p>Déposez-les dans les points de collecte.</p>
    </div>

    <div className="recommendation-card">
      <Leaf size={32} color="#4CAF50" />
      <h4>Consommez local</h4>
      <p>Réduisez les émissions de transport.</p>
    </div>

    <div className="recommendation-card">
      <Lightbulb size={32} color="#FFC107" />
      <h4>Éteignez les lumières</h4>
      <p>Économisez l'énergie au quotidien.</p>
    </div>

    <div className="recommendation-card">
      <Trash2 size={32} color="#F44336" />
      <h4>Gardez votre quartier propre</h4>
      <p>Déposez les déchets aux endroits prévus.</p>
    </div>

  </div>

</div>
        
        {/* Actualités */}
<div className="news-section">
  <div className="news-header">
    <div className="news-header-left">
      <Newspaper size={20} color="#2E7D32" />
      <h3 className="news-title">Actualités</h3>
    </div>
  </div>

  <div className="news-list">

    {/* Actualité 1 */}
    <div className="news-card">
      <img
        src={actu1}
        alt="Recyclage Mali"
        className="news-image"
      />

      <div className="news-tag tag-green">
        Recyclage
      </div>

      <h4 className="news-card-title">
        Le Mali renforce sa politique de gestion des déchets plastiques
      </h4>

      <p className="news-card-desc">
        Le gouvernement malien annonce un nouveau programme de collecte sélective dans les grandes villes du pays.
      </p>

      <div className="news-card-footer">
        <div className="news-meta">
          <Clock size={12} />
          <span>Il y a 2 heures</span>
        </div>

        <div className="news-meta">
          <MapPin size={12} />
          <span>Bamako</span>
        </div>
      </div>
    </div>

    {/* Actualité 2 */}
    <div className="news-card">
      <img
        src={actu2}
        alt="Nettoyage quartier"
        className="news-image"
      />

      <div className="news-tag tag-blue">
        Écologie
      </div>

      <h4 className="news-card-title">
        Journée mondiale de l'environnement : Bamako mobilise ses quartiers
      </h4>

      <p className="news-card-desc">
        Des milliers de citoyens participent au nettoyage collectif organisé dans plusieurs communes de la capitale.
      </p>

      <div className="news-card-footer">
        <div className="news-meta">
          <Clock size={12} />
          <span>Il y a 5 heures</span>
        </div>

        <div className="news-meta">
          <MapPin size={12} />
          <span>Mali</span>
        </div>
      </div>
    </div>

    {/* Actualité 3 */}
    <div className="news-card">
      <img
        src={actu3}
        alt="Récompenses recyclage"
        className="news-image"
      />

      <div className="news-tag tag-orange">
        Récompenses
      </div>

      <h4 className="news-card-title">
        EcoCycle Mali double les points pour le plastique ce mois-ci
      </h4>

      <p className="news-card-desc">
        Profitez de l'offre spéciale : chaque kilogramme de plastique rapporte deux fois plus de points jusqu'au 30 juin.
      </p>

      <div className="news-card-footer">
        <div className="news-meta">
          <Clock size={12} />
          <span>Il y a 1 jour</span>
        </div>

        <div className="news-meta">
          <MapPin size={12} />
          <span>EcoCycle Mali</span>
        </div>
      </div>
    </div>

    {/* Actualité 4 */}
    <div className="news-card">
      <img
        src={actu4}
        alt="Environnement Afrique"
        className="news-image"
      />

      <div className="news-tag tag-green">
        Environnement
      </div>

      <h4 className="news-card-title">
        Rapport ONU : l'Afrique de l'Ouest réduit ses émissions de CO₂ grâce au recyclage
      </h4>

      <p className="news-card-desc">
        Une étude révèle que les initiatives de recyclage communautaire ont permis de réduire 15% des émissions dans la région.
      </p>

      <div className="news-card-footer">
        <div className="news-meta">
          <Clock size={12} />
          <span>Il y a 2 jours</span>
        </div>

        <div className="news-meta">
          <MapPin size={12} />
          <span>Afrique de l'Ouest</span>
        </div>
      </div>
    </div>

  </div>
</div>
{/* Localisation EcoCycle Mali */}

<div className="location-card">

  <div className="location-header">
    <MapPin size={28} color="#2e7d32" />
    <div>
      <h2>Localisation EcoCycle Mali</h2>
      <p>Retrouvez-nous facilement</p>
    </div>
  </div>

  <iframe
    src="https://maps.google.com/maps?q=Palais%20des%20Sports%20ACI%202000%20Bamako&t=&z=15&ie=UTF8&iwloc=&output=embed"
    width="100%"
    height="280"
    style={{ border: 0 }}
    loading="lazy"
  ></iframe>

  <div className="address-section">
    <MapPin size={24} color="#2e7d32" />

    <div>
      <h3>ACI 2000, Bamako, Mali</h3>
      <p>Près du Palais des Sports</p>
    </div>
  </div>

  <div className="contact-card">

    <div className="contact-row">
      <Mail size={22} color="#2e7d32" />
      <span>Email</span>
      <strong>contact.ecocyclemali@gmail.com</strong>
    </div>

    <div className="contact-row">
      <Phone size={22} color="#2e7d32" />
      <span>Téléphone</span>
      <strong>+223 71 74 54 55</strong>
    </div>

    <div className="contact-row">
      <Clock size={22} color="#2e7d32" />
      <span>Horaires</span>
      <strong>Lun - Sam : 24h/24</strong>
    </div>

  </div>

  <button
    className="maps-btn"
    onClick={() =>
      window.open(
        "https://maps.google.com/?q=Palais+des+Sports+ACI+2000+Bamako",
        "_blank"
      )
    }
  >
    Voir sur Google Maps
  </button>

</div>
{/* Environmental Impact */}
        <div className="impact-section">
          <div className="impact-header">
            <h3 className="impact-title">Impact environnemental</h3>
            <span className="impact-arrow">›</span>
          </div>
          <div className="impact-grid">

  <div className="impact-card">
    <div className="impact-icon">
      <Cloud size={24} color="#1565C0" />
    </div>
    <p className="impact-value">{decimalFormatter.format(estimatedCo2Saved)} kg</p>
    <p className="impact-label">CO₂ réduit (estim.)</p>
    <span className="impact-badge">Basé sur ton poids recyclé</span>
  </div>

  <div className="impact-card">
    <div className="impact-icon">
      <Leaf size={24} color="#2E7D32" />
    </div>
    <p className="impact-value">{decimalFormatter.format(estimatedTreesSaved)}</p>
    <p className="impact-label">Arbres sauvés (estim.)</p>
    <span className="impact-badge">Conversion environnementale</span>
  </div>

  <div className="impact-card">
    <div className="impact-icon">
      <Recycle size={24} color="#43A047" />
    </div>
    <p className="impact-value">{numberFormatter.format(estimatedPlasticBagsAvoided)}</p>
    <p className="impact-label">Sachets évités (estim.)</p>
    <span className="impact-badge">Effet positif de ton tri</span>
  </div>

  <div className="impact-card">
    <div className="impact-icon">
      <Users size={24} color="#FF6F00" />
    </div>
    <p className="impact-value">{numberFormatter.format(safePoints)}</p>
    <p className="impact-label">Points gagnés</p>
    <span className="impact-badge">≈ {numberFormatter.format(safeBalance)} FCFA</span>
  </div>

</div>

<div className="impact-footer">
  <span>
    🌱 Merci ! Grâce à vous, nous construisons un Mali plus propre et durable.
  </span>

</div>

</div>

</main>

<NotificationModal
  isOpen={isNotificationOpen}
  onClose={() => setIsNotificationOpen(false)}
/>

<BottomNavigation activeTab="home" />

<EcoCycleAI />

</div>
);
}