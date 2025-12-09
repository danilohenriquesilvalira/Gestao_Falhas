/**
 * Componente: Gráfico de Área Empilhada
 * 
 * Mostra evolução empilhada por setor
 */

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DadoAreaEmpilhada {
  setor: string;
  falhas: number;
  eventos: number;
  total: number;
}

interface GraficoAreaEmpilhadaProps {
  dados: DadoAreaEmpilhada[];
  titulo?: string;
}

export const GraficoAreaEmpilhada: React.FC<GraficoAreaEmpilhadaProps> = ({ dados, titulo }) => {
  return (
    <div className="bg-white rounded-lg border border-edp-marine/30 p-6">
      {titulo && (
        <h3 className="text-lg font-semibold text-edp-slate mb-4">{titulo}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={dados}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="setor" 
            stroke="#64748B"
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis stroke="#64748B" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area type="monotone" dataKey="falhas" stackId="1" stroke="#E32C2C" fill="#E32C2C" name="Falhas" />
          <Area type="monotone" dataKey="eventos" stackId="1" stroke="#28FF52" fill="#28FF52" name="Eventos" />
          <Area type="monotone" dataKey="total" stackId="1" stroke="#263CC8" fill="#263CC8" name="Total" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
