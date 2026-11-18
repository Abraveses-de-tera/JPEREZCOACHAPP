// =============================================================================
// JPEREZCOACH APP · MOTOR DE CHAT EN VIVO Y COMUNIDAD DE ATLETAS
// Chat con Jose Perez (Coach IA con su metodología) + Feed Grupal JPEREZ TEAM + WhatsApp
// =============================================================================

(function(global) {
  'use strict';

  var ChatEngine = {
    currentChannel: 'coach', // 'coach' | 'team'

    // Respuestas inteligentes del Coach Jose Perez basadas en su metodología real
    coachKnowledgeBase: [
      {
        triggers: ['calentar', 'calentamiento', 'serie pesada', 'como caliento'],
        response: 'Para llegar a la serie pesada sin fatigarte de antemano:\n1. Serie 1: 10 reps al 50% de la carga de trabajo (muy fluido).\n2. Serie 2: 5 reps al 70% (movimiento controlado).\n3. Serie 3: 2 reps al 85-90% para preparar el sistema nervioso sin acumular ácido láctico.\nDescansas 2-3 minutos y atacas la primera serie efectiva a RIR 0. ¡A por todas!'
      },
      {
        triggers: ['estancado', 'estanco', 'no subo', 'peso', 'marca'],
        response: 'Si te estancas en un ejercicio:\n1. Revisa la técnica: asegúrate de no estar perdiendo rango de recorrido.\n2. Aplica microcargas (+0.5kg o +1kg por lado en lugar de saltar de 5 en 5).\n3. Trabaja el tempo: si no puedes subir peso, haz la fase excéntrica en 5 segundos completos con el mismo peso; eso creará nuevo estímulo hipertrófico.\n4. Si llevas 3 semanas sin progresar, cambiamos el orden o rotamos el ejercicio.'
      },
      {
        triggers: ['rest pause', 'rest-pause', 'como funciona'],
        response: 'El Rest-Pause en mi sistema funciona así: haces la serie efectiva buscando el fallo muscular concéntrico en el rango marcado (por ejemplo 8-10 reps). Al llegar al fallo donde no puedes sacar otra repetición limpia, dejas el peso, respiras hondo 12-15 segundos (cronometrados), y sacas 2-3 repeticiones extra con la misma carga. Eso recluta el 100% de fibras motoras de alto umbral.'
      },
      {
        triggers: ['excentrico', 'excentrica', '5 segundos', '5s', 'bajada'],
        response: 'La fase excéntrica (bajada) en 5 segundos es uno de los sellos de nuestra metodología. Genera la mayor tensión mecánica y daño sarcomérico sin necesitar pesos que pongan en riesgo tus articulaciones. Cuenta mentalmente: 1001, 1002, 1003, 1004, 1005 y empuja explosivo pero controlado.'
      },
      {
        triggers: ['rotativo', 'rotativos', '6 dias', 'descanso', 'cuando descanso'],
        response: 'La rutina de 6 Días Rotativos (1 PULL ➔ 2 PUSH ➔ 3 LEG ➔ 4 PULL ➔ 5 ARMS ➔ 6 LEG) no está atada a los días de la semana (lunes a domingo). Si un día necesitas descansar o por trabajo no puedes ir al gimnasio, descansas. El siguiente día que entrenes, continúas exactamente por el día que tocaba en la secuencia. Así evitas el síndrome de "saltearse el día de pierna".'
      },
      {
        triggers: ['proteina', 'macros', 'comida', 'dieta', 'nutricion'],
        response: 'Para optimizar la ganancia muscular en este plan:\n- Proteína: 1.8 a 2.2 gramos por kilo de peso corporal al día repartido en 3-5 tomas.\n- Hidratos de carbono: tu combustible principal para las series pesadas y RIR 0; concéntralos antes y después de entrenar.\n- Agua: mínimo 3.5 a 4 litros diarios para mantener la voluminización celular muscular.'
      },
      {
        triggers: ['rebote', 'belt squat', 'rebotes'],
        response: 'En la Belt Squat con rebotes acumulativos: en la rep 1 haces 1 rebote abajo y subes; en la rep 2 haces 2 rebotes y subes; y así progresivamente hasta la rep 10 donde haces 10 rebotes seguidos en el fondo antes de bloquear. ¡Es una prueba de fuego para los cuádriceps!'
      }
    ],

    // Obtener mensajes del canal actual
    getMessages: function(channel) {
      channel = channel || this.currentChannel;
      if (!global.AppState) return [];
      return (channel === 'coach') ? global.AppState.chatCoach : global.AppState.chatTeam;
    },

    // Cambiar de canal
    setChannel: function(channel) {
      this.currentChannel = channel;
      document.dispatchEvent(new CustomEvent('jperez:channel-changed', { detail: { channel: channel } }));
    },

    // Enviar un mensaje de texto por el usuario
    sendMessage: function(text, channel) {
      if (!text || !text.trim()) return null;
      channel = channel || this.currentChannel;

      var currentUser = (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser : { name: 'Atleta', avatar: '' };

      var userMsg = {
        id: 'msg_' + Date.now(),
        sender: 'user',
        authorName: currentUser.name,
        avatar: currentUser.avatar || '',
        text: text.trim(),
        timestamp: new Date().toISOString()
      };

      global.AppState.addChatMessage(channel, userMsg);

      // Si es el canal del Coach, generar respuesta inteligente de Jose Perez
      if (channel === 'coach') {
        this.generateCoachResponse(text.trim());
      } else {
        // En el canal del equipo, simular respuesta de apoyo de un compañero ocasionalmente
        this.simulateTeamResponse(text.trim());
      }

      return userMsg;
    },

    // Generar respuesta del Coach Jose Perez
    generateCoachResponse: function(userPrompt) {
      var lower = userPrompt.toLowerCase();
      var responseText = '';

      // Buscar coincidencia en la base de conocimiento
      for (var i = 0; i < this.coachKnowledgeBase.length; i++) {
        var item = this.coachKnowledgeBase[i];
        var matched = item.triggers.some(function(t) { return lower.indexOf(t) >= 0; });
        if (matched) {
          responseText = item.response;
          break;
        }
      }

      // Respuesta de fallback con el tono motivador y estricto de Jose Perez
      if (!responseText) {
        var fallbacks = [
          '¡Buena pregunta! En nuestro entrenamiento la clave indiscutible es mantener la intensidad real al fallo (RIR 0) y no acelerar la excéntrica. Registra los pesos en cada serie para batir tu récord la próxima semana. ¿Cómo te has sentido hoy?',
          'Recuerda que la constancia y la progresión de cargas son el 90% del éxito. Si tienes dudas en cualquier ejercicio, pulsa en el botón de vídeo para revisar la técnica que te he dejado grabada.',
          '¡A tope! Cada serie cuenta. Si quieres que analicemos tu progreso a fondo o revisar tu plan dietético, pulsa en el botón de WhatsApp y me escribes directamente al móvil (+34 658 50 71 36).'
        ];
        responseText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      var self = this;
      setTimeout(function() {
        var coachMsg = {
          id: 'msg_coach_' + Date.now(),
          sender: 'coach',
          authorName: 'Jose Perez (Coach)',
          avatar: 'assets/coach_photo.png',
          text: responseText,
          timestamp: new Date().toISOString()
        };
        global.AppState.addChatMessage('coach', coachMsg);
      }, 700);
    },

    // Simular interacción de compañeros de equipo en el canal social
    simulateTeamResponse: function(userPrompt) {
      var mates = [
        { name: 'Carlos M.', text: '¡Grande! A seguir sumando días de hierro 💪🔥' },
        { name: 'Elena R.', text: '¡Vaya ritmo llevas! Esa constancia da frutos seguro 🦁' },
        { name: 'Sergio V.', text: '¡Duro! A tope con la rotación de Jose ⚡' }
      ];

      var randomMate = mates[Math.floor(Math.random() * mates.length)];

      setTimeout(function() {
        var teamMsg = {
          id: 'msg_team_' + Date.now(),
          sender: 'teammate',
          authorName: randomMate.name,
          avatar: '',
          text: randomMate.text,
          timestamp: new Date().toISOString(),
          reactions: {}
        };
        global.AppState.addChatMessage('team', teamMsg);
      }, 1200);
    },

    // Compartir el último entrenamiento completado en el chat
    shareLastWorkout: function(channel) {
      channel = channel || this.currentChannel;
      var history = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
      if (history.length === 0) {
        alert('Aún no has completado ningún entrenamiento para compartir. ¡Completa tu primera sesión!');
        return false;
      }

      var lastWorkout = history[0];
      var currentUser = (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser : { name: 'Atleta' };

      var cardText = '🏋️‍♂️ **¡Entrenamiento Completado!**\n' +
        '**' + lastWorkout.name + '**\n' +
        '⏱️ Duración: ' + (global.WorkoutEngine ? global.WorkoutEngine.formatDuration(lastWorkout.durationSeconds) : '45 min') + '\n' +
        '📊 Volumen Total: ' + (lastWorkout.totalVolumeKg || 0) + ' kg\n' +
        '🔢 Series: ' + (lastWorkout.totalSets || 0) + ' | Reps: ' + (lastWorkout.totalReps || 0);

      if (lastWorkout.prsCount > 0) {
        cardText += '\n🏆 **¡' + lastWorkout.prsCount + ' Nuevo(s) Récord(s) Personal(es) superado(s)!**';
      }

      var msg = {
        id: 'msg_share_' + Date.now(),
        sender: 'user',
        authorName: currentUser.name,
        avatar: currentUser.avatar || '',
        text: cardText,
        isWorkoutCard: true,
        workoutData: lastWorkout,
        timestamp: new Date().toISOString(),
        reactions: channel === 'team' ? { '🔥': [currentUser.name] } : {}
      };

      global.AppState.addChatMessage(channel, msg);

      if (channel === 'coach') {
        var coachReply = '¡Brutal sesión, ' + currentUser.name + '! Has movido ' + (lastWorkout.totalVolumeKg || 0) + ' kg de volumen total. Descansa bien, hidrátate y a comer limpio para asimilar el estímulo.';
        setTimeout(function() {
          var cMsg = {
            id: 'msg_coach_' + Date.now(),
            sender: 'coach',
            authorName: 'Jose Perez (Coach)',
            avatar: 'assets/coach_photo.png',
            text: coachReply,
            timestamp: new Date().toISOString()
          };
          global.AppState.addChatMessage('coach', cMsg);
        }, 800);
      } else {
        setTimeout(function() {
          var tMsg = {
            id: 'msg_team_' + Date.now(),
            sender: 'teammate',
            authorName: 'Carlos M.',
            avatar: '',
            text: '¡Vaya bestialidad de volumen (' + (lastWorkout.totalVolumeKg || 0) + ' kg)! Enhorabuena 🦁🔥',
            timestamp: new Date().toISOString(),
            reactions: { '💪': ['Elena R.', 'Sergio V.'] }
          };
          global.AppState.addChatMessage('team', tMsg);
        }, 1200);
      }

      return true;
    },

    // Generar enlace directo a WhatsApp con mensaje formateado
    getWhatsAppUrl: function() {
      var phone = '34658507136';
      var history = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
      var user = (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser : { name: 'Atleta' };

      var text = '¡Hola Jose! Soy ' + user.name + ' de tu app JPEREZCOACH.';
      if (history.length > 0) {
        var last = history[0];
        text += ' Acabo de finalizar mi entreno de ' + last.name + ' con ' + last.totalVolumeKg + ' kg de volumen total.';
      }
      text += ' ¿Cómo lo ves? ¡Un saludo!\n\n📲 https://abraveses-de-tera.github.io/JPEREZCOACHAPP/';

      return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    }
  };

  global.ChatEngine = ChatEngine;
})(window);
