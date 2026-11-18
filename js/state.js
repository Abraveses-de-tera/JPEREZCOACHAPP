// =============================================================================
// JPEREZCOACH APP · ESTADO GLOBAL REACTIVO Y PERSISTENCIA (HEVY STYLE)
// Almacenamiento seguro en LocalStorage con soporte de backup/sync
// =============================================================================

(function(global) {
  'use strict';

  var STORAGE_KEYS = {
    USER: 'jperez_current_user_v2',
    USERS: 'jperez_all_users_v2',
    ACTIVE_WORKOUT: 'jperez_active_workout_v2',
    WORKOUT_HISTORY: 'jperez_workout_history_v2',
    CUSTOM_ROUTINES: 'jperez_custom_routines_v2',
    CUSTOM_EXERCISES: 'jperez_custom_exercises_v2',
    CHAT_COACH: 'jperez_chat_coach_v2',
    CHAT_TEAM: 'jperez_chat_team_v2',
    SETTINGS: 'jperez_app_settings_v2',
    PRS: 'jperez_personal_records_v2'
  };

  // Usuarios predeterminados para inicio de sesión inmediato / demo
  var DEFAULT_USERS = [
    {
      id: 'david',
      name: 'David Otero',
      username: 'davidotero',
      email: 'david@jperezcoach.com',
      avatar: 'assets/coach_photo.png',
      role: 'Atleta Oficial',
      weight: 84.5,
      height: 181,
      goal: 'Hipertrofia y Alta Intensidad',
      streak: 5,
      joinedDate: '2026-01-10',
      bio: 'Atleta JPEREZCOACH · Rutina 6 Días Rotativos · Enfoque RIR 0 y excéntricas controladas.'
    },
    {
      id: 'jperez',
      name: 'Jose Perez',
      username: 'jperezcoach',
      email: 'jperez@mail.com',
      avatar: 'assets/coach_photo.png',
      role: 'Head Coach',
      weight: 92.0,
      height: 184,
      goal: 'Entrenador & Preparador',
      streak: 18,
      joinedDate: '2025-01-01',
      bio: 'Entrenador Personal y Preparador de Atletas de Alta Intensidad. Contacto: +34 658 50 71 36 · jperezcoach.com'
    },
    {
      id: 'invitado',
      name: 'Nuevo Atleta',
      username: 'atleta_invitado',
      email: 'atleta@gym.com',
      avatar: '',
      role: 'Atleta en Formación',
      weight: 78.0,
      height: 178,
      goal: 'Fuerza e Hipertrofia',
      streak: 1,
      joinedDate: '2026-11-18',
      bio: 'Empezando el plan de fuerza con JPEREZCOACH.'
    }
  ];

  var DEFAULT_SETTINGS = {
    restTimerSeconds: 90,
    soundEnabled: true,
    vibrateEnabled: true,
    theme: 'dark',
    units: 'kg',
    autoStartRest: true,
    keepScreenAwake: true
  };

  var AppState = {
    currentUser: null,
    users: [],
    activeWorkout: null,
    workoutHistory: [],
    customRoutines: [],
    customExercises: [],
    chatCoach: [],
    chatTeam: [],
    settings: Object.assign({}, DEFAULT_SETTINGS),
    prs: {},

    // Inicializar estado desde LocalStorage
    init: function() {
      this.loadUsers();
      this.loadSettings();
      this.loadActiveWorkout();
      this.loadWorkoutHistory();
      this.loadCustomRoutines();
      this.loadCustomExercises();
      this.loadChats();
      this.loadPRs();
      return this;
    },

    loadUsers: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.USERS);
        this.users = raw ? JSON.parse(raw) : DEFAULT_USERS;
        
        var currentRaw = localStorage.getItem(STORAGE_KEYS.USER);
        if (currentRaw) {
          this.currentUser = JSON.parse(currentRaw);
        } else {
          // Iniciar por defecto con David Otero (el atleta de la rutina de Jose Perez)
          this.currentUser = this.users[0];
          this.saveCurrentUser();
        }
      } catch (e) {
        console.error('Error cargando usuarios:', e);
        this.users = DEFAULT_USERS;
        this.currentUser = DEFAULT_USERS[0];
      }
    },

    saveCurrentUser: function() {
      try {
        if (this.currentUser) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
          // Actualizar en la lista de usuarios
          var idx = this.users.findIndex(function(u) { return u.id === AppState.currentUser.id; });
          if (idx >= 0) {
            this.users[idx] = AppState.currentUser;
          } else {
            this.users.push(AppState.currentUser);
          }
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
        }
      } catch (e) {
        console.error('Error guardando usuario actual:', e);
      }
    },

    setCurrentUser: function(user) {
      this.currentUser = user;
      this.saveCurrentUser();
      document.dispatchEvent(new CustomEvent('jperez:user-changed', { detail: user }));
    },

    loadSettings: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        this.settings = raw ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw)) : Object.assign({}, DEFAULT_SETTINGS);
      } catch (e) {
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
      }
    },

    saveSettings: function() {
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      } catch (e) {
        console.error('Error guardando ajustes:', e);
      }
    },

    loadActiveWorkout: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        this.activeWorkout = raw ? JSON.parse(raw) : null;
      } catch (e) {
        this.activeWorkout = null;
      }
    },

    saveActiveWorkout: function() {
      try {
        if (this.activeWorkout) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(this.activeWorkout));
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        }
      } catch (e) {
        console.error('Error guardando entreno activo:', e);
      }
    },

    clearActiveWorkout: function() {
      this.activeWorkout = null;
      try {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      } catch (e) {}
    },

    loadWorkoutHistory: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
        this.workoutHistory = raw ? JSON.parse(raw) : this.generateSeedHistory();
      } catch (e) {
        this.workoutHistory = this.generateSeedHistory();
      }
    },

    saveWorkoutHistory: function() {
      try {
        localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(this.workoutHistory));
        this.calculatePRs();
      } catch (e) {
        console.error('Error guardando historial:', e);
      }
    },

    addCompletedWorkout: function(workout) {
      if (!workout.id) {
        workout.id = 'w_' + Date.now();
      }
      this.workoutHistory.unshift(workout);
      this.saveWorkoutHistory();
      this.clearActiveWorkout();
      
      // Actualizar streak del usuario
      if (this.currentUser) {
        this.currentUser.streak = (this.currentUser.streak || 0) + 1;
        this.saveCurrentUser();
      }

      document.dispatchEvent(new CustomEvent('jperez:workout-completed', { detail: workout }));
      return workout;
    },

    loadCustomRoutines: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES);
        this.customRoutines = raw ? JSON.parse(raw) : [];
      } catch (e) {
        this.customRoutines = [];
      }
    },

    saveCustomRoutines: function() {
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(this.customRoutines));
      } catch (e) {
        console.error('Error guardando rutinas personalizadas:', e);
      }
    },

    addCustomRoutine: function(routine) {
      if (!routine.id) {
        routine.id = 'rutina_custom_' + Date.now();
      }
      routine.createdAt = new Date().toISOString();
      routine.isCustom = true;
      this.customRoutines.unshift(routine);
      this.saveCustomRoutines();
      document.dispatchEvent(new CustomEvent('jperez:routines-updated'));
      return routine;
    },

    updateCustomRoutine: function(id, updatedData) {
      var idx = this.customRoutines.findIndex(function(r) { return r.id === id; });
      if (idx >= 0) {
        this.customRoutines[idx] = Object.assign({}, this.customRoutines[idx], updatedData, { updatedAt: new Date().toISOString() });
        this.saveCustomRoutines();
        document.dispatchEvent(new CustomEvent('jperez:routines-updated'));
        return this.customRoutines[idx];
      }
      return null;
    },

    deleteCustomRoutine: function(id) {
      this.customRoutines = this.customRoutines.filter(function(r) { return r.id !== id; });
      this.saveCustomRoutines();
      document.dispatchEvent(new CustomEvent('jperez:routines-updated'));
    },

    loadCustomExercises: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
        this.customExercises = raw ? JSON.parse(raw) : [];
      } catch (e) {
        this.customExercises = [];
      }
    },

    saveCustomExercises: function() {
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(this.customExercises));
      } catch (e) {
        console.error('Error guardando ejercicios personalizados:', e);
      }
    },

    addCustomExercise: function(exercise) {
      if (!exercise.id) {
        exercise.id = 'ex_custom_' + Date.now();
      }
      exercise.isCustom = true;
      this.customExercises.push(exercise);
      this.saveCustomExercises();
      document.dispatchEvent(new CustomEvent('jperez:exercises-updated'));
      return exercise;
    },

    loadChats: function() {
      try {
        var coachRaw = localStorage.getItem(STORAGE_KEYS.CHAT_COACH);
        this.chatCoach = coachRaw ? JSON.parse(coachRaw) : this.generateSeedCoachChat();

        var teamRaw = localStorage.getItem(STORAGE_KEYS.CHAT_TEAM);
        this.chatTeam = teamRaw ? JSON.parse(teamRaw) : this.generateSeedTeamChat();
      } catch (e) {
        this.chatCoach = this.generateSeedCoachChat();
        this.chatTeam = this.generateSeedTeamChat();
      }
    },

    saveChats: function() {
      try {
        localStorage.setItem(STORAGE_KEYS.CHAT_COACH, JSON.stringify(this.chatCoach));
        localStorage.setItem(STORAGE_KEYS.CHAT_TEAM, JSON.stringify(this.chatTeam));
      } catch (e) {
        console.error('Error guardando chats:', e);
      }
    },

    addChatMessage: function(channel, message) {
      if (!message.id) message.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      if (!message.timestamp) message.timestamp = new Date().toISOString();

      if (channel === 'coach') {
        this.chatCoach.push(message);
      } else {
        this.chatTeam.push(message);
      }
      this.saveChats();
      document.dispatchEvent(new CustomEvent('jperez:chat-updated', { detail: { channel: channel, message: message } }));
      return message;
    },

    addReactionToMessage: function(channel, messageId, emoji, userName) {
      var list = (channel === 'coach') ? this.chatCoach : this.chatTeam;
      var msg = list.find(function(m) { return m.id === messageId; });
      if (msg) {
        if (!msg.reactions) msg.reactions = {};
        if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
        var userIdx = msg.reactions[emoji].indexOf(userName);
        if (userIdx >= 0) {
          msg.reactions[emoji].splice(userIdx, 1);
          if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
        } else {
          msg.reactions[emoji].push(userName);
        }
        this.saveChats();
        document.dispatchEvent(new CustomEvent('jperez:chat-updated', { detail: { channel: channel } }));
      }
    },

    loadPRs: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.PRS);
        this.prs = raw ? JSON.parse(raw) : {};
        if (Object.keys(this.prs).length === 0) {
          this.calculatePRs();
        }
      } catch (e) {
        this.calculatePRs();
      }
    },

    // Calcular records personales basados en el historial completo
    calculatePRs: function() {
      var records = {};
      var workouts = this.workoutHistory || [];

      workouts.forEach(function(w) {
        if (!w.exercises) return;
        w.exercises.forEach(function(ex) {
          var exId = ex.exerciseId || ex.id;
          if (!exId) return;
          if (!records[exId]) {
            records[exId] = {
              exerciseName: ex.name,
              maxWeight: 0,
              maxRepsAtMaxWeight: 0,
              maxEstimated1RM: 0,
              maxVolumeInSingleSet: 0,
              date: w.endedAt || w.date
            };
          }

          if (ex.sets) {
            ex.sets.forEach(function(s) {
              if (s.completed) {
                var weight = parseFloat(s.weight) || 0;
                var reps = parseInt(s.reps, 10) || 0;
                if (weight > 0 && reps > 0) {
                  // Fórmula Epley 1RM: peso * (1 + reps / 30)
                  var e1rm = Math.round(weight * (1 + (reps / 30)) * 10) / 10;
                  var setVol = weight * reps;

                  if (weight > records[exId].maxWeight) {
                    records[exId].maxWeight = weight;
                    records[exId].maxRepsAtMaxWeight = reps;
                    records[exId].date = w.endedAt || w.date;
                  }
                  if (e1rm > records[exId].maxEstimated1RM) {
                    records[exId].maxEstimated1RM = e1rm;
                  }
                  if (setVol > records[exId].maxVolumeInSingleSet) {
                    records[exId].maxVolumeInSingleSet = setVol;
                  }
                }
              }
            });
          }
        });
      });

      this.prs = records;
      try {
        localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(this.prs));
      } catch (e) {}
      return records;
    },

    // Buscar marcas de la sesión anterior para un ejercicio
    getLastSessionForExercise: function(exerciseId) {
      for (var i = 0; i < this.workoutHistory.length; i++) {
        var w = this.workoutHistory[i];
        if (w.exercises) {
          var found = w.exercises.find(function(e) { return (e.exerciseId === exerciseId || e.id === exerciseId); });
          if (found && found.sets && found.sets.length > 0) {
            return {
              workoutDate: w.endedAt || w.date,
              workoutName: w.name,
              sets: found.sets.filter(function(s) { return s.completed; })
            };
          }
        }
      }
      return null;
    },

    // Semilla de entrenamientos previos para que la app se sienta viva desde el primer segundo
    generateSeedHistory: function() {
      return [
        {
          id: 'w_seed_1',
          name: '1 PULL · Espalda y Bíceps',
          routineId: 'D1',
          date: '2026-11-16T18:30:00.000Z',
          endedAt: '2026-11-16T19:42:00.000Z',
          durationSeconds: 4320,
          totalVolumeKg: 9480,
          totalSets: 16,
          totalReps: 124,
          prsCount: 2,
          exercises: [
            {
              exerciseId: 'dominadas_jalon',
              name: 'Dominadas/jalón',
              sets: [
                { setNumber: 1, type: 'pesada', weight: 85, reps: 6, completed: true, isPR: true },
                { setNumber: 2, type: 'pesada', weight: 85, reps: 5, completed: true, isPR: false },
                { setNumber: 3, type: 'pesada', weight: 80, reps: 6, completed: true, isPR: false }
              ]
            },
            {
              exerciseId: 'remo_t',
              name: 'Remo T',
              sets: [
                { setNumber: 1, type: 'pesada', weight: 70, reps: 6, completed: true, isPR: true },
                { setNumber: 2, type: 'pesada', weight: 70, reps: 6, completed: true, isPR: false },
                { setNumber: 3, type: 'pesada', weight: 65, reps: 6, completed: true, isPR: false }
              ]
            },
            {
              exerciseId: 'jalon_maquina',
              name: 'Jalón máquina',
              sets: [
                { setNumber: 1, type: 'normal', weight: 75, reps: 10, completed: true, isPR: false },
                { setNumber: 2, type: 'normal', weight: 75, reps: 9, completed: true, isPR: false },
                { setNumber: 3, type: 'fallo', weight: 70, reps: 9, completed: true, isPR: false }
              ]
            },
            {
              exerciseId: 'biceps_martillo_mancuernas',
              name: 'Bíceps martillo mancuernas',
              sets: [
                { setNumber: 1, type: 'normal', weight: 18, reps: 10, completed: true, isPR: false },
                { setNumber: 2, type: 'rest_pause', weight: 18, reps: 9, completed: true, isPR: false }
              ]
            }
          ],
          notes: 'Gran congestión en espalda. Dominadas muy sólidas con pausa abajo.'
        },
        {
          id: 'w_seed_2',
          name: '2 PUSH · Pecho y Hombro',
          routineId: 'D2',
          date: '2026-11-14T17:15:00.000Z',
          endedAt: '2026-11-14T18:25:00.000Z',
          durationSeconds: 4200,
          totalVolumeKg: 8920,
          totalSets: 16,
          totalReps: 138,
          prsCount: 1,
          exercises: [
            {
              exerciseId: 'press_inclinado_60',
              name: 'Press inclinado 60%',
              sets: [
                { setNumber: 1, type: 'normal', weight: 70, reps: 10, completed: true, isPR: true },
                { setNumber: 2, type: 'normal', weight: 70, reps: 9, completed: true, isPR: false },
                { setNumber: 3, type: 'normal', weight: 65, reps: 8, completed: true, isPR: false }
              ]
            },
            {
              exerciseId: 'press_plano_maquina',
              name: 'Press plano máquina',
              sets: [
                { setNumber: 1, type: 'piramidal', weight: 60, reps: 12, completed: true, isPR: false },
                { setNumber: 2, type: 'piramidal', weight: 70, reps: 10, completed: true, isPR: false },
                { setNumber: 3, type: 'piramidal', weight: 80, reps: 8, completed: true, isPR: false }
              ]
            }
          ],
          notes: 'Hombro sano y muy buenas sensaciones en press inclinado.'
        }
      ];
    },

    generateSeedCoachChat: function() {
      return [
        {
          id: 'msg_seed_c1',
          sender: 'coach',
          authorName: 'Jose Perez',
          avatar: 'assets/coach_photo.png',
          text: '¡Hola David! Bienvenido a tu app JPEREZCOACH tipo Hevy. Aquí tienes toda tu rotación de 6 días, el creador de rutinas para añadir cualquier variación y el registro serie a serie en tiempo real. Recuerda: en cada serie pesada ve a RIR 0 con excéntricas de 5 segundos.',
          timestamp: '2026-11-18T08:00:00.000Z'
        },
        {
          id: 'msg_seed_c2',
          sender: 'user',
          authorName: 'David Otero',
          avatar: '',
          text: '¡Jose! Las dominadas del último entreno salieron a 85kg con pausa estricta. Mañana me toca pierna con sentadilla Hack a 5 segundos de bajada.',
          timestamp: '2026-11-18T08:15:00.000Z'
        },
        {
          id: 'msg_seed_c3',
          sender: 'coach',
          authorName: 'Jose Perez',
          avatar: 'assets/coach_photo.png',
          text: '¡Brutal esa marca de 85kg! Mañana en la Hack controla el rebote abajo, 5 segundos clavados en la bajada y empuja con la planta entera sin despegar el talón. Al terminar me pasas el resumen del entreno por aquí o directo a mi WhatsApp.',
          timestamp: '2026-11-18T08:20:00.000Z'
        }
      ];
    },

    generateSeedTeamChat: function() {
      return [
        {
          id: 'msg_seed_t1',
          sender: 'user_carlos',
          authorName: 'Carlos M.',
          avatar: '',
          text: '¡Equipo! Acabo de terminar el Día 4 (PULL grosor y lumbar). El remo barra Smith a 5s de bajada te deja la espalda como una roca 🔥🦁',
          timestamp: '2026-11-18T10:30:00.000Z',
          reactions: { '🔥': ['David Otero', 'Jose Perez'], '💪': ['Elena R.'] }
        },
        {
          id: 'msg_seed_t2',
          sender: 'user_elena',
          authorName: 'Elena R.',
          avatar: '',
          text: 'Ayer probé la Belt Squat con rebotes acumulativos (hasta 10 rebotes) y las agujetas hoy son de otro planeta 😅 ¡A seguir sumando!',
          timestamp: '2026-11-18T11:45:00.000Z',
          reactions: { '🦁': ['David Otero', 'Carlos M.'] }
        },
        {
          id: 'msg_seed_t3',
          sender: 'coach',
          authorName: 'Jose Perez (Coach)',
          avatar: 'assets/coach_photo.png',
          text: '¡Eso es intensidad real equipo! La clave del método JPEREZ no es mover peso por mover, es la tensión mecánica en la excéntrica. ¡Orgulloso de vosotros!',
          timestamp: '2026-11-18T12:00:00.000Z',
          reactions: { '⚡': ['David Otero', 'Carlos M.', 'Elena R.'] }
        }
      ];
    },

    // Exportar todos los datos como archivo JSON
    exportAllData: function() {
      var backup = {
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        app: 'JPEREZCOACHAPP',
        user: this.currentUser,
        users: this.users,
        workoutHistory: this.workoutHistory,
        customRoutines: this.customRoutines,
        customExercises: this.customExercises,
        prs: this.prs,
        settings: this.settings,
        chatCoach: this.chatCoach,
        chatTeam: this.chatTeam
      };
      return JSON.stringify(backup, null, 2);
    },

    // Importar datos desde JSON
    importAllData: function(jsonString) {
      try {
        var data = JSON.parse(jsonString);
        if (data.workoutHistory) this.workoutHistory = data.workoutHistory;
        if (data.customRoutines) this.customRoutines = data.customRoutines;
        if (data.customExercises) this.customExercises = data.customExercises;
        if (data.user) this.currentUser = data.user;
        if (data.users) this.users = data.users;
        if (data.settings) this.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
        if (data.chatCoach) this.chatCoach = data.chatCoach;
        if (data.chatTeam) this.chatTeam = data.chatTeam;

        this.saveCurrentUser();
        this.saveWorkoutHistory();
        this.saveCustomRoutines();
        this.saveCustomExercises();
        this.saveSettings();
        this.saveChats();
        this.calculatePRs();

        document.dispatchEvent(new CustomEvent('jperez:data-imported'));
        return true;
      } catch (e) {
        console.error('Error importando datos:', e);
        return false;
      }
    }
  };

  // Inicializar en carga
  AppState.init();

  global.AppState = AppState;
})(window);
