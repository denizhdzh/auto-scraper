import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { VehicleDetail } from './pages/VehicleDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
