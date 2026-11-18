import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Download,
  Users
} from 'lucide-react';
import { EmployeeWithPrediction } from '../types';

interface EmployeeTableProps {
  employees: EmployeeWithPrediction[];
  onSelectEmployee: (emp: EmployeeWithPrediction) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onSelectEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [riskFilter, setRiskFilter] = useState('Todos');
  const [sortField, setSortField] = useState<'riesgo' | 'desempeno' | 'salario' | 'nombre'>('riesgo');
  const [sortAsc, setSortAsc] = useState(false);

  // Departamentos únicos
  const departments = useMemo(() => {
    const deps = new Set(employees.map(e => e.departamento));
    return ['Todos', ...Array.from(deps)];
  }, [employees]);

  // Filtrado y Ordenación
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(emp => {
        const matchesSearch = 
          emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.departamento.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = departmentFilter === 'Todos' || emp.departamento === departmentFilter;
        const matchesRisk = riskFilter === 'Todos' || emp.prediction.nivelRiesgo === riskFilter;

        return matchesSearch && matchesDept && matchesRisk;
      })
      .sort((a, b) => {
        let valA: any = a.prediction.riesgoRotacion;
        let valB: any = b.prediction.riesgoRotacion;

        if (sortField === 'desempeno') {
          valA = a.desempeno;
          valB = b.desempeno;
        } else if (sortField === 'salario') {
          valA = a.salarioAnual;
          valB = b.salarioAnual;
        } else if (sortField === 'nombre') {
          valA = a.nombre;
          valB = b.nombre;
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortAsc ? valA - valB : valB - valA;
      });
  }, [employees, searchTerm, departmentFilter, riskFilter, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
      {/* Controles de búsqueda y filtros */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Directorio de Talento y Diagnóstico Individual
          </h3>
          <p className="text-xs text-slate-500">
            Haz clic sobre cualquier empleado para abrir el diagnóstico en profundidad, desglose de riesgos y plan de retención.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Búsqueda */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o puesto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filtro Departamento */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>Dept: {dept}</option>
            ))}
          </select>

          {/* Filtro Nivel de Riesgo */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="Todos">Riesgo: Todos</option>
            <option value="Alto">Alto (Crítico)</option>
            <option value="Medio">Medio (Precaución)</option>
            <option value="Bajo">Bajo (Estable)</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('nombre')}>
                <div className="flex items-center gap-1.5">
                  Colaborador
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Departamento & Modalidad</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('desempeno')}>
                <div className="flex items-center gap-1.5">
                  Desempeño
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Satisfacción / Horas Extra</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('riesgo')}>
                <div className="flex items-center gap-1.5">
                  Riesgo Rotación
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Impacto Financiero de Fuga</th>
              <th className="py-3.5 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  No se encontraron empleados con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const isHighRisk = emp.prediction.nivelRiesgo === 'Alto';
                const isMediumRisk = emp.prediction.nivelRiesgo === 'Medio';

                return (
                  <tr 
                    key={emp.id} 
                    onClick={() => onSelectEmployee(emp)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Colaborador */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isHighRisk ? 'bg-rose-100 text-rose-700' : isMediumRisk ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {emp.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {emp.nombre}
                          </p>
                          <p className="text-[11px] text-slate-500">{emp.puesto}</p>
                        </div>
                      </div>
                    </td>

                    {/* Departamento & Modalidad */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{emp.departamento}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {emp.modalidad}
                      </div>
                    </td>

                    {/* Desempeño */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{emp.desempeno}/10</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${emp.desempeno >= 8 ? 'bg-emerald-500' : emp.desempeno >= 6 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            style={{ width: `${emp.desempeno * 10}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Satisfacción & Horas Extra */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-700">Satisfacción: <strong className={emp.satisfaccion <= 4 ? 'text-rose-600' : 'text-slate-900'}>{emp.satisfaccion}/10</strong></div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {emp.horasExtra}h extra/sem
                        </div>
                      </div>
                    </td>

                    {/* Riesgo de Rotación (Semáforo) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          isHighRisk 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : isMediumRisk 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          {emp.prediction.riesgoRotacion}% ({emp.prediction.nivelRiesgo})
                        </span>
                      </div>
                    </td>

                    {/* Costo de Impacto Financiero */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        ${emp.prediction.impactoFinancieroTotal.toLocaleString()} USD
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Curva: ~{emp.prediction.diasCurvaAprendizaje} días
                      </div>
                    </td>

                    {/* Botón Ver Diagnóstico */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmployee(emp);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors border border-slate-200/80"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Diagnosticar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>Mostrando <strong>{filteredEmployees.length}</strong> de <strong>{employees.length}</strong> talentos</span>
        <span className="text-[11px] text-slate-400">Datos recalculados con el motor de scoring en tiempo real</span>
      </div>
    </div>
  );
};
