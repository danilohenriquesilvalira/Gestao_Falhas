/**
 * Componente: GraficoBarra
 * 
 * Gráfico de barras comparativas usando Recharts
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DadosBarra {
  nome: string;
  falhas: number;
  eventos: number;
}

interface PropsGraficoBarra {
  titulo: string;
  dados: DadosBarra[];
}

export const GraficoBarra: React.FC<PropsGraficoBarra> = ({ titulo, dados }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-edp-marine/30">
      <h3 className="text-lg font-semibold text-edp-marine mb-6">{titulo}</h3>
      
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dados}
            margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="nome" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#94a3b8"
              angle={-15}
              textAnchor="end"
              height={70}
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
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="falhas" 
              fill="#E32C2C" 
              name="Falhas"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="eventos" 
              fill="#28FF52" 
              name="Eventos"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoBarra;
