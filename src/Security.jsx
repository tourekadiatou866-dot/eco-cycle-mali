import React, { useState } from 'react';
import './Security.css';
import { supabase } from './supabaseClient';

export default function Security() {

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert('Mot de passe modifié avec succès 🎉');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification du mot de passe');
    }
  };

  return (
    <div className="security-container">

      <h1>Sécurité</h1>

      <p className="security-subtitle">
        Modifiez votre mot de passe.
      </p>

      <div className="security-card">

        <div className="form-group">
          <label>Ancien mot de passe</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          className="update-password-btn"
          onClick={handleChangePassword}
        >
          Mettre à jour le mot de passe
        </button>

      </div>

    </div>
  );
}