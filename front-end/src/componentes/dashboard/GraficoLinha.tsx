/**
 * Componente: GraficoLinha
 * 
 * Gráfico de linha usando Recharts
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DadosLinha {
  nome: string;
  valor: number;
}

interface PropsGraficoLinha {
  titulo: string;
  dados: DadosLinha[];
  cor?: string;
  comArea?: boolean;
}

export const GraficoLinha: React.FC<PropsGraficoLinha> = ({ titulo, dados, cor = '#E32C2C', comArea = true }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-edp-marine/30">
      <h3 className="text-lg font-semibold text-edp-marine mb-6">{titulo}</h3>
      
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {comArea ? (
            <AreaChart
              data={dados}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorFalhas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={cor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="nome" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                stroke="#94a3b8"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                stroke="#94a3b8"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke={cor}
                strokeWidth={2}
                fill="url(#colorFalhas)"
                dot={{ fill: cor, r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={dados}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="nome" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                stroke="#94a3b8"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                stroke="#94a3b8"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke={cor}
                strokeWidth={2}
                dot={{ fill: cor, r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoLinha;
