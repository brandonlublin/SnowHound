import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HourlyForecastPage from './pages/HourlyForecastPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hourly/:date" element={<HourlyForecastPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

