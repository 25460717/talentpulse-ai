import { Employee } from './types';

export function parseCSV(csvText: string): Employee[] {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const employees: Employee[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 5) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Mapeo flexible de columnas
    const nombre = row['nombre'] || row['name'] || `Empleado ${i}`;
    const puesto = row['puesto'] || row['rol'] || row['position'] || 'Especialista';
    const departamento = row['departamento'] || row['department'] || 'General';
    const salarioAnual = parseFloat(row['salario_anual'] || row['salary'] || '50000') || 50000;
    const salarioRelativo = parseFloat(row['salario_relativo'] || row['relative_salary'] || '1.0') || 1.0;
    const horasExtra = parseFloat(row['horas_extra'] || row['overtime'] || '0') || 0;
    const satisfaccion = parseFloat(row['satisfaccion_1_10'] || row['satisfaction'] || row['satisfaccion'] || '7') || 7;
    const mesesEnPuesto = parseInt(row['meses_en_puesto'] || row['months_in_role'] || '12', 10) || 12;
    const desempeno = parseFloat(row['desempeno_1_10'] || row['performance'] || row['desempeno'] || '7') || 7;
    const modalidad = (row['modalidad'] || 'Híbrido') as 'Remoto' | 'Híbrido' | 'Presencial';
    const antiguedadMeses = parseInt(row['antiguedad_meses'] || row['tenure_months'] || '18', 10) || 18;

    employees.push({
      id: `CSV-${i.toString().padStart(3, '0')}`,
      nombre,
      puesto,
      departamento,
      salarioAnual,
      salarioRelativo,
      horasExtra,
      satisfaccion: Math.max(1, Math.min(10, satisfaccion)),
      mesesEnPuesto,
      desempeno: Math.max(1, Math.min(10, desempeno)),
      modalidad: ['Remoto', 'Híbrido', 'Presencial'].includes(modalidad) ? modalidad : 'Híbrido',
      antiguedadMeses
    });
  }

  return employees;
}
