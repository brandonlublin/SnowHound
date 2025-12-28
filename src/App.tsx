import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import SkeletonLoader from './components/SkeletonLoader';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HourlyForecastPage = lazy(() => import('./pages/HourlyForecastPage'));
const FavoritesDashboard = lazy(() => import('./pages/FavoritesDashboard'));

function App() {
  return (
    <BrowserRouter>
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Suspense fallback={<SkeletonLoader type="location" />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hourly/:date" element={<HourlyForecastPage />} />
          <Route path="/favorites" element={<FavoritesDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

