import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardFeature } from './features/DashboardFeature';
import { BusquedaFeature } from './features/BusquedaFeature';
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

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthFeature />;
  }

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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardFeature />} />
            <Route path="/busqueda" element={<BusquedaFeature />} />
            <Route path="/bautismos" element={<BautismosFeature />} />
            <Route path="/matrimonios" element={<MatrimoniosFeature />} />
            <Route path="/notas" element={<NotasMarginalesFeature />} />
            <Route path="/ocr" element={<OCRFeature />} />
            <Route path="/capillas" element={<CapillasFeature />} />
            <Route path="/usuarios" element={<UsuariosFeature />} />
            <Route path="/roles" element={<RolesFeature />} />
            <Route path="/eventos" element={<EventosFeature />} />
            <Route path="/comprobantes" element={<ComprobantesFeature />} />
            <Route path="/auditoria" element={<AuditoriaFeature />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
