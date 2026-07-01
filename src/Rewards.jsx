import orangeMoneyLogo from "./assets/orange-money.png";
import waveLogo from "./assets/wave.png";
import moovMoneyLogo from "./assets/moov-money.png";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import {
  ArrowLeft,
  Check,
  Lock,
  AlertCircle,
  Smartphone,
  Pencil,
  Wallet
} from 'lucide-react';
import './Rewards.css';
import BottomNavigation from './BottomNavigation';
export default function Rewards() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('form'); // 'form' ou 'confirmation'
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('orange-money');
  const [phoneNumber, setPhoneNumber] = useState('+223 76 12 34 56');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(phoneNumber);
  const [confirmationData, setConfirmationData] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const [availablePoints, setAvailablePoints] = useState(user?.points || 0);

  useEffect(() => {
    if (!user?.id) return;
    const fetchPoints = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('points, phone')
          .eq('id', user.id)
          .single();
        if (data) {
          setAvailablePoints(data.points || 0);
          if (data.phone) {
            setPhoneNumber(data.phone);
            setTempPhone(data.phone);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPoints();
  }, [user?.id]);
  const getCardGradient = () => {
  if (availablePoints <= 500) {
    return 'linear-gradient(135deg, #FF9800, #FF5722)';
  }

  if (availablePoints <= 1500) {
    return 'linear-gradient(135deg, #8BC34A, #4CAF50)';
  }

  return 'linear-gradient(135deg, #2E7D32, #1B5E20)';
};

const getWalletColor = () => {
  if (availablePoints <= 500) return "#FF9800";
  if (availablePoints <= 1500) return "#8BC34A";
  return "#FFFFFF";
};
  const predefinedAmounts = [500, 1000, 2000, 5000];
  
  // Calcul des frais dynamiques
  const calculateFees = (amount) => {
    if (amount <= 1000) return 0;
    if (amount <= 5000) return Math.floor(amount * 0.02); // 2%
    return Math.floor(amount * 0.03); // 3%
  };

  const currentAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const fees = calculateFees(currentAmount);
  const totalDebit = currentAmount + fees;
  const canProceed = currentAmount > 0 && currentAmount <= availablePoints && totalDebit <= availablePoints;

  const handleSelectAmount = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  };

  const handlePhoneChange = (e) => {
    setTempPhone(e.target.value);
  };

  const handleSavePhone = () => {
    if (tempPhone.trim()) {
      setPhoneNumber(tempPhone);
      setIsEditingPhone(false);
    }
  };

  const handleConfirmExchange = async () => {
    if (!canProceed) {
      alert('Veuillez vérifier vos données');
      return;
    }

    const methodLabel =
      selectedMethod === 'orange-money'
        ? 'Orange Money'
        : selectedMethod === 'wave'
        ? 'Wave'
        : selectedMethod === 'moov-money'
        ? 'Moov Money'
        : 'Espèces';

    try {
      const withdrawalData = {
        user_id: user.id,
        points_debited: totalDebit,
        amount_fcfa: currentAmount,
        method: methodLabel,
        phone: phoneNumber,
        status: 'complete'
      };

      const { data, error } = await supabase
        .from('withdrawals')
        .insert([withdrawalData])
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setAvailablePoints(prev => prev - totalDebit);

      const confirmInfo = {
        amount: currentAmount,
        fees: fees,
        totalDebit: totalDebit,
        method: methodLabel,
        phone: phoneNumber,
        date: new Date(data.created_at).toLocaleDateString('fr-FR'),
        time: new Date(data.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setConfirmationData(confirmInfo);
      setScreen('confirmation');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la conversion des points');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNewExchange = () => {
    setScreen('form');
    setSelectedAmount(500);
    setCustomAmount('');
    setConfirmationData(null);
  };

  if (screen === 'confirmation') {
    return (
      <div className="rewards-container">
        {/* Header */}
        <header className="rewards-header">
          <button className="back-btn" onClick={handleBackToDashboard}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="rewards-title">Échange confirmé</h1>
          <div className="header-spacer"></div>
        </header>

        {/* Main Content */}
        <main className="rewards-main">
          {/* Success Animation */}
          <div className="success-animation">
            <div className="success-circle">
              <Check size={48} />
            </div>
          </div>

          {/* Success Message */}
          <div className="success-message">
            <h2 className="success-title">Échange réussi !</h2>
            <p className="success-subtitle">
              Votre demande de conversion a été traitée avec succès.
            </p>
          </div>

          {/* Confirmation Details */}
          <div className="confirmation-card">
            <div className="confirmation-section">
              <p className="confirmation-label">Montant converti</p>
              <p className="confirmation-value">{confirmationData?.amount} pts</p>
              <p className="confirmation-equiv">{confirmationData?.amount} FCFA</p>
            </div>

            <div className="confirmation-divider"></div>

            <div className="confirmation-section">
              <p className="confirmation-label">Frais de transaction</p>
              <p className="confirmation-value">{confirmationData?.fees} FCFA</p>
            </div>

            <div className="confirmation-divider"></div>

            <div className="confirmation-section highlight">
              <p className="confirmation-label">Montant à recevoir</p>
              <p className="confirmation-value-highlight">{confirmationData?.totalDebit} FCFA</p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="transaction-details">
            <div className="detail-row">
              <span className="detail-label">Mode de retrait</span>
              <span className="detail-value">{confirmationData?.method}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Numéro</span>
              <span className="detail-value">{confirmationData?.phone}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-value">{confirmationData?.date} à {confirmationData?.time}</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="info-box">
            <AlertCircle size={18} />
            <div className="info-content">
              <p className="info-title">Suivi de votre transaction</p>
              <p className="info-text">
                Vous recevrez une notification dès que l'argent sera disponible sur votre compte.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleNewExchange}>
              Faire un nouvel échange
            </button>
            <button className="btn btn-primary" onClick={handleBackToDashboard}>
              Retour à l'accueil
            </button>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab="rewards" />
      </div>
    );
  } 

  return (
    <div className="rewards-container">
      {/* Header */}
      <header className="rewards-header">
        <button className="back-btn" onClick={handleBackToDashboard}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="rewards-title">Récompenses</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="rewards-main">
        {/* Intro */}
        <div className="intro-section">
          <p className="intro-text">
  Échangez vos points contre de l'argent !
</p>
        </div>

        {/* Points Card */}
        <div
  className="points-card"
  style={{ background: getCardGradient() }}
>
          <div className="points-content">
            <p className="points-label">Mes points disponibles</p>
            <div className="points-display">
              <span className="points-amount">{availablePoints}</span>
              <span className="points-unit">pts</span>
            </div>
            <p className="points-equiv">≈ {availablePoints} FCFA</p>
            <p className="points-motivation">
  🌱 Continuez à recycler pour augmenter vos revenus !
</p>
           
          </div>
          <div className="points-illustration">
  <Wallet
    size={75}
    color={getWalletColor()}
    strokeWidth={2.5}
  />
</div>
        </div>

        {/* Step 1: Amount Selection */}
        <div className="form-section">
          <div className="step-header">
            <span className="step-number">1</span>
            <h2 className="step-title">Choisissez le montant à convertir</h2>
          </div>

          <div className="amount-grid">
            {predefinedAmounts.map((amount) => (
              <button
                key={amount}
                className={`amount-btn ${selectedAmount === amount && !customAmount ? 'active' : ''}`}
                onClick={() => handleSelectAmount(amount)}
              >
                <span className="amount-value">{amount}</span>
                <span className="amount-unit">pts</span>
                <span className="amount-equiv">= {amount} FCFA</span>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="custom-amount">
            <label className="custom-label">Ou entrez un montant personnalisé</label>
            <div className="custom-input-group">
              <input
                type="number"
                className="custom-input"
                placeholder="Montant en points"
                value={customAmount}
                onChange={handleCustomAmountChange}
                min="1"
                max={availablePoints}
              />
              <span className="custom-unit">pts</span>
            </div>
            {customAmount && (
              <p className="custom-equiv">= {customAmount} FCFA</p>
            )}
          </div>
        </div>

        {/* Step 2: Withdrawal Method */}
        <div className="form-section">
          <div className="step-header">
            <span className="step-number">2</span>
            <h2 className="step-title">Mode de retrait</h2>
          </div>

          <div className="method-options">
            {/* Orange Money */}
            <button
  className={`method-option ${selectedMethod === 'orange-money' ? 'active' : ''}`}
  onClick={() => setSelectedMethod('orange-money')}
>
  <div className="method-icon">
    <img src={orangeMoneyLogo} alt="Orange Money" />
  </div>

  <div className="method-info">
    <p className="method-name">Orange Money</p>
    <p className="method-desc">
      Retrait instantané et sécurisé
    </p>
  </div>

  <div className="method-check">
    {selectedMethod === 'orange-money' && <Check size={20} />}
  </div>
</button>

            {/* Cash */}
            {/* Wave */}
<button
  className={`method-option ${selectedMethod === 'wave' ? 'active' : ''}`}
  onClick={() => setSelectedMethod('wave')}
>
  <div className="method-icon">
    <img src={waveLogo} alt="Wave" />
  </div>

  <div className="method-info">
    <p className="method-name">Wave</p>
    <p className="method-desc">
      Retrait via Wave
    </p>
  </div>

  <div className="method-check">
    {selectedMethod === 'wave' &&<Check size={20} />}
  </div>
</button>

{/* Moov Money */}

            <button
  className={`method-option ${selectedMethod === 'moov-money' ? 'active' : ''}`}
  onClick={() => setSelectedMethod('moov-money')}
>
  <div className="method-icon">
    <img src={moovMoneyLogo} alt="Moov Money" />
  </div>

  <div className="method-info">
    <p className="method-name">Moov Money</p>
    <p className="method-desc">
      Retrait via Moov Money
    </p>
  </div>

  <div className="method-check">
    {selectedMethod === 'moov-money' && <Check size={20} />}
  </div>
</button>
          </div>
        </div>

        {/* Step 3: Phone Number */}
       {selectedMethod !== 'cash' && (
          <div className="form-section">
            <div className="step-header">
              <span className="step-number">3</span>
              <h2 className="step-title">
  {selectedMethod === 'orange-money'
    ? 'Numéro Orange Money'
    : selectedMethod === 'wave'
    ? 'Numéro Wave'
    : selectedMethod === 'moov-money'
    ? 'Numéro Moov Money'
    : 'Numéro de retrait'}
</h2>
            </div>

            {!isEditingPhone ? (
              <div className="phone-display">
               <div className="phone-icon">
  <Smartphone size={24} />
</div>
                <div className="phone-content">
                  <p className="phone-number">{phoneNumber}</p>
                  <p className="phone-hint">Vérifiez bien votre numéro avant de confirmer.</p>
                </div>
                <button
  className="edit-btn"
  onClick={() => {
    setIsEditingPhone(true);
    setTempPhone(phoneNumber);
  }}
>
  <Pencil size={18} />
</button> 
              </div>
            ) : (
              <div className="phone-edit">
                <input
                  type="tel"
                  className="phone-input"
                  value={tempPhone}
                  onChange={handlePhoneChange}
                 placeholder={
  selectedMethod === 'orange-money'
    ? 'Numéro Orange Money'
    : selectedMethod === 'wave'
    ? 'Numéro Wave'
    : 'Numéro Moov Money'
}
                />
                <div className="phone-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditingPhone(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSavePhone}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Summary */}
        <div className="form-section">
          <div className="step-header">
            <span className="step-number">{selectedMethod === 'orange-money' ? '4' : '3'}</span>
            <h2 className="step-title">Récapitulatif</h2>
          </div>

          <div className="summary-table">
            <div className="summary-row">
              <span className="summary-label">Montant sélectionné</span>
              <span className="summary-value">{currentAmount} pts</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Valeur</span>
              <span className="summary-value">{currentAmount} FCFA</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Frais de transaction</span>
              <span className="summary-value">{fees} FCFA</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row highlight">
              <span className="summary-label">Montant à recevoir</span>
              <span className="summary-value-highlight">{currentAmount - fees} FCFA</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="security-badge">
            <Lock size={16} />
            <span>Transaction 100% sécurisée</span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="form-section">
          <button
  className={`confirm-btn ${canProceed ? '' : 'disabled'}`}
  onClick={handleConfirmExchange}
  disabled={!canProceed}
>
  <Wallet size={20} />
  <span>Confirmer l'échange</span>
</button>
          {!canProceed && (
            <p className="error-message">
              Montant invalide ou insuffisant de points
            </p>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="rewards" />
    </div>
  );
}