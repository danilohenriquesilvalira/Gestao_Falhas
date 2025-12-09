/**
 * Componente: CardModerno
 * 
 * Card EDP com retângulo marine blue e fundo branco
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PropsCardModerno {
  titulo: string;
  valor: string | number;
  descricao?: string;
  icone: LucideIcon;
  cor?: 'azul' | 'verde' | 'vermelho' | 'amarelo' | 'neutro';
  aoClicar?: () => void;
}

const obterCorIcone = (cor: PropsCardModerno['cor']) => {
  const cores = {
    azul: 'text-edp-marine',
    verde: 'text-edp-electric',
    vermelho: 'text-edp-semantic-red',
    amarelo: 'text-edp-semantic-yellow',
    neutro: 'text-edp-marine'
  };
  return cores[cor || 'neutro'];
};

export const CardModerno: React.FC<PropsCardModerno> = ({
  titulo,
  valor,
  descricao,
  icone: Icone,
  cor = 'neutro',
  aoClicar
}) => {
  const corIcone = obterCorIcone(cor);
  
  return (
    <div 
      className={`
        relative
        bg-white
        rounded-lg
        border border-edp-marine/30
        overflow-hidden
        transition-all
        duration-300
        hover:shadow-md
        group
        ${aoClicar ? 'cursor-pointer' : ''}
      `}
      onClick={aoClicar}
    >
      {/* Retângulo azul marine no topo */}
      <div className="h-1 bg-edp-marine w-full"></div>
      
      {/* Conteúdo */}
      <div className="p-6">
        {/* Ícone e título */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-edp-marine rounded-lg flex items-center justify-center">
              <Icone size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-edp-marine">
                {titulo}
              </h3>
              {descricao && (
                <p className="text-xs text-edp-slate mt-1">
                  {descricao}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Valor principal */}
        <div className="text-3xl font-bold text-edp-marine">
          {valor}
        </div>
      </div>
    </div>
  );
};

export default CardModerno;