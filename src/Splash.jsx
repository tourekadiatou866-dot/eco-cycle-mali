import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 3800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">

      <img src="/leaf-top.png" alt="" className="splash-leaf-top" />
      <img src="/leaf-bottom.png" alt="" className="splash-leaf-bottom" />

      <div className="splash-content">

        {/* Logo fond beige — s'intègre parfaitement */}
        <div className="splash-logo-wrapper">
          <img
            src="/logo-ecocycle-beige.png"
            alt="EcoCycle Mali"
            className="splash-logo"
          />
        </div>

        <div className="splash-title-block">
          <h1 className="splash-title">ECO-CYCLE</h1>
          <h1 className="splash-title">MALI</h1>
        </div>

        <p className="splash-slogan">Nos déchets ont de la valeur</p>

        <div className="splash-divider">
          <span className="divider-line"></span>
          <span className="bismillah-text">Aw Bismillah</span>
          <span className="divider-line"></span>
        </div>

        <div className="splash-loader">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>

      </div>
    </div>
  );
}