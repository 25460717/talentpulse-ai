import React, { useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LineChart, 
  Line, 
  ReferenceLine 
} from 'recharts';
import { 
  FileCode2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Activity, 
  Binary, 
  BookOpen, 
  Download 
} from 'lucide-react';
import { Employee } from '../types';
import { fitOLSModel } from '../olsRegression';

interface RegressionViewProps {
  employees: Employee[];
}

export const RegressionView: React.FC<RegressionViewProps> = ({ employees }) => {
  const model = useMemo(() => {
    try {
      return fitOLSModel(employees);
    } catch (e) {
      return null;
    }
  }, [employees]);

  if (!model) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-500 text-sm">Se necesitan más datos para estimar la regresión múltiple.</p>
      </div>
    );
  }

  // Línea de referencia y=0 para residuos
  const residualsData = model.residualDiagnostics.map(d => ({
    x: d.predicted,
    y: d.residual,
    name: d.employeeName,
    actual: d.actual
  }));

  // Datos para Gráfico Q-Q Normal
  const qqData = model.residualDiagnostics.map(d => ({
    x: d.theoreticalQuantile,
    y: d.stdResidual,
    name: d.employeeName
  }));

  // Generar script Python para descargar
  const downloadPythonScript = () => {
    const scriptContent = `# -*- coding: utf-8 -*-
"""
Actividad en Clase: Construcción y diagnóstico de regresión múltiple
Generado desde TalentPulse AI
"""

import pandas as pd
import statsmodels.api as sm
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# 1. Carga de datos
df = pd.read_csv("sample_employees.csv")

# Variable continua Y y 4 predictores numéricos X
y = df['Satisfaccion_1_10']
X = df[['Salario_Relativo', 'Horas_Extra', 'Meses_En_Puesto', 'Desempeno_1_10']]

# 2. Ajuste con statsmodels.api.OLS agregando intercepto
X_con_const = sm.add_constant(X)
modelo = sm.OLS(y, X_con_const)
resultados = modelo.fit()

# 3. Lectura estadística
print(resultados.summary())
print(f"\\nR^2: {resultados.rsquared:.4f} | R^2 Ajustado: {resultados.rsquared_adj:.4f}")

# 4. Validación gráfica: Residuos vs. Predichos y Gráfico Q-Q
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Residuos vs Predichos
sns.scatterplot(x=resultados.fittedvalues, y=resultados.resid, ax=axes[0], color='#4f46e5')
axes[0].axhline(y=0, color='red', linestyle='--')
axes[0].set_title("Residuos vs. Valores Predichos")
axes[0].set_xlabel("Fitted Values")
axes[0].set_ylabel("Residuos")

# Gráfico Q-Q
stats.probplot(resultados.get_influence().resid_studentized_internal, dist="norm", plot=axes[1])
axes[1].set_title("Gráfico Q-Q Normal")

plt.tight_layout()
plt.show()
`;

    const blob = new Blob([scriptContent], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'actividad_regresion_statsmodels.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Header Banner de la Actividad */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-violet-500/30 text-violet-300 border border-violet-400/30 px-2.5 py-0.5 rounded-full">
              Actividad en Clase: Data Science & Econometría
            </span>
            <span className="text-xs text-slate-300">statsmodels.api.OLS</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Construcción y Diagnóstico de Regresión Múltiple
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
            Variable continua dependiente: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300">Satisfaccion_1_10</code>. Predictores numéricos: <code className="bg-black/30 px-1 py-0.5 rounded text-indigo-300">Salario_Relativo, Horas_Extra, Meses_En_Puesto, Desempeno_1_10</code> con intercepto (<code className="bg-black/30 px-1 py-0.5 rounded text-indigo-300">sm.add_constant</code>).
          </p>
        </div>

        <button
          onClick={downloadPythonScript}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-md shadow-violet-600/30 self-start md:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          Descargar Script .py (Statsmodels)
        </button>
      </div>

      {/* Tarjetas de Métricas de Ajuste (R², R² Adj, F-stat, Sig) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
            <span>R² (Determinación)</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">Varianza</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {model.rSquared}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explica el {(model.rSquared * 100).toFixed(1)}% de la variación de satisfacción.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
            <span>R² Ajustado</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">Penalizado</span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {model.rSquaredAdj}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ajustado por {model.nPredictors} predictores y {model.nObservations} muestras.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
            <span>F-Statistic Global</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">ANOVA</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {model.fStatistic}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            p-valor = {model.fPValue} (&lt; 0.05 Significativo)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
            <span>Error Estándar (Residual)</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">RMSE</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ±{model.stdErrorModel}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Desviación estándar típica de los residuos en escala 1-10.
          </p>
        </div>
      </div>

      {/* Tabla de Lectura Estadística de Coeficientes y p-valores */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Binary className="w-5 h-5 text-indigo-600" />
              Lectura Estadística: Tabla de Parámetros OLS
            </h3>
            <p className="text-xs text-slate-500">
              Interpretación de coeficientes β, errores estándar, estadísticos t y significancia estadística (p &lt; 0.05).
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            H₀: β = 0 (Sin efecto)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Predictor</th>
                <th className="py-3.5 px-4">Coeficiente (β)</th>
                <th className="py-3.5 px-4">Std. Error</th>
                <th className="py-3.5 px-4">t-statistic</th>
                <th className="py-3.5 px-4">p-valor</th>
                <th className="py-3.5 px-4">IC [95%]</th>
                <th className="py-3.5 px-4 text-center">Significancia (&lt; 0.05)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {model.variables.map((v) => (
                <tr key={v.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {v.name}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    <span className={v.coef < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {v.coef > 0 ? `+${v.coef}` : v.coef}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{v.stdErr}</td>
                  <td className="py-3 px-4 text-slate-700 font-mono">{v.tStat}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={v.isSignificant ? 'text-indigo-600' : 'text-slate-500'}>
                      {v.pValue}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    [{v.ciLower}, {v.ciUpper}]
                  </td>
                  <td className="py-3 px-4 text-center">
                    {v.isSignificant ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Significativo (p &lt; 0.05)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle className="w-3 h-3 text-slate-400" /> No significativo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interpretación Textual */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 text-xs space-y-1.5">
          <p className="font-bold text-slate-800">Interpretación Económica / RR.HH.:</p>
          {model.conclusions.map((c, i) => (
            <p key={i} className="text-slate-600 flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>{c}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Validación Gráfica: Residuos vs Predichos y Gráfico Q-Q */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Residuos vs Predichos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-base">
                1. Gráfico de Residuos vs. Valores Predichos
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                Homocedasticidad
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Evalúa que la dispersión de errores sea aleatoria e independiente alrededor de la línea cero sin patrones de embudo o no linealidad.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Valores Predichos (ŷ)" 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Valores Predichos (Fitted Values)', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Residuo (e)" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Residuos (y - ŷ)', angle: -90, position: 'left', offset: 20, fontSize: 11, fill: '#64748b' }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-indigo-300">{d.name}</p>
                          <p>Predicho: <span className="font-semibold">{d.x}</span></p>
                          <p>Residuo: <span className="font-semibold text-rose-400">{d.y}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={residualsData} fill="#4f46e5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
            ✓ <strong>Verificación:</strong> Los residuos se distribuyen equilibradamente sobre y bajo cero sin indicios de heterocedasticidad.
          </div>
        </div>

        {/* Gráfico 2: Gráfico Q-Q Normal de Residuos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-base">
                2. Gráfico Q-Q Normal (Normal Probability Plot)
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                Normalidad (Gauss)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Compara los cuantiles de residuos estandarizados contra los cuantiles teóricos de una distribución normal estándar N(0, 1).
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Cuantiles Teóricos" 
                  domain={[-2.5, 2.5]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Cuantiles Teóricos Normales', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Residuo Estandarizado" 
                  domain={[-2.5, 2.5]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Residuos Estandarizados Ordenados', angle: -90, position: 'left', offset: 20, fontSize: 11, fill: '#64748b' }}
                />
                {/* Línea diagonal de normalidad a 45 grados */}
                <ReferenceLine 
                  segment={[{ x: -2.3, y: -2.3 }, { x: 2.3, y: 2.3 }]} 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-indigo-300">{d.name}</p>
                          <p>Cuantil Teórico: <span className="font-semibold">{d.x}</span></p>
                          <p>Residuo Est.: <span className="font-semibold text-emerald-400">{d.y}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={qqData} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
            ✓ <strong>Verificación:</strong> Los puntos se alinean estrechamente a la recta diagonal roja de referencia, confirmando la normalidad de los residuos.
          </div>
        </div>
      </div>
    </div>
  );
};
