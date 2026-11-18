import { Employee, PredictionResult, SimulationParams } from './types';

/**
 * Motor Predictivo de Rotación e Impacto en Productividad (TalentPulse Engine)
 *
 * Utiliza un modelo de scoring ponderado calibrado en HR Analytics:
 * 1. Riesgo de Rotación (0 - 100%):
 *    - Insatisfacción laboral (ponderación 35%): (10 - satisfaccion) / 9
 *    - Competitividad salarial (ponderación 25%): déficit salarial respecto al mercado (1.0)
 *    - Burnout / Horas extra (ponderación 25%): Horas extra semanales normalizadas
 *    - Estancamiento laboral (ponderación 15%): Meses en puesto sin ascenso (>18 meses alerta)
 *    - Ajustes por simulación ("What-If"): aumentos salariales, alivio de horas extra, plan de carrera y modalidad.
 *
 * 2. Impacto en Productividad:
 *    - Seniority multiplier (desempeño y salario)
 *    - Costo de rotación: 50% a 150% del salario anual según seniority
 *    - Días de curva de aprendizaje: 60 a 90 días ponderado por desempeño y seniority
 *    - Pérdida de horas de productividad durante la curva
 */

export function calculateEmployeePrediction(
  emp: Employee,
  simulation?: SimulationParams
): PredictionResult {
  // Aplicar ajustes de simulación si se proporcionan
  let salarioRelativoEfectivo = emp.salarioRelativo;
  let horasExtraEfectivas = emp.horasExtra;
  let satisfaccionEfectiva = emp.satisfaccion;
  let modalidadEfectiva = emp.modalidad;

  if (simulation) {
    // 1. Ajuste salarial simula mejora de competitividad
    const factorSalarial = 1 + simulation.ajusteSalarialPct / 100;
    salarioRelativoEfectivo = emp.salarioRelativo * factorSalarial;

    // 2. Reducción de horas extra (mitigación de burnout)
    horasExtraEfectivas = Math.max(0, emp.horasExtra * (1 - simulation.reduccionHorasExtraPct / 100));

    // 3. Inversión en capacitación aumenta satisfacción y reduce estancamiento
    const boostSatisfaccionCapacitacion = (simulation.inversionCapacitacionPorEmpleado / 1000) * 0.6;
    satisfaccionEfectiva = Math.min(10, emp.satisfaccion + boostSatisfaccionCapacitacion);

    // 4. Modalidad
    if (simulation.modalidadGeneral !== 'Todas') {
      modalidadEfectiva = simulation.modalidadGeneral as 'Remoto' | 'Híbrido' | 'Presencial';
    }
  }

  // Factor 1: Insatisfacción (Peso 35%)
  // Rango: Si satisfacción es 10 -> 0%, si es 1 -> 100%
  const scoreInsatisfaccion = Math.max(0, Math.min(1, (10 - satisfaccionEfectiva) / 9));

  // Factor 2: Competitividad Salarial (Peso 25%)
  // Si salarioRelativo <= 0.7 (30% bajo mercado) -> score 1.0
  // Si salarioRelativo >= 1.25 (25% sobre mercado) -> score 0.0
  let scoreSalario = 0;
  if (salarioRelativoEfectivo < 1.0) {
    scoreSalario = Math.min(1, (1.0 - salarioRelativoEfectivo) / 0.35);
  } else {
    scoreSalario = Math.max(0, 0.2 - (salarioRelativoEfectivo - 1.0) * 0.8);
  }

  // Factor 3: Burnout por Horas Extra (Peso 25%)
  // 0 hrs = 0%, 5 hrs = 25%, 15+ hrs = 100%
  const scoreBurnout = Math.min(1, horasExtraEfectivas / 15);

  // Factor 4: Estancamiento en puesto (Peso 15%)
  // <12 meses = bajo riesgo, 18-24 meses = moderado, >36 meses = alto riesgo
  const scoreEstancamiento = Math.min(1, Math.max(0, (emp.mesesEnPuesto - 12) / 28));

  // Modificador Modalidad
  let modModalidad = 0;
  if (modalidadEfectiva === 'Presencial') {
    modModalidad = 0.08; // Mayor fricción laboral en perfiles modernos
  } else if (modalidadEfectiva === 'Remoto') {
    modModalidad = -0.05; // Mayor fidelización general
  }

  // Cálculo ponderado
  const rawRisk =
    scoreInsatisfaccion * 0.35 +
    scoreSalario * 0.25 +
    scoreBurnout * 0.25 +
    scoreEstancamiento * 0.15 +
    modModalidad;

  // Normalizar entre 3% (riesgo natural de rotación) y 98%
  const riesgoRotacion = Math.round(Math.max(3, Math.min(98, rawRisk * 100)));

  // Determinación de nivel de riesgo
  let nivelRiesgo: 'Bajo' | 'Medio' | 'Alto' = 'Bajo';
  if (riesgoRotacion >= 65) {
    nivelRiesgo = 'Alto';
  } else if (riesgoRotacion >= 35) {
    nivelRiesgo = 'Medio';
  }

  // Cálculo de Productividad y Costo de Reemplazo
  // Seniority multiplier según salario y desempeño (1 a 10)
  // Perfiles de alto desempeño y salarios altos tienen un costo de reemplazo del 120-150% del salario anual
  const factorDesempeno = emp.desempeno / 10;
  let porcentajeCostoReemplazo = 0.5; // Base 50%
  if (emp.salarioAnual > 80000 || emp.desempeno >= 8) {
    porcentajeCostoReemplazo = 1.25 + (factorDesempeno - 0.8) * 0.5; // hasta ~140%
  } else if (emp.salarioAnual > 50000 || emp.desempeno >= 6) {
    porcentajeCostoReemplazo = 0.85 + (factorDesempeno - 0.6) * 0.4;
  }
  porcentajeCostoReemplazo = Math.min(1.5, Math.max(0.5, porcentajeCostoReemplazo));

  const costoReemplazo = Math.round(emp.salarioAnual * porcentajeCostoReemplazo);

  // Días de curva de aprendizaje (60 a 90 días base, ampliado si el puesto es técnico o de alto desempeño)
  const diasCurvaAprendizaje = Math.round(
    60 + (emp.desempeno / 10) * 20 + (emp.antiguedadMeses > 24 ? 15 : 5)
  );

  // Pérdida en horas de productividad:
  // Se estima que un reemplazo opera a ~40% de efectividad durante los días de curva
  // Horas laborales estándar: 8 hrs/día. Pérdida del 60% de esas horas durante el período
  const perdidaHorasProductividad = Math.round(diasCurvaAprendizaje * 8 * 0.6);

  // Valor financiero de las horas de productividad perdida
  const tasaHoraria = emp.salarioAnual / (52 * 40);
  const costoProductividadPerdida = Math.round(perdidaHorasProductividad * tasaHoraria * 1.15); // Factor multiplicador impacto en equipo

  const impactoFinancieroTotal = costoReemplazo + costoProductividadPerdida;

  // Generación de Alertas Diagnósticas
  const alertas: string[] = [];
  if (horasExtraEfectivas >= 10) {
    alertas.push(`Sobrecarga crítica de trabajo (${horasExtraEfectivas.toFixed(1)} hrs extra/sem). Alto riesgo de burnout.`);
  } else if (horasExtraEfectivas >= 6) {
    alertas.push(`Horas extra elevadas (${horasExtraEfectivas.toFixed(1)} hrs/sem), requiere monitoreo de fatiga.`);
  }

  if (salarioRelativoEfectivo < 0.9) {
    const desfase = Math.round((1 - salarioRelativoEfectivo) * 100);
    alertas.push(`Salario ${desfase}% por debajo de la media de mercado para este rol.`);
  }

  if (emp.mesesEnPuesto >= 24) {
    alertas.push(`Lleva ${emp.mesesEnPuesto} meses en el mismo puesto sin promoción ni movilidad interna.`);
  } else if (emp.mesesEnPuesto >= 18) {
    alertas.push(`Acumula ${emp.mesesEnPuesto} meses sin cambio de categoría salarial o rol.`);
  }

  if (satisfaccionEfectiva <= 4) {
    alertas.push(`Índice de satisfacción laboral muy bajo (${satisfaccionEfectiva.toFixed(1)}/10) en encuestas de clima.`);
  }

  if (emp.desempeno >= 8 && riesgoRotacion >= 50) {
    alertas.push(`⚠️ Talento Clave en Peligro: Desempeño sobresaliente (${emp.desempeno}/10) con alta probabilidad de fuga.`);
  }

  // Generación de Recomendaciones Accionables
  const recomendaciones: string[] = [];
  if (salarioRelativoEfectivo < 0.95) {
    const aumentoSugerido = Math.round((1.05 - salarioRelativoEfectivo) * 100);
    recomendaciones.push(`Nivelación salarial urgente de al menos +${aumentoSugerido}% para neutralizar ofertas de la competencia.`);
  }

  if (horasExtraEfectivas >= 6) {
    recomendaciones.push(`Redistribución de cargas de trabajo o integración de apoyo operativo temporal para limitar horas extra a máx 3 hrs/sem.`);
  }

  if (emp.mesesEnPuesto >= 18) {
    recomendaciones.push(`Diseñar un Plan de Carrera y fijar objetivos trimestrales para ascenso o liderazgo de proyectos técnicos.`);
  }

  if (modalidadEfectiva === 'Presencial' && emp.departamento === 'Tecnología') {
    recomendaciones.push(`Ofrecer esquema de trabajo híbrido (2-3 días remotos) para incrementar retención en perfiles tecnológicos.`);
  }

  if (satisfaccionEfectiva <= 6) {
    recomendaciones.push(`Agendar sesión 1-on-1 de feedback cualitativo enfocado en reconocimiento y expectativas laborales.`);
  }

  if (recomendaciones.length === 0) {
    recomendaciones.push(`Mantener revisiones trimestrales de bienestar y plan de mentoría continua.`);
  }

  return {
    riesgoRotacion,
    nivelRiesgo,
    costoReemplazo,
    perdidaHorasProductividad,
    impactoFinancieroTotal,
    diasCurvaAprendizaje,
    factoresDesglose: {
      factorInsatisfaccion: Math.round(scoreInsatisfaccion * 35),
      factorBurnout: Math.round(scoreBurnout * 25),
      factorSalario: Math.round(scoreSalario * 25),
      factorEstancamiento: Math.round(scoreEstancamiento * 15),
      factorModalidad: Math.round(modModalidad * 100),
    },
    alertas,
    recomendaciones,
  };
}
