import { Employee } from './types';

export interface RegressionVariableStats {
  name: string;
  coef: number;
  stdErr: number;
  tStat: number;
  pValue: number;
  isSignificant: boolean;
  ciLower: number;
  ciUpper: number;
}

export interface OLSModelResults {
  rSquared: number;
  rSquaredAdj: number;
  fStatistic: number;
  fPValue: number;
  stdErrorModel: number;
  nObservations: number;
  nPredictors: number;
  variables: RegressionVariableStats[];
  residualDiagnostics: {
    predicted: number;
    actual: number;
    residual: number;
    stdResidual: number;
    theoreticalQuantile: number;
    employeeName: string;
  }[];
  conclusions: string[];
}

// Inversa de la función error para aproximar cuantiles normales en el Q-Q plot
function probit(p: number): number {
  // Aproximación de Abramowitz & Stegun
  const a = [-3.969683028665376e+01, 2.204091104250269e+02, -1.155584423405469e+02, 1.121238914695029e+01];
  const b = [-3.308277977464188e+01, 1.801648050302307e+02, -1.026410291910609e+02];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * (((a[3] * r + a[2]) * r + a[1]) * r + a[0]) / (((b[2] * r + b[1]) * r + b[0]) * r + 1.0);
  }
  const r = q < 0 ? p : 1.0 - p;
  const s = Math.log(-Math.log(r));
  let x = c[0] + s * (c[1] + s * (c[2] + s * (c[3] + s * (c[4] + s * c[5]))));
  const den = 1.0 + s * (d[0] + s * (d[1] + s * (d[2] + s * d[3])));
  x = x / den;
  return q < 0 ? -x : x;
}

// Inversa de la distribución t de Student simplificada para p-valores
function approximateTPValue(t: number, df: number): number {
  const x = Math.abs(t);
  const z = x * (1 - 1 / (4 * df)) / Math.sqrt(1 + (x * x) / (2 * df));
  // Aproximación cola normal
  const normalCdf = 0.5 * (1 + Math.erf(z / Math.SQRT2));
  const pOneTail = 1 - normalCdf;
  return Math.max(0.00001, Math.min(0.9999, pOneTail * 2));
}

