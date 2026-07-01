import EcoCycleAI from "./EcoCycleAI";
import actu1 from './assets/actu1.jpeg';
import actu2 from './assets/actu2.jpeg';
import actu3 from './assets/actu3.jpeg';
import actu4 from './assets/actu4.jpeg'; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import {
  Bell,
  MapPin,
  User,
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
  const [activeTab, setActiveTab] = useState('home');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
const [stats, setStats] = useState({
  points: 0,
  balance: 0,
  total_weight: 0
});

useEffect(() => {
  if (!user?.id) return;

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('points, balance, total_weight')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setStats({
          points: data.points || 0,
          balance: data.balance || 0,
          total_weight: data.total_weight || 0
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();

  const profileSubscription = supabase
    .channel(`profile-changes-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      },
      (payload) => {
        setStats({
          points: payload.new.points || 0,
          balance: payload.new.balance || 0,
          total_weight: payload.new.total_weight || 0
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(profileSubscription);
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
  {stats.points}<span> pts</span>
</h1>

    <p className="points-equivalent">
  ≈ {stats.balance} FCFA
</p>

    <div className="points-motivation">
      🌱 Continue, chaque geste compte
    </div>

  </div>

  <div className="points-right">

    <div className="level-header">
      <span>Eco-Héros 🌿</span>
      <span>62%</span>
    </div>

    <div className="level-bar">
      <div className="level-fill"></div>
    </div>

    <p className="level-next">
      Prochain niveau : 2000 pts
    </p>

  </div>

</div>
        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={22} color="#2E7D32" /></div>
            <h3 className="stat-title">Déchets collectés</h3>
           <p className="stat-value">
  {stats.total_weight} kg
</p>
            <p className="stat-period">Ce mois-ci</p>
            <p className="stat-trend">↑ +3 kg vs avril</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Star size={22} color="#FF9800" fill="#FF9800" /></div>
            <h3 className="stat-title">Équivalent gagné</h3>
            <p className="stat-value">
  {stats.balance}
</p>
            <p className="stat-period">FCFA</p>
            <p className="stat-trend">↑ +500 FCFA vs avril</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><BarChart2 size={22} color="#1565C0" /></div>
            <h3 className="stat-title">Classement</h3>
            <p className="stat-value">Top 15%</p>
            <p className="stat-period">Dans ton quartier</p>
            <p className="stat-trend">↑ +2% vs avril</p>
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
              <div className="progress-fill" style={{ width: '60%' }}></div>
            </div>
            <div className="progress-info">
              <span className="progress-text">12 / 20 kg</span>
              <span className="progress-percent">60%</span>
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
    <p className="impact-value">5 kg</p>
    <p className="impact-label">CO₂ réduit</p>
    <span className="impact-badge">+12% ce mois</span>
  </div>

  <div className="impact-card">
    <div className="impact-icon">
      <Leaf size={24} color="#2E7D32" />
    </div>
    <p className="impact-value">2</p>
    <p className="impact-label">Arbres sauvés</p>
    <span className="impact-badge">+1 ce mois</span>
  </div>

  <div className="impact-card">
    <div className="impact-icon">
      <Recycle size={24} color="#43A047" />
    </div>
    <p className="impact-value">128</p>
    <p className="impact-label">Collectes</p>
    <span className="impact-badge">+8 ce mois</span>
  </div>

  <div className="impact-card">
    <div className="impact-icon">
      <Users size={24} color="#FF6F00" />
    </div>
    <p className="impact-value">245</p>
    <p className="impact-label">Utilisateurs</p>
    <span className="impact-badge">+18 ce mois</span>
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