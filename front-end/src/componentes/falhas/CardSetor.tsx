/**
 * Componente: CardSetor
 * 
 * Card individual para cada setor da eclusa
 * Exibe estatísticas de falhas e eventos por setor
 */

import React from 'react';
import { AlertTriangle, Activity, Settings, ChevronRight } from 'lucide-react';
import type { FalhaPorSetor, SetorEclusa } from '../../tipos/falhas';
import { CORES_POR_SETOR } from '../../constantes/dadosFalhas';

interface PropsCardSetor {
  dadosSetor: FalhaPorSetor;
  aoClicar?: (setor: SetorEclusa) => void;
}

const obterIconeSetor = (setor: SetorEclusa) => {
  const icones = {
    ENCHIMENTO: Activity,
    ESVAZIAMENTO: Activity,
    PORTAJUSANTE: Settings,
    PORTAMONTANTE: Settings,
    COMANDO_ECLUSA: Settings,
    ESGOTO_DRENAGEM: AlertTriangle
  };
  
  const IconeComponent = icones[setor];
  return <IconeComponent size={24} />;
};

const formatarNomeSetor = (setor: SetorEclusa): string => {
  const nomes = {
    ENCHIMENTO: 'Enchimento',
    ESVAZIAMENTO: 'Esvaziamento',
    PORTAJUSANTE: 'Porta Jusante',
    PORTAMONTANTE: 'Porta Montante', 
    COMANDO_ECLUSA: 'Comando Eclusa',
    ESGOTO_DRENAGEM: 'Esgoto Drenagem'
  };
  
  return nomes[setor];
};

export const CardSetor: React.FC<PropsCardSetor> = ({ 
  dadosSetor, 
  aoClicar 
}) => {
  const corSetor = CORES_POR_SETOR[dadosSetor.setor];
  const nomeSetor = formatarNomeSetor(dadosSetor.setor);
  
  return (
    <div 
      className={`
        bg-white 
        rounded-xl 
        border 
        border-edp-marine/30 
        shadow-sm 
        hover:shadow-lg 
        transition-all 
        duration-300 
        overflow-hidden
        w-full
        max-w-full
        ${aoClicar ? 'cursor-pointer hover:border-' + corSetor : ''}
      `}
      onClick={() => aoClicar && aoClicar(dadosSetor.setor)}
    >
      {/* Header do Card */}
      <div className={`bg-${corSetor} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              {obterIconeSetor(dadosSetor.setor)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg truncate">{nomeSetor}</h3>
              <p className="text-sm opacity-90 truncate">{dadosSetor.classe}</p>
            </div>
          </div>
          
          {aoClicar && (
            <ChevronRight size={20} className="opacity-70" />
          )}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Falhas */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-edp-semantic-red" />
              <span className="text-sm font-medium text-edp-marine">Falhas</span>
            </div>
            <div className="text-2xl font-bold text-edp-semantic-red">
              {dadosSetor.totalFalhas}
            </div>
          </div>

          {/* Eventos */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity size={18} className="text-edp-electric" />
              <span className="text-sm font-medium text-edp-marine">Eventos</span>
            </div>
            <div className="text-2xl font-bold text-edp-electric">
              {dadosSetor.totalEventos}
            </div>
          </div>
        </div>

        {/* Barra de progresso visual */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-edp-slate mb-1">
            <span>Criticidade</span>
            <span>{Math.round((dadosSetor.totalFalhas / (dadosSetor.totalFalhas + dadosSetor.totalEventos)) * 100)}%</span>
          </div>
          <div className="w-full bg-edp-neutral-white-wash rounded-full h-2">
            <div 
              className={`bg-${corSetor} h-2 rounded-full transition-all duration-500`}
              style={{
                width: `${Math.min(100, (dadosSetor.totalFalhas / (dadosSetor.totalFalhas + dadosSetor.totalEventos)) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSetor;