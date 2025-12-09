/**
 * Componente: GraficoPizza
 * 
 * Gráfico de pizza usando Recharts
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DadosPizza {
  label: string;
  valor: number;
  cor: string;
}

interface PropsGraficoPizza {
  titulo: string;
  dados: DadosPizza[];
}

export const GraficoPizza: React.FC<PropsGraficoPizza> = ({ titulo, dados }) => {
  const total = dados.reduce((acc, item) => acc + item.valor, 0);
  
  // Formatar dados para Recharts
  const dadosFormatados = dados.map(item => ({
    name: item.label,
    value: item.valor,
    color: item.cor
  }));

  return (
    <div className="bg-white rounded-lg p-6 border border-edp-marine/30">
      <h3 className="text-lg font-semibold text-edp-marine mb-6">{titulo}</h3>
      
      {/* Gráfico */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: '320px', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosFormatados}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={140}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={3}
                stroke="#fff"
              >
                {dadosFormatados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Texto central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-edp-marine">{total}</div>
            <div className="text-sm text-edp-slate mt-1">Total</div>
          </div>
        </div>

        {/* Legenda compacta embaixo */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6">
          {dadosFormatados.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-edp-slate">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraficoPizza;
