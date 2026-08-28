import React, { useState } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import type { ActiveTab } from './components/Sidebar';
import { DashboardFeature } from './features/DashboardFeature';
import { BusquedaFeature } from './features/BusquedaFeature';
import { BautismosFeature } from './features/BautismosFeature';
import { MatrimoniosFeature } from './features/MatrimoniosFeature';
import { NotasMarginalesFeature } from './features/NotasMarginalesFeature';
import { CapillasFeature } from './features/CapillasFeature';
import { OCRFeature } from './features/OCRFeature';
import { UsuariosFeature } from './features/UsuariosFeature';
import { RolesPermisosFeature } from './features/RolesPermisosFeature';
import { EventosFeature } from './features/EventosFeature';
import { ComprobantesFeature } from './features/ComprobantesFeature';
import { AuditoriaFeature } from './features/AuditoriaFeature';
import { AuthFeature } from './features/AuthFeature';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 my-2 py-2 w-full min-w-0">
          {activeTab === 'dashboard' && <DashboardFeature setActiveTab={setActiveTab} />}
          {activeTab === 'busqueda' && <BusquedaFeature />}
          {activeTab === 'bautismos' && <BautismosFeature />}
          {activeTab === 'matrimonios' && <MatrimoniosFeature />}
          {activeTab === 'notas' && <NotasMarginalesFeature />}
          {activeTab === 'ocr' && <OCRFeature />}
          {activeTab === 'capillas' && <CapillasFeature />}
          {activeTab === 'usuarios' && <UsuariosFeature />}
          {activeTab === 'roles' && <RolesPermisosFeature />}
          {activeTab === 'eventos' && <EventosFeature />}
          {activeTab === 'comprobantes' && <ComprobantesFeature />}
          {activeTab === 'auditoria' && <AuditoriaFeature />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
