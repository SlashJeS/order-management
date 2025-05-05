import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersTable from './pages/OrdersTable';
import OrderForm from './pages/OrderForm';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersTable />
              </PrivateRoute>
            }
          />
          <Route
            path="/order/new"
            element={
              <PrivateRoute>
                <OrderForm />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App; 