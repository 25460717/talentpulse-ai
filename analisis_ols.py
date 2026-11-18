# -*- coding: utf-8 -*-
"""
TalentPulse AI - Módulo de Ciencia de Datos: Regresión Lineal Múltiple OLS
Actividad en Clase:
- Carga de datos con variable continua y 3+ predictores numéricos
- Ajuste con statsmodels.api.OLS agregando intercepto (sm.add_constant)
- Lectura estadística: coeficientes, p-valores (<0.05), R² y R² ajustado
- Validación gráfica: Residuos vs Predichos y Gráfico Q-Q Normal
"""

import pandas as pd
import numpy as np
import statsmodels.api as sm
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

def ejecutar_actividad_regresion(csv_path="sample_employees.csv"):
    print("=" * 70)
    print(" 1. CARGA DE DATOS TABULAR EN PANDAS")
    print("=" * 70)
    
    # Cargar dataset
    df = pd.read_csv(csv_path)
    print(f"Dataset cargado con éxito: {df.shape[0]} filas, {df.shape[1]} columnas.\n")
    print(df[['Nombre', 'Departamento', 'Satisfaccion_1_10', 'Salario_Relativo', 'Horas_Extra', 'Meses_En_Puesto', 'Desempeno_1_10']].head())

    # Definir variable continua dependiente (Y) y 4 predictores numéricos (X)
    # Variable objetivo continua: Satisfaccion_1_10 (o riesgo de rotación continuo)
    # Predictores: Salario_Relativo, Horas_Extra, Meses_En_Puesto, Desempeno_1_10
    y = df['Satisfaccion_1_10']
    X = df[['Salario_Relativo', 'Horas_Extra', 'Meses_En_Puesto', 'Desempeno_1_10']]

    print("\n" + "=" * 70)
    print(" 2. AJUSTE DE MODELO CON statsmodels.api.OLS (sm.add_constant)")
    print("=" * 70)
    
    # Agregar intercepto (constante)
    X_con_constante = sm.add_constant(X)
    
    # Ajuste por Mínimos Cuadrados Ordinarios (OLS)
    modelo = sm.OLS(y, X_con_constante)
    resultados = modelo.fit()
    
    # Resumen completo de statsmodels
    print(resultados.summary())

    print("\n" + "=" * 70)
    print(" 3. LECTURA E INTERPRETACIÓN ESTADÍSTICA")
    print("=" * 70)
    print(f"R² (Coeficiente de determinación):      {resultados.rsquared:.4f} ({resultados.rsquared*100:.1f}% de la varianza explicada)")
    print(f"R² Ajustado (penaliza complejidad):     {resultados.rsquared_adj:.4f}")
    print(f"F-statistic:                            {resultados.fvalue:.4f} (p-valor: {resultados.f_pvalue:.4e})\n")

    print(f"{'Predictor':<20} | {'Coeficiente (Beta)':<20} | {'P-valor':<12} | {'Significativo (<0.05)?'}")
    print("-" * 75)
    for variable, coef in resultados.params.items():
        pval = resultados.pvalues[variable]
        sig = "✓ SÍ (p < 0.05)" if pval < 0.05 else "✗ No significativo"
        print(f"{variable:<20} | {coef:>18.4f}  | {pval:>10.4f} | {sig}")

    print("\nConclusiones estadísticas:")
    if 'Horas_Extra' in resultados.pvalues:
        coef_he = resultados.params['Horas_Extra']
        print(f" • Horas Extra: Coeficiente = {coef_he:.3f}. Por cada hora extra semanal adicional, la satisfacción se reduce en {abs(coef_he):.3f} puntos.")
    if 'Salario_Relativo' in resultados.pvalues:
        coef_sr = resultados.params['Salario_Relativo']
        print(f" • Salario Relativo: Coeficiente = {coef_sr:.3f}. Una mayor competitividad salarial tiene impacto positivo.")

    print("\n" + "=" * 70)
    print(" 4. VALIDACIÓN GRÁFICA: RESIDUOS VS PREDICHOS Y GRÁFICO Q-Q")
    print("=" * 70)

    valores_predichos = resultados.fittedvalues
    residuos = resultados.resid
    residuos_estandarizados = resultados.get_influence().resid_studentized_internal

    # Configuración de estilo visual
    sns.set_theme(style="whitegrid")
    fig, axes = plt.subplots(1, 2, figsize=(14, 5.5))

    # Gráfico A: Residuos vs Predichos (Evalúa Homocedasticidad y Linealidad)
    sns.scatterplot(x=valores_predichos, y=residuos, ax=axes[0], color="#4f46e5", s=70, alpha=0.85, edgecolor='w')
    axes[0].axhline(y=0, color="#ef4444", linestyle="--", linewidth=1.5)
    sns.regplot(x=valores_predichos, y=residuos, ax=axes[0], scatter=False, lowess=True, 
                line_kws={'color': '#f59e0b', 'linewidth': 1.5})
    axes[0].set_title("Diagnóstico 1: Residuos vs. Valores Predichos\n(Homocedasticidad e Independencia)", fontsize=11, fontweight='bold')
    axes[0].set_xlabel("Valores Predichos (Fitted Values)", fontsize=10)
    axes[0].set_ylabel("Residuos (y - ŷ)", fontsize=10)

    # Gráfico B: Gráfico Q-Q Normal (Evalúa Normalidad de los Errores)
    stats.probplot(residuos_estandarizados, dist="norm", plot=axes[1])
    axes[1].get_lines()[0].set_color("#4f46e5")
    axes[1].get_lines()[0].set_markersize(6.5)
    axes[1].get_lines()[1].set_color("#ef4444")
    axes[1].get_lines()[1].set_linewidth(1.8)
    axes[1].set_title("Diagnóstico 2: Gráfico Q-Q Normal de Residuos\n(Evaluación de Normalidad)", fontsize=11, fontweight='bold')
    axes[1].set_xlabel("Cuantiles Teóricos (Distribución Normal)", fontsize=10)
    axes[1].set_ylabel("Residuos Estandarizados Ordenados", fontsize=10)

    plt.tight_layout()
    plt.savefig("diagnostico_regresion_ols.png", dpi=300)
    print("Gráficos de diagnóstico guardados en 'diagnostico_regresion_ols.png'.")
    plt.show()

if __name__ == "__main__":
    ejecutar_actividad_regresion()
