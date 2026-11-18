// =============================================================================
// JPEREZCOACH APP · GESTOR DE RUTINAS DINÁMICAS Y PLANTILLAS MAESTRAS
// Exportación a JSON, PDF profesional y WhatsApp + Restauración y Eliminación
// =============================================================================

(function(global) {
  'use strict';

  // Plantillas oficiales predefinidas del método JPEREZCOACH
  var PLANTILLAS_OFICIALES = [
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
    }
  ];

  var RutinasMaestras = {
    PLANTILLAS_OFICIALES: PLANTILLAS_OFICIALES,

    // Obtener todas las rutinas dinámicas actualmente activas en la app
    getAll: function() {
      if (global.AppState && global.AppState.routines) {
        return global.AppState.routines;
      }
      return PLANTILLAS_OFICIALES;
    },

    getById: function(id) {
      if (!id) return null;
      var list = this.getAll();
      return list.find(function(r) { return r.id === id; }) || null;
    },

    // Borrar rutina de la aplicación
    borrarRutina: function(id) {
      if (!global.AppState) return false;
      return global.AppState.deleteRoutine(id);
    },

    // Restaurar el plan original de 6 días de Jose Perez
    restaurarOficiales: function() {
      if (!global.AppState) return false;
      return global.AppState.restoreDefaultRoutines();
    },

    // Borrar todas las rutinas para empezar completamente de cero
    borrarTodas: function() {
      if (!global.AppState) return false;
      global.AppState.clearAllRoutines();
      return true;
    },

    // Crear estructura vacía para entrenamiento libre
    crearEntrenamientoVacio: function() {
      return {
        id: "entreno_vacio_" + Date.now(),
        titulo: "Entrenamiento Libre",
        categoria: "Entreno Libre",
        descripcion: "Sesión libre sin rutina predefinida. Añade ejercicios sobre la marcha.",
        foco: ["General"],
        ejercicios: []
      };
    },

    // =========================================================================
    // EXPORTACIÓN DE RUTINAS (JSON, PDF PROFESIONAL Y WHATSAPP)
    // =========================================================================

    // 1. Exportar a JSON descargable
    exportarAJSON: function(routineId) {
      var r = this.getById(routineId);
      if (!r) return null;

      var exportObj = {
        app: "JPEREZCOACH PRO",
        version: "3.0.0",
        exportedAt: new Date().toISOString(),
        routine: r
      };

      var jsonStr = JSON.stringify(exportObj, null, 2);
      var blob = new Blob([jsonStr], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'rutina_' + (r.titulo || 'plan').toLowerCase().replace(/[^a-z0-9]/g, '_') + '.json';
      a.click();
      URL.revokeObjectURL(url);
      return jsonStr;
    },

    // 2. Exportar a texto formateado para WhatsApp
    exportarAWhatsApp: function(routineId) {
      var r = this.getById(routineId);
      if (!r) return '';

      var user = (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser : { name: 'Atleta' };
      var txt = '🏋️‍♂️ *PLAN DE ENTRENAMIENTO · JPEREZCOACH*\n';
      txt += '👤 *Atleta:* ' + user.name + '\n';
      txt += '📋 *Rutina:* ' + r.titulo + '\n';
      if (r.descripcion) txt += '💡 *Foco:* ' + r.descripcion + '\n';
      txt += '⏱️ *Tiempo estimado:* ' + (r.tiempoEstimadoMin || 60) + ' min\n\n';
      txt += '━━━━━━━━━━━━━━━━━━━━\n';
      txt += '📝 *EJERCICIOS Y DIRECTRICES:*\n';

      (r.ejercicios || []).forEach(function(ex, idx) {
        var numSets = ex.defaultSets ? ex.defaultSets.length : 3;
        txt += '\n*' + (idx + 1) + '. ' + ex.name + '*\n';
        txt += '   • ' + numSets + ' series × ' + (ex.targetReps || '8-10') + ' reps\n';
        if (ex.notes) txt += '   • 🎯 Directriz: ' + ex.notes + '\n';
      });

      txt += '\n━━━━━━━━━━━━━━━━━━━━\n';
      txt += '⚡ _Metodología JPEREZ: Series a RIR 0 y excéntricas controladas en 5s._\n';
      txt += '📲 JPEREZCOACH PRO: https://abraveses-de-tera.github.io/JPEREZCOACHAPP/\n';
      txt += '📱 WhatsApp Coach: +34 658 50 71 36';

      return txt;
    },

    // 3. Generar e Imprimir / Guardar como PDF profesional
    exportarAPDFImprimible: function(routineId) {
      var r = this.getById(routineId);
      if (!r) return;

      var user = (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser : { name: 'Atleta JPEREZ' };
      var printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Por favor permite las ventanas emergentes en tu navegador para generar el PDF.');
        return;
      }

      var html = '<!DOCTYPE html><html lang="es"><head>' +
        '<meta charset="UTF-8"><title>' + r.titulo + ' · JPEREZCOACH</title>' +
        '<style>' +
          '@page { size: A4 portrait; margin: 15mm; }' +
          'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; line-height: 1.4; margin: 0; padding: 20px; font-size: 13px; }' +
          '.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }' +
          '.logo-title { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }' +
          '.logo-title span { color: #0284c7; }' +
          '.meta-badge { font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 99px; font-weight: 700; }' +
          '.athlete-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 15px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px; }' +
          '.routine-heading { font-size: 18px; font-weight: 800; color: #0369a1; margin-bottom: 6px; }' +
          '.routine-desc { font-size: 12px; color: #64748b; margin-bottom: 15px; }' +
          'table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }' +
          'th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }' +
          'td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; vertical-align: top; }' +
          'tr:nth-child(even) td { background: #f8fafc; }' +
          '.ex-name { font-weight: 800; color: #0f172a; display: block; font-size: 13px; }' +
          '.ex-notes { color: #0284c7; font-size: 11px; font-weight: 600; margin-top: 2px; }' +
          '.checkbox-col { width: 35px; text-align: center; border: 1px solid #cbd5e1; border-radius: 3px; height: 16px; margin: 0 auto; }' +
          '.footer { border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }' +
        '</style></head><body>' +
        '<div class="header">' +
          '<div>' +
            '<div class="logo-title">JPEREZ<span>COACH</span></div>' +
            '<div style="font-size: 11px; color: #64748b; font-weight: 600;">ALTA INTENSIDAD · METODOLOGÍA OFICIAL</div>' +
          '</div>' +
          '<div style="text-align: right;">' +
            '<span class="meta-badge">' + (r.etiqueta || 'PLAN DE ENTRENO') + '</span>' +
            '<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Fecha: ' + new Date().toLocaleDateString() + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="athlete-bar">' +
          '<div><strong>Atleta:</strong> ' + user.name + '</div>' +
          '<div><strong>Entrenador:</strong> Jose Perez</div>' +
          '<div><strong>Objetivo:</strong> Hipertrofia & RIR 0</div>' +
        '</div>' +
        '<div class="routine-heading">' + r.titulo + '</div>' +
        '<div class="routine-desc">' + (r.descripcion || 'Plan estructurado para sobrecarga progresiva y control excéntrico estricto.') + '</div>' +
        '<table>' +
          '<thead>' +
            '<tr>' +
              '<th style="width: 5%;">#</th>' +
              '<th style="width: 45%;">EJERCICIO Y DIRECTRICES TÉCNICAS</th>' +
              '<th style="width: 15%;">SERIES</th>' +
              '<th style="width: 15%;">REPS</th>' +
              '<th style="width: 20%; text-align: center;">REGISTRO KG / OK</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>';

      (r.ejercicios || []).forEach(function(ex, idx) {
        var numSets = ex.defaultSets ? ex.defaultSets.length : 3;
        html += '<tr>' +
          '<td style="font-weight: 800; color: #64748b;">' + (idx + 1) + '</td>' +
          '<td><span class="ex-name">' + ex.name + '</span>' +
            (ex.notes ? '<div class="ex-notes">🎯 ' + ex.notes + '</div>' : '') +
          '</td>' +
          '<td><strong>' + numSets + ' series</strong></td>' +
          '<td>' + (ex.targetReps || '8-10') + '</td>' +
          '<td style="text-align: center; color: #94a3b8; font-size: 10px;">[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; kg ]</td>' +
        '</tr>';
      });

      html += '</tbody></table>' +
        '<div class="footer">' +
          '<div><strong>Jose Perez Coach</strong> · Tel: +34 658 50 71 36 · jperez@mail.com</div>' +
          '<div>jperezcoach.com</div>' +
        '</div>' +
        '<script>window.onload = function() { window.print(); };</' + 'script>' +
        '</body></html>';

      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  global.RutinasMaestras = RutinasMaestras;
})(window);
