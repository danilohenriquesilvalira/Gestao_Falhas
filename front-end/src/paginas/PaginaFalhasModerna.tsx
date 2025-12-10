import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { CardModerno, TabelaFalhas } from '../componentes/falhas';

interface EstatisticasDashboard {
  ocorrencias_ativas: number;
  falhas_ultimas_24h: number;
  eventos_ultimas_24h: number;
  total_ocorrencias: number;
}

export const PaginaFalhasModerna: React.FC = () => {
  const [estatisticas, setEstatisticas] = useState<EstatisticasDashboard>(() => {
    try {
      const saved = localStorage.getItem('dashboard_estatisticas');
      return saved ? JSON.parse(saved) : {
        ocorrencias_ativas: 0,
        falhas_ultimas_24h: 0,
        eventos_ultimas_24h: 0,
        total_ocorrencias: 0
      };
    } catch {
      return {
        ocorrencias_ativas: 0,
        falhas_ultimas_24h: 0,
        eventos_ultimas_24h: 0,
        total_ocorrencias: 0
      };
    }
  });
  const [carregandoEstatisticas, setCarregandoEstatisticas] = useState(false);

  const carregarEstatisticas = async (mostrarLoading = false) => {
    if (mostrarLoading) {
      setCarregandoEstatisticas(true);
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8080/api/v1/estatisticas/dashboard');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setEstatisticas(data.data);
          // Salvar no localStorage
          localStorage.setItem('dashboard_estatisticas', JSON.stringify(data.data));
        }
      }
    } catch (error) {
      // Falha silenciosa - estatísticas mantêm valores anteriores
    } finally {
      setCarregandoEstatisticas(false);
    }
  };

  useEffect(() => {
    // Se não tem dados salvos, carrega silenciosamente
    const temDados = localStorage.getItem('dashboard_estatisticas');
    carregarEstatisticas(!temDados); // Só mostra loading se não tem dados
    const interval = setInterval(() => carregarEstatisticas(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200 w-full"></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-4 md:p-8 pb-20 md:pb-8 space-y-6 max-w-full">
        
        {/* Cards de estatísticas gerais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {carregandoEstatisticas ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <CardModerno
                titulo="Total de Ocorrências"
                valor={estatisticas.total_ocorrencias}
                descricao="Registro total do sistema"
                icone={BarChart3}
                cor="azul"
              />
              
              <CardModerno
                titulo="Ocorrências Ativas"
                valor={estatisticas.ocorrencias_ativas}
                descricao="Requer atenção imediata"
                icone={AlertTriangle}
                cor="vermelho"
              />
              
              <CardModerno
                titulo="Falhas (24h)"
                valor={estatisticas.falhas_ultimas_24h}
                descricao="Falhas nas últimas 24 horas"
                icone={Activity}
                cor="amarelo"
              />
              
              <CardModerno
                titulo="Eventos (24h)"
                valor={estatisticas.eventos_ultimas_24h}
                descricao="Eventos nas últimas 24 horas"
                icone={TrendingUp}
                cor="verde"
              />
            </>
          )}
        </div>

        {/* Tabela integrada com filtros */}
        <TabelaFalhas />
        
      </div>
    </div>
  );
};

export default PaginaFalhasModerna;