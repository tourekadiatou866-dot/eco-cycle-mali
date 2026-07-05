import './Welcome.css'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome-page">
      <div className="bg-wave-top"></div>
      <div className="bg-wave-bottom"></div>

      {/* Feuilles décoratives */}
      <img src="/leaf-top.png" alt="" className="leaf-top" />
      <img src="/leaf-bottom.png" alt="" className="leaf-bottom" />

      <div className="welcome-content">

        {/* Titre */}
        <h2 className="welcome-text">Bienvenue dans</h2>

        <h1 className="logo-title">
          <span className="eco">EcoCycle</span>
          <span className="mali"> Mali</span>
        </h1>

        {/* Ligne décorative */}
        <div className="divider">
          <span></span>
          🌿
          <span></span>
        </div>

        <p className="slogan">Nos déchets ont de la valeur</p>
        <p className="description">Recycler les déchets, c'est protéger l'environnement</p>

        {/* Zone image — vide pour l'instant, sera remplacée */}
        <div className="hero-placeholder"></div>

        {/* Bouton Se connecter */}
        <button className="login-btn" onClick={() => navigate('/login')}>
          <LogIn size={22} strokeWidth={2.5} />
          Se connecter
        </button>

        <p className="small-text">
          Accédez à votre espace personnel<br />
          et continuez à faire la différence.
        </p>

        {/* Bouton S'inscrire */}
        <button className="register-btn" onClick={() => navigate('/register')}>
          <UserPlus size={22} strokeWidth={2.5} />
          S'inscrire
        </button>

        <p className="small-text">
          Rejoignez la communauté EcoCycle Mali<br />
          et commencez à gagner des points dès aujourd'hui.
        </p>

        <p className="bismillah">— Aw Bismillah —</p>

      </div>
    </div>
  )
}

export default Welcome