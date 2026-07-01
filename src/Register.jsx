import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Register.css';
import { supabase } from './supabaseClient';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (!agreeTerms) {
      alert('Veuillez accepter les conditions');
      return;
    }

    try {
      console.log('Inscription Supabase avec :', formData);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert('Compte créé avec succès 🎉');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert("Impossible de s'inscrire via Supabase");
    }
  };

  return (
    <div className="register-container">
      {/* Feuilles décoratives */}
      <img src="/leaf-top.png" alt="" className="leaf-top" />
      <img src="/leaf-bottom.png" alt="" className="leaf-bottom" />

      <div className="register-content">
        {/* Bouton retour */}
        <button className="back-btn" onClick={() => navigate('/welcome')}>
          <ArrowLeft size={28} />
        </button>

        {/* Titre */}
        <div className="register-card">
          <h2>S'inscrire</h2>
          <p className="register-text">Créez votre compte pour commencer à recycler</p>

          {/* Divider */}
          <div className="divider">
            <span></span>
            🌿
            <span></span>
          </div>

          {/* Nom complet */}
          <input
            type="text"
            name="fullName"
            placeholder="Nom complet"
            className="register-input"
            value={formData.fullName}
            onChange={handleChange}
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            className="register-input"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Téléphone */}
          <input
            type="tel"
            name="phone"
            placeholder="Numéro de téléphone"
            className="register-input"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* Mot de passe */}
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="register-input"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Confirmer mot de passe */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            className="register-input"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* Conditions */}
          <div className="terms">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <p>
              J'accepte les <span>conditions d'utilisation</span>
            </p>
          </div>

          {/* Bouton inscription */}
          <button className="register-btn" onClick={handleRegister}>
            S'inscrire
          </button>

          {/* Lien connexion */}
          <p className="login-link">
            Vous avez déjà un compte ? <span onClick={() => navigate('/login')}>Se connecter</span>
          </p>
        </div>

        {/* Bottom text */}
        <p className="bottom-text">
          Rejoignez la communauté EcoCycle Mali
        </p>
      </div>
    </div>
  );
}