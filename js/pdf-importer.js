// =============================================================================
// JPEREZCOACH PRO · IMPORTADOR Y ANALIZADOR INTELIGENTE DE RUTINAS EN PDF Y TEXTO
// Extracción de días, ejercicios, series, repeticiones y notas técnicas en el navegador
// =============================================================================

(function(global) {
  'use strict';

  // Configurar worker de PDF.js si está cargada la librería
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdf.worker.min.js';
  }

  // Diccionario de sinónimos de ejercicios comunes en PDFs de entrenadores
  var SINONIMOS_EJERCICIOS = {
    'dominadas': 'dominadas_jalon',
    'dominada': 'dominadas_jalon',
    'jalon al pecho': 'dominadas_jalon',
    'jalon dorsal': 'jalon_maquina',
    'remo con barra': 'remo_barra_smith',
    'remo smith': 'remo_barra_smith',
    'remo mancuerna': 'remo_unilateral',
    'remo serrucho': 'remo_unilateral',
    'remo punta': 'remo_t',
    'remo barra t': 'remo_t',
    'curl martillo': 'biceps_martillo_mancuernas',
    'martillo': 'biceps_martillo_mancuernas',
    'banco scott': 'scott_maquina_unilateral',
    'curl predicador': 'scott_maquina_unilateral',
    'press banca': 'press_banca_plano_barra',
    'press plano': 'press_plano_maquina',
    'press inclinado': 'press_inclinado_60',
    'aperturas': 'apertura_unilateral_desde_abajo',
    'cruces polea': 'apertura_unilateral_desde_abajo',
    'press militar': 'press_hombro_neutro',
    'press hombro': 'press_hombro_neutro',
    'elevaciones laterales': 'laterales_maquina',
    'laterales': 'laterales_maquina',
    'pajaros': 'pajaros_mancuerna_banco',
    'deltoides posterior': 'pajaros_mancuerna_banco',
    'sentadilla': 'sentadilla_trasera_barra',
    'sentadilla hack': 'hack_pisada_neutra',
    'hack': 'hack_pisada_neutra',
    'prensa': 'prensa_horizontal_unilateral',
    'prensa inclinada': 'prensa_45_grados',
    'zancadas': 'zancadas_estaticas_smith',
    'lunges': 'zancadas_estaticas_smith',
    'peso muerto': 'peso_muerto_barra',
    'peso muerto rumano': 'peso_muerto_rumano_mancuernas',
    'hip thrust': 'hip_thrust_unilateral',
    'curl femoral': 'femoral_tumbado',
    'femoral': 'femoral_tumbado',
    'femoral sentado': 'femoral_sentado',
    'extension cuadriceps': 'extension_cuadriceps',
    'extensiones': 'extension_cuadriceps',
    'gemelos': 'gemelo_de_pie',
    'gemelo': 'gemelo_de_pie',
    'press frances': 'press_frances_mancuernas',
    'triceps polea': 'polea_alta_cuerda',
    'cuerda triceps': 'polea_alta_cuerda',
    'curl barra z': 'curl_biceps_barra_z',
    'aductor': 'aductor',
    'aductores': 'aductor',
    'abductor': 'abductor_maquina'
  };

  function normalizarTexto(str) {
    if (!str) return '';
    return str.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  var PDFImporter = {
    // Guía explicativa para el usuario y entrenador
    getFormatGuidelines: function() {
      return {
        titulo: "Cómo preparar tu PDF para que la App lo reconozca al 100%",
        resumen: "El importador inteligente de JPEREZCOACH utiliza reconocimiento de texto estructurado. Si tu PDF sigue estas sencillas pautas, se convertirá automáticamente en una rutina interactiva con vídeos de técnica, series y cronómetros.",
        reglas: [
          {
            paso: "1. Encabezado del Plan",
            descripcion: "Incluye el título del plan y tu nombre al inicio (ej: 'PLAN DE ENTRENAMIENTO - Carlos Gómez · Hipertrofia')."
          },
          {
            paso: "2. Separación de Días",
            descripcion: "Separa cada día con un título claro que contenga la palabra 'DÍA', 'DIA', 'DAY' o el grupo muscular. Ejemplos:\n• DÍA 1: 1 PULL (Espalda y Bíceps)\n• DÍA 2: 2 PUSH (Pecho y Hombro)\n• DÍA 3: 3 LEG (Pierna Completa)"
          },
          {
            paso: "3. Formato de Ejercicios y Series",
            descripcion: "Escribe cada ejercicio en una línea seguido del número de series y repeticiones. Patrones reconocidos automáticamente:\n• 3 series de 8-10 reps\n• 3 × 4-6 reps (Pesadas)\n• 4x12 reps\n• Serie piramidal (12, 10, 8, 6, 4 reps)"
          },
          {
            paso: "4. Indicaciones y Metodología",
            descripcion: "Puedes añadir entre paréntesis o en la misma línea las directrices que la app convertirá en notas técnicas:\n• (Excéntrico en 5 seg / Bajadas en 5s)\n• (RIR 0 al fallo muscular)\n• (Rest-Pause: pausa 15s y 2-3 reps extra)\n• (Tempo 1-3-1)\n• (3 seg contracción isométrica arriba)"
          }
        ],
        ejemploTexto: "PLAN DE ENTRENAMIENTO · JPEREZCOACH\nAtleta: Carlos Gómez | Objetivo: Hipertrofia\n\nDÍA 1: PULL (Espalda y Bíceps)\n1. Dominadas/jalón: 3 series de 4-6 reps (Calienta 2 series y busca series pesadas)\n2. Remo T: 3 series de 4-6 reps (Excéntrico en 5 segundos)\n3. Jalón máquina: 3 series de 8-10 reps (RIR 0 al fallo concéntrico)\n4. Bíceps martillo mancuernas: 2 series de 8-10 reps (Rest pause)\n\nDÍA 2: PUSH (Pecho y Hombro)\n1. Press inclinado con mancuernas: 3 series de 8-10 reps\n2. Press plano máquina: Serie piramidal (12, 10, 8, 6, 4 reps)\n3. Elevaciones laterales: 3 series de 10-12 reps (3 seg isométrico arriba)"
      };
    },

    // Extraer texto plano ordenado línea a línea desde un PDF
    extractLinesFromPDF: async function(arrayBuffer) {
      if (typeof pdfjsLib === 'undefined') {
        throw new Error('La biblioteca PDF.js no está cargada. Asegúrate de tener conexión o los archivos locales.');
      }

      var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      var lineasTotales = [];

      for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        var page = await pdf.getPage(pageNum);
        var content = await page.getTextContent({ normalizeWhitespace: true });
        var items = content.items || [];
        if (items.length === 0) continue;

        // Agrupación adaptativa de texto por coordenada Y (tolerancia 6px)
        var lineasAgrupadas = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var str = (it.str || '').trim();
          if (!str) continue;

          var y = it.transform ? it.transform[5] : 0;
          var x = it.transform ? it.transform[4] : 0;

          var matchLine = lineasAgrupadas.find(function(l) { return Math.abs(l.y - y) <= 6.0; });
          if (matchLine) {
            matchLine.items.push({ x: x, str: it.str });
          } else {
            lineasAgrupadas.push({ y: y, items: [{ x: x, str: it.str }] });
          }
        }

        // Ordenar de arriba hacia abajo (Y descendente)
        lineasAgrupadas.sort(function(a, b) { return b.y - a.y; });

        // Ordenar horizontalmente (X ascendente)
        lineasAgrupadas.forEach(function(l) {
          l.items.sort(function(a, b) { return a.x - b.x; });
          var txt = l.items.map(function(item) { return item.str; }).join(' ').replace(/\s+/g, ' ').trim();
          if (txt) lineasTotales.push(txt);
        });
      }

      return lineasTotales;
    },

    // Analizador estructural de líneas (sea desde PDF o pegado como texto)
    parseLinesIntoRoutines: function(lines, sourceName) {
      if (!lines || lines.length === 0) {
        throw new Error('El documento o texto no contiene líneas reconocibles.');
      }

      var planTitulo = 'Rutina Importada';
      var atleta = '';
      var dias = [];
      var diaActual = null;

      // Expresiones regulares para detectar encabezados de días
      var regDia = /^(?:[•\-\*]?\s*)?(?:d[ií]a|day)\s*([0-9]{1,2})?\s*[:\-\.]?\s*(.*)/i;
      var regDiaNombre = /^(?:1\s*pull|2\s*push|3\s*leg|4\s*pull|5\s*arms|6\s*leg|torso|pierna|empuje|tir[oó]n|brazos|full\s*body)/i;

      for (var i = 0; i < lines.length; i++) {
        var linea = lines[i].trim();
        if (!linea) continue;

        // Intentar detectar título del plan o nombre de atleta en las primeras 6 líneas
        if (i < 6) {
          if (/atleta\s*[:\-]\s*(.*)/i.test(linea)) {
            atleta = linea.match(/atleta\s*[:\-]\s*(.*)/i)[1].trim();
          } else if (/plan\s*de\s*(?:entreno|entrenamiento)/i.test(linea) || /rutina/i.test(linea)) {
            planTitulo = linea;
          }
        }

        // Detectar si la línea es un encabezado de día
        var matchDia = linea.match(regDia);
        var esDiaPuro = regDiaNombre.test(linea);

        if (matchDia || esDiaPuro) {
          var numDia = matchDia && matchDia[1] ? matchDia[1] : (dias.length + 1);
          var nombreDia = matchDia ? matchDia[2] : linea;
          if (!nombreDia) nombreDia = 'Día ' + numDia;

          var tituloDia = 'Día ' + numDia + (nombreDia ? ': ' + nombreDia : '');
          if (esDiaPuro) tituloDia = linea;

          diaActual = {
            id: 'rutina_imp_' + Date.now() + '_' + (dias.length + 1),
            titulo: tituloDia,
            categoria: 'Rutina Importada',
            etiqueta: 'DÍA ' + numDia,
            descripcion: 'Importada desde: ' + (sourceName || 'Documento'),
            color: this.getColorForDay(dias.length + 1),
            tiempoEstimadoMin: 60,
            foco: this.detectMuscleFocus(tituloDia),
            ejercicios: []
          };
          dias.push(diaActual);
          continue;
        }

        // Si tenemos un día activo, intentar extraer ejercicio
        if (diaActual) {
          var ejercicioExtraido = this.parseExerciseLine(linea);
          if (ejercicioExtraido) {
            diaActual.ejercicios.push(ejercicioExtraido);
          }
        }
      }

      // Si no se detectaron días separados pero sí ejercicios, crear un día único
      if (dias.length === 0) {
        var diaUnico = {
          id: 'rutina_imp_' + Date.now(),
          titulo: planTitulo !== 'Rutina Importada' ? planTitulo : 'Entrenamiento Importado',
          categoria: 'Rutina Importada',
          etiqueta: 'RUTINA',
          descripcion: 'Plan importado desde: ' + (sourceName || 'PDF'),
          color: '#38bdf8',
          tiempoEstimadoMin: 60,
          foco: ['General'],
          ejercicios: []
        };

        lines.forEach(function(l) {
          var ex = PDFImporter.parseExerciseLine(l);
          if (ex) diaUnico.ejercicios.push(ex);
        });

        if (diaUnico.ejercicios.length > 0) {
          dias.push(diaUnico);
        }
      }

      return {
        tituloPlan: planTitulo,
        atleta: atleta,
        totalDias: dias.length,
        dias: dias
      };
    },

    // Extraer datos de una línea de ejercicio (nombre, series, reps, notas)
    parseExerciseLine: function(linea) {
      linea = linea.trim();
      // Ignorar líneas cortas o encabezados obvios
      if (linea.length < 4 || /^(página|page|fecha|objetivo|contacto|preparador)/i.test(linea)) {
        return null;
      }

      // Limpiar prefijo numérico como "1.", "1 -", "•"
      var cleanLine = linea.replace(/^[0-9]{1,2}[\.\-\)]\s*/, '').replace(/^[•\-\*]\s*/, '').trim();

      // Separar nombre e indicaciones por ":" o "("
      var nombreEjercicio = cleanLine;
      var indicaciones = '';

      if (cleanLine.indexOf(':') !== -1) {
        var partes = cleanLine.split(':');
        nombreEjercicio = partes[0].trim();
        indicaciones = partes.slice(1).join(':').trim();
      } else if (cleanLine.indexOf('(') !== -1) {
        var posParen = cleanLine.indexOf('(');
        nombreEjercicio = cleanLine.substring(0, posParen).trim();
        indicaciones = cleanLine.substring(posParen).trim();
      }

      // Si el nombre quedó vacío o contiene patrones de series, reajustar
      if (!nombreEjercicio || nombreEjercicio.length < 3) return null;

      // Buscar emparejamiento con el motor inteligente de EjerciciosDB
      var matchResult = global.EjerciciosDB ? global.EjerciciosDB.findBestMatch(nombreEjercicio) : null;
      var matchDB = matchResult ? matchResult.exercise : this.matchExerciseWithDatabase(nombreEjercicio);
      var videoId = matchResult ? matchResult.youtubeId : (matchDB ? matchDB.youtubeId : '');
      var isApprox = matchResult ? !!matchResult.isApproximate : false;

      // Determinar número de series y repeticiones
      var parsedSets = this.parseSetsAndReps(indicaciones || cleanLine);

      return {
        exerciseId: matchDB ? matchDB.id : ('ex_imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
        name: nombreEjercicio,
        matchedName: matchDB ? matchDB.nombre : '',
        targetReps: parsedSets.repsTarget || '8-10',
        notes: indicaciones || (matchDB ? matchDB.descripcion : ''),
        matchedId: matchDB ? matchDB.id : null,
        youtubeId: videoId,
        group: matchDB ? matchDB.grupo : 'General',
        matchConfidence: matchResult ? matchResult.confidence : (matchDB ? 0.9 : 0),
        isApproximate: isApprox,
        defaultSets: parsedSets.sets
      };
    },

    // Emparejar nombre de ejercicio con EjerciciosDB
    matchExerciseWithDatabase: function(rawName) {
      if (!global.EjerciciosDB) return null;
      var matchRes = global.EjerciciosDB.findBestMatch(rawName);
      if (matchRes && matchRes.exercise) return matchRes.exercise;

      var norm = normalizarTexto(rawName);

      // 1. Comprobar diccionario de sinónimos
      for (var syn in SINONIMOS_EJERCICIOS) {
        if (norm.indexOf(syn) !== -1) {
          var exFound = global.EjerciciosDB.getById(SINONIMOS_EJERCICIOS[syn]);
          if (exFound) return exFound;
        }
      }

      // 2. Comprobar todos los ejercicios de la BD por coincidencia exacta o subcadena
      var all = global.EjerciciosDB.getAll();
      for (var i = 0; i < all.length; i++) {
        var cand = all[i];
        var candNorm = normalizarTexto(cand.nombre);
        if (candNorm === norm || norm.indexOf(candNorm) !== -1 || candNorm.indexOf(norm) !== -1) {
          return cand;
        }
      }

      return null;
    },

    // Analizar series y repeticiones a partir del texto
    parseSetsAndReps: function(text) {
      var sets = [];
      var repsTarget = '8-10';

      // Serie piramidal: "12, 10, 8, 6, 4"
      if (/piramidal/i.test(text) || /12[\s,]+10[\s,]+8/i.test(text)) {
        var piramide = [12, 10, 8, 6, 4];
        piramide.forEach(function(r) {
          sets.push({ type: 'piramidal', reps: r.toString(), weight: 0 });
        });
        return { sets: sets, repsTarget: '12-10-8-6-4 Piramidal' };
      }

      // Patrón "3 x 8-10", "4 × 12", "3x10"
      var matchXxY = text.match(/([0-9]{1,2})\s*[x×]\s*([0-9]{1,2}(?:\s*-\s*[0-9]{1,2})?)/i);
      if (matchXxY) {
        var numSets = parseInt(matchXxY[1], 10);
        repsTarget = matchXxY[2].replace(/\s+/g, '');
        var setType = /pesad/i.test(text) ? 'pesada' : (/fallo|rir\s*0/i.test(text) ? 'fallo' : 'normal');

        for (var s = 1; s <= numSets; s++) {
          sets.push({ type: setType, reps: repsTarget, weight: 0 });
        }
        return { sets: sets, repsTarget: repsTarget };
      }

      // Patrón "3 series de 8-10 reps"
      var matchSeries = text.match(/([0-9]{1,2})\s*series(?:\s*de\s*([0-9]{1,2}(?:\s*-\s*[0-9]{1,2})?))?/i);
      if (matchSeries) {
        var count = parseInt(matchSeries[1], 10);
        if (matchSeries[2]) repsTarget = matchSeries[2].replace(/\s+/g, '');
        var sType = /pesad/i.test(text) ? 'pesada' : 'normal';

        for (var j = 1; j <= count; j++) {
          sets.push({ type: sType, reps: repsTarget, weight: 0 });
        }
        return { sets: sets, repsTarget: repsTarget };
      }

      // Por defecto: 3 series de 8-10
      for (var d = 1; d <= 3; d++) {
        sets.push({ type: 'normal', reps: '8-10', weight: 0 });
      }
      return { sets: sets, repsTarget: '8-10' };
    },

    detectMuscleFocus: function(title) {
      var t = title.toLowerCase();
      var focus = [];
      if (/pull|espalda|dorsal/i.test(t)) focus.push('Espalda');
      if (/push|pecho|pectoral/i.test(t)) focus.push('Pecho');
      if (/leg|pierna|cuadriceps|sentadilla/i.test(t)) focus.push('Pierna');
      if (/arms|brazo|biceps|triceps/i.test(t)) focus.push('Brazos');
      if (/hombro|deltoid/i.test(t)) focus.push('Hombro');
      return focus.length > 0 ? focus : ['General'];
    },

    getColorForDay: function(index) {
      var colors = ['#38bdf8', '#00d2ff', '#10b981', '#818cf8', '#ec4899', '#f59e0b', '#06b6d4'];
      return colors[(index - 1) % colors.length];
    },

    // Analizar archivo PDF completo desde input file
    parsePDFFile: async function(file) {
      if (!file) throw new Error('Selecciona un archivo PDF válido.');
      var arrayBuffer = await file.arrayBuffer();
      var lines = await this.extractLinesFromPDF(arrayBuffer);
      return this.parseLinesIntoRoutines(lines, file.name);
    },

    // Analizar texto copiado y pegado manualmente
    parsePlainText: function(text, optionalName) {
      if (!text || !text.trim()) throw new Error('El texto proporcionado está vacío.');
      var lines = text.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);
      return this.parseLinesIntoRoutines(lines, optionalName || 'Texto Pegado');
    }
  };

  global.PDFImporter = PDFImporter;
})(window);
