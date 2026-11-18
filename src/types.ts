export interface Employee {
  id: string;
  nombre: string;
  puesto: string;
  departamento: 'Tecnología' | 'Ventas' | 'Operaciones' | 'Marketing' | 'RR.HH.' | string;
  salarioAnual: number; // Salario base anual en USD
  salarioRelativo: number; // Comparación respecto al mercado: ej. 0.85 = -15% bajo mercado, 1.0 = mercado, 1.2 = +20%
  horasExtra: number; // Horas extra promedio semanales (0 a 25)
  satisfaccion: number; // 1 a 10
  mesesEnPuesto: number; // Meses en la misma posición sin ascenso
  desempeno: number; // 1 a 10
  modalidad: 'Remoto' | 'Híbrido' | 'Presencial';
  antiguedadMeses: number;
}

export interface PredictionResult {
  riesgoRotacion: number; // 0 - 100%
  nivelRiesgo: 'Bajo' | 'Medio' | 'Alto';
  costoReemplazo: number; // $
  perdidaHorasProductividad: number; // Horas
  impactoFinancieroTotal: number; // $ (costo reemplazo + valor horas perdidas)
  diasCurvaAprendizaje: number; // Días de rampa estimada
  factoresDesglose: {
    factorInsatisfaccion: number; // contribución en %
    factorBurnout: number;
    factorSalario: number;
    factorEstancamiento: number;
    factorModalidad: number;
  };
  alertas: string[];
  recomendaciones: string[];
}

export interface EmployeeWithPrediction extends Employee {
  prediction: PredictionResult;
}

export interface SimulationParams {
  ajusteSalarialPct: number; // -10 a +30 %
  reduccionHorasExtraPct: number; // 0 a 80 %
  inversionCapacitacionPorEmpleado: number; // $0 a $3000
  modalidadGeneral: 'Todas' | 'Remoto' | 'Híbrido' | 'Presencial';
}

export interface DepartmentMetrics {
  departamento: string;
  totalEmpleados: number;
  riesgoPromedio: number;
  empleadosCriticos: number;
  costoProyectado: number;
}
