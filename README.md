# JPEREZCOACH PRO · Workout Tracker (Hevy Style)
### Aplicación de Entrenamiento de Alta Intensidad y Registro Serie a Serie · Jose Perez Coach
**Repositorio Oficial:** [Abraveses-de-tera/JPEREZCOACHAPP](https://github.com/Abraveses-de-tera/JPEREZCOACHAPP)  
**Enlace Web Directo (GitHub Pages):** [https://abraveses-de-tera.github.io/JPEREZCOACHAPP/](https://abraveses-de-tera.github.io/JPEREZCOACHAPP/)

---

## ⚡ Descripción General

**JPEREZCOACH PRO** es una Progressive Web App (**PWA**) de última generación inspirada en la mejor experiencia de usuario de **Hevy** y adaptada al 100% a la metodología, identidad y directrices técnicas de **Jose Perez (JPEREZCOACH)**.

Permite registrar entrenamientos serie a serie en tiempo real, construir y personalizar cualquier rutina desde cero, chatear directamente con el entrenador o en la comunidad de atletas, calcular cargas con la barra visual olímpica y batir récords personales (PRs) con feedback háptico y sonoro nativo.

---

## 🚀 Características Principales (Estilo Hevy)

### 🏋️‍♂️ 1. Registro de Entrenamiento en Vivo (Active Workout Engine)
- **Inicio Flexible**: Comienza un entrenamiento libre vacío (*Empty Workout*) o selecciona cualquiera de las rutinas oficiales y personalizadas con 1 solo toque.
- **Cronómetro Flotante y Minimizable**: Si sales de la pantalla de entreno para consultar el chat o tu historial, una barra flotante inferior mantiene el contador en tiempo real y el acceso inmediato.
- **Tabla de Series Inteligente**:
  - Selector de tipo de serie táctil: **Normal (1, 2...)**, **Calentamiento (W)**, **Drop Set (D)** y **Fallo / RIR 0 (F)**.
  - **Valores Anteriores (*Ghost Values*)**: Muestra la carga y repeticiones de tu sesión anterior (`ej: 80 kg × 6`) para ayudarte a aplicar sobrecarga progresiva.
  - **Checkmark Neón**: Al completar una serie, se ilumina en verde esmeralda, emite un agradable acorde sintético (*Web Audio API*) y vibra el teléfono.
- **Temporizador de Descanso Automático**: Al marcar una serie, arranca la cuenta atrás con rueda circular de progreso, botones de ajuste rápido (`+30s` / `-15s`), aviso sonoro al llegar a `00:00` y vibración en el bolsillo.
- **Celebración de Fin de Sesión**: Animación de confeti en pantalla, cálculo automático del tonelaje levantado (kg/toneladas), duración y desglose de récords personales superados.

---

### 📋 2. Creador y Editor de Rutinas Personalizadas (*"Haz tu Rutina"*)
- **Constructor Completo**:
  - Crea rutinas desde cero con título, categoría (Empuje, Tirón, Pierna, Torso, Brazos, Full Body), descripción y notas.
  - Añade cualquier ejercicio del catálogo maestro de más de 100 ejercicios o crea ejercicios propios.
  - Configura repeticiones objetivo, número de series por defecto y directrices técnicas (ej: *excéntrica en 5 segundos*, *tempo 1-3-1*).
  - Reordena los ejercicios arriba/abajo con un toque.
  - Duplica cualquier rutina (oficial o personalizada) para adaptarla como nueva plantilla.
  - Exportación e importación directa de rutinas en formato JSON.

---

### 💬 3. Chat Interactivo Doble Canal
- **Canal 1: Jose Perez (Head Coach)**:
  - Asistente conversacional inteligente entrenado en la metodología oficial de Jose Perez: alta intensidad, RIR 0, bajadas en 5s, rest-pause, progresiones, macros y descansos.
  - Píldoras de preguntas frecuentes con 1 toque.
  - **Botón Directo de WhatsApp**: Enlace preformateado directo al WhatsApp oficial de Jose Perez (`+34 658 50 71 36`).
  - **Compartir Entrenamiento**: Envía la ficha resumen de tu último entreno directamente a la conversación.
- **Canal 2: Comunidad JPEREZ TEAM**:
  - Feed social donde los atletas comparten sus entrenamientos finalizados y nuevos récords.
  - Reacciones interactivas con emojis (🔥, 💪, 🦁, ⚡).

---

### 👤 4. Autenticación y Gestión de Perfiles
- **Inicio de Sesión y Registro**: Soporte para cuentas múltiples guardadas localmente.
- **Acceso Rápido de 1 Toque a Cuentas Demo**:
  - `David Otero`: Atleta oficial con su plan de 6 días precargado y marcas históricas.
  - `Jose Perez`: Head Coach y administrador del sistema.
  - `Nuevo Atleta`: Perfil de invitado para comenzar desde cero.
- **Editor de Perfil**: Peso corporal, estatura, objetivo deportivo y bio.

---

### 📊 5. Analítica, Historial y Herramientas Gym
- **Calendario de Consistencia (Heatmap de 12 semanas)**: Matriz estilo GitHub/Hevy con 5 niveles de intensidad de volumen entrenado por día.
- **Salón de la Fama de Récords Personales (PRs)**: Seguimiento del peso máximo levantado y 1RM estimado en los ejercicios clave.
- **Calculadora de Discos de Barra (*Plate Calculator*)**:
  - Gráfico interactivo con la barra olímpica y discos oficiales de competición codificados por color (25kg rojo, 20kg azul, 15kg amarillo, 10kg verde, 5kg blanco, 2.5kg y 1.25kg).
  - Desglose exacto de discos por lado.
- **Calculadora de 1RM**: Fórmulas de Epley y Brzycki con tabla de porcentajes de carga (100% a 50%) y guía de repeticiones.
- **Copia de Seguridad**: Exporta e importa toda tu base de datos en un clic en formato `.json`.

---

### 📚 6. Base de Datos de 100+ Ejercicios y Vídeos de Técnica
- Incluye los **35 ejercicios oficiales verificados de la rutina de 6 Días de Jose Perez**:
  1. **Día 1 PULL**: Dominadas/jalón, Remo T (5s excéntrica), Jalón máquina al fallo, Remo unilateral, Bíceps martillo (rest-pause), Scott unilateral máquina (tempo 1-3-1).
  2. **Día 2 PUSH**: Press inclinado 60%, Press plano máquina (piramidal 12-10-8-6-4), Apertura unilateral polea baja, Press hombro neutro, Laterales máquina (isometría 3s).
  3. **Día 3 LEG**: Prensa horizontal unilateral, Sentadilla Hack (5s bajada), Zancadas Smith (RIR 0), Belt squat cuádriceps (rebotes acumulativos 1 a 10), Hip thrust unilateral, Gemelo de pie.
  4. **Día 4 PULL**: Hiperextensión lumbar con disco, Remo barra Smith (5s excéntrica), Jalón unilateral polea alta, Remo agarre supino, Low row.
  5. **Día 5 ARMS**: Polea cuerda baja (3s isométrico), Polea alta cuerda tríceps, Curl bíceps barra Z (RIR 0), Press francés mancuernas, Scott unilateral, Extensión tríceps polea.
  6. **Día 6 LEG**: Aductor máquina (5s excéntrica), Peso muerto con barra pesada, Sentadilla sumo Smith, Femoral tumbado, Femoral sentado, Extensión cuádriceps al fallo.
- Botón directo `🎬 Vídeo` en cada ejercicio para reproducir demostraciones de técnica en vídeo sin perder tus series ni el cronómetro en curso.

---

## 🛠️ Tecnologías Empleadas

- **HTML5 Semántico y PWA**: `manifest.webmanifest` y `sw.js` con Service Worker para funcionamiento sin conexión (*Offline-First*).
- **CSS3 Moderno**: Variables personalizadas, Obsidian Dark Theme, Flexbox, CSS Grid y diseño táctil optimizado para iOS y Android.
- **JavaScript Vanilla Modular**:
  - `state.js`: Estado reactivo y persistencia local.
  - `db-ejercicios.js`: Catálogo maestro de ejercicios y búsqueda instantánea.
  - `rutinas-oficiales.js`: Rutinas de Jose Perez y plantillas clásicas.
  - `auth.js`: Autenticación, perfiles y cambio rápido de cuenta.
  - `workout-engine.js`: Motor de entrenamiento en vivo, temporizadores y síntesis Web Audio.
  - `routine-builder.js`: Constructor y editor de rutinas.
  - `chat-engine.js`: Motor de chat con IA y enlaces a WhatsApp.
  - `analytics.js`: Heatmap, calculadora de discos y fórmulas 1RM.
  - `app.js`: Enrutador de pestañas, modales y controlador visual.

---

## 📱 Instalación en el Teléfono Móvil

1. Abre el enlace en Safari (iOS) o Chrome (Android):  
   `https://abraveses-de-tera.github.io/JPEREZCOACHAPP/`
2. Pulsa en **Compartir** o en el menú de tres puntos.
3. Selecciona **"Añadir a la pantalla de inicio"**.
4. ¡La app se abrirá a pantalla completa como una aplicación nativa sin barra de navegación del navegador!

---

## 📞 Contacto Oficial Jose Perez

- 📱 **WhatsApp / Teléfono:** `+34 658 50 71 36`
- ✉️ **Email:** `jperez@mail.com`
- 🌐 **Sitio Web:** `jperezcoach.com`
