import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
const handleLogin = async () => {
  if (isSubmitting) return;

  if (!phone || !password) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  try {
    setIsSubmitting(true);
    let email = phone.trim();
    if (!email.includes('@')) {
      const { data: profileByPhone, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', phone.trim())
        .maybeSingle();

      if (lookupError || !profileByPhone?.email) {
        alert('Aucun compte trouvé avec ce numéro.');
        return;
      }
      email = profileByPhone.email;
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (authError) {
      alert('Numéro/email ou mot de passe incorrect.');
      return;
    }

    const sessionUser = authData.user;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (profileError || !profileData) {
      alert('Connexion réussie, mais profil introuvable.');
      return;
    }

    localStorage.setItem('user', JSON.stringify(profileData));
    navigate('/dashboard');
  } catch (error) {
    console.error(error);
    alert('Impossible de se connecter pour le moment.');
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="login-container">

      {/* Feuilles décoratives */}
      <img src="/leaf-top.png" alt="" className="login-leaf-top" />
      <img src="/leaf-bottom.png" alt="" className="login-leaf-bottom" />

      {/* Ronds décoratifs */}
      <div className="login-wave-top"></div>
      <div className="login-wave-bottom"></div>

      <div className="login-content">

        {/* Logo */}
        <div className="login-logo-wrapper">
          <img src="/logo-ecocycle-beige.png" alt="EcoCycle Mali" className="login-logo" />
        </div>

        {/* Titre tout en bleu */}
        <h1 className="login-title">
          <span>EcoCycle</span>
          <span> Mali</span>
        </h1>

        {/* Slogan */}
        <div className="login-slogan-row">
          <span className="slogan-line"></span>
          <span className="login-slogan">Assainir, transformer, 🌿 protéger</span>
          <span className="slogan-line"></span>
        </div>

        {/* Carte formulaire */}
        <div className="login-card">

          <h2 className="card-title">Se connecter</h2>
          <p className="card-desc">Entrez vos informations pour accéder à votre compte.</p>

          {/* Téléphone */}
          <div className="input-wrapper">
            <span className="input-icon">
              <Phone size={18} color="#2E7D32" strokeWidth={2} />
            </span>
            <input
              type="tel"
              placeholder="Numéro de téléphone"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Mot de passe */}
          <div className="input-wrapper">
            <span className="input-icon">
              <Lock size={18} color="#2E7D32" strokeWidth={2} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword
                ? <EyeOff size={18} color="#999" strokeWidth={2} />
                : <Eye size={18} color="#999" strokeWidth={2} />
              }
            </button>
          </div>

          {/* Mot de passe oublié */}
          <div className="forgot-row">
            <a href="#" className="forgot-link">Mot de passe oublié ?</a>
          </div>

          {/* Bouton connexion */}
          <button className="btn-login" onClick={handleLogin} disabled={isSubmitting}>
  {isSubmitting ? 'Connexion...' : 'Se connecter'}
</button>

          {/* Séparateur */}
          <div className="divider">
            <span className="divider-line"></span>
            <span className="divider-text">ou</span>
            <span className="divider-line"></span>
          </div>

          {/* Lien inscription */}
          <div className="signup-section">
            <p className="signup-text">Vous n'avez pas de compte ?</p>
            <span className="link-signup" onClick={() => navigate('/register')}>
              S'inscrire
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}