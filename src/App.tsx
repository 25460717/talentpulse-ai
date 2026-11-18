import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Layers, 
  BarChart3, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit,
  Sliders,
  LineChart as LineChartIcon
} from 'lucide-react';
import { SAMPLE_EMPLOYEES } from './sampleData';
import { calculateEmployeePrediction } from './engine';
import { Employee, EmployeeWithPrediction, SimulationParams } from './types';
import { ExecutiveKPIs } from './components/ExecutiveKPIs';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { Simulator } from './components/Simulator';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeModal } from './components/EmployeeModal';
import { DataUpload } from './components/DataUpload';
import { RegressionView } from './components/RegressionView';

export function App() {
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithPrediction | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'regresion'>('dashboard');

  // Parámetros de Simulación What-If
  const defaultSimulationParams: SimulationParams = {
    ajusteSalarialPct: 0,
    reduccionHorasExtraPct: 0,
    inversionCapacitacionPorEmpleado: 0,
    modalidadGeneral: 'Todas'
  };

  const [simulationParams, setSimulationParams] = useState<SimulationParams>(defaultSimulationParams);

  // Determinar si hay una simulación activa distinta a la base
  const isSimulating = useMemo(() => {
    return (
      simulationParams.ajusteSalarialPct !== 0 ||
      simulationParams.reduccionHorasExtraPct !== 0 ||
      simulationParams.inversionCapacitacionPorEmpleado !== 0 ||
      simulationParams.modalidadGeneral !== 'Todas'
    );
  }, [simulationParams]);

  // Cálculo de predicción baseline
  const baselineEmployeesWithPrediction = useMemo<EmployeeWithPrediction[]>(() => {
    return employees.map(emp => ({
      ...emp,
      prediction: calculateEmployeePrediction(emp)
    }));
  }, [employees]);

  // Cálculo de predicción simulada
  const simulatedEmployeesWithPrediction = useMemo<EmployeeWithPrediction[]>(() => {
    return employees.map(emp => ({
      ...emp,
      prediction: calculateEmployeePrediction(emp, simulationParams)
    }));
  }, [employees, simulationParams]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  TalentPulse <span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Enterprise RR.HH.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                People Analytics & Econometric Modeling
              </p>
            </div>
          </div>

          {/* Selector de Pestañas / Módulos */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard Ejecutivo
            </button>
            <button
              onClick={() => setActiveTab('regresion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'regresion'
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
              Actividad Regresión Múltiple (OLS)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner de Bienvenida y Propósito */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === 'dashboard' ? 'Panel de Inteligencia Predictiva de Talento' : 'Diagnóstico Econométrico: Regresión Múltiple OLS'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            {activeTab === 'dashboard'
              ? 'Monitorea el riesgo de fuga involuntaria, anticipa cuellos de botella en la productividad del equipo y evalúa escenarios estratégicos ("What-If") antes de tomar decisiones de compensación.'
              : 'Implementación completa del ajuste con statsmodels.api.OLS agregando intercepto (sm.add_constant), lectura estadística de coeficientes, valores p (<0.05), R² y R² ajustado, junto a validación gráfica de residuos y gráfico Q-Q.'}
          </p>
        </div>

        {/* 1. Módulo de Carga de Datos y Template (Común a ambos) */}
        <DataUpload
          totalLoaded={employees.length}
          onLoadSample={() => setEmployees(SAMPLE_EMPLOYEES)}
          onDataLoaded={(newEmps) => setEmployees(newEmps)}
        />

        {activeTab === 'dashboard' ? (
          <>
            {/* 2. Módulo Dashboard Ejecutivo - KPIs Clave */}
            <ExecutiveKPIs
              employees={baselineEmployeesWithPrediction}
              simulatedEmployees={simulatedEmployeesWithPrediction}
              isSimulating={isSimulating}
            />

            {/* 3. Módulo Motor de Simulación What-If */}
            <Simulator
              params={simulationParams}
              onChange={setSimulationParams}
              onReset={() => setSimulationParams(defaultSimulationParams)}
              baselineEmployees={baselineEmployeesWithPrediction}
              simulatedEmployees={simulatedEmployeesWithPrediction}
            />

            {/* 4. Módulo Gráficas Analíticas e Interactivas */}
            <AnalyticsCharts
              employees={baselineEmployeesWithPrediction}
              simulatedEmployees={simulatedEmployeesWithPrediction}
              isSimulating={isSimulating}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            />

            {/* 5. Directorio de Empleados y Diagnóstico Individual */}
            <EmployeeTable
              employees={isSimulating ? simulatedEmployeesWithPrediction : baselineEmployeesWithPrediction}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            />
          </>
        ) : (
          /* Módulo de Actividad en Clase: Regresión Múltiple OLS */
          <RegressionView employees={employees} />
        )}
      </main>

      {/* Modal Lateral / Centrado de Diagnóstico Individual */}
      <EmployeeModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* Footer Corporativo */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TalentPulse AI © 2026 • People Analytics & Econometric Modeling</span>
          <span className="text-slate-400">Implementado con statsmodels OLS, Pandas, Seaborn & React</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
