import { Routes, Route, Navigate } from 'react-router-dom'

import Splash from './Splash'
import Welcome from './Welcome'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import Report from './Report'
import TrackingOrder from './TrackingOrder'
import Rewards from './Rewards'
import History from './History'
import Profile from './Profile'
import Community from './Community'
import EditProfile from './EditProfile'
import Security from './Security'
function App() {
  return (
    <Routes>
      {/* Splash en premier, redirige vers Welcome */}
      <Route path="/" element={<Navigate to="/splash" replace />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} /> 
      <Route path="/signaler" element={<Report />} />
      <Route path="/tracking" element={<TrackingOrder />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/history" element={<History />} />
      <Route path="/community" element={<Community />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/security" element={<Security />} />
    </Routes>
  )
}

export default App