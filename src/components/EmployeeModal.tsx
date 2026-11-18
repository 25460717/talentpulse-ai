import React from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Briefcase, 
  ShieldAlert, 
  HeartHandshake, 
  Award,
  Zap
} from 'lucide-react';
import { EmployeeWithPrediction } from '../types';

interface EmployeeModalProps {
  employee: EmployeeWithPrediction | null;
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose }) => {
  if (!employee) return null;

  const { prediction } = employee;
  const isHighRisk = prediction.nivelRiesgo === 'Alto';
  const isMediumRisk = prediction.nivelRiesgo === 'Medio';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
              isHighRisk ? 'bg-rose-100 text-rose-700' : isMediumRisk ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {employee.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{employee.nombre}</h3>
              <p className="text-xs text-slate-500">{employee.puesto} • {employee.departamento}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tarjeta de Riesgo Principal */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isHighRisk 
              ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
              : isMediumRisk 
              ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                isHighRisk ? 'bg-rose-100 text-rose-600' : isMediumRisk ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Probabilidad de Salida Estimada
                </span>
                <div className="text-3xl font-black flex items-baseline gap-2">
                  {prediction.riesgoRotacion}%
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60">
                    Nivel {prediction.nivelRiesgo}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 w-full sm:w-auto">
              <div className="text-xs opacity-75">Impacto Financiero de Fuga</div>
              <div className="text-2xl font-black text-slate-900">
                ${prediction.impactoFinancieroTotal.toLocaleString()} USD
              </div>
              <div className="text-[11px] opacity-75">
                Costo reemplazo + curva de {prediction.diasCurvaAprendizaje} días
              </div>
            </div>
          </div>

          {/* Factores Clave del Perfil */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Evaluación Desempeño</span>
              <span className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-indigo-500" />
                {employee.desempeno}/10
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Satisfacción Clima</span>
              <span className={`text-base font-bold flex items-center gap-1.5 mt-0.5 ${
                employee.satisfaccion <= 4 ? 'text-rose-600' : 'text-slate-800'
              }`}>
                <Zap className="w-4 h-4 text-amber-500" />
                {employee.satisfaccion}/10
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Horas Extra Semanales</span>
              <span className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-rose-500" />
                {employee.horasExtra} hrs
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Meses en el Puesto</span>
              <span className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-4 h-4 text-blue-500" />
                {employee.mesesEnPuesto} meses
              </span>
            </div>
          </div>

          {/* Desglose de Contribución al Riesgo */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Desglose Ponderado de Factores de Riesgo
            </h4>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Insatisfacción Laboral</span>
                  <span className="font-semibold text-slate-800">{prediction.factoresDesglose.factorInsatisfaccion}% peso</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(prediction.factoresDesglose.factorInsatisfaccion / 35) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Sobrecarga / Horas Extra (Burnout)</span>
                  <span className="font-semibold text-slate-800">{prediction.factoresDesglose.factorBurnout}% peso</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(prediction.factoresDesglose.factorBurnout / 25) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Competitividad Salarial (vs Mercado)</span>
                  <span className="font-semibold text-slate-800">{prediction.factoresDesglose.factorSalario}% peso</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(prediction.factoresDesglose.factorSalario / 25) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Estancamiento en el Puesto (&gt;18 meses)</span>
                  <span className="font-semibold text-slate-800">{prediction.factoresDesglose.factorEstancamiento}% peso</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(prediction.factoresDesglose.factorEstancamiento / 15) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Alertas Detectadas */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas del Algoritmo
            </h4>
            <div className="space-y-2">
              {prediction.alertas.map((alerta, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 font-medium">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{alerta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones Accionables */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              Plan de Retención Recomendado por TalentPulse AI
            </h4>
            <div className="space-y-2">
              {prediction.recomendaciones.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Cerrar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};
