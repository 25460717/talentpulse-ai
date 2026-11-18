import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  DollarSign, 
  Clock, 
  GraduationCap, 
  Laptop, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { SimulationParams, EmployeeWithPrediction } from '../types';

interface SimulatorProps {
  params: SimulationParams;
  onChange: (newParams: SimulationParams) => void;
  onReset: () => void;
  baselineEmployees: EmployeeWithPrediction[];
  simulatedEmployees: EmployeeWithPrediction[];
}

export const Simulator: React.FC<SimulatorProps> = ({
  params,
  onChange,
  onReset,
  baselineEmployees,
  simulatedEmployees
}) => {
  // Métricas comparativas
  const baselineAvgRisk = Math.round(
    baselineEmployees.reduce((a, b) => a + b.prediction.riesgoRotacion, 0) / (baselineEmployees.length || 1)
  );
  const simulatedAvgRisk = Math.round(
    simulatedEmployees.reduce((a, b) => a + b.prediction.riesgoRotacion, 0) / (simulatedEmployees.length || 1)
  );

  const baselineLoss = baselineEmployees.reduce(
    (a, b) => a + (b.prediction.impactoFinancieroTotal * (b.prediction.riesgoRotacion / 100)),
    0
  );
  const simulatedLoss = simulatedEmployees.reduce(
    (a, b) => a + (b.prediction.impactoFinancieroTotal * (b.prediction.riesgoRotacion / 100)),
    0
  );

  const totalPayroll = baselineEmployees.reduce((a, b) => a + b.salarioAnual, 0);
  const costOfIntervention = 
    (totalPayroll * (Math.max(0, params.ajusteSalarialPct) / 100)) + 
    (params.inversionCapacitacionPorEmpleado * baselineEmployees.length);

  const grossSavings = Math.max(0, baselineLoss - simulatedLoss);
  const netROI = grossSavings - costOfIntervention;

  const baselineCritical = baselineEmployees.filter(e => e.prediction.nivelRiesgo === 'Alto').length;
  const simulatedCritical = simulatedEmployees.filter(e => e.prediction.nivelRiesgo === 'Alto').length;

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-indigo-800/40 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Motor de Simulación "What-If"
              <span className="text-xs bg-indigo-500/30 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">
                Tiempo Real
              </span>
            </h2>
            <p className="text-xs text-indigo-200/70">
              Modela políticas de compensación, bienestar y flexibilidad para evaluar el impacto en retención y ROI.
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors border border-white/10 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reestablecer Parámetros
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Sliders de Simulación (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Ajuste Salarial */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold flex items-center gap-2 text-slate-200">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Ajuste Salarial Promedio
              </label>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                {params.ajusteSalarialPct > 0 ? `+${params.ajusteSalarialPct}%` : `${params.ajusteSalarialPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="25"
              step="1"
              value={params.ajusteSalarialPct}
              onChange={(e) => onChange({ ...params, ajusteSalarialPct: parseFloat(e.target.value) })}
              className="w-full accent-indigo-400 bg-indigo-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>-5% (Congelamiento)</span>
              <span>Mercado (0%)</span>
              <span>+10% (Competitivo)</span>
              <span>+25% (Agresivo)</span>
            </div>
          </div>

          {/* Slider 2: Reducción de Horas Extra (Burnout) */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold flex items-center gap-2 text-slate-200">
                <Clock className="w-4 h-4 text-rose-400" />
                Alivio de Sobrecarga (Reducción Horas Extra)
              </label>
              <span className="font-mono font-bold text-rose-300 bg-rose-950/60 px-2.5 py-0.5 rounded-lg border border-rose-500/30">
                -{params.reduccionHorasExtraPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="75"
              step="5"
              value={params.reduccionHorasExtraPct}
              onChange={(e) => onChange({ ...params, reduccionHorasExtraPct: parseFloat(e.target.value) })}
              className="w-full accent-indigo-400 bg-indigo-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Sin cambios (0%)</span>
              <span>-25% (Apoyo operativo)</span>
              <span>-50% (Rebalanceo fuerte)</span>
              <span>-75% (Límite estricto)</span>
            </div>
          </div>

          {/* Slider 3: Inversión en Capacitación */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold flex items-center gap-2 text-slate-200">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Inversión en Desarrollo y Carrera (por empleado/año)
              </label>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                ${params.inversionCapacitacionPorEmpleado} USD
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="250"
              value={params.inversionCapacitacionPorEmpleado}
              onChange={(e) => onChange({ ...params, inversionCapacitacionPorEmpleado: parseFloat(e.target.value) })}
              className="w-full accent-indigo-400 bg-indigo-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>$0</span>
              <span>$1,000 (Cursos/LMS)</span>
              <span>$2,000 (Certificaciones)</span>
              <span>$3,000 (Coaching/Executive)</span>
            </div>
          </div>

          {/* Selector 4: Modalidad de Trabajo */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <label className="font-semibold flex items-center gap-2 text-sm text-slate-200">
              <Laptop className="w-4 h-4 text-amber-400" />
              Política General de Flexibilidad / Modalidad
            </label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {(['Todas', 'Remoto', 'Híbrido', 'Presencial'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...params, modalidadGeneral: mode })}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all border ${
                    params.modalidadGeneral === mode
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Impacto y Retorno Estimado (5 cols) */}
        <div className="lg:col-span-5 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Proyección de Impacto y Ahorro
            </h3>

            <div className="space-y-4">
              {/* Rotación reducida */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs text-indigo-200">Tasa de Rotación Esperada</span>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through">{baselineAvgRisk}%</span>
                    <span className="text-xl font-extrabold text-emerald-400">{simulatedAvgRisk}%</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-medium">
                    {simulatedAvgRisk < baselineAvgRisk ? `↓ Reducción de ${(baselineAvgRisk - simulatedAvgRisk)} pts` : 'Sin cambio'}
                  </span>
                </div>
              </div>

              {/* Empleados críticos rescatados */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs text-indigo-200">Talentos en Alto Riesgo</span>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through">{baselineCritical} pers.</span>
                    <span className="text-xl font-extrabold text-white">{simulatedCritical} pers.</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-medium">
                    {baselineCritical > simulatedCritical ? `✓ ${baselineCritical - simulatedCritical} empleados retenidos` : 'Estable'}
                  </span>
                </div>
              </div>

              {/* Ahorro bruto en reemplazos y rampa */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs text-indigo-200">Ahorro Bruto en Rotación</span>
                <span className="text-lg font-bold text-emerald-400">
                  +${Math.round(grossSavings).toLocaleString()} USD
                </span>
              </div>

              {/* Costo de la intervención */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs text-indigo-200">Costo de Implementación</span>
                <span className="text-sm font-semibold text-rose-300">
                  -${Math.round(costOfIntervention).toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* ROI Card */}
          <div className={`mt-6 p-4 rounded-xl border ${
            netROI > 0 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100' 
              : 'bg-amber-950/40 border-amber-500/40 text-amber-100'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {netROI > 0 ? 'Retorno Neto Estimado (ROI)' : 'Inversión en Plan de Retención'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10">
                {costOfIntervention > 0 ? `${Math.round((grossSavings / (costOfIntervention || 1)) * 100)}% ROI` : '100% Orgánico'}
              </span>
            </div>
            <div className="text-2xl font-black">
              ${Math.round(Math.abs(netROI)).toLocaleString()} USD
              <span className="text-xs font-normal opacity-80 ml-1">
                {netROI >= 0 ? 'de beneficio neto para la empresa' : 'de presupuesto requerido'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-1">
              El ahorro en reemplazos cubre sobradamente la inversión en ajustes y planes de carrera.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
