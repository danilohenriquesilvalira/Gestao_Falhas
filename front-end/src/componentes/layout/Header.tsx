/**
 * Componente: Header
 * 
 * Cabeçalho geral da aplicação com título e ícones de usuário
 */

import React from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';

export type PropsHeader = {
  titulo?: string;
  nomeUsuario?: string;
};

export const Header: React.FC<PropsHeader> = ({
  titulo = 'Dashboard',
  nomeUsuario = 'Usuário'
}) => {
  return (
    <header className="bg-edp-neutral-white-wash border-b border-edp-marine border-opacity-20">
      <div className="px-4 md:px-8 h-[76px] flex items-center justify-between">
        {/* Título à esquerda */}
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-edp-marine">
            {titulo}
          </h1>
        </div>

        {/* Ícones e usuário à direita */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notificações - sempre visível */}
          <button className="relative p-2 text-edp-slate hover:text-edp-electric rounded-lg transition-colors">
            <Bell size={18} className="md:hidden" />
            <Bell size={20} className="hidden md:block" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-edp-electric rounded-full"></span>
          </button>

          {/* Configurações - sempre visível */}
          <button className="p-2 text-edp-slate hover:text-edp-electric rounded-lg transition-colors">
            <Settings size={18} className="md:hidden" />
            <Settings size={20} className="hidden md:block" />
          </button>

          {/* Divisor - apenas desktop */}
          <div className="hidden md:block h-8 w-px bg-edp-marine/30"></div>

          {/* Menu do usuário */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Nome do usuário - apenas desktop */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-edp-marine">
                {nomeUsuario}
              </p>
              <p className="text-xs text-edp-slate">
                Administrador
              </p>
            </div>

            {/* Avatar do usuário */}
            <div className="relative group">
              <button className="w-9 h-9 md:w-10 md:h-10 bg-edp-marine text-white rounded-full flex items-center justify-center hover:bg-edp-electric hover:text-edp-marine transition-colors">
                <User size={18} className="md:hidden" />
                <User size={20} className="hidden md:block" />
              </button>

              {/* Menu dropdown */}
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-edp-marine/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button className="w-full px-4 py-3 text-left text-sm text-edp-slate hover:bg-edp-neutral-white-wash flex items-center gap-2 rounded-t-lg">
                  <User size={16} />
                  Meu Perfil
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-edp-slate hover:bg-edp-neutral-white-wash flex items-center gap-2">
                  <Settings size={16} />
                  Configurações
                </button>
                <hr className="border-edp-marine border-opacity-20" />
                <button className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg">
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
