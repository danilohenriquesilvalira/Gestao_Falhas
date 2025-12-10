import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, AlertTriangle, ChevronDown, X } from 'lucide-react';


interface OcorrenciaAPI {
  id: number;
  status: string;
  timestamp_inicio: string;
  timestamp_fim?: string;
  definicao_id: number;
  codigo: string;
  tipo: string;
  descricao: string;
  prioridade: string;
  word_index: number;
  bit_index: number;
  classe_mensagem: string;
  setor_codigo: string;
  setor_nome: string;
  eclusa_codigo: string;
  eclusa_nome: string;
  duracao_segundos?: number;
}

const API_URL = 'http://127.0.0.1:8080/api/v1/ocorrencias/historico';

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
  { value: 'FALHA', label: 'Falhas' },
  { value: 'EVENTO', label: 'Eventos' }
];

const STATUS = [
  { value: 'TODOS', label: 'Todos os status' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'RESOLVIDO', label: 'Resolvido' },
  { value: 'EM_ANALISE', label: 'Em Análise' }
];

export const TabelaFalhas: React.FC = () => {
  const [dados, setDados] = useState<OcorrenciaAPI[]>(() => {
    try {
      const saved = localStorage.getItem('tabelaFalhas_dados');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [carregando, setCarregando] = useState(false);
  const [recarregando, setRecarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtros, setFiltros] = useState({
    setor: 'TODOS',
    tipo: 'TODOS',
    status: 'TODOS'
  });

  const carregarDados = async (mostrarLoader = false) => {
    if (mostrarLoader) {
      setCarregando(true);
    } else {
      setRecarregando(true);
    }
    setErro(null);
    
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const novosDados = data.success && Array.isArray(data.data) ? data.data : [];
      setDados(novosDados);
      
      // Salvar no localStorage
      if (novosDados.length > 0) {
        localStorage.setItem('tabelaFalhas_dados', JSON.stringify(novosDados));
      }
      
    } catch (error: any) {
      setErro(error.message);
      if (mostrarLoader) {
        setDados([]); // Só limpa dados no carregamento inicial
      }
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  };

  useEffect(() => {
    // Se não tem dados salvos, carrega silenciosamente
    const temDados = localStorage.getItem('tabelaFalhas_dados');
    if (!temDados) {
      carregarDados(false); // Carrega sem mostrar skeleton
    }
  }, []);

  const dadosFiltrados = useMemo(() => {
    const buscaLower = busca.toLowerCase();
    
    return dados.filter(item => {
      if (busca && 
          !item.descricao.toLowerCase().includes(buscaLower) && 
          !formatarNomeSetor(item.setor_codigo).toLowerCase().includes(buscaLower) &&
          !item.codigo.toLowerCase().includes(buscaLower)) {
        return false;
      }

      return (filtros.setor === 'TODOS' || item.setor_codigo === filtros.setor) &&
             (filtros.tipo === 'TODOS' || item.tipo === filtros.tipo) &&
             (filtros.status === 'TODOS' || item.status === filtros.status);
    });
  }, [dados, busca, filtros]);

  const formatarData = (timestamp: string) => {
    const data = new Date(timestamp);
    return `${data.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })} às ${data.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
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

  const Badge: React.FC<{ tipo: 'status' | 'tipo' | 'prioridade', valor: string }> = ({ tipo, valor }) => {
    if (tipo === 'status') {
      const configs = {
        'ATIVO': 'bg-red-100 text-red-800 border-red-200',
        'RESOLVIDO': 'bg-green-100 text-green-800 border-green-200',
        'EM_ANALISE': 'bg-amber-100 text-amber-800 border-amber-200'
      };
      const labels = { 'ATIVO': 'Ativo', 'RESOLVIDO': 'Resolvido', 'EM_ANALISE': 'Em Análise' };
      const config = configs[valor as keyof typeof configs] || configs.ATIVO;
      
      return (
        <span className={`inline-flex items-center justify-center w-20 px-2 py-1 rounded-md text-xs font-medium border ${config}`}>
          {labels[valor as keyof typeof labels] || valor}
        </span>
      );
    }

    if (tipo === 'tipo') {
      const labels = { 'FALHA': 'Falha', 'EVENTO': 'Evento' };
      return (
        <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded-md text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
          {labels[valor as keyof typeof labels] || valor}
        </span>
      );
    }

    const configs = {
      'ALTA': 'font-bold',
      'MEDIA': 'font-medium', 
      'BAIXA': 'font-normal'
    };
    const labels = { 'ALTA': 'Alta', 'MEDIA': 'Média', 'BAIXA': 'Baixa' };
    const weight = configs[valor as keyof typeof configs] || configs.MEDIA;
    
    return (
      <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-md text-xs ${weight} border bg-gray-50 text-gray-700 border-gray-200`}>
        {labels[valor as keyof typeof labels] || valor}
      </span>
    );
  };

  // Skeleton Loading mais elegante
  if (carregando) {
    return (
      <div className="w-full max-w-none bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Header do skeleton */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-xl mb-4"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded-lg flex-1 max-w-[180px]"></div>
              <div className="h-8 bg-gray-200 rounded-lg flex-1 max-w-[150px]"></div>
              <div className="h-8 bg-gray-200 rounded-lg flex-1 max-w-[150px]"></div>
            </div>
          </div>
        </div>
        
        {/* Skeleton da tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 5 }, (_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-6 bg-gray-200 rounded w-20 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="text-center text-red-600">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p className="font-medium mb-2">Erro ao carregar dados</p>
          <p className="text-sm mb-4">{erro}</p>
          <button 
            onClick={() => carregarDados()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
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
              className="w-full pl-10 pr-10 py-2 sm:py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:bg-white"
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
              onChange={(e) => setFiltros({...filtros, setor: e.target.value})}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
            >
              {SETORES.map(setor => (
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
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
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
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
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

          {/* Contador, Atualizar e Limpar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 sm:ml-auto mt-2 sm:mt-0">
            <div className="text-sm text-gray-500">
              {dadosFiltrados.length} registros
            </div>

            {/* Botão Atualizar */}
            <button
              onClick={() => carregarDados(false)}
              disabled={recarregando}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={recarregando ? 'animate-spin' : ''} />
              {recarregando ? 'Atualizando...' : 'Atualizar'}
            </button>
            
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

      {dadosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-gray-600 font-medium mb-1">
            {dados.length === 0 ? 'Nenhuma ocorrência registrada' : 'Nenhum registro encontrado'}
          </p>
          <p className="text-sm text-gray-500">
            {dados.length === 0 
              ? 'As ocorrências aparecerão aqui quando forem registradas pelo PLC'
              : 'Tente ajustar os filtros de busca'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosFiltrados.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent transition-all duration-200 border-l-2 border-transparent hover:border-blue-400 hover:shadow-sm"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatarNomeSetor(item.setor_codigo)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.setor_codigo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 leading-tight max-w-md">
                      {item.descricao}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.codigo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Badge tipo="tipo" valor={item.tipo} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Badge tipo="status" valor={item.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Badge tipo="prioridade" valor={item.prioridade} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600 font-medium">
                      {formatarData(item.timestamp_inicio)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TabelaFalhas;