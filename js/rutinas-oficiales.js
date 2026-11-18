// =============================================================================
// JPEREZCOACH APP · RUTINAS OFICIALES Y PLANTILLAS MAESTRAS
// Metodología de Alta Intensidad de Jose Perez + Plantillas Clásicas Hevy Style
// =============================================================================

(function(global) {
  'use strict';

  var RUTINAS_OFICIALES = [
    // -------------------------------------------------------------------------
    // 1. ROTACIÓN OFICIAL DE 6 DÍAS JPEREZCOACH (ALTA INTENSIDAD E HIPERTROFIA)
    // -------------------------------------------------------------------------
    {
      id: "D1",
      codigo: "D1",
      titulo: "1 PULL · Espalda y Bíceps",
      categoria: "JPEREZ 6 Días Rotativos",
      etiqueta: "1 PULL",
      descripcion: "Dominadas pesadas, Remo T con excéntrica 5s, Jalón máquina al fallo RIR 0 y Bíceps martillo con rest-pause.",
      tiempoEstimadoMin: 65,
      foco: ["Espalda", "Bíceps"],
      esOficial: true,
      color: "#38bdf8",
      ejercicios: [
        {
          exerciseId: "dominadas_jalon",
          name: "Dominadas/jalón",
          targetReps: "4-6",
          notes: "Calienta 2/3 series y después busca 3 series lo más pesadas posible.",
          defaultSets: [
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 }
          ]
        },
        {
          exerciseId: "remo_t",
          name: "Remo T",
          targetReps: "4-6",
          notes: "Excéntrico en 5 segundos. Control estricto del torso.",
          defaultSets: [
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 }
          ]
        },
        {
          exerciseId: "jalon_maquina",
          name: "Jalón máquina",
          targetReps: "8-10",
          notes: "RIR 0 al fallo concéntrico + repeticiones parciales.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "fallo", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "remo_unilateral",
          name: "Remo unilateral",
          targetReps: "10-12",
          notes: "Excéntrico en 5 segundos con mancuerna. Tirón hacia la cadera.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "biceps_martillo_mancuernas",
          name: "Bíceps martillo mancuernas",
          targetReps: "8-10",
          notes: "Rest pause: tras el fallo, descanso de 15 segundos y 2-3 reps extra.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "rest_pause", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "scott_maquina_unilateral",
          name: "Scott máquina unilateral",
          targetReps: "8-10",
          notes: "Tempo 1-3-1 (1s subida, 3s bajada, 1s pausa isométrica).",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        }
      ]
    },
    {
      id: "D2",
      codigo: "D2",
      titulo: "2 PUSH · Pecho y Hombro",
      categoria: "JPEREZ 6 Días Rotativos",
      etiqueta: "2 PUSH",
      descripcion: "Press inclinado al 60%, Press plano con serie piramidal progresiva, Aperturas en polea baja y Laterales en máquina.",
      tiempoEstimadoMin: 60,
      foco: ["Pecho", "Hombro"],
      esOficial: true,
      color: "#00d2ff",
      ejercicios: [
        {
          exerciseId: "press_inclinado_60",
          name: "Press inclinado 60%",
          targetReps: "8-10",
          notes: "Inclinación al 60% para activar porción clavicular.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "press_plano_maquina",
          name: "Press plano máquina",
          targetReps: "12-10-8-6-4",
          notes: "Serie piramidal (12, 10, 8, 6, 4 reps) subiendo carga progresiva.",
          defaultSets: [
            { type: "piramidal", reps: "12", weight: 0 },
            { type: "piramidal", reps: "10", weight: 0 },
            { type: "piramidal", reps: "8", weight: 0 },
            { type: "piramidal", reps: "6", weight: 0 },
            { type: "piramidal", reps: "4", weight: 0 }
          ]
        },
        {
          exerciseId: "apertura_unilateral_desde_abajo",
          name: "Apertura unilateral desde abajo",
          targetReps: "15",
          notes: "Bajadas lentas y controladas en 5 segundos en polea baja.",
          defaultSets: [
            { type: "normal", reps: "15", weight: 0 },
            { type: "normal", reps: "15", weight: 0 },
            { type: "normal", reps: "15", weight: 0 }
          ]
        },
        {
          exerciseId: "press_hombro_neutro",
          name: "Press hombro neutro",
          targetReps: "8-10",
          notes: "Máximo rango de recorrido con mancuernas en agarre neutro.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "laterales_maquina_unilateral",
          name: "Laterales máquina unilateral",
          targetReps: "10-12",
          notes: "3 segundos de contracción isométrica arriba.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "laterales_maquina",
          name: "Laterales máquina",
          targetReps: "6-8",
          notes: "Series pesadas a 6-8 repeticiones en máquina.",
          defaultSets: [
            { type: "pesada", reps: "6-8", weight: 0 },
            { type: "pesada", reps: "6-8", weight: 0 },
            { type: "pesada", reps: "6-8", weight: 0 }
          ]
        }
      ]
    },
    {
      id: "D3",
      codigo: "D3",
      titulo: "3 LEG · Pierna Completa (Cuádriceps y Glúteo)",
      categoria: "JPEREZ 6 Días Rotativos",
      etiqueta: "3 LEG",
      descripcion: "Prensa horizontal unilateral, Sentadilla Hack con 5s de bajada, Belt squat con rebotes progresivos y Gemelos.",
      tiempoEstimadoMin: 70,
      foco: ["Pierna", "Cuádriceps", "Glúteo"],
      esOficial: true,
      color: "#10b981",
      ejercicios: [
        {
          exerciseId: "prensa_horizontal_unilateral",
          name: "Prensa horizontal unilateral",
          targetReps: "8-10",
          notes: "Máximo recorrido por pierna con apoyo firme.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "hack_pisada_neutra",
          name: "Hack pisada neutra",
          targetReps: "4-6",
          notes: "Bajadas controladas de 5 segundos con pisada neutra en sentadilla Hack.",
          defaultSets: [
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 }
          ]
        },
        {
          exerciseId: "zancadas_estaticas_smith",
          name: "Zancadas estáticas Smith",
          targetReps: "10-12",
          notes: "RIR 0 al fallo muscular en máquina Smith (multipower).",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "fallo", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "belt_squat_cuadriceps",
          name: "Belt squat cuádriceps",
          targetReps: "10 acumulativo",
          notes: "1 rep 1 rebote, 1 rep 2 rebotes... hasta 10 rebotes acumulativos en el fondo.",
          defaultSets: [
            { type: "especial", reps: "10", weight: 0 },
            { type: "especial", reps: "10", weight: 0 }
          ]
        },
        {
          exerciseId: "hip_thrust_unilateral",
          name: "Hip thrust unilateral",
          targetReps: "10-12",
          notes: "Máxima contracción de glúteo en el punto alto a una pierna.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "gemelo_de_pie",
          name: "Gemelo de pie",
          targetReps: "15-20",
          notes: "3 series de 15-20 repeticiones con estiramiento completo de pie en máquina.",
          defaultSets: [
            { type: "normal", reps: "15-20", weight: 0 },
            { type: "normal", reps: "15-20", weight: 0 },
            { type: "normal", reps: "15-20", weight: 0 }
          ]
        }
      ]
    },
    {
      id: "D4",
      codigo: "D4",
      titulo: "4 PULL · Espalda y Cadena Posterior (Grosor y Lumbar)",
      categoria: "JPEREZ 6 Días Rotativos",
      etiqueta: "4 PULL",
      descripcion: "Hiperextensión con disco, Remo en Smith con excéntrica 5s, Jalón unilateral en polea alta y Remo agarre supino.",
      tiempoEstimadoMin: 65,
      foco: ["Espalda", "Dorsal", "Lumbar"],
      esOficial: true,
      color: "#818cf8",
      ejercicios: [
        {
          exerciseId: "hiperextension_lumbar_con_peso",
          name: "Hiperextensión lumbar con peso",
          targetReps: "10-12",
          notes: "Movimiento controlado en banco romano con disco.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "remo_barra_smith",
          name: "Remo barra Smith",
          targetReps: "8-10",
          notes: "Excéntrica en 5 segundos con barra guiada multipower.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "jalon_unilateral_polea_alta",
          name: "Jalón unilateral polea alta",
          targetReps: "10-12",
          notes: "3 segundos de máxima contracción abajo con agarre neutro.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "remo_maquina_agarre_supino",
          name: "Remo máquina agarre supino",
          targetReps: "12-10-8-6-4",
          notes: "Serie piramidal (12, 10, 8, 6, 4 reps) con agarre supino.",
          defaultSets: [
            { type: "piramidal", reps: "12", weight: 0 },
            { type: "piramidal", reps: "10", weight: 0 },
            { type: "piramidal", reps: "8", weight: 0 },
            { type: "piramidal", reps: "6", weight: 0 },
            { type: "piramidal", reps: "4", weight: 0 }
          ]
        },
        {
          exerciseId: "low_row",
          name: "Low row",
          targetReps: "10-12",
          notes: "Contracción de 2 segundos arriba en remo bajo de dorsal.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        }
      ]
    },
    {
      id: "D5",
      codigo: "D5",
      titulo: "5 ARMS · Brazos (Bíceps y Tríceps)",
      categoria: "JPEREZ 6 Días Rotativos",
      etiqueta: "5 ARMS",
      descripcion: "Superseries e isometrías para bíceps y tríceps con poleas, Barra Z al fallo RIR 0 y Scott unilateral.",
      tiempoEstimadoMin: 55,
      foco: ["Bíceps", "Tríceps", "Brazos"],
      esOficial: true,
      color: "#ec4899",
      ejercicios: [
        {
          exerciseId: "polea_cuerda_baja",
          name: "Polea cuerda baja",
          targetReps: "10-12",
          notes: "3 segundos de isométrico arriba en contracción con cuerda.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "polea_alta_cuerda",
          name: "Polea alta cuerda",
          targetReps: "10-12",
          notes: "3 segundos de isométrico abajo abriendo la cuerda de tríceps.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "curl_biceps_barra_z",
          name: "Curl bíceps barra Z",
          targetReps: "8-10",
          notes: "RIR 0 al límite concéntrico con barra Z de pie.",
          defaultSets: [
            { type: "fallo", reps: "8-10", weight: 0 },
            { type: "fallo", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "press_frances_mancuernas",
          name: "Press francés mancuernas",
          targetReps: "8-10",
          notes: "RIR 0 tumbado con mancuernas y codos estables.",
          defaultSets: [
            { type: "fallo", reps: "8-10", weight: 0 },
            { type: "fallo", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "scott_unilateral",
          name: "Scott unilateral",
          targetReps: "10-12",
          notes: "RIR 0 en banco Scott con mancuerna a una mano.",
          defaultSets: [
            { type: "fallo", reps: "10-12", weight: 0 },
            { type: "fallo", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "polea_unilateral_triceps",
          name: "Polea unilateral tríceps",
          targetReps: "10-12",
          notes: "RIR 0 extensión de tríceps en polea a una mano.",
          defaultSets: [
            { type: "fallo", reps: "10-12", weight: 0 },
            { type: "fallo", reps: "10-12", weight: 0 }
          ]
        }
      ]
    },
    {
      id: "D6",
      codigo: "D6",
      titulo: "6 LEG · Pierna (Cadena Posterior y Aductor)",
      categoria: "JPEREZ 6 Días Rotativos",
      etiqueta: "6 LEG",
      descripcion: "Aductor con bajada en 5s, Peso muerto pesado, Sentadilla sumo en Smith y Femorales tumbado y sentado.",
      tiempoEstimadoMin: 70,
      foco: ["Pierna", "Isquios", "Cadena Posterior"],
      esOficial: true,
      color: "#f59e0b",
      ejercicios: [
        {
          exerciseId: "aductor",
          name: "Aductor en máquina",
          targetReps: "10-12",
          notes: "Excéntrico en 5 segundos en máquina de aductores sentada.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "peso_muerto_barra",
          name: "Peso muerto barra",
          targetReps: "4-6",
          notes: "3 series pesadas de 4-6 reps con técnica convencional limpia.",
          defaultSets: [
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 },
            { type: "pesada", reps: "4-6", weight: 0 }
          ]
        },
        {
          exerciseId: "sentadilla_sumo_en_smith",
          name: "Sentadilla sumo en Smith",
          targetReps: "8-10",
          notes: "Bajadas controladas en 5 segundos con apertura ancha en Smith.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "femoral_tumbado",
          name: "Femoral tumbado",
          targetReps: "8-10",
          notes: "Máxima contracción arriba aguantando 1 segundo en máquina tumbado.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "femoral_sentado",
          name: "Femoral sentado",
          targetReps: "10-12",
          notes: "Excéntrica en 5 segundos en curl femoral sentado.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        },
        {
          exerciseId: "extension_cuadriceps",
          name: "Extensión cuádriceps",
          targetReps: "10-12",
          notes: "RIR 0 al fallo en extensión de cuádriceps en máquina.",
          defaultSets: [
            { type: "fallo", reps: "10-12", weight: 0 },
            { type: "fallo", reps: "10-12", weight: 0 },
            { type: "fallo", reps: "10-12", weight: 0 }
          ]
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 2. PLANTILLAS CLÁSICAS POPULARES DE GIMNASIO (HEVY STYLE)
    // -------------------------------------------------------------------------
    {
      id: "torso_pesado",
      codigo: "TORSO",
      titulo: "Torso Fuerza e Hipertrofia",
      categoria: "Plantillas Clásicas",
      etiqueta: "TORSO",
      descripcion: "Sesión completa para tren superior combinando press banca, remo con barra y elevaciones laterales.",
      tiempoEstimadoMin: 60,
      foco: ["Pecho", "Espalda", "Hombros"],
      esOficial: false,
      color: "#06b6d4",
      ejercicios: [
        {
          exerciseId: "press_banca_plano_barra",
          name: "Press banca plano con barra",
          targetReps: "6-8",
          notes: "Pesado y técnico. Descanso 2-3 min entre series.",
          defaultSets: [
            { type: "pesada", reps: "6-8", weight: 0 },
            { type: "pesada", reps: "6-8", weight: 0 },
            { type: "pesada", reps: "6-8", weight: 0 }
          ]
        },
        {
          exerciseId: "remo_con_barra_90",
          name: "Remo con barra 90 grados",
          targetReps: "8-10",
          notes: "Tracción horizontal con codos hacia atrás.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "press_militar_barra_de_pie",
          name: "Press militar con barra de pie",
          targetReps: "8-10",
          notes: "Fuerza de hombros y estabilidad de core.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "elevaciones_laterales_mancuernas",
          name: "Elevaciones laterales con mancuernas",
          targetReps: "12-15",
          notes: "Control estricto, tempo 2-0-1.",
          defaultSets: [
            { type: "normal", reps: "12-15", weight: 0 },
            { type: "normal", reps: "12-15", weight: 0 },
            { type: "drop_set", reps: "15", weight: 0 }
          ]
        }
      ]
    },
    {
      id: "pierna_fuerza",
      codigo: "PIERNA",
      titulo: "Pierna Completa · Fuerza Fundacional",
      categoria: "Plantillas Clásicas",
      etiqueta: "PIERNA",
      descripcion: "Sentadilla trasera pesada, peso muerto rumano, prensa y gemelo.",
      tiempoEstimadoMin: 65,
      foco: ["Cuádriceps", "Isquios", "Glúteo"],
      esOficial: false,
      color: "#14b8a6",
      ejercicios: [
        {
          exerciseId: "sentadilla_trasera_barra",
          name: "Sentadilla trasera con barra",
          targetReps: "5-6",
          notes: "Profundidad rompiendo el paralelo.",
          defaultSets: [
            { type: "pesada", reps: "5", weight: 0 },
            { type: "pesada", reps: "5", weight: 0 },
            { type: "pesada", reps: "5", weight: 0 }
          ]
        },
        {
          exerciseId: "peso_muerto_rumano_mancuernas",
          name: "Peso muerto rumano con mancuernas",
          targetReps: "8-10",
          notes: "Bisagra de cadera máxima con estiramiento.",
          defaultSets: [
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 },
            { type: "normal", reps: "8-10", weight: 0 }
          ]
        },
        {
          exerciseId: "prensa_45_grados",
          name: "Prensa de 45 grados",
          targetReps: "10-12",
          notes: "Recorrido continuo sin bloquear rodillas.",
          defaultSets: [
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 },
            { type: "normal", reps: "10-12", weight: 0 }
          ]
        }
      ]
    }
  ];

  var RutinasMaestras = {
    // Obtener todas las rutinas (oficiales + personalizadas del usuario)
    getAll: function() {
      var custom = (global.AppState && global.AppState.customRoutines) ? global.AppState.customRoutines : [];
      return RUTINAS_OFICIALES.concat(custom);
    },

    getOficiales: function() {
      return RUTINAS_OFICIALES;
    },

    getPersonalizadas: function() {
      return (global.AppState && global.AppState.customRoutines) ? global.AppState.customRoutines : [];
    },

    getById: function(id) {
      if (!id) return null;
      var all = this.getAll();
      return all.find(function(r) { return r.id === id; }) || null;
    },

    // Generar estructura para entrenamiento vacío (Hevy "Start an Empty Workout")
    crearEntrenamientoVacio: function() {
      return {
        id: "entreno_vacio_" + Date.now(),
        titulo: "Entrenamiento Libre",
        categoria: "Entreno Libre",
        descripcion: "Sesión libre sin rutina predefinida. Añade ejercicios sobre la marcha.",
        foco: ["General"],
        ejercicios: []
      };
    }
  };

  global.RutinasMaestras = RutinasMaestras;
})(window);
