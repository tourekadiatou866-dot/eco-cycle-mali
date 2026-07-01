import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';
import { supabase } from './supabaseClient';

export default function EditProfile() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');

  const handleSave = async () => {
    const updatedUser = {
      ...currentUser,
      name,
      phone,
      address
    };

    try {
      if (currentUser?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ name, phone, address })
          .eq('id', currentUser.id);

        if (error) {
          alert(error.message);
          return;
        }
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profil mis à jour avec succès');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  return (
    <div className="edit-profile-container">

      <h1>Modifier mon profil</h1>

      <div className="form-group">
        <label>Nom complet</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Téléphone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Adresse</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <button className="save-btn" onClick={handleSave}>
        Enregistrer
      </button>

    </div>
  );
}