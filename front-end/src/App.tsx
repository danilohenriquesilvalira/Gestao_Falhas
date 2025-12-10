/**
 * App Principal
 * 
 * Ponto de entrada da aplicação
 */

import React, { useState } from 'react';
import { Sidebar } from './componentes/layout/Sidebar';
import { Header } from './componentes/layout/Header';
import PaginaFalhasModerna from './paginas/PaginaFalhasModerna';
import PaginaDashboard from './paginas/PaginaDashboard';

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState(() => {
    return localStorage.getItem('paginaAtiva') || 'inicio';
  });
  const [sidebarRecolhido, setSidebarRecolhido] = useState(() => {
    const saved = localStorage.getItem('sidebarRecolhido');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const handleItemClick = (id: string) => {
    setPaginaAtiva(id);
    localStorage.setItem('paginaAtiva', id);
  };

  const handleToggleSidebar = () => {
    const novoEstado = !sidebarRecolhido;
    setSidebarRecolhido(novoEstado);
    localStorage.setItem('sidebarRecolhido', JSON.stringify(novoEstado));
  };

  // Mapear páginas para títulos
  const getTitulo = (): string => {
    const titulos: Record<string, string> = {
      'inicio': 'Dashboard',
      'falhas': 'Falhas',
      'relatorios': 'Relatórios',
      'estatisticas': 'Estatísticas',
      'calendario': 'Calendário',
      'notificacoes': 'Notificações',
      'usuarios': 'Usuários',
      'configuracoes': 'Configurações'
    };
    return titulos[paginaAtiva] || 'Dashboard';
  };

  // Renderizar conteúdo baseado na página ativa
  const renderConteudo = () => {
    switch (paginaAtiva) {
      case 'inicio':
        return <PaginaDashboard />;
      case 'falhas':
        return <PaginaFalhasModerna />;
      case 'relatorios':
        return (
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {/* Conteúdo da página de Relatórios */}
          </div>
        );
      case 'estatisticas':
        return (
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {/* Conteúdo da página de Estatísticas */}
          </div>
        );
      case 'calendario':
        return (
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {/* Conteúdo da página de Calendário */}
          </div>
        );
      case 'notificacoes':
        return (
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {/* Conteúdo da página de Notificações */}
          </div>
        );
      case 'usuarios':
        return (
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {/* Conteúdo da página de Usuários */}
          </div>
        );
      case 'configuracoes':
        return (
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {/* Conteúdo da página de Configurações */}
          </div>
        );
      default:
        return (
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            <p className="text-edp-slate mb-6">
              Sistema de Gerenciamento de Falhas EDP
            </p>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-edp-slate">
                Área de conteúdo - Em desenvolvimento
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-edp-neutral-white-wash overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        itemAtivo={paginaAtiva} 
        aoClicarItem={handleItemClick}
        recolhido={sidebarRecolhido}
        aoRecolher={handleToggleSidebar}
      />

      {/* Área de Conteúdo */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          titulo={getTitulo()} 
          nomeUsuario="João Silva"
          aoToggleSidebar={handleToggleSidebar}
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-auto">
          {renderConteudo()}
        </div>
      </main>
    </div>
  );
}

export default App;
