/**
 * Serviço: API Service
 * 
 * Serviço para comunicação com a API do backend
 * Gerencia todas as chamadas para o sistema de falhas
 */

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Tipos da API (espelhando o que vem do backend)
export interface OcorrenciaCompleta {
  id: number;
  status: 'ATIVO' | 'RESOLVIDO' | 'EM_ANALISE';
  timestamp_inicio: string;
  timestamp_fim?: string;
  duracao_segundos?: number;
  
  // Dados da Definição de Falha
  definicao_id: number;
  codigo: string;
  tipo: 'FALHA' | 'EVENTO';
  descricao: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  word_index: number;
  bit_index: number;
  classe_mensagem: string;
  
  // Dados do Setor
  setor_codigo: string;
  setor_nome: string;
  
  // Dados da Eclusa
  eclusa_codigo: string;
  eclusa_nome: string;
}

export interface EstatisticasDashboard {
  ocorrencias_ativas: number;
  falhas_ultimas_24h: number;
  eventos_ultimas_24h: number;
  total_ocorrencias: number;
  por_setor: Record<string, number>;
  por_prioridade: Record<string, number>;
  top_falhas_frequentes: Array<{
    codigo: string;
    descricao: string;
    setor_nome: string;
    frequencia: number;
  }>;
  tempo_medio_resolucao_horas: number;
}

export interface DefinicaoFalha {
  id: number;
  codigo: string;
  tipo: 'FALHA' | 'EVENTO';
  descricao: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  word_index: number;
  bit_index: number;
  classe_mensagem: string;
  setor_codigo: string;
  setor_nome: string;
  eclusa_codigo: string;
  eclusa_nome: string;
  ativa: boolean;
}

export interface Setor {
  id: number;
  codigo: string;
  nome: string;
  cor_tema: string;
}

export interface Eclusa {
  id: number;
  codigo: string;
  nome: string;
  localizacao: string;
  ativa: boolean;
}

// Resposta padrão da API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição da API:', error);
      throw error;
    }
  }

  // Verificar saúde da API
  async verificarSaude(): Promise<boolean> {
    try {
      const response = await this.request<any>('/health');
      return response.success;
    } catch (error) {
      console.error('API não está disponível:', error);
      return false;
    }
  }

  // Buscar ocorrências ativas
  async obterOcorrenciasAtivas(): Promise<OcorrenciaCompleta[]> {
    try {
      const response = await this.request<OcorrenciaCompleta[]>('/ocorrencias/ativas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ocorrências ativas:', error);
      return [];
    }
  }

  // Buscar histórico de ocorrências com filtros
  async obterHistoricoOcorrencias(filtros?: {
    setor?: string;
    tipo?: string;
    status?: string;
    limite?: number;
  }): Promise<OcorrenciaCompleta[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.setor && filtros.setor !== 'TODOS') {
        params.append('setor', filtros.setor);
      }
      if (filtros?.tipo && filtros.tipo !== 'TODOS') {
        params.append('tipo', filtros.tipo === 'FALHAS' ? 'FALHA' : 'EVENTO');
      }
      if (filtros?.status && filtros.status !== 'TODOS') {
        params.append('status', filtros.status);
      }
      if (filtros?.limite) {
        params.append('limite', filtros.limite.toString());
      }

      const queryString = params.toString();
      const endpoint = `/ocorrencias/historico${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.request<OcorrenciaCompleta[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de ocorrências:', error);
      return [];
    }
  }

  // Buscar estatísticas do dashboard
  async obterEstatisticasDashboard(): Promise<EstatisticasDashboard | null> {
    try {
      const response = await this.request<EstatisticasDashboard>('/estatisticas/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      return null;
    }
  }

  // Buscar definições de falhas
  async obterDefinicoesFalhas(filtros?: {
    setor?: string;
    tipo?: string;
  }): Promise<DefinicaoFalha[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.setor && filtros.setor !== 'TODOS') {
        params.append('setor', filtros.setor);
      }
      if (filtros?.tipo && filtros.tipo !== 'TODOS') {
        params.append('tipo', filtros.tipo === 'FALHAS' ? 'FALHA' : 'EVENTO');
      }

      const queryString = params.toString();
      const endpoint = `/definicoes/falhas${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.request<DefinicaoFalha[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar definições de falhas:', error);
      return [];
    }
  }

  // Buscar setores
  async obterSetores(): Promise<Setor[]> {
    try {
      const response = await this.request<Setor[]>('/setores');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      return [];
    }
  }

  // Buscar eclusas
  async obterEclusas(): Promise<Eclusa[]> {
    try {
      const response = await this.request<Eclusa[]>('/eclusas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eclusas:', error);
      return [];
    }
  }

  // Resolver ocorrência manualmente
  async resolverOcorrencia(id: number): Promise<boolean> {
    try {
      const response = await this.request<any>(`/ocorrencias/${id}/resolver`, {
        method: 'POST',
      });
      return response.success;
    } catch (error) {
      console.error('Erro ao resolver ocorrência:', error);
      return false;
    }
  }

  // Converter ocorrência da API para formato da tabela
  convertOcorrenciaParaItem(ocorrencia: OcorrenciaCompleta): {
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
  } {
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
  }
}

// Instância única do serviço
export const apiService = new ApiService();

// Hook personalizado para usar o serviço com React
export const useApiService = () => {
  return apiService;
};