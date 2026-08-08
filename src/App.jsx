import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import PortalLayout from './layouts/PortalLayout'
import HomePage from './pages/public/HomePage'
import CatalogPage from './pages/public/CatalogPage'
import ProductDetailPage from './pages/public/ProductDetailPage'
import ServicesPage from './pages/public/ServicesPage'
import QuotePage from './pages/public/QuotePage'
import ServiceRequestPage from './pages/public/ServiceRequestPage'
import ReviewsPage from './pages/public/ReviewsPage'
import PaymentPage from './pages/public/PaymentPage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import NotFoundPage from './pages/NotFoundPage'
import ForbiddenPage from './pages/ForbiddenPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ProductsPage from './pages/admin/ProductsPage'
import InventoryPage from './pages/admin/InventoryPage'
import SuppliersPage from './pages/admin/SuppliersPage'
import OrdersPage from './pages/admin/OrdersPage'
import QuotesPage from './pages/admin/QuotesPage'
import PaymentsPage from './pages/admin/PaymentsPage'
import ReviewsAdminPage from './pages/admin/ReviewsAdminPage'
import UsersPage from './pages/admin/UsersPage'
import TechnicianDashboardPage from './pages/technician/TechnicianDashboardPage'
import JobsPage from './pages/technician/JobsPage'
import JobDetailPage from './pages/technician/JobDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="catalogo/:productId" element={<ProductDetailPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="cotizador" element={<QuotePage />} />
        <Route path="solicitar-servicio" element={<ServiceRequestPage />} />
        <Route path="resenas" element={<ReviewsPage />} />
        <Route path="pago-sinpe" element={<PaymentPage />} />
      </Route>
      <Route path="ingresar" element={<LoginPage />} />
      <Route path="olvide-clave" element={<ForgotPasswordPage />} />
      <Route path="restablecer-clave" element={<ResetPasswordPage />} />
      <Route path="sin-permiso" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute allowedRole="Administrator" />}>
        <Route element={<PortalLayout role="Administrator" />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/productos" element={<ProductsPage />} />
          <Route path="admin/inventario" element={<InventoryPage />} />
          <Route path="admin/proveedores" element={<SuppliersPage />} />
          <Route path="admin/ordenes" element={<OrdersPage />} />
          <Route path="admin/cotizaciones" element={<QuotesPage />} />
          <Route path="admin/pagos" element={<PaymentsPage />} />
          <Route path="admin/resenas" element={<ReviewsAdminPage />} />
          <Route path="admin/usuarios" element={<UsersPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="Technician" />}>
        <Route element={<PortalLayout role="Technician" />}>
          <Route path="tecnico" element={<TechnicianDashboardPage />} />
          <Route path="tecnico/trabajos" element={<JobsPage />} />
          <Route path="tecnico/trabajos/:jobId" element={<JobDetailPage />} />
        </Route>
      </Route>

      <Route path="inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
