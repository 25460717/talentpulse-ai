# TalentPulse AI ⚡
**People Analytics, Turnover Prediction & Productivity Modeling Engine**

Una aplicación web analítica de grado empresarial para departamentos de Recursos Humanos (RR.HH.) y directores de talento, diseñada para predecir la rotación voluntaria de colaboradores y proyectar el impacto financiero y operativo en la productividad de la empresa.

---

## 🛠️ Stack Tecnológico
- **Frontend & Framework:** React 18 + TypeScript + Vite.
- **Estilos & Diseño UI:** Tailwind CSS (diseño limpio inspirado en Linear/Lattice, semáforos cromáticos).
- **Iconografía:** Lucide React.
- **Visualización de Datos:** Recharts (Scatter Cuadrantes, Proyecciones Lineales a 12 meses y Gráfico de Barras horizontales de causas raíz).
- **Procesamiento de Datos:** Motor en TypeScript con Scoring Multivariable Transparente y parser de CSV reactivo en el cliente.

---

## 📁 Estructura del Proyecto

```
talentpulse-ai/
├── public/
│   └── sample_employees.csv        # Archivo CSV de ejemplo descargable
├── src/
│   ├── components/
│   │   ├── ExecutiveKPIs.tsx       # 4 KPIs principales ejecutivos
│   │   ├── AnalyticsCharts.tsx     # Gráficos interactivos (Matriz de Riesgo, Proyecciones, Factores)
│   │   ├── Simulator.tsx           # Motor What-If interactivo con sliders y cálculo de ROI
│   │   ├── EmployeeTable.tsx       # Directorio con filtros, búsqueda y ordenación
│   │   ├── EmployeeModal.tsx       # Modal de diagnóstico individual, desglose y plan de retención
│   │   └── DataUpload.tsx          # Gestor de carga CSV y plantilla
│   ├── csvHelper.ts                # Parser tolerante a columnas y formatos CSV
│   ├── engine.ts                   # Lógica matemática de Scoring ponderado y productividad
│   ├── sampleData.ts               # 25 colaboradores ficticios en varios departamentos
│   ├── types.ts                    # Definición de tipos TypeScript
│   ├── App.tsx                     # Aplicación principal
│   ├── main.tsx                    # Punto de entrada Vite
│   └── index.css                   # Tailwind base y directivas CSS
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🧮 Lógica de Predicción & Fórmulas (Modelo de Scoring Transparente)

### 1. Riesgo de Rotación (0 - 100%)
El modelo calcula el riesgo como una combinación ponderada de variables críticas de RR.HH.:
- **Insatisfacción Laboral (Peso 35%):** Derivado de encuestas de clima laboral `(10 - Satisfacción) / 9`.
- **Competitividad Salarial (Peso 25%):** Ratio de salario respecto al mercado (1.0 = media mercado). Valores `< 0.90` disparan alertas críticas.
- **Sobrecarga de Trabajo / Burnout (Peso 25%):** Medido a través de horas extra semanales normalizadas (más de 10 hrs/semana representa riesgo crítico).
- **Estancamiento en Puesto (Peso 15%):** Penaliza periodos superiores a 18-24 meses en el mismo rol sin promoción o cambio de nivel.
- **Modificador de Modalidad:** Flexibilidad remota bonifica retención (-5%), presencialidad forzada penaliza (+8%).

### 2. Impacto en Productividad & Costo Financiero
- **Costo de Reemplazo:** Varía entre el 50% y 150% del salario anual según el seniority y evaluación de desempeño del empleado.
- **Curva de Aprendizaje:** 60 a 90 días ponderado por rol y antigüedad.
- **Horas de Productividad Perdidas:** Caída del 60% de efectividad de las horas laborales durante la rampa de incorporación del reemplazo.

---

## 🚀 Cómo Ejecutar la Aplicación

1. **Abrir terminal en el directorio del proyecto:**
   ```bash
   cd C:\Users\josea\.gemini\antigravity\scratch\talentpulse-ai
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *La app estará disponible en `http://localhost:3000`.*

3. **Compilar para producción:**
   ```bash
   npm run build
   ```
