/**
 * Componente: ListaFalhas
 * 
 * Lista detalhada de falhas de um setor específico
 */

import React from 'react';
import { AlertTriangle, Activity, Clock, CheckCircle } from 'lucide-react';
import type { SetorEclusa } from '../../tipos/falhas';
import { DADOS_FALHAS_ECLUSA } from '../../constantes/dadosFalhas';

interface PropsListaFalhas {
  setor: SetorEclusa;
  tipoExibicao: 'falhas' | 'eventos';
}

export const ListaFalhas: React.FC<PropsListaFalhas> = ({ 
  setor, 
  tipoExibicao 
}) => {
  const dadosSetor = DADOS_FALHAS_ECLUSA.find(d => d.setor === setor);
  
  if (!dadosSetor) {
    return (
      <div className="text-center py-8">
        <p className="text-edp-slate">Setor não encontrado</p>
      </div>
    );
  }

  const itens = tipoExibicao === 'falhas' ? dadosSetor.falhas : dadosSetor.eventos;
  const icone = tipoExibicao === 'falhas' ? AlertTriangle : Activity;
  const corIcone = tipoExibicao === 'falhas' ? 'text-edp-semantic-red' : 'text-edp-electric';

  // Simular status aleatório para demonstração
  const obterStatusAleatorio = () => {
    const statuses = ['ATIVO', 'RESOLVIDO', 'EM_ANALISE'] as const;
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const obterCorStatus = (status: string) => {
    const cores = {
      ATIVO: 'bg-edp-semantic-red text-white',
      RESOLVIDO: 'bg-edp-semantic-green text-white',
      EM_ANALISE: 'bg-edp-semantic-yellow text-edp-marine'
    };
    return cores[status as keyof typeof cores] || 'bg-edp-slate text-white';
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return <AlertTriangle size={16} />;
      case 'RESOLVIDO':
        return <CheckCircle size={16} />;
      case 'EM_ANALISE':
        return <Clock size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="space-y-3">
      {itens.length === 0 ? (
        <div className="text-center py-8 bg-edp-neutral-white-wash rounded-lg">
          <p className="text-edp-slate">
            Nenhum {tipoExibicao === 'falhas' ? 'falha' : 'evento'} encontrado
          </p>
        </div>
      ) : (
        itens.map((item, index) => {
          const status = obterStatusAleatorio();
          const IconeComponent = icone;
          
          return (
            <div 
              key={index}
              className="bg-white border border-edp-marine/30 rounded-lg p-4 hover:shadow-md transition-shadow w-full max-w-full"
            >
              <div className="flex items-start gap-3">
                {/* Ícone */}
                <div className={`${corIcone} flex-shrink-0 mt-1`}>
                  <IconeComponent size={18} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-edp-marine text-sm leading-relaxed mb-2 break-words">
                    {item}
                  </h4>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${obterCorStatus(status)}
                      `}>
                        {obterIconeStatus(status)}
                        {status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Timestamp simulado */}
                    <span className="text-xs text-edp-slate whitespace-nowrap">
                      {new Date(Date.now() - Math.random() * 86400000).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListaFalhas;