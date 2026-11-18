# JPEREZCOACH PRO · Workout Tracker
### Aplicación de Alta Intensidad · Personalización de Atleta · Rutinas en PDF · Creador y Exportador Dinámico
**Repositorio Oficial:** [Abraveses-de-tera/JPEREZCOACHAPP](https://github.com/Abraveses-de-tera/JPEREZCOACHAPP)  
**Enlace Web Directo (GitHub Pages):** [https://abraveses-de-tera.github.io/JPEREZCOACHAPP/](https://abraveses-de-tera.github.io/JPEREZCOACHAPP/)

---

## ⚡ Novedades Principales de esta Versión

1. **🧙 Asistente de Personalización y Onboarding Interactivo**:
   - Al abrir la aplicación, el asistente interactivo te guía en 3 pasos:
     - **Paso 1: ¿Quién eres?**: Nombre, apellidos y apodo para personalizar tu seguimiento.
     - **Paso 2: Métricas y Objetivo**: Peso corporal (kg), estatura (cm), objetivo (Hipertrofia, Fuerza Máxima, Definición, Rendimiento) y nivel de experiencia.
     - **Paso 3: Vinculación de Rutina**: Elige adjuntar tu archivo en PDF, pegar texto plano, cargar la rotación oficial de 6 días de Jose Perez o empezar en blanco.
   - Todo se almacena en local de forma segura, privada y sin necesidad de servidores externos.

2. **📄 Subida e Importación Inteligente de Rutinas en PDF**:
   - Sube cualquier rutina en archivo `.pdf` (arrastrar y soltar) o pega el texto directamente.
   - El motor analiza y detecta automáticamente días, ejercicios, series, repeticiones y observaciones de intensidad (excéntricas en 5s, RIR 0, rest-pause).
   - Vinculación automática de ejercicios con la base de datos oficial y vídeos de técnica.
   - Pantalla de previsualización antes de guardar en tu biblioteca personal.

3. **📖 Guía de Formato PDF Integrada**:
   - Sección interactiva en la app que explica exactamente cómo debe estructurarse el PDF para que el analizador lo entienda al 100%.
   - Ejemplo modelo con botón para copiarlo o usarlo directamente como plantilla.

4. **🗑️ Rutinas 100% Dinámicas (Borrar, Guardar y Restaurar)**:
   - Las rutinas ya no son fijas para una sola persona: **puedes borrar cualquier rutina**, crear las tuyas o importar nuevas.
   - Puedes guardar tantas rutinas como desees en tu biblioteca personal.
   - Botón **"🔄 Restaurar 6 Días Oficiales"** para recuperar la plantilla de Jose Perez en cualquier momento.

5. **📤 Exportación de Rutinas (3 Formatos)**:
   - **📄 Ficha PDF Imprimible**: Genera una hoja de entrenamiento profesional lista para imprimir o guardar como PDF en tu dispositivo.
   - **📱 Mensaje Formateado para WhatsApp**: Texto con emojis, series y notas listo para enviar a tu entrenador o compañero de entreno.
   - **💾 Archivo JSON**: Backup completo de la rutina para transferirla entre dispositivos.

6. **👥 Gestión de Perfiles Locales (Sin Administración Forzada)**:
   - Al ser una aplicación que corre localmente en el móvil o navegador del atleta, Jose Perez actúa estrictamente como **Head Coach** (ofreciendo su metodología, chat con IA especializada y contacto directo por WhatsApp al `+34 658 50 71 36`).
   - El atleta tiene control total de su perfil, sus marcas personales y sus entrenamientos en su propio dispositivo.

---

## 📖 Cómo estructurar el PDF para que la App lo entienda al 100%

El importador inteligente de **JPEREZCOACH PRO** procesa el texto estructurado del documento. Para una detección perfecta:

### 1. Encabezado del Plan
Incluye al inicio el nombre del plan y el atleta:
```text
PLAN DE ENTRENAMIENTO · JPEREZCOACH
Atleta: Marcos Ramos | Objetivo: Hipertrofia
```

### 2. Separación Clara de Días
Cada día debe comenzar con la palabra `DÍA`, `DIA` o `DAY` seguida del número y el grupo muscular:
```text
DÍA 1: PULL (Espalda y Bíceps)
DÍA 2: PUSH (Pecho y Hombro)
DÍA 3: LEG (Pierna Completa - Cuádriceps y Glúteo)
DÍA 4: PULL (Espalda y Cadena Posterior - Grosor y Lumbar)
DÍA 5: ARMS (Brazos - Bíceps y Tríceps)
DÍA 6: LEG (Pierna - Cadena Posterior y Aductor)
```

### 3. Líneas de Ejercicio y Series
Escribe cada ejercicio en una línea seguido de dos puntos `:` o paréntesis con el número de series y repeticiones. Patrones reconocidos automáticamente:
- `3 series de 4-6 reps (Pesadas)`
- `3 series de 8-10 reps (RIR 0 al fallo)`
- `4x12 reps`
- `3 × 10-12 reps`
- `Serie piramidal (12, 10, 8, 6, 4 reps)`

### 4. Directrices Técnicas y Metodología JPEREZ
Puedes incluir entre paréntesis indicaciones que la app convertirá automáticamente en directrices interactivas:
- `(Excéntrico en 5 seg / Bajadas en 5s)`
- `(RIR 0 al fallo muscular)`
- `(Rest pause: descanso 15s y 2-3 reps extra)`
- `(Tempo 1-3-1)`
- `(3 seg de contracción isométrica arriba)`
- `(1 rep 1 rebote, 1 rep 2 rebotes... hasta 10 rebotes)`

### 📋 Ejemplo de Documento Modelo
```text
PLAN DE ENTRENAMIENTO · JPEREZCOACH
Atleta: Marcos Ramos | Objetivo: Hipertrofia

DÍA 1: PULL (Espalda y Bíceps)
1. Dominadas/jalón: 3 series de 4-6 reps (Calienta 2/3 series y después busca series pesadas)
2. Remo T: 3 series de 4-6 reps (Excéntrico en 5 segundos)
3. Jalón máquina: 3 series de 8-10 reps (RIR 0 al fallo concéntrico + parciales)
4. Remo unilateral: 2 series de 10-12 reps (Excéntrico en 5 segundos con mancuerna)
5. Bíceps martillo mancuernas: 2 series de 8-10 reps (Rest pause)
6. Scott máquina unilateral: 3 series de 8-10 reps (Tempo 1-3-1)

DÍA 2: PUSH (Pecho y Hombro)
1. Press inclinado 60%: 3 series de 8-10 reps
2. Press plano máquina: Serie piramidal (12, 10, 8, 6, 4 reps)
3. Apertura unilateral desde abajo: 3 series de 15 reps (Bajadas en 5 seg en polea baja)
4. Press hombro neutro: 3 series de 8-10 reps (Máximo rango de recorrido con mancuernas)
5. Laterales máquina unilateral: 2 series de 10-12 reps (3 seg de contracción isométrica)
6. Laterales máquina: 3 series de 6-8 reps pesadas
```

---

## 🚀 Arquitectura Completa de la Aplicación

- **🏋️‍♂️ Entrenar (Live Workout Tracker)**:
  - Registro serie a serie con valores anteriores (*Ghost values*).
  - **⚡ Steppers Rápidos de Carga (+1kg, +2.5kg, +5kg, +1rep)**: Ajuste instantáneo de cargas sin desplegar el teclado táctil.
  - **🔥 Calculadora de Calentamiento (Ramp-Up Sets)**: Calcula las series de aproximación progresiva (Barra, 50%, 70%, 85%) y las inserta con 1 toque.
  - **🎯 Consejos de Sobrecarga Progresiva**: Recomendaciones inteligentes en cada ejercicio basadas en tu última sesión para alcanzar RIR 0.
  - Selector de series: Normal, Calentamiento (W), Drop Set (D), Fallo / RIR 0 (F).
  - Temporizador de descanso flotante con cuenta atrás sonora (beeps 3-2-1-0 vía Web Audio API) y vibración háptica.
  - Barra flotante minimizable que sigue activa mientras navegas por la app.
  - Celebración con confeti al finalizar y resumen con nuevos récords personales (PRs).
- **📋 Rutinas Dinámicas**:
  - Creación manual, duplicación, edición de series/reps y borrado de cualquier rutina.
  - Subida de archivos PDF o pegado de texto con previsualización interactiva.
  - Exportación individual a PDF imprimible, JSON o WhatsApp con vista previa de tarjeta oficial.
- **💬 Chat Doble Canal**:
  - Canal con Jose Perez (Coach IA con su metodología) + enlace directo a WhatsApp (`+34 658 50 71 36`).
  - Feed de comunidad JPEREZ TEAM con tarjetas de entreno y reacciones con emojis.
- **📊 Historial & Analítica Avanzada**:
  - **📈 Gráficos Vectoriales SVG de Evolución 1RM**: Curva histórica de fuerza máxima estimada por ejercicio con marcas pico y tendencias.
  - **🎯 Distribución Muscular y Volumen Semanal**: Balance de series efectivas a RIR 0 por grupo muscular (Espalda, Pecho, Pierna, Hombro, Bíceps, Tríceps, Core) vs volumen óptimo (10-18 series).
  - Matriz Heatmap de consistencia de 12 semanas.
  - Calculadora de Discos de Barra Olímpica (*Plate Calculator*) con gráfico visual de barra.
  - Calculadora de 1RM con tabla de porcentajes de entrenamiento.
  - Salón de la Fama de Récords Personales (PRs).
- **👤 Perfil, Medidas & Sesión**:
  - **📏 Seguimiento Corporal & Peso (Body Tracker)**: Historial de pesajes y medidas (cintura, brazo, pecho, muslo) con cálculo automático de variaciones (+/- kg).
  - Gestión multiperfil de atletas en local sin servidores externos.
  - Asistente de personalización (Onboarding) reabrible en cualquier momento.
  - Botón directo para compartir la app en WhatsApp con vista previa enriquecida y foto oficial de Jose Perez.

---

## 🛠️ Despliegue en GitHub Pages

1. Ve a **Settings > Pages** en el repositorio [JPEREZCOACHAPP](https://github.com/Abraveses-de-tera/JPEREZCOACHAPP/settings/pages).
2. En **Build and deployment > Source**, elige **Deploy from a branch**.
3. Selecciona la rama `main` y carpeta `/(root)`.
4. Tu aplicación estará disponible en vivo en:  
   👉 **[https://abraveses-de-tera.github.io/JPEREZCOACHAPP/](https://abraveses-de-tera.github.io/JPEREZCOACHAPP/)**
