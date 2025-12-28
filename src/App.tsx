import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HourlyForecastPage from './pages/HourlyForecastPage';
import FavoritesDashboard from './pages/FavoritesDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hourly/:date" element={<HourlyForecastPage />} />
        <Route path="/favorites" element={<FavoritesDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

