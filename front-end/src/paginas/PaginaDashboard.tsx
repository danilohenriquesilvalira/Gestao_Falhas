/**
 * Página: Dashboard
 * 
 * Dashboard principal com visualizações de falhas
 */

import React, { useMemo } from 'react';
import { BarChart3, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { CardModerno } from '../componentes/falhas';
import { GraficoPizza, GraficoLinha } from '../componentes/dashboard';
import { DADOS_FALHAS_ECLUSA } from '../constantes/dadosFalhas';

export const PaginaDashboard: React.FC = () => {
  
  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalFalhas = DADOS_FALHAS_ECLUSA.reduce((acc, setor) => acc + setor.totalFalhas, 0);
    const totalEventos = DADOS_FALHAS_ECLUSA.reduce((acc, setor) => acc + setor.totalEventos, 0);
    const totalItens = totalFalhas + totalEventos;
    
    // Taxa de falhas vs eventos
    const taxaFalhas = totalItens > 0 ? Math.round((totalFalhas / totalItens) * 100) : 0;
    
    // Média de falhas por setor
    const mediaFalhasPorSetor = Math.round(totalFalhas / DADOS_FALHAS_ECLUSA.length);
    
    return {
      totalGeral: totalItens,
      totalFalhas,
      taxaFalhas,
      mediaFalhasPorSetor
    };
  }, []);

  // Dados para o gráfico de pizza
  const dadosPizza = useMemo(() => {
    const cores = ['#E32C2C', '#28FF52', '#263CC8', '#F7D200', '#225E66', '#6D32FF'];
    const nomes: Record<string, string> = {
      ENCHIMENTO: 'Enchimento',
      ESVAZIAMENTO: 'Esvaziamento',
      PORTAJUSANTE: 'Porta Jusante',
      PORTAMONTANTE: 'Porta Montante',
      COMANDO_ECLUSA: 'Comando Eclusa',
      ESGOTO_DRENAGEM: 'Esgoto/Drenagem'
    };
    
    return DADOS_FALHAS_ECLUSA.map((setor, index) => ({
      label: nomes[setor.setor] || setor.setor,
      valor: setor.totalFalhas,
      cor: cores[index % cores.length]
    }));
  }, []);

  // Dados para o gráfico de linha (últimos 7 dias - simulado)
  const dadosLinha = useMemo(() => {
    return [
      { nome: 'Seg', valor: 28 },
      { nome: 'Ter', valor: 35 },
      { nome: 'Qua', valor: 32 },
      { nome: 'Qui', valor: 41 },
      { nome: 'Sex', valor: 38 },
      { nome: 'Sáb', valor: 29 },
      { nome: 'Dom', valor: 25 }
    ];
  }, []);

  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-4 md:p-8 pb-20 md:pb-8 space-y-6 max-w-full">
        
        {/* Cards de estatísticas gerais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardModerno
            titulo="Registros Totais"
            valor={estatisticas.totalGeral}
            descricao="Falhas e eventos combinados"
            icone={BarChart3}
            cor="azul"
          />
          
          <CardModerno
            titulo="Total de Falhas"
            valor={estatisticas.totalFalhas}
            descricao="Problemas identificados"
            icone={AlertTriangle}
            cor="vermelho"
          />
          
          <CardModerno
            titulo="Taxa de Criticidade"
            valor={`${estatisticas.taxaFalhas}%`}
            descricao="Proporção de falhas"
            icone={TrendingUp}
            cor="amarelo"
          />
          
          <CardModerno
            titulo="Média por Setor"
            valor={estatisticas.mediaFalhasPorSetor}
            descricao="Falhas distribuídas"
            icone={Activity}
            cor="verde"
          />
        </div>

        {/* Grid de Gráficos - Linha 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoPizza
            titulo="Distribuição de Falhas por Setor"
            dados={dadosPizza}
          />
          
          <GraficoLinha
            titulo="Tendência de Falhas - Últimos 7 Dias"
            dados={dadosLinha}
            cor="#E32C2C"
            comArea={true}
          />
        </div>

      </div>
    </div>
  );
};

export default PaginaDashboard;
