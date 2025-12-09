/**
 * Componente: FiltrosFalhas
 * 
 * Barra de filtros para a página de falhas
 */

import React from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import type { SetorEclusa } from '../../tipos/falhas';

interface PropsFiltrosFalhas {
  busca: string;
  setBusca: (busca: string) => void;
  setorSelecionado: SetorEclusa | 'TODOS';
  setSetorSelecionado: (setor: SetorEclusa | 'TODOS') => void;
  tipoSelecionado: 'TODOS' | 'FALHAS' | 'EVENTOS';
  setTipoSelecionado: (tipo: 'TODOS' | 'FALHAS' | 'EVENTOS') => void;
  aoAtualizar?: () => void;
  aoExportar?: () => void;
}

const SETORES_OPCOES = [
  { value: 'TODOS', label: 'Todos os Setores' },
  { value: 'ENCHIMENTO', label: 'Enchimento' },
  { value: 'ESVAZIAMENTO', label: 'Esvaziamento' },
  { value: 'PORTAJUSANTE', label: 'Porta Jusante' },
  { value: 'PORTAMONTANTE', label: 'Porta Montante' },
  { value: 'COMANDO_ECLUSA', label: 'Comando Eclusa' },
  { value: 'ESGOTO_DRENAGEM', label: 'Esgoto Drenagem' }
] as const;

const TIPOS_OPCOES = [
  { value: 'TODOS', label: 'Todos', cor: 'text-edp-marine' },
  { value: 'FALHAS', label: 'Falhas', cor: 'text-edp-semantic-red' },
  { value: 'EVENTOS', label: 'Eventos', cor: 'text-edp-electric' }
] as const;

export const FiltrosFalhas: React.FC<PropsFiltrosFalhas> = ({
  busca,
  setBusca,
  setorSelecionado,
  setSetorSelecionado,
  tipoSelecionado,
  setTipoSelecionado,
  aoAtualizar,
  aoExportar
}) => {
  return (
    <div className="bg-white border border-edp-marine/30 rounded-lg p-4 space-y-4">
      {/* Linha 1: Busca e Ações */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Campo de busca */}
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-edp-slate" />
          <input
            type="text"
            placeholder="Buscar falhas ou eventos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="
              w-full 
              pl-10 pr-4 py-2 
              border border-edp-marine/30 
              rounded-lg 
              focus:outline-none 
              focus:ring-2 
              focus:ring-edp-electric 
              focus:border-edp-electric
              text-sm
            "
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          {aoAtualizar && (
            <button
              onClick={aoAtualizar}
              className="
                flex items-center gap-2 
                px-4 py-2 
                bg-edp-marine 
                text-white 
                rounded-lg 
                hover:bg-edp-marine-100 
                transition-colors
                text-sm
              "
            >
              <RefreshCw size={16} />
              Atualizar
            </button>
          )}

          {aoExportar && (
            <button
              onClick={aoExportar}
              className="
                flex items-center gap-2 
                px-4 py-2 
                bg-edp-electric 
                text-edp-marine 
                rounded-lg 
                hover:bg-edp-electric-300 
                transition-colors
                text-sm
                font-medium
              "
            >
              <Download size={16} />
              Exportar
            </button>
          )}
        </div>
      </div>

      {/* Linha 2: Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filtro por Setor */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-edp-marine mb-2">
            <Filter size={16} className="inline mr-1" />
            Setor
          </label>
          <select
            value={setorSelecionado}
            onChange={(e) => setSetorSelecionado(e.target.value as SetorEclusa | 'TODOS')}
            className="
              w-full 
              px-3 py-2 
              border border-edp-neutral-light 
              rounded-lg 
              focus:outline-none 
              focus:ring-2 
              focus:ring-edp-electric 
              focus:border-edp-electric
              text-sm
            "
          >
            {SETORES_OPCOES.map(opcao => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-edp-marine mb-2">
            Tipo
          </label>
          <div className="flex gap-1 bg-edp-neutral-white-wash rounded-lg p-1">
            {TIPOS_OPCOES.map(tipo => (
              <button
                key={tipo.value}
                onClick={() => setTipoSelecionado(tipo.value)}
                className={`
                  flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${tipoSelecionado === tipo.value 
                    ? 'bg-white shadow-sm border border-edp-neutral-light ' + tipo.cor
                    : 'text-edp-slate hover:text-edp-marine'
                  }
                `}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo dos filtros */}
        <div className="flex items-end">
          <div className="text-sm text-edp-slate">
            <div>Filtros ativos:</div>
            <div className="font-medium text-edp-marine">
              {setorSelecionado !== 'TODOS' && `${SETORES_OPCOES.find(s => s.value === setorSelecionado)?.label}`}
              {setorSelecionado !== 'TODOS' && tipoSelecionado !== 'TODOS' && ' • '}
              {tipoSelecionado !== 'TODOS' && `${TIPOS_OPCOES.find(t => t.value === tipoSelecionado)?.label}`}
              {setorSelecionado === 'TODOS' && tipoSelecionado === 'TODOS' && 'Nenhum'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosFalhas;