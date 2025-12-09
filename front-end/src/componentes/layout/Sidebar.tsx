/**
 * Componente: Sidebar
 * 
 * Barra lateral de navegação geral da aplicação
 * Cor de fundo: Marine Blue (#212E3E)
 * Texto: Branco
 * Hover: Electric Green (#28FF52) com texto Marine
 */

import React from 'react';
import { 
  Home, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Users,
  FileText,
  Calendar,
  Bell,
  Menu
} from 'lucide-react';

type ItemMenu = {
  id: string;
  label: string;
  icone: React.ReactNode;
  rota: string;
};

export type PropsSidebar = {
  itemAtivo?: string;
  aoClicarItem?: (id: string) => void;
  aoRecolher?: () => void;
  recolhido?: boolean;
};

const itensMenu: ItemMenu[] = [
  { id: 'inicio', label: 'Início', icone: <Home size={20} />, rota: '/' },
  { id: 'falhas', label: 'Falhas', icone: <AlertTriangle size={20} />, rota: '/falhas' },
  { id: 'relatorios', label: 'Relatórios', icone: <FileText size={20} />, rota: '/relatorios' },
  { id: 'estatisticas', label: 'Estatísticas', icone: <BarChart3 size={20} />, rota: '/estatisticas' },
  { id: 'calendario', label: 'Calendário', icone: <Calendar size={20} />, rota: '/calendario' },
  { id: 'notificacoes', label: 'Notificações', icone: <Bell size={20} />, rota: '/notificacoes' },
  { id: 'usuarios', label: 'Usuários', icone: <Users size={20} />, rota: '/usuarios' },
  { id: 'configuracoes', label: 'Configurações', icone: <Settings size={20} />, rota: '/configuracoes' },
];

export const Sidebar: React.FC<PropsSidebar> = ({
  itemAtivo = 'inicio',
  aoClicarItem,
  aoRecolher,
  recolhido = false
}) => {
  const handleItemClick = (id: string) => {
    if (aoClicarItem) {
      aoClicarItem(id);
    }
  };

  return (
    <>
      {/* Sidebar Desktop - lateral apenas em desktop */}
      <aside className={`hidden md:flex bg-edp-marine h-screen ${recolhido ? 'w-20' : 'w-64'} transition-[width] duration-300 ease-in-out flex-col shadow-xl flex-shrink-0 will-change-[width]`}>
        {/* Logo EDP com linha divisória */}
        <div className={`h-[76px] flex items-center border-b border-white border-opacity-20 flex-shrink-0 ${recolhido ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <div className={`transition-opacity duration-300 ease-in-out ${recolhido ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <img 
              src="/assets/imagens/Logo_EDP.svg" 
              alt="EDP Logo" 
              className="h-10 w-auto"
            />
          </div>
          <button 
            onClick={aoRecolher}
            className={`text-white hover:text-edp-electric transition-colors p-2 ${recolhido ? 'flex items-center justify-center' : ''}`}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Menu de Navegação Desktop */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-3">
            {itensMenu.map((item) => {
              const isAtivo = itemAtivo === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full
                      flex
                      items-center
                      ${recolhido ? 'justify-center px-2' : 'gap-3 px-4'}
                      py-3
                      rounded-lg
                      transition-all
                      duration-200
                      ${isAtivo 
                        ? 'bg-edp-electric text-edp-marine font-semibold' 
                        : 'text-white hover:bg-edp-electric hover:text-edp-marine'
                      }
                    `}
                  >
                    <span className="flex-shrink-0">
                      {item.icone}
                    </span>
                    <span className={`text-base font-medium transition-all duration-300 ease-in-out ${recolhido ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé Desktop */}
        <div className={`border-t border-white border-opacity-20 flex-shrink-0 transition-all duration-300 ease-in-out ${recolhido ? 'h-0 overflow-hidden' : 'h-auto p-4'}`}>
          <div className={`transition-opacity duration-300 ease-in-out ${recolhido ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-sm text-white opacity-70 text-center">
              Sistema de Falhas EDP
            </p>
            <p className="text-sm text-white opacity-70 text-center mt-1">
              v1.0.0
            </p>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation Mobile - apenas mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-edp-marine border-t border-white border-opacity-20 z-50 safe-area-inset-bottom">
        <ul className="flex items-center justify-around px-2 py-2">
          {itensMenu.slice(0, 5).map((item) => {
            const isAtivo = itemAtivo === item.id;
            
            return (
              <li key={item.id} className="flex-1">
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full
                    flex
                    flex-col
                    items-center
                    gap-1
                    py-2
                    px-1
                    rounded-lg
                    transition-all
                    duration-200
                    ${isAtivo 
                      ? 'text-edp-electric' 
                      : 'text-white opacity-60'
                    }
                  `}
                >
                  {item.icone}
                  <span className="text-xs font-medium leading-tight">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
