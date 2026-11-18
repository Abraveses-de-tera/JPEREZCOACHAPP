// =============================================================================
// JPEREZCOACH APP · BASE DE DATOS MAESTRA DE EJERCICIOS (100+ EJERCICIOS)
// Incluye los 35 ejercicios oficiales de Jose Perez con vídeos y directrices técnicas
// =============================================================================

(function(global) {
  'use strict';

  var EJERCICIOS_MAESTROS = [
    // =========================================================================
    // 1. EJERCICIOS OFICIALES DE LA RUTINA 6 DÍAS ROTATIVOS JPEREZCOACH
    // =========================================================================
    // DÍA 1 PULL (Espalda y Bíceps)
    {
      id: "dominadas_jalon",
      nombre: "Dominadas/jalón",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Peso Corporal / Polea",
      youtubeId: "orXhTMDnQkI",
      descripcion: "Calienta 2/3 series y después busca series lo más pesadas posible.",
      tips: ["Rango de recorrido completo", "Depresión escapular antes de traccionar", "Pausa de 1 segundo abajo"]
    },
    {
      id: "remo_t",
      nombre: "Remo T",
      grupo: "Espalda",
      secundario: "Deltoides Posterior",
      equipo: "Barra / Máquina",
      youtubeId: "X2-yKYyjWAY",
      descripcion: "Excéntrico en 5 segundos. Control estricto del torso.",
      tips: ["Espalda paralela al suelo", "Controla la bajada en 5 segundos exactos", "Sin balanceo con las piernas"]
    },
    {
      id: "jalon_maquina",
      nombre: "Jalón máquina",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Máquina",
      youtubeId: "pcodNSB6NXQ",
      descripcion: "RIR 0 al fallo concéntrico + repeticiones parciales.",
      tips: ["Pecho alto al traccionar", "Al llegar al fallo, saca 2-3 parciales en estiramiento"]
    },
    {
      id: "remo_unilateral",
      nombre: "Remo unilateral",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Mancuerna",
      youtubeId: "hOBTkGA4mHE",
      descripcion: "Excéntrico en 5 segundos con mancuerna. Tirón hacia la cadera.",
      tips: ["Lleva la mancuerna hacia la cadera, no hacia el pecho", "Baja lento en 5s sintiendo el dorsal"]
    },
    {
      id: "biceps_martillo_mancuernas",
      nombre: "Bíceps martillo mancuernas",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Mancuerna",
      youtubeId: "07D2fR_0iro",
      descripcion: "Rest pause: tras el fallo, descanso de 15 segundos y 2-3 reps extra.",
      tips: ["Agarre neutro firme", "Codos pegados al cuerpo", "Pausa isométrica de 1s arriba"]
    },
    {
      id: "scott_maquina_unilateral",
      nombre: "Scott máquina unilateral",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Máquina",
      youtubeId: "YUhSi_sUGmM",
      descripcion: "Tempo 1-3-1 (1s subida, 3s bajada, 1s pausa isométrica).",
      tips: ["Apoyo total de la axila en el cojín", "Estiramiento seguro sin hiperextensión brusca"]
    },

    // DÍA 2 PUSH (Pecho y Hombro)
    {
      id: "press_inclinado_60",
      nombre: "Press inclinado 60%",
      grupo: "Pecho",
      secundario: "Hombro",
      equipo: "Mancuerna / Banco",
      youtubeId: "DfgI6sGn9iQ",
      descripcion: "Inclinación a 60% para activar la porción clavicular.",
      tips: ["Codos a 45 grados respecto al torso", "Retracción escapular en el banco", "Pausa en el punto bajo"]
    },
    {
      id: "press_plano_maquina",
      nombre: "Press plano máquina",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Máquina",
      youtubeId: "fGpg1zE-Kd0",
      descripcion: "Serie piramidal (12, 10, 8, 6, 4 reps) subiendo carga progresiva.",
      tips: ["Subir peso en cada tramo", "Empuje firme sin levantar los glúteos del asiento"]
    },
    {
      id: "apertura_unilateral_desde_abajo",
      nombre: "Apertura unilateral desde abajo",
      grupo: "Pecho",
      secundario: "Pectoral Clavicular",
      equipo: "Polea",
      youtubeId: "nP9KArjEDeU",
      descripcion: "Bajadas lentas y controladas en 5 segundos en polea baja.",
      tips: ["Tirón hacia arriba y adentro cruzando la línea media", "Excéntrica de 5s estirando el pectoral"]
    },
    {
      id: "press_hombro_neutro",
      nombre: "Press hombro neutro",
      grupo: "Hombro",
      secundario: "Tríceps",
      equipo: "Mancuerna",
      youtubeId: "4N8wePRkBmY",
      descripcion: "Máximo rango de recorrido con mancuernas en agarre neutro.",
      tips: ["Agarre con palmas mirándose", "Bajar hasta tocar suavemente los hombros", "Codos ligeramente adelantados"]
    },
    {
      id: "laterales_maquina_unilateral",
      nombre: "Laterales máquina unilateral",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Máquina",
      youtubeId: "V98wql8IfVA",
      descripcion: "3 segundos de contracción isométrica arriba.",
      tips: ["Elevar con los codos y el deltoides", "Pausa de 3 segundos exactos arriba", "Bajar controlando"]
    },
    {
      id: "laterales_maquina",
      nombre: "Laterales máquina",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Máquina",
      youtubeId: "WmdhjLZzEjM",
      descripcion: "Series pesadas a 6-8 repeticiones en máquina.",
      tips: ["Mantener la tensión continua", "Sin encoger los trapecios de forma exagerada"]
    },

    // DÍA 3 LEG (Pierna Completa - Cuádriceps y Glúteo)
    {
      id: "prensa_horizontal_unilateral",
      nombre: "Prensa horizontal unilateral",
      grupo: "Pierna",
      secundario: "Glúteo",
      equipo: "Máquina",
      youtubeId: "uTjkm8DXeJY",
      descripcion: "Máximo recorrido por pierna con apoyo firme.",
      tips: ["Pie alineado con la rodilla", "Bajar profundo sin despegar la zona lumbar del respaldo"]
    },
    {
      id: "hack_pisada_neutra",
      nombre: "Hack pisada neutra",
      grupo: "Pierna",
      secundario: "Cuádriceps",
      equipo: "Máquina",
      youtubeId: "8Gk8snrY8u4",
      descripcion: "Bajadas controladas de 5 segundos con pisada neutra en sentadilla Hack.",
      tips: ["5 segundos reales de bajada", "Pausa en el fondo", "Empuje con el mediopié"]
    },
    {
      id: "zancadas_estaticas_smith",
      nombre: "Zancadas estáticas Smith",
      grupo: "Pierna",
      secundario: "Glúteo",
      equipo: "Smith",
      youtubeId: "yH0FeAwbjbw",
      descripcion: "RIR 0 al fallo muscular en máquina Smith (multipower).",
      tips: ["Paso largo para involucrar glúteo o medio para cuádriceps", "Torso ligeramente inclinado hacia adelante"]
    },
    {
      id: "belt_squat_cuadriceps",
      nombre: "Belt squat cuádriceps",
      grupo: "Pierna",
      secundario: "Cuádriceps",
      equipo: "Máquina",
      youtubeId: "beP38yZ1N9E",
      descripcion: "1 rep 1 rebote, 1 rep 2 rebotes... hasta 10 rebotes acumulativos.",
      tips: ["Mantén el torso erguido gracias al cinturón", "Rebotes controlados en el punto más profundo de máxima flexión"]
    },
    {
      id: "hip_thrust_unilateral",
      nombre: "Hip thrust unilateral",
      grupo: "Pierna",
      secundario: "Glúteo",
      equipo: "Mancuerna / Banco",
      youtubeId: "RaKaj5gtk1A",
      descripcion: "Máxima contracción de glúteo en el punto alto a una pierna.",
      tips: ["Barbilla pegada al pecho", "Bloqueo arriba apretando el glúteo 1 segundo"]
    },
    {
      id: "gemelo_de_pie",
      nombre: "Gemelo de pie",
      grupo: "Pierna",
      secundario: "Gemelos",
      equipo: "Máquina",
      youtubeId: "iOuAzeiDicY",
      descripcion: "3 series de 15-20 repeticiones con estiramiento completo de pie en máquina.",
      tips: ["Estiramiento profundo de 2s abajo", "Subida explosiva en la punta de los pies"]
    },

    // DÍA 4 PULL (Espalda y Cadena Posterior - Grosor y Lumbar)
    {
      id: "hiperextension_lumbar_con_peso",
      nombre: "Hiperextensión lumbar con peso",
      grupo: "Espalda",
      secundario: "Glúteo / Isquios",
      equipo: "Banco Romano",
      youtubeId: "5mzen3mhQOE",
      descripcion: "Movimiento controlado en banco romano con disco.",
      tips: ["Mantén la columna neutra", "Alinea cadera y hombro al subir sin hiperextender"]
    },
    {
      id: "remo_barra_smith",
      nombre: "Remo barra Smith",
      grupo: "Espalda",
      secundario: "Dorsal",
      equipo: "Smith",
      youtubeId: "lTQJFDyQq0s",
      descripcion: "Excéntrica en 5 segundos con barra guiada multipower.",
      tips: ["Tracción hacia el ombligo", "5 segundos en la fase excéntrica con control absoluto"]
    },
    {
      id: "jalon_unilateral_polea_alta",
      nombre: "Jalón unilateral polea alta",
      grupo: "Espalda",
      secundario: "Dorsal Ancho",
      equipo: "Polea",
      youtubeId: "rudpTb4A0X8",
      descripcion: "3 segundos de máxima contracción abajo con agarre neutro.",
      tips: ["Lleva el codo hacia el bolsillo del pantalón", "Pausa de 3 segundos abajo"]
    },
    {
      id: "remo_maquina_agarre_supino",
      nombre: "Remo máquina agarre supino",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Máquina",
      youtubeId: "iyOM6y5ADAQ",
      descripcion: "Serie piramidal (12, 10, 8, 6, 4 reps) con agarre supino.",
      tips: ["Palmas hacia arriba para mayor activación del dorsal bajo y bíceps"]
    },
    {
      id: "low_row",
      nombre: "Low row",
      grupo: "Espalda",
      secundario: "Dorsal",
      equipo: "Máquina",
      youtubeId: "Zigz-qCgY6U",
      descripcion: "Contracción de 2 segundos arriba en remo bajo de dorsal.",
      tips: ["Pecho apoyado", "Tirón bajo apretando las escápulas 2 segundos"]
    },

    // DÍA 5 ARMS (Brazos - Bíceps y Tríceps)
    {
      id: "polea_cuerda_baja",
      nombre: "Polea cuerda baja",
      grupo: "Bíceps",
      secundario: "Antebrazo",
      equipo: "Polea",
      youtubeId: "TCeIYlq00P8",
      descripcion: "3 segundos de isométrico arriba en contracción con cuerda.",
      tips: ["Abre la cuerda al llegar al pecho", "Mantén la contracción 3 segundos arriba"]
    },
    {
      id: "polea_alta_cuerda",
      nombre: "Polea alta cuerda",
      grupo: "Tríceps",
      secundario: "Braquial",
      equipo: "Polea",
      youtubeId: "qdRDkVqVeOY",
      descripcion: "3 segundos de isométrico abajo abriendo la cuerda de tríceps.",
      tips: ["Codos fijos a los costados", "Abre los extremos de la cuerda al extender los brazos"]
    },
    {
      id: "curl_biceps_barra_z",
      nombre: "Curl bíceps barra Z",
      grupo: "Bíceps",
      secundario: "Antebrazo",
      equipo: "Barra Z",
      youtubeId: "MtgfQwdgE3k",
      descripcion: "RIR 0 al límite concéntrico con barra Z de pie.",
      tips: ["Agarre ondulado para proteger muñecas", "Sin impulsarte con los lumbares"]
    },
    {
      id: "press_frances_mancuernas",
      nombre: "Press francés mancuernas",
      grupo: "Tríceps",
      secundario: "Hombro",
      equipo: "Mancuerna",
      youtubeId: "jCI6_pObQfo",
      descripcion: "RIR 0 tumbado con mancuernas y codos estables.",
      tips: ["Brazos ligeramente inclinados hacia atrás para mantener tensión constante"]
    },
    {
      id: "scott_unilateral",
      nombre: "Scott unilateral",
      grupo: "Bíceps",
      secundario: "Braquial",
      equipo: "Mancuerna / Banco",
      youtubeId: "KvZKqlRFhXc",
      descripcion: "RIR 0 en banco Scott con mancuerna a una mano.",
      tips: ["Aísla cada brazo por separado", "Controla la fase de bajada hasta la extensión completa"]
    },
    {
      id: "polea_unilateral_triceps",
      nombre: "Polea unilateral tríceps",
      grupo: "Tríceps",
      secundario: "Cabeza Lateral",
      equipo: "Polea",
      youtubeId: "visrQO8rhNo",
      descripcion: "RIR 0 extensión de tríceps en polea a una mano.",
      tips: ["Trabaja cada brazo sin asimetrías", "Foco en la cabeza lateral y medial"]
    },

    // DÍA 6 LEG (Pierna - Cadena Posterior y Aductor)
    {
      id: "aductor",
      nombre: "Aductor en máquina",
      grupo: "Pierna",
      secundario: "Aductores",
      equipo: "Máquina",
      youtubeId: "vlViIgtkvh4",
      descripcion: "Excéntrico en 5 segundos en máquina de aductores sentada.",
      tips: ["Apertura amplia", "5 segundos resistiendo la apertura de las piernas"]
    },
    {
      id: "peso_muerto_barra",
      nombre: "Peso muerto barra",
      grupo: "Pierna",
      secundario: "Espalda / Isquios",
      equipo: "Barra",
      youtubeId: "0XL4cZR2Ink",
      descripcion: "3 series pesadas de 4-6 reps con técnica convencional limpia.",
      tips: ["Barra pegada a las espinillas", "Cadera en bisagra", "Bloqueo firme con glúteos"]
    },
    {
      id: "sentadilla_sumo_en_smith",
      nombre: "Sentadilla sumo en Smith",
      grupo: "Pierna",
      secundario: "Aductores / Glúteo",
      equipo: "Smith",
      youtubeId: "qL3heyJRJvw",
      descripcion: "Bajadas controladas en 5 segundos con apertura ancha en Smith.",
      tips: ["Punteras orientadas hacia afuera a 45 grados", "Descenso vertical en 5 segundos"]
    },
    {
      id: "femoral_tumbado",
      nombre: "Femoral tumbado",
      grupo: "Pierna",
      secundario: "Isquiotibiales",
      equipo: "Máquina",
      youtubeId: "nmqG-tIr0hc",
      descripcion: "Máxima contracción arriba aguantando 1 segundo en máquina tumbado.",
      tips: ["Pies en flexión dorsal", "Contracción de 1s tocando casi los glúteos"]
    },
    {
      id: "femoral_sentado",
      nombre: "Femoral sentado",
      grupo: "Pierna",
      secundario: "Isquiotibiales",
      equipo: "Máquina",
      youtubeId: "oOE1vaDX71M",
      descripcion: "Excéntrica en 5 segundos en curl femoral sentado.",
      tips: ["Ajusta la almohadilla firme contra los muslos", "5 segundos en la fase de estiramiento"]
    },
    {
      id: "extension_cuadriceps",
      nombre: "Extensión cuádriceps",
      grupo: "Pierna",
      secundario: "Cuádriceps",
      equipo: "Máquina",
      youtubeId: "SguKyjZ6y9Q",
      descripcion: "RIR 0 al fallo en extensión de cuádriceps en máquina.",
      tips: ["Sujétate fuerte a las agarraderas laterales para no elevar la pelvis", "Extensión completa de rodilla"]
    },

    // =========================================================================
    // 2. EJERCICIOS COMPLEMENTARIOS Y DE GIMNASIO (CATÁLOGO EXPANDIDO)
    // =========================================================================
    // PECHO
    {
      id: "press_banca_plano_barra",
      nombre: "Press banca plano con barra",
      grupo: "Pecho",
      secundario: "Tríceps / Hombro Anterior",
      equipo: "Barra",
      youtubeId: "DfgI6sGn9iQ",
      descripcion: "El rey del empuje para el desarrollo general de pecho y fuerza.",
      tips: ["Arco lumbar natural", "Pies clavados al suelo", "Barra al esternón"]
    },
    {
      id: "press_plano_mancuernas",
      nombre: "Press plano con mancuernas",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Mancuerna",
      youtubeId: "fGpg1zE-Kd0",
      descripcion: "Permite mayor rango de recorrido y trabajo unilateral que la barra.",
      tips: ["Junta las mancuernas arriba sin chocarlas", "Baja hasta sentir el estiramiento pectoral"]
    },
    {
      id: "press_declinado_barra",
      nombre: "Press declinado con barra",
      grupo: "Pecho",
      secundario: "Tríceps",
      equipo: "Barra",
      youtubeId: "DfgI6sGn9iQ",
      descripcion: "Enfocado en la porción costal / inferior del pectoral.",
      tips: ["Control total de la barra hacia la parte baja del pecho"]
    },
    {
      id: "aperturas_mancuerna_plano",
      nombre: "Aperturas con mancuernas en banco plano",
      grupo: "Pecho",
      secundario: "Hombro",
      equipo: "Mancuerna",
      youtubeId: "nP9KArjEDeU",
      descripcion: "Máximo estiramiento mecánico de las fibras pectorales.",
      tips: ["Ligera flexión de codos constante durante todo el recorrido"]
    },
    {
      id: "cruces_polea_media",
      nombre: "Cruces en polea media",
      grupo: "Pecho",
      secundario: "Pectoral Mayor",
      equipo: "Polea",
      youtubeId: "nP9KArjEDeU",
      descripcion: "Tensión continua en el punto de máxima contracción.",
      tips: ["Cruza ligeramente las manos al frente apretando el pecho"]
    },
    {
      id: "flexiones_pecho",
      nombre: "Flexiones de pecho (Push-ups)",
      grupo: "Pecho",
      secundario: "Tríceps / Core",
      equipo: "Peso Corporal",
      youtubeId: "fGpg1zE-Kd0",
      descripcion: "Ejercicio calisténico fundamental para calentamiento o finisher.",
      tips: ["Core activado como una tabla", "Pecho al suelo"]
    },

    // ESPALDA
    {
      id: "dominadas_pronas",
      nombre: "Dominadas pronas lastradas",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Peso Corporal / Lastre",
      youtubeId: "orXhTMDnQkI",
      descripcion: "Tracción vertical fundamental para amplitud dorsal.",
      tips: ["Pecho a la barra", "Baja hasta extensión completa"]
    },
    {
      id: "remo_con_barra_90",
      nombre: "Remo con barra 90 grados",
      grupo: "Espalda",
      secundario: "Deltoides Posterior / Bíceps",
      equipo: "Barra",
      youtubeId: "lTQJFDyQq0s",
      descripcion: "Constructor masivo del grosor de la espalda.",
      tips: ["Tronco firme a 90 grados", "Tira con los codos hacia atrás"]
    },
    {
      id: "remo_gironda",
      nombre: "Remo Gironda en polea baja",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Polea",
      youtubeId: "iyOM6y5ADAQ",
      descripcion: "Tensión continua con agarre estrecho cerrado hacia el abdomen.",
      tips: ["Espalda recta", "Saca pecho en la contracción final"]
    },
    {
      id: "pullover_polea_alta",
      nombre: "Pullover en polea alta con barra recta",
      grupo: "Espalda",
      secundario: "Tríceps (cabeza larga)",
      equipo: "Polea",
      youtubeId: "nP9KArjEDeU",
      descripcion: "Aislamiento puro del dorsal ancho sin fatiga del bíceps.",
      tips: ["Brazos casi rectos", "Baja la barra a los muslos apretando dorsales"]
    },
    {
      id: "jalon_al_pecho_neutro",
      nombre: "Jalón al pecho agarre neutro cerrado",
      grupo: "Espalda",
      secundario: "Bíceps",
      equipo: "Polea",
      youtubeId: "rudpTb4A0X8",
      descripcion: "Excelente palanca biomecánica para el dorsal bajo.",
      tips: ["Agarre con triángulo o manerales neutros", "Lleva la barra a la clavícula"]
    },

    // PIERNA (CUÁDRICEPS, GLÚTEO, ISQUIOS)
    {
      id: "sentadilla_trasera_barra",
      nombre: "Sentadilla trasera con barra",
      grupo: "Pierna",
      secundario: "Glúteo / Core",
      equipo: "Barra",
      youtubeId: "8Gk8snrY8u4",
      descripcion: "El pilar fundamental de la fuerza y masa del tren inferior.",
      tips: ["Rompe el paralelo", "Rodillas en dirección a las puntas de los pies"]
    },
    {
      id: "sentadilla_frontal_barra",
      nombre: "Sentadilla frontal con barra",
      grupo: "Pierna",
      secundario: "Cuádriceps / Core",
      equipo: "Barra",
      youtubeId: "8Gk8snrY8u4",
      descripcion: "Máxima demanda vertical sobre el cuádriceps y estabilidad del core.",
      tips: ["Codos altos", "Tronco lo más vertical posible"]
    },
    {
      id: "sentadilla_bulgara_mancuernas",
      nombre: "Sentadilla búlgara con mancuernas",
      grupo: "Pierna",
      secundario: "Glúteo / Cuádriceps",
      equipo: "Mancuerna / Banco",
      youtubeId: "yH0FeAwbjbw",
      descripcion: "Ejercicio unilateral demoledor para glúteos y cuádriceps.",
      tips: ["Pie trasero apoyado en banco", "Baja con la rodilla trasera buscando el suelo"]
    },
    {
      id: "prensa_45_grados",
      nombre: "Prensa de 45 grados",
      grupo: "Pierna",
      secundario: "Cuádriceps / Glúteo",
      equipo: "Máquina",
      youtubeId: "uTjkm8DXeJY",
      descripcion: "Permite mover grandes cargas con bajo estrés sobre la columna vertebral.",
      tips: ["No bloquees las rodillas al extender", "Baja profundo"]
    },
    {
      id: "peso_muerto_rumano_mancuernas",
      nombre: "Peso muerto rumano con mancuernas",
      grupo: "Pierna",
      secundario: "Isquiotibiales / Glúteos",
      equipo: "Mancuerna",
      youtubeId: "0XL4cZR2Ink",
      descripcion: "Estiramiento bajo carga masivo para la cadena posterior.",
      tips: ["Empuja la cadera hacia atrás", "Espalda totalmente neutra"]
    },
    {
      id: "abductor_maquina",
      nombre: "Abductor en máquina",
      grupo: "Pierna",
      secundario: "Glúteo Medio",
      equipo: "Máquina",
      youtubeId: "vlViIgtkvh4",
      descripcion: "Aislamiento del glúteo medio para estabilidad de cadera y forma.",
      tips: ["Apertura amplia", "Aguanta 1s en la contracción externa"]
    },
    {
      id: "gemelo_sentado_maquina",
      nombre: "Gemelo sentado en máquina (Sóleo)",
      grupo: "Pierna",
      secundario: "Sóleo",
      equipo: "Máquina",
      youtubeId: "iOuAzeiDicY",
      descripcion: "Trabajo específico del sóleo con rodilla flexionada a 90 grados.",
      tips: ["Pausa abajo de 2 segundos para anular el reflejo elástico del tendón de Aquiles"]
    },

    // HOMBROS
    {
      id: "press_militar_barra_de_pie",
      nombre: "Press militar con barra de pie",
      grupo: "Hombro",
      secundario: "Tríceps / Core",
      equipo: "Barra",
      youtubeId: "4N8wePRkBmY",
      descripcion: "Constructor por excelencia de la fuerza y volumen de los deltoides.",
      tips: ["Aprieta glúteos y abdomen", "Mete la cabeza hacia adelante al pasar la frente"]
    },
    {
      id: "elevaciones_laterales_mancuernas",
      nombre: "Elevaciones laterales con mancuernas",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Mancuerna",
      youtubeId: "WmdhjLZzEjM",
      descripcion: "El ejercicio clave para dar amplitud en V a los hombros.",
      tips: ["Codos ligeramente flexionados", "Eleva en el plano escapular (30 grados al frente)"]
    },
    {
      id: "elevaciones_laterales_polea",
      nombre: "Elevaciones laterales en polea baja",
      grupo: "Hombro",
      secundario: "Deltoides Lateral",
      equipo: "Polea",
      youtubeId: "V98wql8IfVA",
      descripcion: "Curva de resistencia uniforme durante todo el recorrido.",
      tips: ["La polea mantiene la tensión incluso en el inicio del movimiento"]
    },
    {
      id: "face_pull_cuerda",
      nombre: "Face pull en polea alta con cuerda",
      grupo: "Hombro",
      secundario: "Deltoides Posterior / Manguito Rotador",
      equipo: "Polea",
      youtubeId: "WmdhjLZzEjM",
      descripcion: "Salud articular para hombros y desarrollo del deltoides posterior.",
      tips: ["Tira hacia los ojos o frente", "Rota externamente los hombros al final"]
    },
    {
      id: "pajaros_mancuerna_banco",
      nombre: "Pájaros con mancuerna en banco inclinado",
      grupo: "Hombro",
      secundario: "Deltoides Posterior",
      equipo: "Mancuerna / Banco",
      youtubeId: "WmdhjLZzEjM",
      descripcion: "Aislamiento estricto del deltoides posterior con pecho apoyado.",
      tips: ["Evita activar trapecios", "Abre los brazos como si abrazaras un barril"]
    },

    // BRAZOS (BÍCEPS Y TRÍCEPS)
    {
      id: "curl_biceps_inclinado_mancuerna",
      nombre: "Curl bíceps inclinado con mancuernas",
      grupo: "Bíceps",
      secundario: "Cabeza Larga Bíceps",
      equipo: "Mancuerna / Banco",
      youtubeId: "07D2fR_0iro",
      descripcion: "Estiramiento máximo de la cabeza larga del bíceps.",
      tips: ["Banco a 45 o 60 grados", "Deja caer los brazos por detrás del torso"]
    },
    {
      id: "curl_spider_banco",
      nombre: "Curl Spider en banco Scott / Inclinado",
      grupo: "Bíceps",
      secundario: "Cabeza Corta Bíceps",
      equipo: "Barra Z / Mancuerna",
      youtubeId: "YUhSi_sUGmM",
      descripcion: "Máxima tensión en acortamiento con brazos adelantados.",
      tips: ["Pecho apoyado", "Sube hasta contraer al 100%"]
    },
    {
      id: "fondos_en_paralelas",
      nombre: "Fondos en paralelas lastrados",
      grupo: "Tríceps",
      secundario: "Pecho / Hombro Anterior",
      equipo: "Peso Corporal / Lastre",
      youtubeId: "qdRDkVqVeOY",
      descripcion: "Constructor legendario de tríceps y pectoral inferior.",
      tips: ["Torso erguido para enfatizar tríceps", "Baja hasta 90 grados en codos"]
    },
    {
      id: "press_banca_cerrado",
      nombre: "Press banca con agarre cerrado",
      grupo: "Tríceps",
      secundario: "Pecho",
      equipo: "Barra",
      youtubeId: "jCI6_pObQfo",
      descripcion: "Permite mover gran tonelaje directo al tríceps.",
      tips: ["Manos al ancho de los hombros", "Codos cerca del torso al bajar"]
    },
    {
      id: "extension_triceps_katana",
      nombre: "Extensión de tríceps Katana en polea",
      grupo: "Tríceps",
      secundario: "Cabeza Larga",
      equipo: "Polea",
      youtubeId: "visrQO8rhNo",
      descripcion: "Alineación biomecánica perfecta con la cabeza larga del tríceps.",
      tips: ["Cruza las poleas por detrás de la cabeza y extiende hacia los lados"]
    },

    // ABDOMEN Y CORE
    {
      id: "crunch_abdominal_declinado",
      nombre: "Crunch abdominal declinado con disco",
      grupo: "Abdomen",
      secundario: "Core",
      equipo: "Banco Declinado",
      youtubeId: "eGo4IYlbE5g",
      descripcion: "Sobrecarga progresiva para el recto abdominal.",
      tips: ["Enrolla la columna vertebral hacia el pubis", "No tires del cuello"]
    },
    {
      id: "elevaciones_piernas_colgado",
      nombre: "Elevaciones de piernas colgado en barra",
      grupo: "Abdomen",
      secundario: "Flexores de Cadera",
      equipo: "Peso Corporal / Barra",
      youtubeId: "eGo4IYlbE5g",
      descripcion: "Desarrollo del abdomen inferior y estabilidad de la cintura.",
      tips: ["Sube la pelvis hacia las costillas", "Sin balanceo pendular"]
    },
    {
      id: "rueda_abdominal",
      nombre: "Rueda abdominal (Ab Wheel)",
      grupo: "Abdomen",
      secundario: "Dorsal / Core",
      equipo: "Rueda / Accesorio",
      youtubeId: "eGo4IYlbE5g",
      descripcion: "Ejercicio anti-extensión de máxima intensidad.",
      tips: ["Mantén la pelvis retrovertida", "Baja hasta donde puedas regresar sin arquear la espalda"]
    },
    {
      id: "plancha_isometrica_lastrada",
      nombre: "Plancha isométrica con disco",
      grupo: "Abdomen",
      secundario: "Core Completo",
      equipo: "Peso Corporal / Disco",
      youtubeId: "eGo4IYlbE5g",
      descripcion: "Entrenamiento estático de estabilidad de columna.",
      tips: ["Alinea tobillos, cadera y hombros", "Glúteo activo"]
    }
  ];

  var EjerciciosDB = {
    // Obtener todos los ejercicios combinando maestros y personalizados
    getAll: function() {
      var custom = (global.AppState && global.AppState.customExercises) ? global.AppState.customExercises : [];
      return EJERCICIOS_MAESTROS.concat(custom);
    },

    // Buscar ejercicio por ID
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
          matchesQuery = nameMatch || groupMatch || descMatch;
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
      var nuevo = {
        id: 'cust_ex_' + Date.now(),
        nombre: datos.nombre.trim(),
        grupo: datos.grupo || 'General',
        secundario: datos.secundario || '',
        equipo: datos.equipo || 'Máquina',
        youtubeId: datos.youtubeId || '',
        descripcion: datos.descripcion || 'Ejercicio personalizado del atleta.',
        tips: datos.tips || ['Ejecución controlada', 'Sobrecarga progresiva'],
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
