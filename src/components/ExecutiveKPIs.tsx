import React from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { EmployeeWithPrediction } from '../types';

interface ExecutiveKPIsProps {
  employees: EmployeeWithPrediction[];
  simulatedEmployees: EmployeeWithPrediction[];
  isSimulating: boolean;
}

export const ExecutiveKPIs: React.FC<ExecutiveKPIsProps> = ({
  employees,
  simulatedEmployees,
  isSimulating
}) => {
  const currentList = isSimulating ? simulatedEmployees : employees;

  // Cálculos actuales / simulados
  const totalEmployees = currentList.length;
  const avgRisk = Math.round(
    currentList.reduce((acc, curr) => acc + curr.prediction.riesgoRotacion, 0) / (totalEmployees || 1)
  );

  const baselineRisk = Math.round(
    employees.reduce((acc, curr) => acc + curr.prediction.riesgoRotacion, 0) / (employees.length || 1)
  );

  const criticalEmployees = currentList.filter(e => e.prediction.nivelRiesgo === 'Alto');
  const baselineCritical = employees.filter(e => e.prediction.nivelRiesgo === 'Alto');

  // Pérdida total proyectada
  const totalFinancialLoss = currentList.reduce(
    (acc, curr) => acc + (curr.prediction.impactoFinancieroTotal * (curr.prediction.riesgoRotacion / 100)),
    0
  );
  const baselineFinancialLoss = employees.reduce(
    (acc, curr) => acc + (curr.prediction.impactoFinancieroTotal * (curr.prediction.riesgoRotacion / 100)),
    0
  );

  // Horas perdidas esperadas
  const totalHoursLoss = Math.round(
    currentList.reduce(
      (acc, curr) => acc + (curr.prediction.perdidaHorasProductividad * (curr.prediction.riesgoRotacion / 100)),
      0
    )
  );

  const savingsFinancial = Math.max(0, baselineFinancialLoss - totalFinancialLoss);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Tasa de Rotación Proyectada */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tasa Rotación Proyectada
          </span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{avgRisk}%</span>
          {isSimulating && avgRisk < baselineRisk && (
            <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              -{(baselineRisk - avgRisk)}%
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {avgRisk > 45 ? '⚠️ Nivel de riesgo corporativo elevado' : 'Rango saludable de rotación'}
        </p>
      </div>

      {/* KPI 2: Pérdida Financiera Esperada */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Impacto Financiero Proyectado
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            ${(totalFinancialLoss / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k
          </span>
          {isSimulating && savingsFinancial > 0 && (
            <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Ahorro: ${(savingsFinancial / 1000).toFixed(0)}k
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Costo reemplazos + caída de curva rampa
        </p>
      </div>

      {/* KPI 3: Pérdida en Horas de Productividad */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Productividad en Riesgo
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {totalHoursLoss.toLocaleString()} <span className="text-lg font-medium text-slate-400">hrs</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Equivalente a ~{(totalHoursLoss / 160).toFixed(1)} meses/hombre
        </p>
      </div>

      {/* KPI 4: Empleados en Riesgo Crítico */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Talentos en Riesgo Crítico
          </span>
          <div className="p-2 rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-600">
            {criticalEmployees.length}
          </span>
          <span className="text-sm font-medium text-slate-500">
            de {totalEmployees} colaboradores
          </span>
          {isSimulating && criticalEmployees.length < baselineCritical.length && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              -{baselineCritical.length - criticalEmployees.length} rescatados
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Riesgo individual &gt; 65% con alta probabilidad de salida
        </p>
      </div>
    </div>
  );
};
