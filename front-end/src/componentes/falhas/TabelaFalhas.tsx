/**
 * Componente: TabelaFalhas
 * 
 * Tabela moderna e elegante para exibir falhas
 * Design minimalista com linhas delicadas
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, X, RefreshCw } from 'lucide-react';
import { apiService, type OcorrenciaCompleta } from '../../servicos/apiService';
import type { SetorEclusa } from '../../tipos/falhas';

interface ItemTabela {
  id: string;
  setor: string;
  descricao: string;
  tipo: 'FALHA' | 'EVENTO';
  status: 'ATIVO' | 'RESOLVIDO' | 'EM_ANALISE';
  timestamp: Date;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  codigo: string;
  wordIndex: number;
  bitIndex: number;
  duracaoSegundos?: number;
}

const SETORES = [
  { value: 'TODOS', label: 'Todos os setores' },
  { value: 'ENCHIMENTO', label: 'Enchimento' },
  { value: 'ESVAZIAMENTO', label: 'Esvaziamento' },
  { value: 'PORTAJUSANTE', label: 'Porta Jusante' },
  { value: 'PORTAMONTANTE', label: 'Porta Montante' },
  { value: 'COMANDO_ECLUSA', label: 'Comando Eclusa' },
  { value: 'ESGOTO_DRENAGEM', label: 'Esgoto Drenagem' }
];

const TIPOS = [
  { value: 'TODOS', label: 'Todos os tipos' },
  { value: 'FALHAS', label: 'Falhas' },
  { value: 'EVENTOS', label: 'Eventos' }
];

const STATUS = [
  { value: 'TODOS', label: 'Todos os status' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'RESOLVIDO', label: 'Resolvido' },
  { value: 'EM_ANALISE', label: 'Em Análise' }
];

// Função para converter ocorrências da API para formato da tabela
const converterOcorrenciaParaItem = (ocorrencia: OcorrenciaCompleta): ItemTabela => {
  return {
    id: `ocorrencia-${ocorrencia.id}`,
    setor: ocorrencia.setor_codigo,
    descricao: ocorrencia.descricao,
    tipo: ocorrencia.tipo,
    status: ocorrencia.status,
    timestamp: new Date(ocorrencia.timestamp_inicio),
    prioridade: ocorrencia.prioridade,
    codigo: ocorrencia.codigo,
    wordIndex: ocorrencia.word_index,
    bitIndex: ocorrencia.bit_index,
    duracaoSegundos: ocorrencia.duracao_segundos
  };
};

const formatarNomeSetor = (setorCodigo: string): string => {
  const nomes: Record<string, string> = {
    'ENCHIMENTO': 'Enchimento',
    'ESVAZIAMENTO': 'Esvaziamento',
    'PORTAJUSANTE': 'Porta Jusante',
    'PORTAMONTANTE': 'Porta Montante',
    'COMANDO_ECLUSA': 'Comando Eclusa',
    'ESGOTO_DRENAGEM': 'Esgoto Drenagem'
  };
  return nomes[setorCodigo] || setorCodigo;
};

// Função para criar badge de status com tamanho fixo
const criarBadgeStatus = (status: string) => {
  const configs = {
    'ATIVO': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Ativo' },
    'RESOLVIDO': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Resolvido' },
    'EM_ANALISE': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'Em Análise' }
  };
  
  const config = configs[status as keyof typeof configs] || configs.ATIVO;
  
  return (
    <span className={`inline-flex items-center justify-center w-20 px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Função para criar badge de prioridade neutro
const criarBadgePrioridade = (prioridade: string) => {
  const configs = {
    'ALTA': { label: 'Alta', weight: 'font-bold' },
    'MEDIA': { label: 'Média', weight: 'font-medium' },
    'BAIXA': { label: 'Baixa', weight: 'font-normal' }
  };
  
  const config = configs[prioridade as keyof typeof configs] || configs.MEDIA;
  
  return (
    <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-md text-xs ${config.weight} border bg-gray-50 text-gray-700 border-gray-200`}>
      {config.label}
    </span>
  );
};

// Função para badge de tipo neutro
const criarBadgeTipo = (tipo: string) => {
  const configs = {
    'FALHA': { label: 'Falha' },
    'EVENTO': { label: 'Evento' }
  };
  
  const config = configs[tipo as keyof typeof configs] || configs.EVENTO;
  
  return (
    <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded-md text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
      {config.label}
    </span>
  );
};

// Componente de linha otimizado para performance
const LinhaTabela: React.FC<{item: ItemTabela; calcularTempoRelativo: (timestamp: Date) => string}> = React.memo(({item, calcularTempoRelativo}) => {
  return (
    <tr 
      key={item.id}
      className="hover:bg-gray-50/80 transition-all duration-300 border-l-4 border-transparent hover:shadow-sm cursor-pointer group will-change-transform"
      style={{
        borderLeftColor: 'transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeftColor = '#212E3E'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = 'transparent'
      }}
    >
      {/* Setor */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-edp-marine group-hover:text-edp-marine transition-colors">
          {formatarNomeSetor(item.setor)}
        </div>
        <div className="text-xs text-edp-slate group-hover:text-edp-marine transition-colors">
          {item.setor}
        </div>
      </td>

      {/* Descrição */}
      <td className="px-6 py-4">
        <div className="text-sm text-edp-slate leading-tight max-w-md group-hover:text-gray-700 transition-colors">
          {item.descricao}
        </div>
      </td>

      {/* Tipo */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {criarBadgeTipo(item.tipo)}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {criarBadgeStatus(item.status)}
      </td>

      {/* Prioridade */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {criarBadgePrioridade(item.prioridade)}
      </td>

      {/* Data/Hora */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm text-edp-slate font-medium">
          {item.timestamp.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })} às {item.timestamp.toLocaleTimeString('pt-PT', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </td>
    </tr>
  );
});

