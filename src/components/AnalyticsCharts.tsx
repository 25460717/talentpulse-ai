import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { EmployeeWithPrediction } from '../types';
import { Info, Sparkles } from 'lucide-react';

interface AnalyticsChartsProps {
  employees: EmployeeWithPrediction[];
  simulatedEmployees: EmployeeWithPrediction[];
  isSimulating: boolean;
  onSelectEmployee: (emp: EmployeeWithPrediction) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  employees,
  simulatedEmployees,
  isSimulating,
  onSelectEmployee
}) => {
  const currentList = isSimulating ? simulatedEmployees : employees;

  // 1. Datos para Scatter: Riesgo Rotación (X) vs. Nivel de Desempeño (Y)
  const scatterData = currentList.map(emp => ({
    name: emp.nombre,
    puesto: emp.puesto,
    departamento: emp.departamento,
    x: emp.prediction.riesgoRotacion, // 0 - 100%
    y: emp.desempeno, // 1 - 10
    costo: emp.prediction.impactoFinancieroTotal,
    color: emp.prediction.riesgoRotacion >= 65 
      ? '#ef4444' 
      : emp.prediction.riesgoRotacion >= 35 
      ? '#f59e0b' 
      : '#10b981',
    raw: emp
  }));

  // 2. Proyección de Rotación acumulada y Pérdida de Productividad a 12 meses
  const avgRiskCurrent = employees.reduce((a, b) => a + b.prediction.riesgoRotacion, 0) / (employees.length || 1);
  const avgRiskSim = currentList.reduce((a, b) => a + b.prediction.riesgoRotacion, 0) / (currentList.length || 1);

  const months = ['Mes 0', 'Mes 2', 'Mes 4', 'Mes 6', 'Mes 8', 'Mes 10', 'Mes 12'];
  const projectionData = months.map((m, idx) => {
    const fraction = idx / 6;
    // Tasa acumulada estimada
    const rotacionActual = Math.round(avgRiskCurrent * fraction * 0.85);
    const rotacionIntervencion = Math.round(avgRiskSim * fraction * 0.65);
    // Productividad remanente (% sobre base 100)
    const prodActual = Math.max(65, Math.round(100 - (rotacionActual * 0.6)));
    const prodIntervencion = Math.max(75, Math.round(100 - (rotacionIntervencion * 0.4)));

    return {
      mes: m,
      rotacionActual,
      rotacionIntervencion,
      prodActual,
      prodIntervencion
    };
  });

  // 3. Factores Principales de Deserción Agregados
  const factorsTotal = currentList.reduce(
    (acc, emp) => {
      acc.insatisfaccion += emp.prediction.factoresDesglose.factorInsatisfaccion;
      acc.burnout += emp.prediction.factoresDesglose.factorBurnout;
      acc.salario += emp.prediction.factoresDesglose.factorSalario;
      acc.estancamiento += emp.prediction.factoresDesglose.factorEstancamiento;
      return acc;
    },
    { insatisfaccion: 0, burnout: 0, salario: 0, estancamiento: 0 }
  );

  const n = currentList.length || 1;
  const factorsData = [
    { factor: 'Burnout / Sobrecarga', peso: Math.round(factorsTotal.burnout / n), color: '#ef4444' },
    { factor: 'Desfase Salarial vs Mercado', peso: Math.round(factorsTotal.salario / n), color: '#f97316' },
    { factor: 'Baja Satisfacción / Clima', peso: Math.round(factorsTotal.insatisfaccion / n), color: '#8b5cf6' },
    { factor: 'Estancamiento en Puesto', peso: Math.round(factorsTotal.estancamiento / n), color: '#3b82f6' }
  ].sort((a, b) => b.peso - a.peso);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico 1: Cuadrante Riesgo vs Productividad/Desempeño */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Matriz de Riesgo vs. Desempeño
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Clic para diagnosticar
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Identifica el <strong>Talento Clave en Peligro</strong> (Cuadrante superior derecho: alto desempeño &gt; 7 y alto riesgo &gt; 50%).
          </p>
        </div>

        <div className="h-72 w-full relative">
          {/* Guías de cuadrantes en el fondo */}
          <div className="absolute inset-x-12 top-4 bottom-10 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-20 border border-slate-300">
            <div className="bg-amber-100/40 p-2 text-[10px] font-bold text-amber-800">Retención Normal</div>
            <div className="bg-rose-100/50 p-2 text-[10px] font-bold text-rose-800 text-right">⚠️ TALENTO CLAVE EN RIESGO</div>
            <div className="bg-emerald-100/40 p-2 text-[10px] font-bold text-emerald-800 flex items-end">Bajo Riesgo / Estable</div>
            <div className="bg-amber-100/30 p-2 text-[10px] font-bold text-amber-700 flex items-end justify-end">Riesgo Alto (Desempeño Medio)</div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Riesgo de Rotación" 
                unit="%" 
                domain={[0, 100]} 
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Riesgo de Rotación (%)', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748b' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Desempeño" 
                domain={[1, 10]} 
                ticks={[2, 4, 6, 8, 10]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Evaluación de Desempeño', angle: -90, position: 'left', offset: 20, fontSize: 11, fill: '#64748b' }}
              />
              <ZAxis range={[70, 70]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-sm text-indigo-200">{data.name}</p>
                        <p className="text-slate-300">{data.puesto} ({data.departamento})</p>
                        <div className="pt-2 border-t border-slate-700 space-y-0.5">
                          <p>Riesgo Rotación: <span className="font-semibold text-rose-400">{data.x}%</span></p>
                          <p>Desempeño: <span className="font-semibold text-emerald-400">{data.y} / 10</span></p>
                          <p>Impacto Financiero: <span className="font-semibold">${(data.costo).toLocaleString()}</span></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                data={scatterData} 
                onClick={(e: any) => e?.raw && onSelectEmployee(e.raw)}
                cursor="pointer"
              >
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Proyección de Rotación y Productividad a 6 y 12 meses */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-base">
              Proyección Temporal (Escenario Actual vs. Intervención)
            </h3>
            {isSimulating && (
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Simulación Activa
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Comparativa proyectada de fuga acumulada y retención de productividad a 6 y 12 meses.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="rotacionActual" 
                name="Fuga Proyectada (Sin Acción)" 
                stroke="#ef4444" 
                strokeWidth={2.5} 
                strokeDasharray="4 4"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="rotacionIntervencion" 
                name="Fuga con Plan de Retención" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="prodIntervencion" 
                name="Nivel de Productividad (%)" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 3: Factores Principales de Deserción */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 text-base">
            Factores Principales Impulsores de Deserción
          </h3>
          <span className="text-xs text-slate-500">Ponderación del modelo de scoring de RR.HH.</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Causas raíz con mayor incidencia en el riesgo de fuga calculado para el equipo seleccionado.
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={factorsData} margin={{ top: 5, right: 30, bottom: 5, left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 35]} unit=" pts" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis type="category" dataKey="factor" tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val} pts de contribución al riesgo`, 'Impacto']}
              />
              <Bar dataKey="peso" radius={[0, 6, 6, 0]} barSize={22}>
                {factorsData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
