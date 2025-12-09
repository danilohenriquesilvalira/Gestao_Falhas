/**
 * Tipos - Sistema de Falhas da Eclusa
 * 
 * Definições de tipos para falhas e eventos da eclusa
 */

export type TipoFalha = 'ALARME' | 'EVENTO';

export type SetorEclusa = 
  | 'ENCHIMENTO'
  | 'ESVAZIAMENTO' 
  | 'PORTAJUSANTE'
  | 'PORTAMONTANTE'
  | 'COMANDO_ECLUSA'
  | 'ESGOTO_DRENAGEM';

export type StatusFalha = 'ATIVO' | 'RESOLVIDO' | 'EM_ANALISE';

export type SeveridadeFalha = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export interface Falha {
  id: string;
  descricao: string;
  setor: SetorEclusa;
  tipo: TipoFalha;
  classe: string;
  status: StatusFalha;
  severidade: SeveridadeFalha;
  dataOcorrencia: Date;
  dataResolucao?: Date;
  observacoes?: string;
}

export interface FalhaPorSetor {
  setor: SetorEclusa;
  classe: string;
  falhas: string[];
  eventos: string[];
  totalFalhas: number;
  totalEventos: number;
}

export interface EstatisticasFalhas {
  totalGeral: number;
  porSetor: Record<SetorEclusa, number>;
  porStatus: Record<StatusFalha, number>;
  porSeveridade: Record<SeveridadeFalha, number>;
}