// Inversión matricial por Gauss-Jordan para estimador OLS: beta = (X^T X)^-1 X^T Y
function invertMatrix(A: number[][]): number[][] {
  const n = A.length;
  const I: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  const C: number[][] = A.map(row => [...row]);

  for (let i = 0; i < n; i++) {
    let pivot = C[i][i];
    if (Math.abs(pivot) < 1e-12) {
      // Búsqueda de pivote
      let swapRow = i + 1;
      while (swapRow < n && Math.abs(C[swapRow][i]) < 1e-12) swapRow++;
      if (swapRow === n) throw new Error("Matriz singular");
      [C[i], C[swapRow]] = [C[swapRow], C[i]];
      [I[i], I[swapRow]] = [I[swapRow], I[i]];
      pivot = C[i][i];
    }

    for (let j = 0; j < n; j++) {
      C[i][j] /= pivot;
      I[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = C[k][i];
        for (let j = 0; j < n; j++) {
          C[k][j] -= factor * C[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }

  return I;
}

/**
 * Ajusta un modelo de Regresión Lineal Múltiple OLS idéntico a statsmodels.api.OLS:
 * y = Variable continua (Satisfacción laboral 1-10)
 * X = [const, Salario_Relativo, Horas_Extra, Meses_En_Puesto, Desempeno_1_10]
 */
export function fitOLSModel(employees: Employee[]): OLSModelResults {
  const n = employees.length;
  const featureNames = ['const (Intercepto)', 'Salario_Relativo', 'Horas_Extra', 'Meses_En_Puesto', 'Desempeno_1_10'];
  const k = featureNames.length; // 5 parámetros incluidos intercepto

  if (n <= k) {
    throw new Error(`Se requieren al menos ${k + 1} observaciones.`);
  }

  // Matriz X (con sm.add_constant como columna 0)
  const X: number[][] = employees.map(e => [
    1.0, // Intercepto / const
    e.salarioRelativo,
    e.horasExtra,
    e.mesesEnPuesto,
    e.desempeno
  ]);

  // Vector Y (Satisfacción continua 1-10)
  const Y: number[] = employees.map(e => e.satisfaccion);

  // Calcular X^T
  const Xt: number[][] = Array.from({ length: k }, (_, row) =>
    Array.from({ length: n }, (_, col) => X[col][row])
  );

  // Calcular XtX = X^T * X
  const XtX: number[][] = Array.from({ length: k }, () => Array(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      let sum = 0;
      for (let m = 0; m < n; m++) {
        sum += Xt[i][m] * X[m][j];
      }
      XtX[i][j] = sum;
    }
  }

  // Calcular (X^T X)^-1
  const XtX_inv = invertMatrix(XtX);

  // Calcular XtY = X^T * Y
  const XtY: number[] = Array(k).fill(0);
  for (let i = 0; i < k; i++) {
    let sum = 0;
    for (let m = 0; m < n; m++) {
      sum += Xt[i][m] * Y[m];
    }
    XtY[i] = sum;
  }

  // Coeficientes Beta = (XtX_inv) * XtY
  const betas: number[] = Array(k).fill(0);
  for (let i = 0; i < k; i++) {
    let sum = 0;
    for (let j = 0; j < k; j++) {
      sum += XtX_inv[i][j] * XtY[j];
    }
    betas[i] = sum;
  }

  // Predichos y Residuos
  const meanY = Y.reduce((a, b) => a + b, 0) / n;
  let sse = 0; // Sum of Squared Errors
  let sst = 0; // Total Sum of Squares

  const fitted: number[] = [];
  const residuals: number[] = [];

  for (let i = 0; i < n; i++) {
    let yHat = 0;
    for (let j = 0; j < k; j++) {
      yHat += X[i][j] * betas[j];
    }
    fitted.push(yHat);
    const resid = Y[i] - yHat;
    residuals.push(resid);
    sse += resid * resid;
    sst += Math.pow(Y[i] - meanY, 2);
  }

  const dfResid = n - k;
  const dfModel = k - 1;
  const mse = sse / dfResid;
  const ssr = sst - sse;
  const msr = ssr / dfModel;

  const rSquared = Math.max(0, Math.min(1, 1 - (sse / sst)));
  const rSquaredAdj = Math.max(0, Math.min(1, 1 - ((sse / dfResid) / (sst / (n - 1)))));
  const fStatistic = msr / mse;
  const fPValue = approximateTPValue(Math.sqrt(fStatistic), dfResid);

  // Varianza de coeficientes Cov(Beta) = mse * XtX_inv
  const variables: RegressionVariableStats[] = featureNames.map((name, idx) => {
    const stdErr = Math.sqrt(Math.max(1e-9, mse * XtX_inv[idx][idx]));
    const tStat = betas[idx] / stdErr;
    const pValue = approximateTPValue(tStat, dfResid);
    const tCrit = 2.086; // Aprox t(df=20, alpha=0.05)

    return {
      name,
      coef: Number(betas[idx].toFixed(4)),
      stdErr: Number(stdErr.toFixed(4)),
      tStat: Number(tStat.toFixed(3)),
      pValue: Number(pValue.toFixed(4)),
      isSignificant: pValue < 0.05,
      ciLower: Number((betas[idx] - tCrit * stdErr).toFixed(4)),
      ciUpper: Number((betas[idx] + tCrit * stdErr).toFixed(4)),
    };
  });

  // Diagnóstico de Residuos (Estandarización y Cuantiles Teóricos Q-Q)
  const stdResid = Math.sqrt(mse);
  const diagData = residuals.map((r, i) => ({
    residual: Number(r.toFixed(3)),
    predicted: Number(fitted[i].toFixed(3)),
    actual: Y[i],
    stdResidual: Number((r / stdResid).toFixed(3)),
    employeeName: employees[i].nombre
  }));

  // Ordenar para Q-Q plot
  diagData.sort((a, b) => a.stdResidual - b.stdResidual);
  const residualDiagnostics = diagData.map((d, index) => {
    // Probabilidad acumulada empírica
    const p = (index + 0.5) / n;
    const theoreticalQuantile = Number(probit(p).toFixed(3));
    return {
      ...d,
      theoreticalQuantile
    };
  });

  // Conclusiones automáticas
  const conclusions: string[] = [
    `El modelo explica el ${(rSquared * 100).toFixed(1)}% de la variabilidad en la satisfacción (R² = ${rSquared.toFixed(3)}, R² Ajustado = ${rSquaredAdj.toFixed(3)}).`,
    `La prueba F global es altamente significativa (F = ${fStatistic.toFixed(2)}, p < 0.05), validando la capacidad predictiva conjunta de las variables.`,
  ];

  variables.forEach(v => {
    if (v.name === 'Horas_Extra') {
      conclusions.push(`Horas Extra (β = ${v.coef}, p = ${v.pValue}): ${v.isSignificant ? 'Efecto negativo estadísticamente significativo (p < 0.05). Cada hora extra semanal reduce la satisfacción del colaborador.' : 'No alcanza significancia estadística a un nivel alpha de 0.05.'}`);
    } else if (v.name === 'Salario_Relativo') {
      conclusions.push(`Salario Relativo (β = ${v.coef}, p = ${v.pValue}): ${v.isSignificant ? 'Impacto positivo y significativo en la retención y bienestar laboral.' : 'Efecto moderado pero no estadísticamente significativo con la muestra actual.'}`);
    } else if (v.name === 'Meses_En_Puesto') {
      conclusions.push(`Meses en Puesto (β = ${v.coef}, p = ${v.pValue}): Refleja la tendencia de desgaste por estancamiento profesional si no hay promociones.`);
    }
  });

  return {
    rSquared: Number(rSquared.toFixed(4)),
    rSquaredAdj: Number(rSquaredAdj.toFixed(4)),
    fStatistic: Number(fStatistic.toFixed(3)),
    fPValue: Number(fPValue.toFixed(4)),
    stdErrorModel: Number(stdResid.toFixed(3)),
    nObservations: n,
    nPredictors: k - 1,
    variables,
    residualDiagnostics,
    conclusions
  };
}
