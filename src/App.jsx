import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';

// Public intake (anyone, no account)
import PublicLayout from './components/PublicLayout.jsx';
import GetListed from './pages/GetListed.jsx';
import FindDeals from './pages/FindDeals.jsx';

// Auth
import Login from './pages/Login.jsx';

// Protected app
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sellers from './pages/Sellers.jsx';
import SellerNew from './pages/SellerNew.jsx';
import SellerDetail from './pages/SellerDetail.jsx';
import Buyers from './pages/Buyers.jsx';
import BuyerNew from './pages/BuyerNew.jsx';
import Deals from './pages/Deals.jsx';
import DealNew from './pages/DealNew.jsx';
import DealDetail from './pages/DealDetail.jsx';
import Contracts from './pages/Contracts.jsx';
import ContractNew from './pages/ContractNew.jsx';
import Settings from './pages/Settings.jsx';

// Root: send signed-in users to the dashboard, everyone else to login.
function RootRedirect() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={session ? '/app' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public intake — keep so customers can submit without an account */}
      <Route element={<PublicLayout />}>
        <Route path="/get-listed" element={<GetListed />} />
        <Route path="/find-deals" element={<FindDeals />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Protected dashboard */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="sellers" element={<Sellers />} />
        <Route path="sellers/new" element={<SellerNew />} />
        <Route path="sellers/:id" element={<SellerDetail />} />
        <Route path="buyers" element={<Buyers />} />
        <Route path="buyers/new" element={<BuyerNew />} />
        <Route path="deals" element={<Deals />} />
        <Route path="deals/new" element={<DealNew />} />
        <Route path="deals/:id" element={<DealDetail />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="contracts/new" element={<ContractNew />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
