import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardFeature } from './features/DashboardFeature';
import { BusquedaFeature } from './features/BusquedaFeature';
import { BusquedaSacramentosFeature } from './features/BusquedaSacramentosFeature';
import { BautismosFeature } from './features/BautismosFeature';
import { MatrimoniosFeature } from './features/MatrimoniosFeature';
import { NotasMarginalesFeature } from './features/NotasMarginalesFeature';
import { CapillasFeature } from './features/CapillasFeature';
import { OCRFeature } from './features/OCRFeature';
import { UsuariosFeature } from './features/UsuariosFeature';
import { RolesFeature } from './features/RolesFeature';
import { EventosFeature } from './features/EventosFeature';
import { ComprobantesFeature } from './features/ComprobantesFeature';
import { AuditoriaFeature } from './features/AuditoriaFeature';
import { AuthFeature } from './features/AuthFeature';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  forbiddenRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, forbiddenRoles }) => {
  const { user } = useAuth();
  
  const userRole = user?.role || 'FELIGRES';
  const defaultRedirect = userRole === 'SECRETARIO' ? '/busqueda-sacramentos' : '/dashboard';

  if (!user) return <Navigate to={defaultRedirect} replace />;
  
  // Regla estricta: los SECRETARIOS solo tienen permitido el módulo de búsqueda de sacramentos
  if (userRole === 'SECRETARIO') {
    if (allowedRoles && !allowedRoles.includes('SECRETARIO')) {
      return <Navigate to="/busqueda-sacramentos" replace />;
    }
    if (forbiddenRoles && forbiddenRoles.includes('SECRETARIO')) {
      return <Navigate to="/busqueda-sacramentos" replace />;
    }
  }

  // Comprobar roles explícitamente prohibidos
  if (forbiddenRoles && forbiddenRoles.includes(userRole)) {
    return <Navigate to={defaultRedirect} replace />;
  }
  
  // Comprobar roles permitidos
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={defaultRedirect} replace />;
  }
  
  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthFeature />;
  }

  const isSecretario = user?.role === 'SECRETARIO';
  const defaultPath = isSecretario ? '/busqueda-sacramentos' : '/dashboard';

  // Personal administrativo estándar (sin SECRETARIO para el resto de módulos)
  const staffRoles = ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'];
  // Exclusivo para secretarios (y superadmin)
  const sacramentosSearchRoles = ['SECRETARIO', 'SUPERADMIN'];

  return (
    <div className="min-h-screen bg-[#E0EBFF] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex flex-1 items-start gap-4 pr-4 max-w-[1600px] w-full mx-auto">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 my-2 py-2 w-full min-w-0">
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            
            {/* Dashboard y Eventos bloqueados para SECRETARIO */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute forbiddenRoles={['SECRETARIO']}>
                  <DashboardFeature />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos"
              element={
                <ProtectedRoute forbiddenRoles={['SECRETARIO']}>
                  <EventosFeature />
                </ProtectedRoute>
              }
            />
            
            {/* Módulo exclusivo de búsqueda de sacramentos para SECRETARIOS */}
            <Route
              path="/busqueda-sacramentos"
              element={
                <ProtectedRoute allowedRoles={sacramentosSearchRoles}>
                  <BusquedaSacramentosFeature />
                </ProtectedRoute>
              }
            />

            {/* Resto de módulos operativos restringidos: secretarios tienen prohibido el acceso */}
            <Route path="/busqueda" element={<ProtectedRoute allowedRoles={staffRoles}><BusquedaFeature /></ProtectedRoute>} />
            <Route path="/bautismos" element={<ProtectedRoute allowedRoles={staffRoles}><BautismosFeature /></ProtectedRoute>} />
            <Route path="/matrimonios" element={<ProtectedRoute allowedRoles={staffRoles}><MatrimoniosFeature /></ProtectedRoute>} />
            <Route path="/notas" element={<ProtectedRoute allowedRoles={staffRoles}><NotasMarginalesFeature /></ProtectedRoute>} />
            <Route path="/ocr" element={<ProtectedRoute allowedRoles={staffRoles}><OCRFeature /></ProtectedRoute>} />
            <Route path="/capillas" element={<ProtectedRoute allowedRoles={staffRoles}><CapillasFeature /></ProtectedRoute>} />
            <Route path="/comprobantes" element={<ProtectedRoute allowedRoles={staffRoles}><ComprobantesFeature /></ProtectedRoute>} />
            
            {/* Módulos de administración */}
            <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR']}><UsuariosFeature /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute allowedRoles={['SUPERADMIN']}><RolesFeature /></ProtectedRoute>} />
            <Route path="/auditoria" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMINISTRADOR']}><AuditoriaFeature /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
