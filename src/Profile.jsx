import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  User,
  Lock,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Shield,
  Recycle,
  Star,
  Wallet,
  TreePine,
  Camera,
  Smartphone,
  Award,
  BarChart3
} from 'lucide-react';
import './Profile.css';
import BottomNavigation from './BottomNavigation';
import { supabase } from './supabaseClient';

export default function Profile() {
  const navigate = useNavigate();
  const [activeNavTab, setActiveNavTab] = useState('profile');

  const user = JSON.parse(localStorage.getItem('user'));
  const [photo, setPhoto] = useState(
    user?.photo ||
    `https://ui-avatars.com/api/?name=${user?.name}&background=2E7D32&color=fff&size=128`
  );
  const [stats, setStats] = useState({
    collections: 0,
    points: 0,
    fcfa: 0,
    trees: 0
  });

  const level = 'Éco-acteur';
  const motivation = 'Continuez comme ça !';

  useEffect(() => {
    if (!user?.id) return;

    const loadProfileStats = async () => {
      try {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const { count, error: countErr } = await supabase
          .from('waste_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (profile) {
          localStorage.setItem('user', JSON.stringify(profile));
          setPhoto(profile.photo || `https://ui-avatars.com/api/?name=${profile.name}&background=2E7D32&color=fff&size=128`);

          setStats({
            collections: count || 0,
            points: profile.points || 0,
            fcfa: profile.balance || 0,
            trees: Math.floor((profile.points || 0) / 150)
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProfileStats();
  }, [user?.id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      setPhoto(reader.result);

      const updatedUser = {
        ...user,
        photo: reader.result
      };

      try {
        if (user?.id) {
          const { error } = await supabase
            .from('profiles')
            .update({ photo: reader.result })
            .eq('id', user.id);

          if (error) {
            console.error('Erreur lors de la sauvegarde de la photo dans Supabase :', error);
          }
        }
      } catch (err) {
        console.error(err);
      }

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      );
    };

    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir vous déconnecter ?'
      )
    ) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="profile-container">

      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <h1 className="profile-title">Profil</h1>
          <p className="profile-subtitle">
            Gérez vos informations et préférences
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="profile-main">

        {/* Carte utilisateur */}
        <div className="user-card">

          <div className="user-card-content">

            <div className="user-avatar-container">

              <img
  src={photo}
  alt="Photo profil"
  className="profile-image"
/>

              <>
  <input
    type="file"
    accept="image/*"
    id="profilePhoto"
    style={{ display: 'none' }}
    onChange={handlePhotoChange}
  />

  <label
    htmlFor="profilePhoto"
    className="user-edit-btn"
  >
    <Camera size={16} />
  </label>
</>

            </div>

            <div className="user-info">

              <h2 className="user-name">
                {user?.name}
              </h2>

              <div className="user-contact">
                <Smartphone size={16} />
                <span>{user?.phone}</span>
              </div>

              <div className="user-location">
                <Award size={16} />
                <span>Membre EcoCycle Mali</span>
              </div>

            </div>

          </div>

          {/* Niveau */}
          <div className="user-stats">

            <div className="stat-item">
              <Award size={28} />
              <p className="stat-label">Niveau</p>
              <p className="stat-value">{level}</p>
              <p className="stat-motivation">
                {motivation}
              </p>
            </div>

            <div className="stat-item">
              <Recycle size={28} />
              <p className="stat-label">
                Déchets recyclés
              </p>
              <p className="stat-value">
                {stats.collections} kg
              </p>
              <p className="stat-subtitle">
                Depuis votre inscription
              </p>
            </div>

          </div>

        </div>

        {/* Impact */}
        <div className="impact-section">

          <h3 className="section-title">
            <BarChart3 size={22} />
            <span>Mon impact</span>
          </h3>

          <div className="impact-grid">

            <div className="impact-card">
              <Recycle size={30} />
              <p className="impact-value">
                {stats.collections}
              </p>
              <p className="impact-label">
                Collectes réalisées
              </p>
            </div>

            <div className="impact-card">
              <Star size={30} />
              <p className="impact-value">
                {stats.points.toLocaleString('fr-FR')}
              </p>
              <p className="impact-label">
                Points gagnés
              </p>
            </div>

            <div className="impact-card">
              <Wallet size={30} />
              <p className="impact-value">
                {stats.fcfa.toLocaleString('fr-FR')}
              </p>
              <p className="impact-label">
                FCFA retirés
              </p>
            </div>

            <div className="impact-card">
              <TreePine size={30} />
              <p className="impact-value">
                {stats.trees}
              </p>
              <p className="impact-label">
                Arbres préservés
              </p>
            </div>

          </div>

        </div>

        {/* Paramètres */}
        <div className="settings-section">

          <h3 className="section-title">
            <Lock size={22} />
            <span>Paramètres</span>
          </h3>

          <div className="settings-list">

            <button
  className="settings-item"
  onClick={() => navigate('/edit-profile')}
>
              <div className="settings-icon">
                <User size={20} />
              </div>

              <div className="settings-content">
                <p className="settings-label">
                  Modifier mon profil
                </p>
                <p className="settings-desc">
                  Nom, numéro...
                </p>
              </div>

              <ChevronRight size={20} />
            </button>

            <button className="settings-item">
              <div className="settings-icon">
                <Lock size={20} />
              </div>

              <div className="settings-content">
                <p className="settings-label">
                  Sécurité
                </p>
                <p className="settings-desc">
                  Mot de passe
                </p>
              </div>

              <ChevronRight size={20} />
            </button>

            <button className="settings-item">
              <div className="settings-icon">
                <Globe size={20} />
              </div>

              <div className="settings-content">
                <p className="settings-label">
                  Langue
                </p>
                <p className="settings-desc">
                  Français
                </p>
              </div>

              <ChevronRight size={20} />
            </button>

            <button className="settings-item">
              <div className="settings-icon">
                <HelpCircle size={20} />
              </div>

              <div className="settings-content">
                <p className="settings-label">
                  Aide et support
                </p>
                <p className="settings-desc">
                  FAQ, contact
                </p>
              </div>

              <ChevronRight size={20} />
            </button>

            <button className="settings-item">
              <div className="settings-icon">
                <Info size={20} />
              </div>

              <div className="settings-content">
                <p className="settings-label">
                  À propos
                </p>
                <p className="settings-desc">
                  Version 1.0.0
                </p>
              </div>

              <ChevronRight size={20} />
            </button>

          </div>

        </div>

        {/* Déconnexion */}
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
          <ChevronRight size={20} />
        </button>

        {/* Sécurité */}
        <div className="security-info">

          <div className="security-icon-box">
            <Shield size={24} />
          </div>

          <div className="security-content">
            <p className="security-title">
              Vos données sont sécurisées
            </p>

            <p className="security-text">
              Nous protégeons vos informations personnelles.
            </p>
          </div>

        </div>

      </main>

      <BottomNavigation activeTab="profile" />

    </div>
  );
}