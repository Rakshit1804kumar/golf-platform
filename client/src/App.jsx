import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';

// Pages
import Home       from './pages/Home';
import Charities  from './pages/Charities';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import Subscribe  from './pages/Subscribe';
import Dashboard  from './pages/Dashboard';
import Scores     from './pages/Scores';
import Draws      from './pages/Draws';

// Admin
import AdminLayout    from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminDraws     from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners   from './pages/admin/AdminWinners';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Home />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/subscribe" element={<Subscribe />} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/scores"    element={<PrivateRoute><Scores /></PrivateRoute>} />
          <Route path="/draws"     element={<PrivateRoute><Draws /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index            element={<AdminDashboard />} />
            <Route path="users"     element={<AdminUsers />} />
            <Route path="draws"     element={<AdminDraws />} />
            <Route path="charities" element={<AdminCharities />} />
            <Route path="winners"   element={<AdminWinners />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