LinhaTabela.displayName = 'LinhaTabela';

// Skeleton loading para melhor UX
const SkeletonLoader: React.FC = () => (
  <>
    {Array.from({ length: 5 }, (_, index) => (
      <tr key={`skeleton-${index}`} className="border-b border-gray-200">
        <td className="px-6 py-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-16 mx-auto"></div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-20 mx-auto"></div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-16 mx-auto"></div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const TabelaFalhas: React.FC = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [dados, setDados] = useState<ItemTabela[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    setor: 'TODOS' as string,
    tipo: 'TODOS' as 'TODOS' | 'FALHAS' | 'EVENTOS',
    status: 'TODOS' as 'TODOS' | 'ATIVO' | 'RESOLVIDO' | 'EM_ANALISE'
  });
  
  const itensPorPagina = 10;

  // Carregar dados da API
  const carregarDados = async (mostrarLoader = true) => {
    try {
      if (mostrarLoader) {
        setCarregando(true);
      } else {
        setRecarregando(true);
      }
      setErro(null);

      // Carregar histórico de ocorrências com filtros
      const ocorrencias = await apiService.obterHistoricoOcorrencias({
        setor: filtros.setor !== 'TODOS' ? filtros.setor : undefined,
        tipo: filtros.tipo !== 'TODOS' ? filtros.tipo : undefined,
        status: filtros.status !== 'TODOS' ? filtros.status : undefined,
        limite: 1000 // Buscar mais dados para filtros locais funcionarem
      });

      const itensTabela = ocorrencias.map(converterOcorrenciaParaItem);
      setDados(itensTabela);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados. Verifique se o servidor está rodando.');
      setDados([]);
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Recarregar quando filtros mudarem (exceto busca local)
  useEffect(() => {
    carregarDados();
  }, [filtros]);
  
  // Aplicar filtros locais (busca)
  const dadosFiltrados = useMemo(() => {
    return dados.filter(item => {
      // Filtro por busca local
      if (busca && 
          !item.descricao.toLowerCase().includes(busca.toLowerCase()) && 
          !formatarNomeSetor(item.setor).toLowerCase().includes(busca.toLowerCase()) &&
          !item.codigo.toLowerCase().includes(busca.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [dados, busca]);

  // Paginação
  const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  // Reset página quando filtros mudam com loading
  React.useEffect(() => {
    setCarregando(true);
    setPaginaAtual(1);
    // Simula loading para melhor UX
    const timer = setTimeout(() => setCarregando(false), 300);
    return () => clearTimeout(timer);
  }, [filtros, busca]);

  // Indicador de tempo real - atualiza a cada minuto
  const [tempoAtual, setTempoAtual] = useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => setTempoAtual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Função para calcular tempo relativo
  const calcularTempoRelativo = (timestamp: Date): string => {
    const agora = tempoAtual.getTime();
    const diferenca = agora - timestamp.getTime();
    const minutos = Math.floor(diferenca / (1000 * 60));
    
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `há ${minutos}min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas}h`;
    const dias = Math.floor(horas / 24);
    return `há ${dias}d`;
  };

  return (
    <div className="w-full max-w-none bg-white rounded-xl border border-edp-marine/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Filtros e busca */}
      <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
        {/* Busca */}
        <div className="mb-4 lg:mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por descrição, setor ou palavra-chave..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-10 py-2 sm:py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filtros responsivos */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
          {/* Filtro Setor */}
          <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
            <select
              value={filtros.setor}
              onChange={(e) => setFiltros({...filtros, setor: e.target.value as any})}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer transition-all duration-200"
            >
              <option value="TODOS">Todos os setores</option>
              {SETORES.slice(1).map(setor => (
                <option key={setor.value} value={setor.value}>
                  {setor.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Filtro Tipo */}
          <div className="relative flex-1 sm:flex-none sm:min-w-[150px]">
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value as any})}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer transition-all duration-200"
            >
              {TIPOS.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Filtro Status */}
          <div className="relative flex-1 sm:flex-none sm:min-w-[150px]">
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value as any})}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer transition-all duration-200"
            >
              {STATUS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Contador e Limpar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 sm:ml-auto mt-2 sm:mt-0">
            <div className="text-sm text-gray-500">
              {dadosFiltrados.length} registros
            </div>
            
            {/* Limpar filtros */}
            {(filtros.setor !== 'TODOS' || filtros.tipo !== 'TODOS' || filtros.status !== 'TODOS' || busca) && (
              <button
                onClick={() => {
                  setBusca('');
                  setFiltros({setor: 'TODOS', tipo: 'TODOS', status: 'TODOS'});
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium underline transition-colors whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto max-w-full">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-edp-slate uppercase tracking-wider">
                Setor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-edp-slate uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-edp-slate uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-edp-slate uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-edp-slate uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-edp-slate uppercase tracking-wider">
                Data/Hora
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <SkeletonLoader />
            ) : (
              dadosPaginados.map((item) => (
                <LinhaTabela key={item.id} item={item} calcularTempoRelativo={calcularTempoRelativo} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Melhorado */}
      <div className="md:hidden space-y-3 p-3 sm:p-4">
        {dadosPaginados.map((item) => (
          <div 
            key={`mobile-${item.id}`} 
            className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-300 hover:border-edp-marine/30"
          >
            {/* Linha 1: Setor + Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-edp-marine">
                {formatarNomeSetor(item.setor)}
              </span>
              {criarBadgeStatus(item.status)}
            </div>
            
            {/* Linha 2: Descrição */}
            <div className="text-sm text-edp-slate mb-3 leading-relaxed">
              {item.descricao}
            </div>
            
            {/* Linha 3: Badges */}
            <div className="flex items-center gap-2 mb-3">
              {criarBadgeTipo(item.tipo)}
              {criarBadgePrioridade(item.prioridade)}
            </div>
            
            {/* Linha 4: Data */}
            <div className="text-xs text-edp-slate/60 flex items-center justify-end">
              <span>
                {item.timestamp.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' })} às {item.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>


      {/* Rodapé com paginação ou info */}
      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs md:text-sm text-edp-slate">
            {dadosFiltrados.length} registros
          </div>
          
          {totalPaginas > 1 && (
            <div className="flex items-center gap-1">
              {/* Botão Anterior */}
              <button
                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                disabled={paginaAtual === 1}
                className={`
                  flex items-center px-2 py-1 text-xs md:text-sm rounded-md transition-all duration-200
                  ${paginaAtual === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-edp-slate hover:bg-gray-100 hover:text-edp-marine'
                  }
                `}
              >
                <ChevronLeft size={14} />
              </button>

              {/* Mobile: Apenas 3 números */}
              <div className="md:hidden flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPaginas) }, (_, i) => {
                  let pageNumber;
                  if (totalPaginas <= 3) {
                    pageNumber = i + 1;
                  } else if (paginaAtual === 1) {
                    pageNumber = i + 1;
                  } else if (paginaAtual === totalPaginas) {
                    pageNumber = totalPaginas - 2 + i;
                  } else {
                    pageNumber = paginaAtual - 1 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPaginaAtual(pageNumber)}
                      className={`
                        w-6 h-6 text-xs font-medium rounded transition-all duration-200
                        ${pageNumber === paginaAtual
                          ? 'bg-edp-marine text-white'
                          : 'text-edp-slate hover:bg-gray-100'
                        }
                      `}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* Desktop: 5 números */}
              <div className="hidden md:flex items-center gap-1">
                {/* Primeira página se necessário */}
                {paginaAtual > 3 && totalPaginas > 5 && (
                  <>
                    <button
                      onClick={() => setPaginaAtual(1)}
                      className="w-8 h-8 text-sm font-medium rounded-md transition-all duration-200 text-edp-slate hover:bg-gray-100 hover:text-edp-marine"
                    >
                      1
                    </button>
                    <span className="px-1 text-edp-slate">...</span>
                  </>
                )}

                {/* Números das páginas */}
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pageNumber;
                  if (totalPaginas <= 5) {
                    pageNumber = i + 1;
                  } else if (paginaAtual <= 3) {
                    pageNumber = i + 1;
                  } else if (paginaAtual >= totalPaginas - 2) {
                    pageNumber = totalPaginas - 4 + i;
                  } else {
                    pageNumber = paginaAtual - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPaginaAtual(pageNumber)}
                      className={`
                        w-8 h-8 text-sm font-medium rounded-md transition-all duration-200
                        ${pageNumber === paginaAtual
                          ? 'bg-edp-marine text-white shadow-sm'
                          : 'text-edp-slate hover:bg-gray-100 hover:text-edp-marine'
                        }
                      `}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Última página se necessário */}
                {paginaAtual < totalPaginas - 2 && totalPaginas > 5 && (
                  <>
                    <span className="px-1 text-edp-slate">...</span>
                    <button
                      onClick={() => setPaginaAtual(totalPaginas)}
                      className="w-8 h-8 text-sm font-medium rounded-md transition-all duration-200 text-edp-slate hover:bg-gray-100 hover:text-edp-marine"
                    >
                      {totalPaginas}
                    </button>
                  </>
                )}
              </div>

              {/* Botão Próximo */}
              <button
                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                disabled={paginaAtual === totalPaginas}
                className={`
                  flex items-center px-2 py-1 text-xs md:text-sm rounded-md transition-all duration-200
                  ${paginaAtual === totalPaginas 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-edp-slate hover:bg-gray-100 hover:text-edp-marine'
                  }
                `}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estado vazio */}
      {dadosFiltrados.length === 0 && (
        <div className="text-center py-16">
          <div className="text-edp-slate/60 mb-2">
            <Search size={48} className="mx-auto mb-3 opacity-50" />
          </div>
          <p className="text-edp-slate font-medium mb-1">
            Nenhum registro encontrado
          </p>
          <p className="text-sm text-edp-slate/60">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}
    </div>
  );
};

export default TabelaFalhas;