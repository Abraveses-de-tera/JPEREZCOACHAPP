// =============================================================================
// JPEREZCOACH PRO · BASE DE DATOS MAESTRA DE EJERCICIOS Y VIDEOTECA (140+ EJERCICIOS)
// Algoritmo de emparejamiento semántico inteligente, vídeos HD de técnica y directrices oficiales
// =============================================================================

(function(global) {
  'use strict';

  // Función de normalización de cadenas de texto (insensible a mayúsculas, tildes y símbolos)
  function normalizarTexto(str) {
    if (!str) return '';
    return str.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extractor de ID de YouTube desde URLs completas, enlaces cortos (youtu.be), Shorts o ID directo
  function extractYouTubeId(urlOrId) {
    if (!urlOrId) return '';
    var clean = urlOrId.toString().trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    var match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i);
    return match ? match[1] : '';
  }

  // Palabras vacías en español e inglés a descartar en el análisis de tokens
  var STOP_WORDS = {
    'de': 1, 'del': 1, 'con': 1, 'en': 1, 'el': 1, 'la': 1, 'los': 1, 'las': 1,
    'un': 1, 'una': 1, 'para': 1, 'al': 1, 'por': 1, 'sobre': 1, 'y': 1, 'o': 1,
    'a': 1, 'banco': 1, 'agarre': 1, 'tipo': 1, 'estilo': 1, 'en': 1, 'the': 1,
    'of': 1, 'with': 1, 'in': 1, 'on': 1, 'for': 1, 'and': 1, 'to': 1
  };

  // Palabras biomecánicas clave con peso doble en la puntuación
  var KEYWORD_WEIGHTS = {
    'inclinado': 2.5, 'inclinada': 2.5, 'incline': 2.5,
    'declinado': 2.5, 'declinada': 2.5, 'decline': 2.5,
    'plano': 2.0, 'plana': 2.0, 'flat': 2.0,
    'mancuerna': 2.2, 'mancuernas': 2.2, 'dumbbell': 2.2,
    'barra': 2.2, 'barbell': 2.2,
    'polea': 2.2, 'poleas': 2.2, 'cable': 2.2,
    'maquina': 2.0, 'machine': 2.0,
    'smith': 2.5, 'multipower': 2.5,
    'unilateral': 2.2, 'single': 2.0,
    'martillo': 2.5, 'hammer': 2.5,
    'scott': 2.5, 'predicador': 2.5, 'preacher': 2.5,
    'gironda': 2.5, 'seated': 1.8,
    'katana': 2.8,
    'hack': 2.5,
    'bulgara': 2.8, 'bulgarian': 2.8,
    'sumo': 2.5,
    'rumano': 2.8, 'romanian': 2.8, 'rdl': 2.8,
    'fondos': 2.5, 'dips': 2.5, 'paralelas': 2.5,
    'dominadas': 2.5, 'pullup': 2.5, 'pullups': 2.5, 'chin': 2.5,
    'jalon': 2.2, 'pulldown': 2.5,
    'remo': 2.2, 'row': 2.2,
    'press': 2.0,
    'sentadilla': 2.2, 'squat': 2.2,
    'prensa': 2.5, 'legpress': 2.5,
    'curl': 2.0,
    'extension': 2.0, 'extensiones': 2.0,
    'elevaciones': 2.0, 'laterales': 2.2, 'frontales': 2.2, 'lateral': 2.2,
    'pajaros': 2.5, 'reardelt': 2.5,
    'aperturas': 2.2, 'cruces': 2.2, 'fly': 2.2, 'flyes': 2.2,
    'thrust': 2.8, 'hip': 2.5, 'gluteo': 2.2,
    'gemelo': 2.2, 'gemelos': 2.2, 'calf': 2.2, 'soleo': 2.5,
    'femoral': 2.5, 'isquios': 2.5, 'hamstring': 2.5,
    'cuadriceps': 2.2, 'quad': 2.2,
    'crunch': 2.5, 'abdominales': 2.2, 'abs': 2.2, 'core': 2.0,
    'face': 2.5, 'facepull': 2.8
  };

  function extraerTokensRelevantes(normStr) {
    if (!normStr) return [];
    var raw = normStr.split(' ');
    var res = [];
    for (var i = 0; i < raw.length; i++) {
      var t = raw[i].trim();
      if (t.length > 2 && !STOP_WORDS[t]) {
        res.push(t);
      }
    }
    return res;
  }

  function uniqueArray(arr) {
    var seen = {};
    return arr.filter(function(item) {
      if (!seen[item]) {
        seen[item] = true;
        return true;
      }
      return false;
    });
  }

  function calcularPuntuacionTokens(queryTokens, candTokens, normQuery, candNorm) {
    if (queryTokens.length === 0 || candTokens.length === 0) return 0;

    var intersectionScore = 0;
    var totalWeight = 0;

    for (var i = 0; i < queryTokens.length; i++) {
      var q = queryTokens[i];
      var w = KEYWORD_WEIGHTS[q] || 1.0;
      totalWeight += w;

      for (var j = 0; j < candTokens.length; j++) {
        var c = candTokens[j];
        if (q === c) {
          intersectionScore += w;
          break;
        } else if (q.length >= 4 && c.length >= 4 && (q.indexOf(c) !== -1 || c.indexOf(q) !== -1)) {
          intersectionScore += w * 0.8;
          break;
        }
      }
    }

    var score = totalWeight > 0 ? (intersectionScore / totalWeight) : 0;

    // Bonus por orden y contención de subcadena exacta
    if (normQuery.indexOf(candNorm) !== -1 || candNorm.indexOf(normQuery) !== -1) {
      score += 0.25;
    }

    return Math.min(1.0, score);
  }

  // ===========================================================================
  // CATÁLOGO MAESTRO EXPANDIDO (140+ EJERCICIOS) CON VÍDEOS DE TÉCNICA HD
  // ===========================================================================
  var EJERCICIOS_MAESTROS = [
    // -------------------------------------------------------------------------
    // 1. ESPALDA Y DORSAL (OFICIALES Y COMPLEMENTARIOS)
    // -------------------------------------------------------------------------
    {
      id: "dominadas_jalon",
      nombre: "Dominadas/jalón al pecho",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Peso Corporal / Polea",
      youtubeId: "orXhTMDnQkI",
      aliases: ["dominadas", "dominada", "jalon al pecho", "jalon polea", "lat pulldown", "pullups", "pull up", "dominadas lastradas"],
      descripcion: "Calienta 2-3 series y busca series pesadas a RIR 0 con rango completo.",
      tips: ["Rango de recorrido completo", "Depresión escapular antes de traccionar", "Pausa de 1 segundo en máxima contracción"]
    },
    {
      id: "dominadas_pronas",
      nombre: "Dominadas pronas lastradas",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Peso Corporal / Lastre",
      youtubeId: "orXhTMDnQkI",
      aliases: ["dominadas pronas", "overhand pullups", "dominadas en barra fija", "pull ups lastre"],
      descripcion: "Tracción vertical pura con agarre prono abierto. Control excéntrico en 5s.",
      tips: ["Tracciona llevando el pecho hacia la barra", "No utilices balanceo ni impulso de cadera", "Baja lento sintiendo el estiramiento"]
    },
    {
      id: "dominadas_supinas_lastradas",
      nombre: "Dominadas supinas lastradas (Chin-ups)",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Peso Corporal / Lastre",
      youtubeId: "orXhTMDnQkI",
      aliases: ["dominadas supinas", "chin ups", "chin up", "dominada invertida", "supinated pullup"],
      descripcion: "Mayor activación de bíceps y dorsal inferior en agarre supino.",
      tips: ["Palmas mirando hacia ti", "Pecho alto al subir", "Extensión completa en la fase excéntrica"]
    },
    {
      id: "dominadas_neutras",
      nombre: "Dominadas con agarre neutro",
      grupo: "Espalda",
      secundario: "Braquial",
      equipo: "Peso Corporal / Barra Paralela",
      youtubeId: "orXhTMDnQkI",
      aliases: ["dominadas neutras", "neutral grip pullups", "dominadas agarre paralelo"],
      descripcion: "Máxima comodidad para hombros y codos con agarre neutro.",
      tips: ["Codos viajan pegados hacia el costado", "Pausa isométrica de 1 segundo arriba"]
    },
    {
      id: "remo_t",
      nombre: "Remo T con apoyo o barra en punta",
      grupo: "Espalda",
      secundario: "Deltoides Posterior",
      equipo: "Barra / Máquina",
      youtubeId: "X2-yKYyjWAY",
      aliases: ["remo t", "remo barra t", "t-bar row", "t bar row", "remo punta", "remo en t"],
      descripcion: "Excéntrico en 5 segundos. Control estricto del torso con máxima carga.",
      tips: ["Espalda fija a 45 grados", "Controla la bajada en 5 segundos exactos", "Sin balanceo con las piernas"]
    },
    {
      id: "jalon_maquina",
      nombre: "Jalón en máquina convergente",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Máquina",
      youtubeId: "pcodNSB6NXQ",
      aliases: ["jalon maquina", "machine pulldown", "jalon convergente", "jalon de placas", "polea dorsal maquina"],
      descripcion: "RIR 0 al fallo concéntrico + repeticiones parciales en estiramiento.",
      tips: ["Pecho alto al traccionar", "Al llegar al fallo concéntrico, saca 2-3 parciales en estiramiento"]
    },
    {
      id: "jalon_al_pecho_neutro",
      nombre: "Jalón al pecho agarre neutro cerrado (Agarre V)",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Polea",
      youtubeId: "rudpTb4A0X8",
      aliases: ["jalon neutro", "jalon agarre cerrado", "jalon agarre v", "v-bar pulldown", "polea al pecho agarre estrecho"],
      descripcion: "Tracción cerrada que maximiza la longitud de estiramiento del dorsal.",
      tips: ["Tracciona llevando los codos hacia las costillas", "Mantén el torso con ligera inclinación de 10-15°"]
    },
    {
      id: "jalon_al_pecho_ancho",
      nombre: "Jalón al pecho agarre ancho prono",
      grupo: "Espalda",
      secundario: "Redondo Mayor",
      equipo: "Polea",
      youtubeId: "pcodNSB6NXQ",
      aliases: ["jalon ancho", "wide lat pulldown", "jalon prono ancho", "polea al pecho barra ancha"],
      descripcion: "Enfoque en la amplitud y expansión dorsal. Excéntrica en 4-5 segundos.",
      tips: ["Baja la barra hasta la parte superior del esternón", "Abre los codos en el plano escapular"]
    },
    {
      id: "jalon_al_pecho_supino",
      nombre: "Jalón al pecho agarre supino cerrado",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Polea",
      youtubeId: "pcodNSB6NXQ",
      aliases: ["jalon supino", "reverse lat pulldown", "jalon invertido polea"],
      descripcion: "Tirón vertical con palmas hacia el cuerpo. Máxima potencia y carga.",
      tips: ["Mantén los codos cerrados", "Extensión completa arriba sin soltar la tensión de las escápulas"]
    },
    {
      id: "jalon_unilateral_polea_alta",
      nombre: "Jalón unilateral en polea alta",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Polea",
      youtubeId: "rudpTb4A0X8",
      aliases: ["jalon unilateral", "jalon una mano", "single arm lat pulldown", "polea alta unilateral"],
      descripcion: "Alineación biomecánica perfecta con las fibras ilíacas del dorsal.",
      tips: ["De rodillas o sentado con estabilidad firme", "Lleva el codo hacia la cadera en trayectoria diagonal"]
    },
    {
      id: "remo_unilateral",
      nombre: "Remo unilateral con mancuerna (Serrucho)",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Mancuerna",
      youtubeId: "hOBTkGA4mHE",
      aliases: ["remo unilateral", "remo con mancuerna", "remo mancuerna", "remo serrucho", "one arm dumbbell row", "remo una mano mancuerna"],
      descripcion: "Excéntrico en 5 segundos con mancuerna. Tirón hacia la cadera.",
      tips: ["Lleva la mancuerna hacia el bolsillo de la cadera", "Baja lento en 5s sintiendo el dorsal"]
    },
    {
      id: "remo_barra_smith",
      nombre: "Remo con barra en máquina Smith (Multipower)",
      grupo: "Espalda",
      secundario: "Trapecio Medio",
      equipo: "Smith",
      youtubeId: "lTQJFDyQq0s",
      aliases: ["remo smith", "remo en multipower", "smith machine row", "remo barra multipower"],
      descripcion: "Trayectoria guiada que permite eliminar la fatiga lumbar y aislar la espalda.",
      tips: ["Torso inclinado a 70 grados", "Tracciona hacia el ombligo manteniendo el pecho expandido"]
    },
    {
      id: "remo_con_barra_90",
      nombre: "Remo con barra a 90 grados (Remo Pendlay / Libre)",
      grupo: "Espalda",
      secundario: "Erectores Espinales",
      equipo: "Barra",
      youtubeId: "lTQJFDyQq0s",
      aliases: ["remo con barra", "remo barra", "barbell row", "bent over row", "remo pendlay", "remo 90 grados"],
      descripcion: "Ejercicio básico de masa y densidad de espalda alta y media.",
      tips: ["Espalda paralela al suelo o inclinada 45°", "Codos flexionados traccionando hacia la cadera"]
    },
    {
      id: "remo_con_barra_supino",
      nombre: "Remo con barra agarre supino (Yates Row)",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Barra",
      youtubeId: "lTQJFDyQq0s",
      aliases: ["remo yates", "yates row", "remo supino barra", "reverse grip barbell row"],
      descripcion: "Inclinación de 60-70 grados con agarre supino para sobrecargar el dorsal bajo.",
      tips: ["Tracción hacia el pubis", "Codos muy pegados a los costados"]
    },
    {
      id: "remo_gironda",
      nombre: "Remo Gironda en polea baja agarre neutro",
      grupo: "Espalda",
      secundario: "Romboides",
      equipo: "Polea",
      youtubeId: "iyOM6y5ADAQ",
      aliases: ["remo gironda", "seated cable row", "remo sentado en polea", "remo polea baja", "remo sentado polea"],
      descripcion: "Estiramiento completo escapular y compresión isométrica de 1s al contraer.",
      tips: ["Permite que las escápulas protraigan alante", "Tracciona contrayendo hacia el abdomen"]
    },
    {
      id: "remo_gironda_ancho",
      nombre: "Remo Gironda con barra ancha prono",
      grupo: "Espalda",
      secundario: "Deltoides Posterior / Trapecio",
      equipo: "Polea",
      youtubeId: "iyOM6y5ADAQ",
      aliases: ["remo gironda ancho", "wide grip seated cable row", "remo polea baja ancho"],
      descripcion: "Enfoque en deltoides posterior, trapecio medio y romboides.",
      tips: ["Tracciona hacia la parte superior del estómago manteniendo codos abiertos"]
    },
    {
      id: "remo_maquina_agarre_supino",
      nombre: "Remo máquina agarre supino",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Máquina",
      youtubeId: "iyOM6y5ADAQ",
      aliases: ["remo maquina supino", "machine row supinated", "remo placas supino"],
      descripcion: "Soporte en el pecho para anular el estrés espinal.",
      tips: ["Pecho apoyado con firmeza", "Tracción con los codos liderando el movimiento"]
    },
    {
      id: "remo_mancuerna_banco_inclinado",
      nombre: "Remo con mancuernas en banco inclinado (Pecho apoyado)",
      grupo: "Espalda",
      secundario: "Romboides",
      equipo: "Mancuerna / Banco",
      youtubeId: "iyOM6y5ADAQ",
      aliases: ["remo banco inclinado", "chest supported dumbbell row", "remo mancuernas apoyado"],
      descripcion: "Aislamiento perfecto de espalda alta sin fatiga de lumbares.",
      tips: ["Banco a 30-45 grados", "Excéntrico de 4 segundos sin rebotar"]
    },
    {
      id: "low_row",
      nombre: "Low row en máquina unilateral",
      grupo: "Espalda",
      secundario: "Dorsal Inferior",
      equipo: "Máquina",
      youtubeId: "Zigz-qCgY6U",
      aliases: ["low row", "remo bajo maquina", "low row unilateral", "remo bajo"],
      descripcion: "Tirón en ángulo ascendente-descendente para dorsal ilíaco.",
      tips: ["Contracción al máximo en el punto final", "No gires el torso exageradamente"]
    },
    {
      id: "remo_meadows",
      nombre: "Remo Meadows en Landmine / Esquina",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Barra / Landmine",
      youtubeId: "hOBTkGA4mHE",
      aliases: ["remo meadows", "meadows row", "landmine row", "remo esquina barra"],
      descripcion: "Tracción con codo perpendicular que sobrecarga la masa dorsal.",
      tips: ["Utiliza agarre overhand por el extremo de la barra", "Cadera retrasada para estabilidad"]
    },
    {
      id: "pullover_polea_alta",
      nombre: "Pullover en polea alta con barra recta o cuerda",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Polea",
      youtubeId: "nP9KArjEDeU",
      aliases: ["pullover polea", "cable pullover", "straight arm pulldown", "pullover dorsal polea", "pullover con cuerda"],
      descripcion: "Aislamiento monoarticular del dorsal ancho sin intervención de bíceps.",
      tips: ["Brazos casi extendidos con leve semiflexión", "Lleva la barra hacia los muslos comprimiendo el dorsal"]
    },
    {
      id: "pullover_maquina_dorsal",
      nombre: "Pullover en máquina dorsal",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Máquina",
      youtubeId: "nP9KArjEDeU",
      aliases: ["pullover maquina", "machine pullover", "pullover dorsal maquina"],
      descripcion: "Rango de recorrido de 180 grados con resistencia constante en todo el arco.",
      tips: ["Apoya los codos en las almohadillas", "Excéntrica profunda en 5 segundos"]
    },
    {
      id: "hiperextension_lumbar_con_peso",
      nombre: "Hiperextensión lumbar con disco",
      grupo: "Espalda",
      secundario: "Glúteos / Isquios",
      equipo: "Banco Romano / Disco",
      youtubeId: "5mzen3mhQOE",
      aliases: ["hiperextensiones", "hiperextension lumbar", "back extension", "lumbares en banco", "hiperextensiones lastradas"],
      descripcion: "Fortalecimiento de la cadena posterior y erectores de la columna.",
      tips: ["Sube alineando el torso con las piernas sin hiperextender el cuello", "Baja controlando"]
    },
    {
      id: "buenos_dias_barra",
      nombre: "Buenos días con barra (Good Mornings)",
      grupo: "Espalda",
      secundario: "Isquiosurales",
      equipo: "Barra",
      youtubeId: "5mzen3mhQOE",
      aliases: ["buenos dias", "good mornings", "buenos dias con barra"],
      descripcion: "Flexión de cadera con barra en espalda para erectores e isquios.",
      tips: ["Empuja la cadera hacia atrás", "Espalda neutra en todo el recorrido"]
    },
    {
      id: "encogimientos_trapecio_barra",
      nombre: "Encogimientos de trapecio con barra (Shrugs)",
      grupo: "Espalda",
      secundario: "Trapecio Superior",
      equipo: "Barra / Smith",
      youtubeId: "5mzen3mhQOE",
      aliases: ["encogimientos barra", "barbell shrugs", "trapecio barra", "shrugs con barra"],
      descripcion: "Elevación escapular pura para trapecios superiores.",
      tips: ["Sube los hombros hacia las orejas", "Pausa isométrica de 2 segundos arriba"]
    },
    {
      id: "encogimientos_trapecio_mancuernas",
      nombre: "Encogimientos de trapecio con mancuernas",
      grupo: "Espalda",
      secundario: "Trapecio Superior",
      equipo: "Mancuerna",
      youtubeId: "5mzen3mhQOE",
      aliases: ["encogimientos mancuernas", "dumbbell shrugs", "trapecio mancuernas", "shrugs mancuerna"],
      descripcion: "Mayor rango anatómico al permitir los brazos a los lados.",
      tips: ["Sin rotar los hombros en círculos", "Movimiento vertical estricto"]
    },

    // -------------------------------------------------------------------------
    // 2. PECHO / PECTORAL
    // -------------------------------------------------------------------------
    {
      id: "press_inclinado_60",
      nombre: "Press inclinado 60% con mancuernas",
      grupo: "Pecho",
      secundario: "Hombro",
      equipo: "Mancuerna / Banco",
      youtubeId: "DfgI6sGn9iQ",
      aliases: ["press inclinado", "press inclinado mancuernas", "incline dumbbell press", "press banca inclinada", "press mancuernas inclinado"],
      descripcion: "Inclinación a 60% para activar la porción clavicular del pectoral.",
      tips: ["Codos a 45 grados respecto al torso", "Retracción escapular en el banco", "Pausa en el punto bajo"]
    },
    {
      id: "press_inclinado_barra",
      nombre: "Press inclinado con barra olímpica",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Barra / Banco Inclinado",
      youtubeId: "DfgI6sGn9iQ",
      aliases: ["press inclinado barra", "incline barbell bench press", "banca inclinada barra"],
      descripcion: "Sobrecarga de fuerza en el haz clavicular con barra libre.",
      tips: ["Baja la barra rozando la clavícula", "Pies clavados en el suelo para empuje estable"]
    },
    {
      id: "press_plano_maquina",
      nombre: "Press plano máquina",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Máquina",
      youtubeId: "fGpg1zE-Kd0",
      aliases: ["press plano maquina", "chest press machine", "press de pecho maquina", "maquina press pecho"],
      descripcion: "Serie piramidal (12, 10, 8, 6, 4 reps) subiendo carga progresiva.",
      tips: ["Subir peso en cada tramo", "Empuje firme sin levantar los glúteos del asiento"]
    },
    {
      id: "press_banca_plano_barra",
      nombre: "Press de banca plano con barra",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Barra",
      youtubeId: "DfgI6sGn9iQ",
      aliases: ["press banca", "press de banca", "bench press", "press banca plano", "press plano con barra", "banca plana"],
      descripcion: "Básico multiarticular para pectoral mayor. Excéntrica controlada.",
      tips: ["Arco lumbar fisiológico natural", "Junta escápulas atrás y abajo", "Toca el pecho con control"]
    },
    {
      id: "press_plano_mancuernas",
      nombre: "Press plano con mancuernas",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Mancuerna",
      youtubeId: "fGpg1zE-Kd0",
      aliases: ["press plano mancuernas", "flat dumbbell press", "press con mancuernas plano", "press mancuernas plano"],
      descripcion: "Mayor rango de recorrido y aducción horizontal completa al subir.",
      tips: ["Baja hasta sentir el estiramiento del pectoral", "Empuja juntando las mancuernas arriba sin chocarlas"]
    },
    {
      id: "press_declinado_barra",
      nombre: "Press declinado con barra",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Barra / Banco Declinado",
      youtubeId: "DfgI6sGn9iQ",
      aliases: ["press declinado", "decline bench press", "press declinado barra"],
      descripcion: "Énfasis en el haz esternal inferior del pectoral con menor tensión en hombros.",
      tips: ["Baja hacia la línea inferior del pecho", "Mantén el bloqueo de las piernas en los rodillos"]
    },
    {
      id: "press_declinado_mancuernas",
      nombre: "Press declinado con mancuernas",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Mancuerna / Banco Declinado",
      youtubeId: "fGpg1zE-Kd0",
      aliases: ["press declinado mancuernas", "decline dumbbell press"],
      descripcion: "Recorrido amplio para el pectoral inferior con control individual de brazos.",
      tips: ["Codos a 45°", "Subida explosiva y bajada lenta en 4 segundos"]
    },
    {
      id: "press_maquina_convergente",
      nombre: "Press de pecho en máquina convergente",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Máquina",
      youtubeId: "fGpg1zE-Kd0",
      aliases: ["press convergente", "convergente pecho", "chest press convergente"],
      descripcion: "Movimiento convergente que reproduce la curva anatómica de aducción.",
      tips: ["Ajusta la altura del asiento para que los agarres queden al centro del pecho"]
    },
    {
      id: "apertura_unilateral_desde_abajo",
      nombre: "Apertura unilateral desde abajo en polea",
      grupo: "Pecho",
      secundario: "Pectoral Clavicular",
      equipo: "Polea",
      youtubeId: "nP9KArjEDeU",
      aliases: ["aperturas polea baja", "apertura unilateral", "low to high cable fly", "cruces polea baja", "aperturas desde abajo"],
      descripcion: "Bajadas lentas y controladas en 5 segundos en polea baja.",
      tips: ["Tirón hacia arriba y adentro cruzando la línea media", "Excéntrica de 5s estirando el pectoral"]
    },
    {
      id: "aperturas_mancuerna_plano",
      nombre: "Aperturas con mancuernas en banco plano",
      grupo: "Pecho",
      secundario: "Pectoral Mayor",
      equipo: "Mancuerna",
      youtubeId: "nP9KArjEDeU",
      aliases: ["aperturas", "aperturas mancuernas", "dumbbell flyes", "aperturas planas", "aperturas en banco"],
      descripcion: "Sobrecarga en la posición de máximo estiramiento del pectoral.",
      tips: ["Ligera flexión en los codos fija durante todo el ejercicio", "Abre hasta sentir estiramiento seguro"]
    },
    {
      id: "aperturas_inclinadas_mancuernas",
      nombre: "Aperturas inclinadas con mancuernas",
      grupo: "Pecho",
      secundario: "Pectoral Clavicular",
      equipo: "Mancuerna / Banco Inclinado",
      youtubeId: "nP9KArjEDeU",
      aliases: ["aperturas inclinadas", "incline dumbbell fly", "aperturas banco inclinado"],
      descripcion: "Estiramiento profundo en banco inclinado a 30-45 grados.",
      tips: ["Movimiento en semicírculo", "No juntes los codos de golpe al subir"]
    },
    {
      id: "peck_deck_contractor",
      nombre: "Peck Deck / Contractor de pecho en máquina",
      grupo: "Pecho",
      secundario: "Pectoral Mayor",
      equipo: "Máquina",
      youtubeId: "nP9KArjEDeU",
      aliases: ["peck deck", "pec deck", "contractora", "contractor pecho", "aperturas maquina", "butterfly maquina"],
      descripcion: "Aislamiento biomecánico con máxima tensión continua en contracción.",
      tips: ["Pecho apoyado en el respaldo", "Pausa de 1 segundo juntando los brazos", "Excéntrica en 4 segundos"]
    },
    {
      id: "cruces_polea_media",
      nombre: "Cruces en polea media / Crossover",
      grupo: "Pecho",
      secundario: "Pectoral Mayor",
      equipo: "Polea",
      youtubeId: "nP9KArjEDeU",
      aliases: ["cruces polea", "cable crossover", "crossover", "cruces en polea", "cruces poleas altas"],
      descripcion: "Tensión constante en todo el rango con cruce de muñecas al final.",
      tips: ["Paso adelantado para base firme", "Codos fijos con leve flexión", "Junta las manos al frente"]
    },
    {
      id: "cruces_poleas_altas",
      nombre: "Cruces en poleas altas hacia abajo",
      grupo: "Pecho",
      secundario: "Pectoral Inferior",
      equipo: "Polea",
      youtubeId: "nP9KArjEDeU",
      aliases: ["cruces poleas altas", "high cable fly", "cruce polea alta"],
      descripcion: "Aducción hacia abajo para aislar la porción esternal e inferior.",
      tips: ["Torso inclinado 30°", "Tirón diagonal hacia las caderas"]
    },
    {
      id: "fondos_en_paralelas",
      nombre: "Fondos en paralelas para pecho (Dips con inclinación)",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Paralelas / Peso Corporal",
      youtubeId: "qdRDkVqVeOY",
      aliases: ["fondos paralelas", "dips pecho", "chest dips", "fondos en paralelas lastrados", "paralelas"],
      descripcion: "Torso inclinado 30-45° hacia adelante para incidir en el pectoral inferior.",
      tips: ["Codos abiertos hacia afuera", "Baja hasta que el hombro quede alineado con el codo", "Empuja sin bloquear"]
    },
    {
      id: "pullover_mancuerna_pecho",
      nombre: "Pullover con mancuerna en banco plano",
      grupo: "Pecho",
      secundario: "Serratos / Dorsal",
      equipo: "Mancuerna / Banco",
      youtubeId: "nP9KArjEDeU",
      aliases: ["pullover mancuerna", "dumbbell pullover", "pullover pecho"],
      descripcion: "Apertura de la caja torácica y estiramiento del pectoral superior.",
      tips: ["Apoyo perpendicular de la espalda alta en el banco", "Baja la mancuerna por detrás de la cabeza controlando"]
    },
    {
      id: "flexiones_pecho",
      nombre: "Flexiones de pecho lastradas (Push-ups)",
      grupo: "Pecho",
      secundario: "Tríceps / Core",
      equipo: "Peso Corporal / Disco",
      youtubeId: "fGpg1zE-Kd0",
      aliases: ["flexiones", "push ups", "pushups", "flexiones de pecho", "lagartijas"],
      descripcion: "Excelente como finalizador o superserie con bajadas en 5s.",
      tips: ["Cuerpo rígido en plancha", "Baja hasta rozar el suelo con el pecho"]
    },

    // -------------------------------------------------------------------------
    // 3. PIERNA (CUÁDRICEPS, ISQUIOS, GLÚTEO Y GEMELOS)
    // -------------------------------------------------------------------------
    {
      id: "prensa_horizontal_unilateral",
      nombre: "Prensa horizontal unilateral",
      grupo: "Pierna",
      secundario: "Glúteo",
      equipo: "Máquina",
      youtubeId: "uTjkm8DXeJY",
      aliases: ["prensa horizontal", "prensa unilateral", "single leg press", "prensa horizontal una pierna"],
      descripcion: "Máximo recorrido por pierna con apoyo firme.",
      tips: ["Pie alineado con la rodilla", "Bajar profundo sin despegar la zona lumbar del respaldo"]
    },
    {
      id: "prensa_45_grados",
      nombre: "Prensa de 45 grados con discos",
      grupo: "Pierna",
      secundario: "Glúteos",
      equipo: "Máquina",
      youtubeId: "uTjkm8DXeJY",
      aliases: ["prensa", "prensa 45", "leg press 45", "prensa inclinada", "prensa de piernas"],
      descripcion: "Permite manejar altas cargas de volumen para hipertrofia de cuádriceps.",
      tips: ["Pisada media para cuádriceps", "Baja profundo sin retroversión pélvica", "No bloquees las rodillas arriba"]
    },
    {
      id: "hack_pisada_neutra",
      nombre: "Sentadilla Hack en máquina pisada neutra",
      grupo: "Pierna",
      secundario: "Cuádriceps",
      equipo: "Máquina",
      youtubeId: "8Gk8snrY8u4",
      aliases: ["hack", "sentadilla hack", "hack squat", "hack pisada neutra", "hack squat machine"],
      descripcion: "Bajadas controladas de 5 segundos con pisada neutra en sentadilla Hack.",
      tips: ["5 segundos reales de bajada", "Pausa en el fondo", "Empuje con el mediopié"]
    },
    {
      id: "sentadilla_trasera_barra",
      nombre: "Sentadilla trasera con barra olímpica (Back Squat)",
      grupo: "Pierna",
      secundario: "Glúteo / Core",
      equipo: "Barra",
      youtubeId: "8Gk8snrY8u4",
      aliases: ["sentadilla", "sentadillas", "squat", "back squat", "sentadilla con barra", "sentadilla trasera"],
      descripcion: "El ejercicio rey de tren inferior. Profundidad rompiendo el paralelo.",
      tips: ["Barra apoyada sobre trapecios", "Empuja las rodillas hacia afuera alineadas con los pies", "Pecho erguido"]
    },
    {
      id: "sentadilla_barra_baja",
      nombre: "Sentadilla trasera barra baja (Low Bar Squat)",
      grupo: "Pierna",
      secundario: "Glúteo / Isquios",
      equipo: "Barra",
      youtubeId: "8Gk8snrY8u4",
      aliases: ["sentadilla barra baja", "low bar squat"],
      descripcion: "Mayor palanca biomecánica y sobrecarga en glúteos y cadena posterior.",
      tips: ["Barra colocada sobre deltoides posterior", "Torso con mayor inclinación natural hacia adelante"]
    },
    {
      id: "sentadilla_frontal_barra",
      nombre: "Sentadilla frontal con barra olímpica (Front Squat)",
      grupo: "Pierna",
      secundario: "Cuádriceps / Core",
      equipo: "Barra",
      youtubeId: "8Gk8snrY8u4",
      aliases: ["sentadilla frontal", "front squat", "sentadillas frontales"],
      descripcion: "Torso vertical que traslada todo el esfuerzo a los cuádriceps.",
      tips: ["Codos altos paralelos al suelo", "Baja profundo manteniendo la espalda recta"]
    },
    {
      id: "sentadilla_goblet",
      nombre: "Sentadilla Goblet con mancuerna o kettlebell",
      grupo: "Pierna",
      secundario: "Cuádriceps",
      equipo: "Mancuerna",
      youtubeId: "8Gk8snrY8u4",
      aliases: ["sentadilla goblet", "goblet squat"],
      descripcion: "Ideal para perfeccionar profundidad y verticalidad de torso.",
      tips: ["Sujeta la mancuerna pegada al pecho", "Baja abriendo las rodillas entre los codos"]
    },
    {
      id: "sentadilla_bulgara_mancuernas",
      nombre: "Sentadilla búlgara con mancuernas",
      grupo: "Pierna",
      secundario: "Glúteos",
      equipo: "Mancuerna",
      youtubeId: "yH0FeAwbjbw",
      aliases: ["bulgara", "sentadilla bulgara", "bulgarian split squat", "bulgaras mancuerna", "split squat"],
      descripcion: "Aislamiento unilateral brutal de cuádriceps y glúteo.",
      tips: ["Pie trasero apoyado sobre banco", "Torso ligeramente inclinado para enfatizar glúteo", "Baja hasta rozar el suelo"]
    },
    {
      id: "sentadilla_bulgara_smith",
      nombre: "Sentadilla búlgara en máquina Smith (Multipower)",
      grupo: "Pierna",
      secundario: "Glúteo / Cuádriceps",
      equipo: "Smith",
      youtubeId: "yH0FeAwbjbw",
      aliases: ["bulgara smith", "sentadilla bulgara smith", "bulgara multipower"],
      descripcion: "Estabilidad guiada que permite aplicar sobrecarga máxima sin balanceo.",
      tips: ["Coloca el pie de apoyo firme", "Controla la fase excéntrica en 4-5 segundos"]
    },
    {
      id: "belt_squat_cuadriceps",
      nombre: "Belt squat en máquina cuádriceps",
      grupo: "Pierna",
      secundario: "Cuádriceps",
      equipo: "Máquina",
      youtubeId: "beP38yZ1N9E",
      aliases: ["belt squat", "sentadilla con cinturon", "belt squat machine"],
      descripcion: "1 rep 1 rebote, 1 rep 2 rebotes... hasta 10 rebotes acumulativos.",
      tips: ["Mantén el torso erguido gracias al cinturón", "Rebotes controlados en el punto más profundo de máxima flexión"]
    },
    {
      id: "zancadas_estaticas_smith",
      nombre: "Zancadas estáticas Smith",
      grupo: "Pierna",
      secundario: "Glúteo",
      equipo: "Smith",
      youtubeId: "yH0FeAwbjbw",
      aliases: ["zancadas", "zancadas smith", "lunges smith", "estocadas", "lunges en multipower"],
      descripcion: "RIR 0 al fallo muscular en máquina Smith (multipower).",
      tips: ["Paso largo para involucrar glúteo o medio para cuádriceps", "Torso ligeramente inclinado hacia adelante"]
    },
    {
      id: "zancadas_caminando_mancuernas",
      nombre: "Zancadas caminando con mancuernas (Walking Lunges)",
      grupo: "Pierna",
      secundario: "Glúteo",
      equipo: "Mancuerna",
      youtubeId: "yH0FeAwbjbw",
      aliases: ["zancadas caminando", "walking lunges", "zancadas con mancuernas"],
      descripcion: "Pasos amplios y continuos generando altísimo estrés metabólico.",
      tips: ["La rodilla trasera casi toca el suelo", "Mantén el peso centrado en el talón delantero"]
    },
    {
      id: "extension_cuadriceps",
      nombre: "Extensión de cuádriceps en máquina",
      grupo: "Pierna",
      secundario: "Recto Femoral",
      equipo: "Máquina",
      youtubeId: "SguKyjZ6y9Q",
      aliases: ["extension cuadriceps", "extensiones", "leg extension", "extensiones de piernas", "cuadriceps en maquina"],
      descripcion: "Aislamiento completo del cuádriceps. Pausa de 2 segundos arriba.",
      tips: ["Alinea el eje de la rodilla con la máquina", "Pausa isométrica de 2s arriba y bajada en 5s"]
    },
    {
      id: "extension_cuadriceps_unilateral",
      nombre: "Extensión de cuádriceps unilateral en máquina",
      grupo: "Pierna",
      secundario: "Recto Femoral",
      equipo: "Máquina",
      youtubeId: "SguKyjZ6y9Q",
      aliases: ["extension cuadriceps una pierna", "single leg extension", "extension unilateral"],
      descripcion: "Corrección de desbalances de fuerza entre ambas piernas.",
      tips: ["Mantén la espalda pegada al cojín", "Extensión completa sin impulsos bruscos"]
    },
    {
      id: "sentadilla_sissy",
      nombre: "Sentadilla Sissy con peso corporal o disco",
      grupo: "Pierna",
      secundario: "Recto Femoral",
      equipo: "Peso Corporal / Soporte",
      youtubeId: "SguKyjZ6y9Q",
      aliases: ["sissy squat", "sentadilla sissy"],
      descripcion: "Máximo estiramiento del recto femoral en posición de cadera extendida.",
      tips: ["Lleva las rodillas hacia adelante manteniendo el torso alineado con los muslos"]
    },
    {
      id: "peso_muerto_barra",
      nombre: "Peso muerto convencional con barra olímpica",
      grupo: "Pierna",
      secundario: "Cadena Posterior / Espalda",
      equipo: "Barra",
      youtubeId: "0XL4cZR2Ink",
      aliases: ["peso muerto", "deadlift", "peso muerto convencional", "deadlift con barra"],
      descripcion: "Máxima producción de fuerza global para toda la cadena posterior.",
      tips: ["Barra rozando las espinillas", "Cadera en posición de bisagra", "Tracción empujando el suelo con los talones"]
    },
    {
      id: "peso_muerto_rumano_barra",
      nombre: "Peso muerto rumano con barra olímpica",
      grupo: "Pierna",
      secundario: "Isquiosurales / Glúteos",
      equipo: "Barra",
      youtubeId: "0XL4cZR2Ink",
      aliases: ["peso muerto rumano", "rdl", "romanian deadlift", "rumano con barra", "peso muerto rumano barra"],
      descripcion: "Bisagra de cadera pura con tensión brutal en isquiosurales en estiramiento.",
      tips: ["Empuja los glúteos hacia atrás contra la pared imaginaria", "Rodillas con semiflexión fija", "Espalda plana"]
    },
    {
      id: "peso_muerto_rumano_mancuernas",
      nombre: "Peso muerto rumano con mancuernas",
      grupo: "Pierna",
      secundario: "Glúteos / Isquios",
      equipo: "Mancuerna",
      youtubeId: "0XL4cZR2Ink",
      aliases: ["peso muerto rumano mancuernas", "rdl mancuernas", "rumano con mancuernas"],
      descripcion: "Mayor rango anatómico al poder deslizar las mancuernas por los costados.",
      tips: ["Baja hasta mitad de espinilla sintiendo el estiramiento de isquios", "Baja en 5 segundos lentos"]
    },
    {
      id: "peso_muerto_piernas_rigidas",
      nombre: "Peso muerto con piernas rígidas (Stiff-Leg)",
      grupo: "Pierna",
      secundario: "Isquiosurales",
      equipo: "Barra / Mancuerna",
      youtubeId: "0XL4cZR2Ink",
      aliases: ["peso muerto piernas rigidas", "stiff leg deadlift", "piernas rigidas"],
      descripcion: "Rodillas casi bloqueadas para aislar la inserción proximal de isquios.",
      tips: ["Cadera muy alta", "No redondees la columna lumbar"]
    },
    {
      id: "peso_muerto_sumo_barra",
      nombre: "Peso muerto estilo sumo con barra olímpica",
      grupo: "Pierna",
      secundario: "Aductores / Glúteos",
      equipo: "Barra",
      youtubeId: "qL3heyJRJvw",
      aliases: ["peso muerto sumo", "sumo deadlift", "deadlift sumo"],
      descripcion: "Apertura amplia de piernas con énfasis en aductores y glúteo.",
      tips: ["Pies apuntando hacia afuera a 45°", "Cadera abierta cerca de la barra", "Torso erguido"]
    },
    {
      id: "femoral_tumbado",
      nombre: "Curl femoral tumbado en máquina",
      grupo: "Pierna",
      secundario: "Isquiosurales",
      equipo: "Máquina",
      youtubeId: "nmqG-tIr0hc",
      aliases: ["femoral tumbado", "curl femoral tumbado", "lying leg curl", "curl femoral prono", "femoral acostado"],
      descripcion: "Pausa isométrica de 1 segundo en máxima flexión de rodilla.",
      tips: ["Presiona la pelvis contra el cojín", "Flexión de tobillo (dorsiflexión) para aislar el isquio", "Excéntrica en 5s"]
    },
    {
      id: "femoral_sentado",
      nombre: "Curl femoral sentado en máquina",
      grupo: "Pierna",
      secundario: "Isquiosurales",
      equipo: "Máquina",
      youtubeId: "oOE1vaDX71M",
      aliases: ["femoral sentado", "curl femoral sentado", "seated leg curl", "isquios sentado en maquina"],
      descripcion: "Máximo estiramiento de isquiosurales al estar la cadera flexionada a 90°.",
      tips: ["Ajusta la almohadilla superior apretada sobre los muslos", "Baja controlando en 5 segundos sin soltar el peso"]
    },
    {
      id: "curl_femoral_de_pie_unilateral",
      nombre: "Curl femoral de pie unilateral en máquina",
      grupo: "Pierna",
      secundario: "Isquiosurales",
      equipo: "Máquina",
      youtubeId: "nmqG-tIr0hc",
      aliases: ["femoral de pie", "standing leg curl", "curl femoral una pierna"],
      descripcion: "Aislamiento monoarticular por cada pierna.",
      tips: ["Mantén el muslo pegado a la almohadilla", "Sube el talón hacia el glúteo"]
    },
    {
      id: "curl_nordico",
      nombre: "Curl nórdico (Nordic Hamstring Curl)",
      grupo: "Pierna",
      secundario: "Isquiosurales",
      equipo: "Peso Corporal / Banco Nórdico",
      youtubeId: "nmqG-tIr0hc",
      aliases: ["curl nordico", "nordic curl", "nordic hamstring"],
      descripcion: "Sobrecarga excéntrica brutal para prevención de lesiones y masa en isquios.",
      tips: ["Tobillos anclados firmemente", "Frena la caída con los isquiosurales el mayor tiempo posible"]
    },
    {
      id: "hip_thrust_unilateral",
      nombre: "Hip thrust unilateral",
      grupo: "Pierna",
      secundario: "Glúteo Mayor",
      equipo: "Banco / Mancuerna",
      youtubeId: "RaKaj5gtk1A",
      aliases: ["hip thrust unilateral", "single leg hip thrust", "empuje cadera unilateral", "hip thrust una pierna"],
      descripcion: "Bloqueo pélvico de 2 segundos arriba con contracción máxima del glúteo.",
      tips: ["Barbilla pegada al pecho", "Empuje desde el talón", "Retroversion pélvica al final"]
    },
    {
      id: "hip_thrust_barra_banco",
      nombre: "Hip Thrust con barra olímpica en banco acolchado",
      grupo: "Pierna",
      secundario: "Glúteo Mayor",
      equipo: "Barra / Banco",
      youtubeId: "RaKaj5gtk1A",
      aliases: ["hip thrust", "hip thrust con barra", "barbell hip thrust", "empuje de cadera"],
      descripcion: "Sobrecarga de alta carga para hipertrofia del glúteo mayor.",
      tips: ["Espalda apoyada a la altura de las escápulas", "Tibia vertical a 90 grados al subir", "Pausa de 2s arriba"]
    },
    {
      id: "hip_thrust_maquina",
      nombre: "Hip Thrust en máquina guiada específica",
      grupo: "Pierna",
      secundario: "Glúteo Mayor",
      equipo: "Máquina",
      youtubeId: "RaKaj5gtk1A",
      aliases: ["hip thrust maquina", "machine hip thrust", "maquina hip thrust"],
      descripcion: "Facilidad de colocación y tensión continua en todo el recorrido.",
      tips: ["Cinturón o almohadilla acolchada sobre las caderas", "Bloquea arriba con retroversión pélvica"]
    },
    {
      id: "glute_bridge_suelo",
      nombre: "Puente de glúteo en suelo con barra (Glute Bridge)",
      grupo: "Pierna",
      secundario: "Glúteo Mayor",
      equipo: "Barra / Suelo",
      youtubeId: "RaKaj5gtk1A",
      aliases: ["glute bridge", "puente de gluteo", "puente gluteo suelo"],
      descripcion: "Mayor ángulo de extensión terminal con apoyo plano en el suelo.",
      tips: ["Pies al ancho de caderas", "Empuja fuerte contrayendo glúteo arriba"]
    },
    {
      id: "patada_gluteo_polea",
      nombre: "Patada de glúteo en polea baja con tobillera",
      grupo: "Pierna",
      secundario: "Glúteo Mayor",
      equipo: "Polea",
      youtubeId: "RaKaj5gtk1A",
      aliases: ["patada gluteo", "patada de gluteo", "cable glute kickback", "patada polea"],
      descripcion: "Aislamiento monoarticular con trayectoria diagonal hacia atrás.",
      tips: ["Torso inclinado 45°", "Patea hacia atrás apretando el glúteo 1 segundo arriba"]
    },
    {
      id: "patada_gluteo_maquina",
      nombre: "Patada de glúteo en máquina",
      grupo: "Pierna",
      secundario: "Glúteo Mayor",
      equipo: "Máquina",
      youtubeId: "RaKaj5gtk1A",
      aliases: ["patada gluteo maquina", "glute machine kickback"],
      descripcion: "Recorrido guiado que maximiza el reclutamiento del glúteo.",
      tips: ["Empuja con el talón", "Excéntrico en 4 segundos"]
    },
    {
      id: "aductor",
      nombre: "Aductor en máquina",
      grupo: "Pierna",
      secundario: "Aductores",
      equipo: "Máquina",
      youtubeId: "vlViIgtkvh4",
      aliases: ["aductor", "aductores", "adductor machine", "aductor maquina", "aductores en maquina"],
      descripcion: "3 series pesadas con 1 segundo de parada isométrica adentro.",
      tips: ["Junta las rodillas apretando 1s al centro", "Abre despacio en 5 segundos sin que choquen las placas"]
    },
    {
      id: "abductor_maquina",
      nombre: "Abductor en máquina de placas",
      grupo: "Pierna",
      secundario: "Glúteo Medio",
      equipo: "Máquina",
      youtubeId: "vlViIgtkvh4",
      aliases: ["abductor", "abductores", "abductor maquina", "abductor en maquina", "hip abductor machine"],
      descripcion: "Desarrollo del glúteo medio para estabilidad de cadera y forma.",
      tips: ["Inclina el torso ligeramente hacia adelante", "Abre las piernas manteniendo la tensión"]
    },
    {
      id: "sentadilla_sumo_en_smith",
      nombre: "Sentadilla sumo en Smith",
      grupo: "Pierna",
      secundario: "Glúteo / Aductores",
      equipo: "Smith",
      youtubeId: "qL3heyJRJvw",
      aliases: ["sentadilla sumo", "sumo squat smith", "sumo en multipower", "sumo smith"],
      descripcion: "Apertura amplia de piernas y puntas de pies a 45 grados en multipower.",
      tips: ["Puntas de los pies hacia afuera", "Bajar sintiendo el estiramiento de aductores y glúteos"]
    },
    {
      id: "sentadilla_sumo_mancuerna",
      nombre: "Sentadilla sumo con mancuerna pesada",
      grupo: "Pierna",
      secundario: "Glúteos / Aductores",
      equipo: "Mancuerna",
      youtubeId: "qL3heyJRJvw",
      aliases: ["sentadilla sumo mancuerna", "sumo dumbbell squat", "plie squat"],
      descripcion: "Sujeta una mancuerna entre las piernas subido a dos steps para mayor profundidad.",
      tips: ["Espalda recta", "Baja profundo sintiendo los aductores"]
    },
    {
      id: "gemelo_de_pie",
      nombre: "Gemelo de pie en máquina o multipower",
      grupo: "Pierna",
      secundario: "Gastrocnemio",
      equipo: "Máquina / Smith",
      youtubeId: "iOuAzeiDicY",
      aliases: ["gemelo", "gemelos", "gemelo de pie", "standing calf raise", "elevaciones de gemelos", "gemelos de pie"],
      descripcion: "3 segundos de parada abajo en estiramiento completo antes de subir.",
      tips: ["Pausa abajo de 3s en estiramiento total", "Sube explosivo arriba y aguanta 1s en contracción"]
    },
    {
      id: "gemelo_sentado_maquina",
      nombre: "Gemelo sentado en máquina (Sóleo)",
      grupo: "Pierna",
      secundario: "Sóleo",
      equipo: "Máquina",
      youtubeId: "iOuAzeiDicY",
      aliases: ["gemelo sentado", "soleo", "seated calf raise", "gemelos sentado", "maquina de soleo"],
      descripcion: "Aislamiento puro del sóleo al estar la rodilla flexionada a 90°.",
      tips: ["Baja el talón hasta el fondo sintiendo el sóleo", "Sube con fuerza y pausa 2 segundos arriba"]
    },
    {
      id: "gemelo_prensa_45",
      nombre: "Elevación de talones en prensa de 45 grados",
      grupo: "Pierna",
      secundario: "Gastrocnemio",
      equipo: "Máquina",
      youtubeId: "iOuAzeiDicY",
      aliases: ["gemelo en prensa", "calf press on leg press", "gemelos prensa 45"],
      descripcion: "Gran capacidad de carga y seguridad para sobrecargar el gemelo.",
      tips: ["Apoya solo la punta del pie en el borde inferior", "No flexiones las rodillas"]
    },

    // -------------------------------------------------------------------------
    // 4. HOMBROS / DELTOIDES
    // -------------------------------------------------------------------------
    {
      id: "press_hombro_neutro",
      nombre: "Press hombro neutro con mancuernas",
      grupo: "Hombro",
      secundario: "Tríceps",
      equipo: "Mancuerna",
      youtubeId: "4N8wePRkBmY",
      aliases: ["press hombro", "press hombros", "press militar mancuernas", "shoulder press", "press hombro neutro", "press con mancuernas hombro"],
      descripcion: "Máximo rango de recorrido con mancuernas en agarre neutro.",
      tips: ["Agarre con palmas mirándose", "Bajar hasta tocar suavemente los hombros", "Codos ligeramente adelantados"]
    },
    {
      id: "press_militar_barra_de_pie",
      nombre: "Press militar con barra de pie (Overhead Press)",
      grupo: "Hombro",
      secundario: "Tríceps / Core",
      equipo: "Barra",
      youtubeId: "4N8wePRkBmY",
      aliases: ["press militar", "overhead press", "ohp", "militar con barra", "press de hombros con barra", "press militar de pie"],
      descripcion: "Fuerza pura vertical y estabilidad del core en bipedestación.",
      tips: ["Glúteos y abdomen apretados", "La barra viaja en línea vertical recta rozando la nariz"]
    },
    {
      id: "press_militar_smith",
      nombre: "Press militar en máquina Smith (Multipower)",
      grupo: "Hombro",
      secundario: "Tríceps",
      equipo: "Smith / Banco",
      youtubeId: "4N8wePRkBmY",
      aliases: ["press militar smith", "press hombro multipower", "smith shoulder press"],
      descripcion: "Sobrecarga estricta en el deltoides anterior sin fatiga de equilibrio.",
      tips: ["Banco a 75-80 grados", "Baja la barra hasta la barbilla o parte alta del pecho"]
    },
    {
      id: "press_arnold_mancuernas",
      nombre: "Press Arnold con mancuernas",
      grupo: "Hombro",
      secundario: "Tríceps",
      equipo: "Mancuerna",
      youtubeId: "4N8wePRkBmY",
      aliases: ["press arnold", "arnold press", "press arnold hombro"],
      descripcion: "Rotación combinada que involucra la cabeza frontal y lateral del deltoides.",
      tips: ["Comienza con palmas hacia el pecho", "Gira los codos hacia afuera conforme empujas arriba"]
    },
    {
      id: "press_hombros_maquina",
      nombre: "Press de hombros en máquina de placas",
      grupo: "Hombro",
      secundario: "Tríceps",
      equipo: "Máquina",
      youtubeId: "4N8wePRkBmY",
      aliases: ["press hombro maquina", "shoulder press machine", "maquina press militar"],
      descripcion: "Tensión constante en deltoides con nulo riesgo de lesión en muñecas.",
      tips: ["Asiento ajustado para que los mangos queden a la altura de las orejas"]
    },
    {
      id: "laterales_maquina_unilateral",
      nombre: "Laterales máquina unilateral",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Máquina",
      youtubeId: "V98wql8IfVA",
      aliases: ["laterales maquina unilateral", "elevaciones laterales maquina unilateral", "lateral raise machine single arm"],
      descripcion: "3 segundos de contracción isométrica arriba.",
      tips: ["Elevar con los codos y el deltoides", "Pausa de 3 segundos exactos arriba", "Bajar controlando"]
    },
    {
      id: "laterales_maquina",
      nombre: "Laterales en máquina sentada",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Máquina",
      youtubeId: "WmdhjLZzEjM",
      aliases: ["laterales maquina", "elevaciones laterales maquina", "lateral raise machine"],
      descripcion: "Series pesadas a 6-8 repeticiones en máquina.",
      tips: ["Mantener la tensión continua", "Sin encoger los trapecios de forma exagerada"]
    },
    {
      id: "elevaciones_laterales_mancuernas",
      nombre: "Elevaciones laterales con mancuernas de pie",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Mancuerna",
      youtubeId: "WmdhjLZzEjM",
      aliases: ["laterales", "elevaciones laterales", "lateral raise", "laterales mancuerna", "laterales con mancuernas", "vuelos laterales"],
      descripcion: "Constructor por excelencia de la cabeza lateral del hombro.",
      tips: ["Lidera el movimiento con los codos", "Brazos en el plano escapular (ligeramente adelantados)", "Pausa arriba"]
    },
    {
      id: "elevaciones_laterales_sentado",
      nombre: "Elevaciones laterales sentado con mancuernas",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Mancuerna / Banco",
      youtubeId: "WmdhjLZzEjM",
      aliases: ["laterales sentado", "seated lateral raise", "elevaciones laterales sentado"],
      descripcion: "Anula el balanceo de piernas obligando al deltoides a trabajar de forma estricta.",
      tips: ["Espalda apoyada o libre con torso erguido", "Subida controlada hasta la horizontal"]
    },
    {
      id: "elevaciones_laterales_polea",
      nombre: "Elevaciones laterales en polea baja unilateral",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Polea",
      youtubeId: "V98wql8IfVA",
      aliases: ["laterales polea", "cable lateral raise", "elevaciones laterales en polea", "polea lateral hombro"],
      descripcion: "Perfil de resistencia constante desde el inicio del movimiento.",
      tips: ["Polea a la altura de la rodilla o muñeca", "Sube en diagonal liderando con el codo"]
    },
    {
      id: "elevaciones_laterales_tras_espalda",
      nombre: "Elevaciones laterales en polea tras la espalda",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Polea",
      youtubeId: "V98wql8IfVA",
      aliases: ["laterales polea tras espalda", "behind the back cable lateral raise"],
      descripcion: "Mayor rango de aducción cruzando el cable por detrás del torso.",
      tips: ["Tira en diagonal con el codo semiflexionado"]
    },
    {
      id: "elevaciones_frontales_mancuernas",
      nombre: "Elevaciones frontales con mancuernas",
      grupo: "Hombro",
      secundario: "Deltoides Anterior",
      equipo: "Mancuerna",
      youtubeId: "4N8wePRkBmY",
      aliases: ["elevaciones frontales", "front raise", "frontales mancuerna", "elevacion frontal"],
      descripcion: "Aislamiento monoarticular de la porción anterior del hombro.",
      tips: ["Eleva hasta la altura de los ojos", "Baja controlando en 4 segundos"]
    },
    {
      id: "elevaciones_frontales_disco",
      nombre: "Elevaciones frontales con disco olímpico",
      grupo: "Hombro",
      secundario: "Deltoides Anterior",
      equipo: "Disco",
      youtubeId: "4N8wePRkBmY",
      aliases: ["frontales disco", "plate front raise", "elevacion frontal con disco"],
      descripcion: "Agarre simétrico firme para congestionar el deltoides frontal.",
      tips: ["Sujeta el disco a las 9 y las 3 en punto del reloj"]
    },
    {
      id: "face_pull_cuerda",
      nombre: "Face pull en polea alta con cuerda",
      grupo: "Hombro",
      secundario: "Manguito Rotador / Deltoides Posterior",
      equipo: "Polea",
      youtubeId: "WmdhjLZzEjM",
      aliases: ["face pull", "face pulls", "facepull", "polea a la cara"],
      descripcion: "Salud articular del hombro y deltoides posterior. Rotación externa.",
      tips: ["Tracciona llevando los pulgares hacia atrás de las orejas", "Pausa de 2 segundos apretando atrás"]
    },
    {
      id: "pajaros_mancuerna_banco",
      nombre: "Pájaros con mancuerna en banco inclinado",
      grupo: "Hombro",
      secundario: "Deltoides Posterior",
      equipo: "Mancuerna / Banco",
      youtubeId: "WmdhjLZzEjM",
      aliases: ["pajaros", "pajaros mancuerna", "rear delt fly", "deltoides posterior mancuerna", "vuelos posteriores"],
      descripcion: "Pecho apoyado en banco a 30° para aislar el deltoides posterior.",
      tips: ["Abre los brazos como alas de pájaro", "Sin encoger los trapecios arriba"]
    },
    {
      id: "pajaros_peck_deck_invertido",
      nombre: "Pájaros en máquina Contractor invertido (Rear Delt)",
      grupo: "Hombro",
      secundario: "Deltoides Posterior",
      equipo: "Máquina",
      youtubeId: "WmdhjLZzEjM",
      aliases: ["pajaros maquina", "rear delt machine", "reverse pec deck", "contractora invertida"],
      descripcion: "Tensión mecánica pura y continua sobre el deltoides posterior.",
      tips: ["Pecho contra el cojín", "Manos al nivel de los hombros", "Abre empujando con los codos"]
    },
    {
      id: "remo_al_menton_barra_z",
      nombre: "Remo al mentón con barra Z",
      grupo: "Hombro",
      secundario: "Trapecio / Deltoides Lateral",
      equipo: "Barra Z",
      youtubeId: "WmdhjLZzEjM",
      aliases: ["remo al menton", "upright row", "remo al menton barra z", "remo al cuello"],
      descripcion: "Tirón vertical con agarre medio para deltoides laterales.",
      tips: ["Agarre algo más ancho que los hombros para proteger el manguito rotador", "Codos por encima de las muñecas"]
    },

    // -------------------------------------------------------------------------
    // 5. BÍCEPS Y ANTEBRAZO
    // -------------------------------------------------------------------------
    {
      id: "biceps_martillo_mancuernas",
      nombre: "Bíceps martillo mancuernas",
      grupo: "Bíceps",
      secundario: "Braquial / Braquiorradial",
      equipo: "Mancuerna",
      youtubeId: "07D2fR_0iro",
      aliases: ["curl martillo", "martillo", "hammer curl", "curl martillo mancuernas", "martillos"],
      descripcion: "Rest pause: tras el fallo, descanso de 15 segundos y 2-3 reps extra.",
      tips: ["Agarre neutro firme", "Codos pegados al cuerpo", "Pausa isométrica de 1s arriba"]
    },
    {
      id: "curl_biceps_mancuernas_alterno",
      nombre: "Curl de bíceps con mancuernas alterno con supinación",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Mancuerna",
      youtubeId: "07D2fR_0iro",
      aliases: ["curl mancuernas", "bicep curl mancuernas", "curl alterno mancuerna", "curl con mancuernas"],
      descripcion: "Supinación estricta de la muñeca para máxima activación del pico del bíceps.",
      tips: ["Comienza con agarre neutro y supina conforme subes", "Baja lento en 4 segundos"]
    },
    {
      id: "curl_biceps_barra_z",
      nombre: "Curl de bíceps con barra Z de pie",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Barra Z",
      youtubeId: "MtgfQwdgE3k",
      aliases: ["curl barra z", "ez bar curl", "curl de biceps barra z", "curl con barra z", "curl bicep barra"],
      descripcion: "Agarre en barra Z que optimiza la posición de las muñecas.",
      tips: ["Codos pegados a los costados", "Sin balanceo con la espalda baja", "Extensión casi total abajo"]
    },
    {
      id: "curl_biceps_barra_recta",
      nombre: "Curl de bíceps con barra recta olímpica",
      grupo: "Bíceps",
      secundario: "Antebrazo",
      equipo: "Barra",
      youtubeId: "MtgfQwdgE3k",
      aliases: ["curl barra recta", "barbell curl", "curl con barra", "curl barra olimpica"],
      descripcion: "Básico multiarticular para máxima carga en flexores de codo.",
      tips: ["Palmas completamente supinadas", "Subida explosiva y bajada en 5 segundos"]
    },
    {
      id: "scott_maquina_unilateral",
      nombre: "Scott máquina unilateral",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Máquina",
      youtubeId: "YUhSi_sUGmM",
      aliases: ["banco scott", "curl predicador", "preacher curl", "scott maquina", "curl scott", "predicador en maquina"],
      descripcion: "Tempo 1-3-1 (1s subida, 3s bajada, 1s pausa isométrica).",
      tips: ["Apoyo total de la axila en el cojín", "Estiramiento seguro sin hiperextensión brusca"]
    },
    {
      id: "curl_scott_barra_z",
      nombre: "Curl Scott / Predicador con barra Z",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Barra Z / Banco Scott",
      youtubeId: "YUhSi_sUGmM",
      aliases: ["predicador barra z", "scott barra z", "preacher curl barbell"],
      descripcion: "Aislamiento absoluto al anular cualquier balanceo del torso.",
      tips: ["Brazos firmes en el banco", "No levantes los codos al subir"]
    },
    {
      id: "scott_unilateral",
      nombre: "Scott unilateral con mancuerna",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Mancuerna / Banco Scott",
      youtubeId: "KvZKqlRFhXc",
      aliases: ["scott con mancuerna", "predicador mancuerna", "scott mancuerna", "single arm preacher curl"],
      descripcion: "Enfoque brazo por brazo para máxima concentración muscular.",
      tips: ["Baja con control total", "Extiende sin dar tirones articulares al codo"]
    },
    {
      id: "curl_concentrado_mancuerna",
      nombre: "Curl concentrado sentado con mancuerna",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Mancuerna",
      youtubeId: "KvZKqlRFhXc",
      aliases: ["curl concentrado", "concentration curl", "curl concentrado sentado"],
      descripcion: "Codo apoyado en el muslo interno para aislar la cabeza corta del bíceps.",
      tips: ["Sube apretando el bíceps 2 segundos en el pico", "Baja lento"]
    },
    {
      id: "curl_biceps_inclinado_mancuerna",
      nombre: "Curl bíceps inclinado con mancuernas en banco 45-60°",
      grupo: "Bíceps",
      secundario: "Cabeza Larga",
      equipo: "Mancuerna / Banco Inclinado",
      youtubeId: "07D2fR_0iro",
      aliases: ["curl inclinado", "incline dumbbell curl", "curl en banco inclinado", "biceps inclinado"],
      descripcion: "Máximo estiramiento de la cabeza larga del bíceps al colgar los brazos.",
      tips: ["Hombros atrás apoyados en el respaldo", "Los codos permanecen estables apuntando al suelo"]
    },
    {
      id: "curl_spider_banco",
      nombre: "Curl Spider en banco Scott o inclinado con barra Z",
      grupo: "Bíceps",
      secundario: "Cabeza Corta",
      equipo: "Barra Z / Banco Inclinado",
      youtubeId: "YUhSi_sUGmM",
      aliases: ["curl spider", "spider curl", "curl araña"],
      descripcion: "Pecho apoyado en el banco con brazos colgando en vertical hacia el suelo.",
      tips: ["Tensión máxima en la fase de flexión final", "Sin impulso de balanceo"]
    },
    {
      id: "polea_cuerda_baja",
      nombre: "Curl en polea baja con cuerda (Martillo)",
      grupo: "Bíceps",
      secundario: "Braquiorradial",
      equipo: "Polea",
      youtubeId: "TCeIYlq00P8",
      aliases: ["polea cuerda baja", "curl polea cuerda", "cable rope hammer curl", "biceps polea baja cuerda"],
      descripcion: "Tensión constante e hipertrofia del braquiorradial y bíceps.",
      tips: ["Abre la cuerda al llegar arriba", "Excéntrico en 5s sintiendo la tensión continua"]
    },
    {
      id: "curl_biceps_polea_baja_barra",
      nombre: "Curl de bíceps en polea baja con barra recta",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Polea",
      youtubeId: "TCeIYlq00P8",
      aliases: ["curl polea barra", "cable straight bar curl", "curl polea baja"],
      descripcion: "Resistencia continua sin puntos muertos en todo el rango.",
      tips: ["Codos pegados al cuerpo", "Pausa de 1 segundo arriba"]
    },
    {
      id: "curl_hercules_polea_doble",
      nombre: "Curl de bíceps en polea alta doble (Hércules)",
      grupo: "Bíceps",
      secundario: "Cabeza Corta",
      equipo: "Polea Doble",
      youtubeId: "TCeIYlq00P8",
      aliases: ["curl hercules", "cable high bicep curl", "curl en cruz poleas"],
      descripcion: "Flexión de brazos en cruz para máxima congestión del pico del bíceps.",
      tips: ["Codos a la altura de los hombros", "Lleva los agarres hacia las orejas"]
    },
    {
      id: "curl_zottman",
      nombre: "Curl Zottman con mancuernas",
      grupo: "Bíceps",
      secundario: "Antebrazo / Braquiorradial",
      equipo: "Mancuerna",
      youtubeId: "07D2fR_0iro",
      aliases: ["curl zottman", "zottman curl"],
      descripcion: "Sube con palmas en supinación y rota a pronación para bajar en 5s.",
      tips: ["Rotación fluida arriba", "Baja despacio sobrecargando el antebrazo"]
    },
    {
      id: "curl_invertido_barra_z",
      nombre: "Curl invertido con barra Z (Braquiorradial)",
      grupo: "Bíceps",
      secundario: "Extensores de Muñeca",
      equipo: "Barra Z",
      youtubeId: "MtgfQwdgE3k",
      aliases: ["curl invertido", "reverse curl", "braquiorradial barra"],
      descripcion: "Agarre prono (palmas hacia abajo) para densidad de antebrazo y braquial.",
      tips: ["Muñecas firmes y rectas", "Subida controlada sin despegar los codos"]
    },
    {
      id: "flexion_muneca_barra",
      nombre: "Flexión de muñeca con barra (Flexores Antebrazo)",
      grupo: "Bíceps",
      secundario: "Antebrazo",
      equipo: "Barra / Banco",
      youtubeId: "MtgfQwdgE3k",
      aliases: ["antebrazo barra", "wrist curl", "flexion muneca"],
      descripcion: "Antebrazos apoyados en banco dejando colgar las muñecas.",
      tips: ["Enrolla la barra hacia la palma con contracción total", "Baja lento"]
    },

    // -------------------------------------------------------------------------
    // 6. TRÍCEPS
    // -------------------------------------------------------------------------
    {
      id: "polea_alta_cuerda",
      nombre: "Extensión en polea alta con cuerda",
      grupo: "Tríceps",
      secundario: "Cabeza Lateral",
      equipo: "Polea",
      youtubeId: "qdRDkVqVeOY",
      aliases: ["polea alta cuerda", "triceps cuerda", "triceps polea cuerda", "cable rope pushdown", "extension triceps cuerda"],
      descripcion: "Abre la cuerda abajo con bloqueo de 1 segundo en máxima contracción.",
      tips: ["Codos pegados a los costados", "Abre la cuerda al final extendiendo el tríceps", "Baja en 5 segundos lentos"]
    },
    {
      id: "polea_alta_barra_recta_triceps",
      nombre: "Extensión de tríceps en polea alta con barra recta",
      grupo: "Tríceps",
      secundario: "Cabeza Lateral",
      equipo: "Polea",
      youtubeId: "qdRDkVqVeOY",
      aliases: ["triceps barra recta", "cable straight bar pushdown", "polea triceps barra"],
      descripcion: "Permite mover mayor tonelaje en empuje estricto hacia abajo.",
      tips: ["Pecho erguido con leve inclinación", "Extiende bloqueando abajo con los tríceps"]
    },
    {
      id: "polea_alta_barra_v_triceps",
      nombre: "Extensión de tríceps en polea alta con barra V",
      grupo: "Tríceps",
      secundario: "Cabeza Medial / Lateral",
      equipo: "Polea",
      youtubeId: "qdRDkVqVeOY",
      aliases: ["triceps barra v", "cable v-bar pushdown", "polea triceps v"],
      descripcion: "Excelente ángulo articular para muñecas y codos en extensiones pesadas.",
      tips: ["Codos inmóviles", "Presiona hacia abajo con los talones de las manos"]
    },
    {
      id: "polea_unilateral_triceps",
      nombre: "Extensión unilateral en polea para tríceps",
      grupo: "Tríceps",
      secundario: "Cabeza Lateral",
      equipo: "Polea",
      youtubeId: "visrQO8rhNo",
      aliases: ["polea unilateral triceps", "single arm tricep pushdown", "triceps polea una mano"],
      descripcion: "Corrección de asimetrías y control individual de cada tríceps.",
      tips: ["Brazo pegado al costado", "Extensión completa sin mover el hombro"]
    },
    {
      id: "extension_triceps_katana",
      nombre: "Extensión de tríceps Katana en polea cruzada tras cabeza",
      grupo: "Tríceps",
      secundario: "Cabeza Larga",
      equipo: "Polea",
      youtubeId: "visrQO8rhNo",
      aliases: ["katana", "triceps katana", "katana extension", "extension katana triceps", "katana cable extension"],
      descripcion: "Alineación biomecánica perfecta con la cabeza larga del tríceps.",
      tips: ["Cruza las poleas por detrás de la cabeza y extiende hacia los lados", "Excéntrico en 5s"]
    },
    {
      id: "press_frances_mancuernas",
      nombre: "Press francés con mancuernas en banco plano",
      grupo: "Tríceps",
      secundario: "Cabeza Medial",
      equipo: "Mancuerna",
      youtubeId: "jCI6_pObQfo",
      aliases: ["press frances", "press frances mancuernas", "skull crushers dumbbell", "press frances mancuerna", "frances con mancuernas"],
      descripcion: "Codos fijos apuntando al techo. Bajar las mancuernas a los lados de la cabeza.",
      tips: ["Codos no se abren hacia afuera", "Bajada lenta en 5s sintiendo el tríceps", "Extensión sin balancear los hombros"]
    },
    {
      id: "press_frances_barra_z",
      nombre: "Press francés con barra Z en banco plano (Skull Crushers)",
      grupo: "Tríceps",
      secundario: "Cabeza Larga",
      equipo: "Barra Z / Banco",
      youtubeId: "jCI6_pObQfo",
      aliases: ["press frances barra z", "skull crushers", "press frances barra", "rompecraneos"],
      descripcion: "Sobrecarga con barra Z bajando hacia la frente o por detrás de la coronilla.",
      tips: ["Ligera inclinación de los brazos hacia atrás para mantener tensión constante en el tríceps"]
    },
    {
      id: "press_banca_cerrado",
      nombre: "Press de banca con agarre cerrado para tríceps",
      grupo: "Tríceps",
      secundario: "Pecho",
      equipo: "Barra",
      youtubeId: "jCI6_pObQfo",
      aliases: ["press cerrado", "close grip bench press", "press banca cerrado", "banca agarre estrecho"],
      descripcion: "Permite mover gran tonelaje directo al tríceps.",
      tips: ["Manos al ancho de los hombros (no más cerrado)", "Codos pegados al torso al bajar"]
    },
    {
      id: "extension_tras_nuca_mancuerna_2_manos",
      nombre: "Extensión de tríceps tras nuca con mancuerna a 2 manos (Copa)",
      grupo: "Tríceps",
      secundario: "Cabeza Larga",
      equipo: "Mancuerna",
      youtubeId: "jCI6_pObQfo",
      aliases: ["copa triceps", "overhead dumbbell tricep extension", "extension tras nuca", "copa con mancuerna"],
      descripcion: "Estiramiento máximo de la cabeza larga en posición de brazos elevados.",
      tips: ["Sujeta la mancuerna en forma de copa con ambas manos", "Baja profundo por detrás del cuello"]
    },
    {
      id: "fondos_en_paralelas_triceps",
      nombre: "Fondos en paralelas lastrados para tríceps (Torso vertical)",
      grupo: "Tríceps",
      secundario: "Pectoral / Deltoides",
      equipo: "Paralelas / Lastre",
      youtubeId: "qdRDkVqVeOY",
      aliases: ["fondos triceps", "tricep dips", "dips paralelas triceps"],
      descripcion: "Torso completamente vertical y codos pegados atrás para enfocar en tríceps.",
      tips: ["Sin inclinarte hacia adelante", "Empuje vertical bloqueando arriba con los tríceps"]
    },
    {
      id: "fondos_entre_bancos_triceps",
      nombre: "Fondos entre bancos para tríceps con disco",
      grupo: "Tríceps",
      secundario: "Hombro",
      equipo: "Bancos / Disco",
      youtubeId: "qdRDkVqVeOY",
      aliases: ["fondos entre bancos", "bench dips", "fondos de triceps banco"],
      descripcion: "Pies elevados en banco opuesto con disco sobre los muslos.",
      tips: ["Espalda rozando el banco trasero", "Baja hasta 90 grados en codos"]
    },
    {
      id: "patada_triceps_polea",
      nombre: "Patada de tríceps en polea baja",
      grupo: "Tríceps",
      secundario: "Cabeza Lateral",
      equipo: "Polea",
      youtubeId: "visrQO8rhNo",
      aliases: ["patada de triceps", "patada triceps polea", "cable tricep kickback", "patada triceps"],
      descripcion: "Tensión máxima en la fase final de extensión horizontal.",
      tips: ["Brazo paralelo al suelo", "Extiende bloqueando 1 segundo atrás"]
    },

    // -------------------------------------------------------------------------
    // 7. ABDOMEN Y CORE
    // -------------------------------------------------------------------------
    {
      id: "crunch_abdominal_declinado",
      nombre: "Crunch abdominal declinado con disco",
      grupo: "Abdomen",
      secundario: "Core",
      equipo: "Banco Declinado / Disco",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["crunch declinado", "decline crunch", "abdominales declinado", "crunch con disco"],
      descripcion: "Sobrecarga progresiva para el recto abdominal.",
      tips: ["Enrolla la columna vertebral hacia el pubis", "No tires del cuello"]
    },
    {
      id: "crunch_polea_alta_rodillas",
      nombre: "Crunch abdominal en polea alta de rodillas con cuerda",
      grupo: "Abdomen",
      secundario: "Core",
      equipo: "Polea",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["crunch polea", "cable crunch", "abdominales en polea", "crunch de rodillas polea"],
      descripcion: "Permite aplicar sobrecarga progresiva exacta con placas de peso.",
      tips: ["Caderas fijas hacia atrás", "Enrolla el torso llevando los codos hacia las rodillas con el abdomen"]
    },
    {
      id: "crunch_suelo",
      nombre: "Crunch abdominal en suelo / colchoneta",
      grupo: "Abdomen",
      secundario: "Core",
      equipo: "Peso Corporal",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["crunch", "abdominales", "crunches", "crunch suelo", "abdominales suelo"],
      descripcion: "Flexión espinal corta para aislamiento estricto del recto del abdomen.",
      tips: ["Expulsa todo el aire al subir", "Pausa de 1 segundo comprimiendo el abdomen"]
    },
    {
      id: "elevaciones_piernas_colgado",
      nombre: "Elevaciones de piernas colgado en barra",
      grupo: "Abdomen",
      secundario: "Flexores de Cadera",
      equipo: "Peso Corporal / Barra",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["elevaciones de piernas", "hanging leg raise", "piernas colgado", "elevacion de piernas barra"],
      descripcion: "Desarrollo del abdomen inferior y estabilidad de la cintura.",
      tips: ["Sube la pelvis hacia las costillas", "Sin balanceo pendular"]
    },
    {
      id: "elevaciones_piernas_paralelas",
      nombre: "Elevaciones de piernas en silla romana / paralelas",
      grupo: "Abdomen",
      secundario: "Core",
      equipo: "Silla Romana / Paralelas",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["piernas paralelas", "captain chair leg raise", "elevacion piernas en paralelas"],
      descripcion: "Espalda apoyada para aislar la flexión pélvica.",
      tips: ["Eleva las rodillas o piernas rectas hasta la horizontal", "Baja controlando"]
    },
    {
      id: "rueda_abdominal",
      nombre: "Rueda abdominal (Ab Wheel)",
      grupo: "Abdomen",
      secundario: "Dorsal / Core",
      equipo: "Rueda / Accesorio",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["rueda abdominal", "ab wheel", "rueda abs", "roller abdominal"],
      descripcion: "Ejercicio anti-extensión de máxima intensidad.",
      tips: ["Mantén la pelvis retrovertida", "Baja hasta donde puedas regresar sin arquear la espalda"]
    },
    {
      id: "plancha_isometrica_lastrada",
      nombre: "Plancha isométrica con disco (Plank)",
      grupo: "Abdomen",
      secundario: "Core Completo",
      equipo: "Peso Corporal / Disco",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["plancha", "plank", "plancha isometrica", "plancha abdominal", "plancha con peso"],
      descripcion: "Entrenamiento estático de estabilidad de columna.",
      tips: ["Alinea tobillos, cadera y hombros", "Glúteo activo"]
    },
    {
      id: "plancha_lateral_isometrica",
      nombre: "Plancha lateral isométrica",
      grupo: "Abdomen",
      secundario: "Oblicuos",
      equipo: "Peso Corporal",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["plancha lateral", "side plank", "oblicuos plancha"],
      descripcion: "Firmeza anti-flexión lateral para la musculatura oblicua.",
      tips: ["Codo alineado bajo el hombro", "Cadera arriba sin caer hacia el suelo"]
    },
    {
      id: "giros_rusos_disco",
      nombre: "Giros rusos con disco olímpico (Russian Twists)",
      grupo: "Abdomen",
      secundario: "Oblicuos",
      equipo: "Disco / Peso Corporal",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["giros rusos", "russian twist", "russian twists", "rotaciones rusas"],
      descripcion: "Rotación controlada del torso en equilibrio sobre glúteos.",
      tips: ["Gira los hombros, no solo los brazos", "Pies en el aire o apoyados en talones"]
    },
    {
      id: "vacio_abdominal",
      nombre: "Vacío abdominal (Stomach Vacuum)",
      grupo: "Abdomen",
      secundario: "Transverso Abdominal",
      equipo: "Peso Corporal",
      youtubeId: "eGo4IYlbE5g",
      aliases: ["vacio abdominal", "stomach vacuum", "vacio transverso"],
      descripcion: "Activación del transverso profundo para una cintura estrecha y compacta.",
      tips: ["Expulsa todo el aire de los pulmones", "Mete el ombligo hacia la columna y aguanta 15-20s"]
    }
  ];

  // Fallback por patrón de movimiento cuando ninguna palabra o alias alcanza el umbral
  function buscarFallbackPorPatron(normQuery, all) {
    var patterns = [
      { regex: /press.*inclinad/i, id: "press_inclinado_60" },
      { regex: /press.*declinad/i, id: "press_declinado_barra" },
      { regex: /press.*banca|press.*plano|bench/i, id: "press_banca_plano_barra" },
      { regex: /press.*militar|press.*hombro|shoulder/i, id: "press_hombro_neutro" },
      { regex: /apertura|cruc|fly/i, id: "apertura_unilateral_desde_abajo" },
      { regex: /dominad|pullup|chin/i, id: "dominadas_jalon" },
      { regex: /jalon.*pecho|lat.*pulldown/i, id: "jalon_maquina" },
      { regex: /remo.*t|t-bar/i, id: "remo_t" },
      { regex: /remo.*mancuerna|serrucho/i, id: "remo_unilateral" },
      { regex: /remo.*barra|pendlay/i, id: "remo_con_barra_90" },
      { regex: /remo.*gironda|remo.*sentado/i, id: "remo_gironda" },
      { regex: /remo/i, id: "remo_unilateral" },
      { regex: /pullover/i, id: "pullover_polea_alta" },
      { regex: /sentadill.*hack/i, id: "hack_pisada_neutra" },
      { regex: /sentadill.*bulgar/i, id: "sentadilla_bulgara_mancuernas" },
      { regex: /sentadill.*frontal/i, id: "sentadilla_frontal_barra" },
      { regex: /sentadill.*sumo/i, id: "sentadilla_sumo_en_smith" },
      { regex: /sentadill|squat/i, id: "sentadilla_trasera_barra" },
      { regex: /prensa/i, id: "prensa_45_grados" },
      { regex: /zancad|lunge/i, id: "zancadas_estaticas_smith" },
      { regex: /cuadricep|extension.*pierna/i, id: "extension_cuadriceps" },
      { regex: /femoral.*sentad/i, id: "femoral_sentado" },
      { regex: /femoral|isquio|leg.*curl/i, id: "femoral_tumbado" },
      { regex: /peso.*muerto.*ruman|rdl/i, id: "peso_muerto_rumano_barra" },
      { regex: /peso.*muerto|deadlift/i, id: "peso_muerto_barra" },
      { regex: /hip.*thrust|puente.*gluteo/i, id: "hip_thrust_barra_banco" },
      { regex: /gluteo/i, id: "patada_gluteo_polea" },
      { regex: /aductor/i, id: "aductor" },
      { regex: /abductor/i, id: "abductor_maquina" },
      { regex: /gemelo|soleo|calf/i, id: "gemelo_de_pie" },
      { regex: /curl.*martillo|hammer/i, id: "biceps_martillo_mancuernas" },
      { regex: /scott|predicador|preacher/i, id: "scott_maquina_unilateral" },
      { regex: /bicep|curl/i, id: "curl_biceps_barra_z" },
      { regex: /katana/i, id: "extension_triceps_katana" },
      { regex: /press.*frances|skull/i, id: "press_frances_mancuernas" },
      { regex: /fondo.*paralela|dips/i, id: "fondos_en_paralelas" },
      { regex: /tricep|pushdown/i, id: "polea_alta_cuerda" },
      { regex: /lateral|vuelo/i, id: "laterales_maquina" },
      { regex: /pajaro|rear.*delt/i, id: "pajaros_mancuerna_banco" },
      { regex: /face.*pull/i, id: "face_pull_cuerda" },
      { regex: /crunch|abdominal|abs|plank|plancha/i, id: "crunch_abdominal_declinado" }
    ];

    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].regex.test(normQuery)) {
        var found = all.find(function(ex) { return ex.id === patterns[i].id; });
        if (found) return found;
      }
    }

    return null;
  }

  // ===========================================================================
  // OBJETO PRINCIPAL EjerciciosDB
  // ===========================================================================
  var EjerciciosDB = {
    // Obtener todos los ejercicios combinando maestros y personalizados
    getAll: function() {
      var custom = (global.AppState && global.AppState.customExercises) ? global.AppState.customExercises : [];
      return EJERCICIOS_MAESTROS.concat(custom);
    },

    // Buscar ejercicio por ID exacto
    getById: function(id) {
      if (!id) return null;
      var all = this.getAll();
      return all.find(function(ex) { return ex.id === id; }) || null;
    },

    // Buscar por texto y filtros
    search: function(query, filterGroup, filterEquipment) {
      var list = this.getAll();
      query = (query || '').toLowerCase().trim();
      filterGroup = (filterGroup || 'todos').toLowerCase();
      filterEquipment = (filterEquipment || 'todos').toLowerCase();

      return list.filter(function(ex) {
        var matchesQuery = true;
        if (query) {
          var nameMatch = ex.nombre.toLowerCase().indexOf(query) >= 0;
          var groupMatch = (ex.grupo || '').toLowerCase().indexOf(query) >= 0;
          var descMatch = (ex.descripcion || '').toLowerCase().indexOf(query) >= 0;
          var aliasMatch = (ex.aliases || []).some(function(a) { return a.toLowerCase().indexOf(query) >= 0; });
          matchesQuery = nameMatch || groupMatch || descMatch || aliasMatch;
        }

        var matchesGroup = true;
        if (filterGroup !== 'todos') {
          matchesGroup = (ex.grupo || '').toLowerCase() === filterGroup;
        }

        var matchesEquipment = true;
        if (filterEquipment !== 'todos') {
          matchesEquipment = (ex.equipo || '').toLowerCase().indexOf(filterEquipment) >= 0;
        }

        return matchesQuery && matchesGroup && matchesEquipment;
      });
    },

    // =========================================================================
    // MOTOR INTELIGENTE DE EMPAREJAMIENTO DE EJERCICIOS Y VÍDEOS
    // =========================================================================
    findBestMatch: function(queryName) {
      if (!queryName) return null;
      var rawStr = queryName.toString().trim();
      var normQuery = normalizarTexto(rawStr);
      if (!normQuery) return null;

      // Comprobar overrides del usuario
      var userVideo = null;
      if (global.AppState && global.AppState.exerciseVideos) {
        userVideo = global.AppState.exerciseVideos[rawStr] || global.AppState.exerciseVideos[normQuery];
      }

      var all = this.getAll();

      // 1. Coincidencia exacta de ID
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === rawStr || all[i].id === normQuery) {
          return {
            exercise: all[i],
            confidence: 1.0,
            reason: 'exact_id',
            isApproximate: false,
            youtubeId: userVideo || all[i].youtubeId
          };
        }
      }

      // 2. Coincidencia exacta de nombre normalizado
      for (var i = 0; i < all.length; i++) {
        var exNorm = normalizarTexto(all[i].nombre);
        if (exNorm === normQuery) {
          return {
            exercise: all[i],
            confidence: 1.0,
            reason: 'exact_name',
            isApproximate: false,
            youtubeId: userVideo || all[i].youtubeId
          };
        }
      }

      // 3. Coincidencia directa en lista de alias de cada ejercicio
      for (var i = 0; i < all.length; i++) {
        var aliases = all[i].aliases || [];
        for (var a = 0; a < aliases.length; a++) {
          var aNorm = normalizarTexto(aliases[a]);
          if (aNorm === normQuery || normQuery.indexOf(aNorm) !== -1 || aNorm.indexOf(normQuery) !== -1) {
            return {
              exercise: all[i],
              confidence: 0.95,
              reason: 'alias_match',
              isApproximate: false,
              youtubeId: userVideo || all[i].youtubeId
            };
          }
        }
      }

      // 4. Token overlap scoring & Jaccard ponderado
      var queryTokens = extraerTokensRelevantes(normQuery);
      var bestCand = null;
      var bestScore = 0;

      for (var i = 0; i < all.length; i++) {
        var cand = all[i];
        var candNorm = normalizarTexto(cand.nombre);
        var candTokens = extraerTokensRelevantes(candNorm);

        if (cand.aliases) {
          cand.aliases.forEach(function(al) {
            candTokens = candTokens.concat(extraerTokensRelevantes(normalizarTexto(al)));
          });
        }
        candTokens = uniqueArray(candTokens);

        var score = calcularPuntuacionTokens(queryTokens, candTokens, normQuery, candNorm);
        if (score > bestScore) {
          bestScore = score;
          bestCand = cand;
        }
      }

      if (bestCand && bestScore >= 0.35) {
        return {
          exercise: bestCand,
          confidence: Math.min(0.92, Math.round(bestScore * 100) / 100),
          reason: 'token_similarity',
          isApproximate: bestScore < 0.65,
          youtubeId: userVideo || bestCand.youtubeId
        };
      }

      // 5. Fallback por patrón biomecánico para garantizar que NUNCA quede sin vídeo
      var fallback = buscarFallbackPorPatron(normQuery, all);
      if (fallback) {
        return {
          exercise: fallback,
          confidence: 0.50,
          reason: 'pattern_fallback',
          isApproximate: true,
          youtubeId: userVideo || fallback.youtubeId
        };
      }

      return null;
    },

    // Obtener los N ejercicios más cercanos recomendados para un nombre dado
    getClosestMatches: function(queryName, limit) {
      limit = limit || 4;
      if (!queryName) return this.getAll().slice(0, limit);
      var normQuery = normalizarTexto(queryName);
      var queryTokens = extraerTokensRelevantes(normQuery);
      var all = this.getAll();

      var ranked = all.map(function(cand) {
        var candNorm = normalizarTexto(cand.nombre);
        var candTokens = extraerTokensRelevantes(candNorm);
        if (cand.aliases) {
          cand.aliases.forEach(function(al) {
            candTokens = candTokens.concat(extraerTokensRelevantes(normalizarTexto(al)));
          });
        }
        candTokens = uniqueArray(candTokens);

        var score = calcularPuntuacionTokens(queryTokens, candTokens, normQuery, candNorm);
        return { exercise: cand, score: score };
      });

      ranked.sort(function(a, b) { return b.score - a.score; });
      return ranked.slice(0, limit).map(function(item) { return item.exercise; });
    },

    // Obtener el ID de vídeo verificado para un ejercicio u objeto
    getVideoForExercise: function(exerciseOrName) {
      if (!exerciseOrName) return '';

      // Si es un string directo
      if (typeof exerciseOrName === 'string') {
        var match = this.findBestMatch(exerciseOrName);
        return match ? match.youtubeId : '';
      }

      // Si es un objeto de ejercicio
      var rawYt = exerciseOrName.youtubeId ? extractYouTubeId(exerciseOrName.youtubeId) : '';
      if (rawYt) return rawYt;

      if (exerciseOrName.exerciseId) {
        var byId = this.getById(exerciseOrName.exerciseId);
        if (byId && byId.youtubeId) return byId.youtubeId;
      }

      if (exerciseOrName.matchedId) {
        var byMatched = this.getById(exerciseOrName.matchedId);
        if (byMatched && byMatched.youtubeId) return byMatched.youtubeId;
      }

      if (exerciseOrName.name || exerciseOrName.nombre) {
        var byName = this.findBestMatch(exerciseOrName.name || exerciseOrName.nombre);
        if (byName && byName.youtubeId) return byName.youtubeId;
      }

      return '';
    },

    // Extraer ID de YouTube desde URL o ID
    extractYouTubeId: extractYouTubeId,

    // Normalizar texto
    normalizarTexto: normalizarTexto,

    // Obtener lista única de grupos musculares disponibles
    getGruposMusculares: function() {
      return ['Todos', 'Pecho', 'Espalda', 'Pierna', 'Hombro', 'Bíceps', 'Tríceps', 'Abdomen'];
    },

    // Obtener lista de tipos de equipamiento
    getEquipamientos: function() {
      return ['Todos', 'Barra', 'Mancuerna', 'Polea', 'Máquina', 'Smith', 'Peso Corporal'];
    },

    // Crear y registrar un ejercicio personalizado
    crearEjercicioPersonalizado: function(datos) {
      var yt = extractYouTubeId(datos.youtubeId || '');
      var nuevo = {
        id: 'cust_ex_' + Date.now(),
        nombre: (datos.nombre || 'Ejercicio Personalizado').trim(),
        grupo: datos.grupo || 'General',
        secundario: datos.secundario || '',
        equipo: datos.equipo || 'Máquina',
        youtubeId: yt,
        aliases: [datos.nombre.toLowerCase().trim()],
        descripcion: datos.descripcion || 'Ejercicio personalizado del atleta.',
        tips: datos.tips || ['Ejecución controlada en 5s', 'Sobrecarga progresiva'],
        isCustom: true
      };

      if (global.AppState) {
        global.AppState.addCustomExercise(nuevo);
      }
      return nuevo;
    }
  };

  global.EjerciciosDB = EjerciciosDB;
})(window);
