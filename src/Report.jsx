import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Minus,
  Scale,
  MapPin,
  Camera,
  Check,
  Leaf,
  ShoppingBag,
  Package,
  Wrench,
  Zap,
  FileText,
  Lightbulb,
  Recycle,
  Send
} from 'lucide-react';

import './Report.css';
import BottomNavigation from './BottomNavigation';
import { supabase } from './supabaseClient';

const wasteTypes = [
  {
    id: 'plastic-hard',
    label: 'Plastique dur',
    price: 200,
    icon: <Recycle size={24} />
  },
  {
    id: 'plastic-bag',
    label: 'Plastique sachet',
    price: 75,
    icon: <ShoppingBag size={24} />
  },
  {
    id: 'bottle',
    label: 'Bouteille plastique',
    price: 150,
    icon: <Package size={24} />
  },
  {
    id: 'iron',
    label: 'Fer',
    price: 150,
    icon: <Wrench size={24} />
  },
  {
    id: 'aluminium',
    label: 'Aluminium',
    price: 800,
    icon: <Zap size={24} />
  },
  {
    id: 'paper',
    label: 'Papier / Journaux',
    price: 100,
    icon: <FileText size={24} />
  }
];

export default function Report() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(
  "Récupération de votre position..."
);
useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          const city =
            data.address.suburb ||
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Quartier inconnu";

          const country = data.address.country || "Mali";

          setLocation(`${city}, ${country}`);
        } catch (error) {
          setLocation("Localisation détectée automatiquement");
        }
      },
      () => {
        setLocation("Impossible de récupérer votre position");
      }
    );
  } else {
    setLocation("La géolocalisation n'est pas supportée");
  }
}, []);
  const selectedWaste = wasteTypes.find(
    waste => waste.id === selectedType
  );

  const totalPrice = selectedWaste
    ? selectedWaste.price * quantity
    : 0;

 const handleQuantityChange = (delta) => {
  setQuantity(
    Math.min(50, Math.max(1, quantity + delta))
  );
};

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Veuillez vous connecter pour soumettre une collecte.');
      navigate('/login');
      return;
    }

    if (!selectedType) {
      alert('Veuillez sélectionner un type de déchet');
      return;
    }

    const reportData = {
      user_id: user.id,
      waste_type: selectedWaste.label,
      weight: quantity,
      description: `${selectedWaste.label} collectés`,
      location: location,
      status: 'en_attente',
      points: Math.floor(totalPrice / 10),
      photo_url: photo || null
    };

    try {
      const { error } = await supabase.from('waste_reports').insert([reportData]);
      if (error) {
        throw error;
      }

      navigate('/tracking', {
        state: {
          orderData: {
            type: selectedWaste.label,
            iconId: selectedWaste.id,
            quantity,
            pricePerKg: selectedWaste.price,
            totalPrice,
            location,
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR')
          }
        }
      });
    } catch (error) {
      console.error(error);
      alert(error?.message || "Erreur lors de l'enregistrement");
    }
  };

   

  return (
    <div className="report-container">

      <header className="report-header">
        <button
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="report-title">
          Signaler des déchets
        </h1>

        
      </header>

      <main className="report-main">

        <div className="intro-highlight">
          <div className="intro-highlight-text">
            <p className="highlight-main">
              Chaque déchet signalé
            </p>

            <p className="highlight-sub">
              = un quartier plus propre et de l'argent gagné
            </p>
          </div>

          <Leaf size={36} color="#2E7D32" />
        </div>

        <div className="form-section">
          <div className="step-header">
            <span className="step-number">1</span>
            <h2 className="step-title">
              Type de déchet
            </h2>
          </div>

          <div className="waste-types">
            {wasteTypes.map((type) => (
              <button
                key={type.id}
                className={`waste-type-btn ${
                  selectedType === type.id ? 'active' : ''
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <span className="type-icon-svg">
                  {type.icon}
                </span>

                <span className="type-label">
                  {type.label}
                </span>

                {selectedType === type.id && (
                  <Check
                    size={14}
                    className="check-icon"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedType && (
          <>
            <div className="form-section">

              <div className="step-header">
                <span className="step-number">2</span>
                <h2 className="step-title">
                  Quantité estimée
                </h2>
              </div>

              <div className="quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                >
                  <Minus size={18} />
                </button>

                <span className="qty-display">
                  {quantity} kg
                </span>

                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="balance-container">

  <Scale
    size={110}
    className="balance-icon"
    style={{
      transform: `rotate(${(quantity - 25) * 1.2}deg)`,
      transition: '0.5s ease'
    }}
  />

  <p className="balance-value">
    ⚖️ Balance dynamique
  </p>

</div>

              <p className="qty-hint">
                <Lightbulb
                  size={14}
                  color="#8b8b8b"
                />

                Plus la quantité est précise,
                plus vous gagnez d'argent.
              </p>

              <div className="price-summary">

                <div className="price-summary-item">
                  <span className="price-summary-label">
                    Prix par kilo
                  </span>

                  <span className="price-summary-value">
                    {selectedWaste.price} FCFA/kg
                  </span>
                </div>

                <div className="price-summary-divider"></div>

                <div className="price-summary-item">
                  <span className="price-summary-label">
                    Montant estimé
                  </span>

                  <span className="price-summary-value green">
                    {totalPrice} FCFA
                  </span>
                </div>

              </div>
            </div>

            <div className="form-section">
              <div className="step-header">
                <span className="step-number">3</span>
                <h2 className="step-title">
                  Localisation
                </h2>
              </div>

              <div className="location-display">
                <MapPin
                  size={20}
                  color="#2E7D32"
                />

                <span className="location-text">
  {location}
</span>
              </div>
            </div>

            <div className="form-section">
              <div className="step-header">
                <span className="step-number">4</span>
                <h2 className="step-title">
                  Photo (optionnel)
                </h2>
              </div>

              <div className="photo-upload">

  <input
    type="file"
    accept="image/*"
    id="photoInput"
    style={{ display: 'none' }}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }}
  />

  <label htmlFor="photoInput" className="upload-label">
    <Camera size={32} color="#2E7D32" />

    <p className="upload-text">
      Cliquez pour ajouter une photo
    </p>
  </label>

  {photo && (
  <div className="preview-container">
    <img
      src={photo}
      alt="Déchet"
      className="preview-image"
    />

    <button
      className="remove-photo-btn"
      onClick={() => setPhoto(null)}
    >
      Supprimer la photo
    </button>
  </div>
)}


</div>
            </div>

            <button className="btn-submit" onClick={handleSubmit}>
  <Send size={20} />
  <span>Soumettre la collecte</span>
</button>
          </>
        )}

      </main>

      <BottomNavigation activeTab="report" />

    </div>
  );
}