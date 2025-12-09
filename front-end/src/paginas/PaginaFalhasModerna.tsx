/**
 * Página: Falhas Moderna
 * 
 * Versão modernizada da página de falhas
 * Design delicado, intuitivo e com UX aprimorada
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, BarChart3, AlertTriangle, Activity, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { CardModerno, TabelaFalhas, ListaFalhas } from '../componentes/falhas';
import { DADOS_FALHAS_ECLUSA } from '../constantes/dadosFalhas';
import type { SetorEclusa } from '../tipos/falhas';

export const PaginaFalhasModerna: React.FC = () => {
  // Estados da página
  const [setorAtivo, setSetorAtivo] = useState<SetorEclusa | null>(null);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'falhas' | 'eventos'>('falhas');
  
  

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalFalhas = DADOS_FALHAS_ECLUSA.reduce((acc, setor) => acc + setor.totalFalhas, 0);
    const totalEventos = DADOS_FALHAS_ECLUSA.reduce((acc, setor) => acc + setor.totalEventos, 0);
    const totalItens = totalFalhas + totalEventos;
    const setorMaisFalhas = DADOS_FALHAS_ECLUSA.reduce((max, setor) => 
      setor.totalFalhas > max.totalFalhas ? setor : max
    );
    
    return {
      totalItens,
      totalFalhas,
      totalEventos,
      setorMaisFalhas,
      percentualFalhas: totalItens > 0 ? Math.round((totalFalhas / totalItens) * 100) : 0,
      setorCritico: DADOS_FALHAS_ECLUSA.filter(s => (s.totalFalhas / (s.totalFalhas + s.totalEventos)) > 0.7).length,
      mediaFalhasPorSetor: Math.round(totalFalhas / DADOS_FALHAS_ECLUSA.length)
    };
  }, []);

  // Handlers
  const handleSetorClick = (setor: SetorEclusa) => {
    setSetorAtivo(setor);
  };

  const handleVoltarOverview = () => {
    setSetorAtivo(null);
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


  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-4 md:p-8 pb-20 md:pb-8 space-y-6 max-w-full">
        {setorAtivo ? (
          /* TELA DETALHADA - Setor Específico */
          <>
            {/* Header com navegação */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleVoltarOverview}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 text-edp-marine hover:bg-white border border-gray-200/60 rounded-xl transition-all duration-300 hover:shadow-md"
              >
                <ArrowLeft size={18} />
                <span>Voltar ao Overview</span>
              </button>
              
              <div className="flex-1 min-w-0">
                <nav className="text-sm text-edp-slate/70 mb-1">
                  Falhas da Eclusa → {formatarNomeSetor(setorAtivo)}
                </nav>
                <h1 className="text-2xl font-bold text-edp-marine">
                  {formatarNomeSetor(setorAtivo)}
                </h1>
              </div>
            </div>

            {/* Estatísticas do setor */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const dadosSetor = DADOS_FALHAS_ECLUSA.find(s => s.setor === setorAtivo);
                if (!dadosSetor) return null;
                
                return (
                  <>
                    <CardModerno
                      titulo="Total de Falhas"
                      valor={dadosSetor.totalFalhas}
                      icone={AlertTriangle}
                      cor="vermelho"
                    />
                    <CardModerno
                      titulo="Total de Eventos"
                      valor={dadosSetor.totalEventos}
                      icone={Activity}
                      cor="verde"
                    />
                    <CardModerno
                      titulo="Total de Itens"
                      valor={dadosSetor.totalFalhas + dadosSetor.totalEventos}
                      icone={BarChart3}
                      cor="azul"
                    />
                    <CardModerno
                      titulo="Criticidade"
                      valor={`${Math.round((dadosSetor.totalFalhas / (dadosSetor.totalFalhas + dadosSetor.totalEventos)) * 100)}%`}
                      icone={TrendingUp}
                      cor={dadosSetor.totalFalhas / (dadosSetor.totalFalhas + dadosSetor.totalEventos) > 0.7 ? 'vermelho' : 
                           dadosSetor.totalFalhas / (dadosSetor.totalFalhas + dadosSetor.totalEventos) > 0.3 ? 'amarelo' : 'verde'}
                    />
                  </>
                );
              })()}
            </div>

            {/* Tabs modernas */}
            <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 w-fit border border-edp-marine/30">
              <button
                onClick={() => setTipoVisualizacao('falhas')}
                className={`
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                  ${tipoVisualizacao === 'falhas' 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                    : 'text-edp-slate hover:text-red-600 hover:bg-red-50'
                  }
                `}
              >
                <AlertTriangle size={16} />
                Falhas ({DADOS_FALHAS_ECLUSA.find(s => s.setor === setorAtivo)?.totalFalhas || 0})
              </button>
              
              <button
                onClick={() => setTipoVisualizacao('eventos')}
                className={`
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                  ${tipoVisualizacao === 'eventos' 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                    : 'text-edp-slate hover:text-green-600 hover:bg-green-50'
                  }
                `}
              >
                <Activity size={16} />
                Eventos ({DADOS_FALHAS_ECLUSA.find(s => s.setor === setorAtivo)?.totalEventos || 0})
              </button>
            </div>

            {/* Lista detalhada */}
            <div className="bg-white/80 backdrop-blur-sm border border-edp-marine/30 rounded-2xl">
              <div className="p-6 border-b border-edp-marine/30">
                <h3 className="text-lg font-bold text-edp-marine mb-2">
                  {tipoVisualizacao === 'falhas' ? 'Lista de Falhas' : 'Lista de Eventos'}
                </h3>
                <p className="text-sm text-edp-slate">
                  Detalhamento completo do setor {formatarNomeSetor(setorAtivo)}
                </p>
              </div>
              
              <div className="p-6">
                <ListaFalhas 
                  setor={setorAtivo} 
                  tipoExibicao={tipoVisualizacao} 
                />
              </div>
            </div>
          </>
        ) : (
          /* TELA OVERVIEW - Dashboard Principal */
          <>
            {/* Cards de estatísticas gerais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <CardModerno
                titulo="Total de Itens"
                valor={estatisticas.totalItens}
                descricao="Falhas e eventos registrados"
                icone={BarChart3}
                cor="azul"
              />
              
              <CardModerno
                titulo="Falhas Ativas"
                valor={estatisticas.totalFalhas}
                descricao="Requer atenção imediata"
                icone={AlertTriangle}
                cor="vermelho"
              />
              
              <CardModerno
                titulo="Eventos"
                valor={estatisticas.totalEventos}
                descricao="Eventos operacionais"
                icone={Activity}
                cor="verde"
              />
              
              <CardModerno
                titulo="Setores Críticos"
                valor={estatisticas.setorCritico}
                descricao="Acima de 70% de falhas"
                icone={TrendingUp}
                cor="amarelo"
              />
            </div>

            {/* Tabela integrada com filtros */}
            <TabelaFalhas />
          </>
        )}
      </div>
    </div>
  );
};

export default PaginaFalhasModerna;