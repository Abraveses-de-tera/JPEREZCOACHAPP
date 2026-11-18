// =============================================================================
// JPEREZCOACH APP · ESTADO GLOBAL REACTIVO Y PERSISTENCIA (HEVY STYLE V3)
// Rutinas 100% dinámicas, borrables, guardables y exportables + LocalStorage
// =============================================================================

(function(global) {
  'use strict';

  var STORAGE_KEYS = {
    USER: 'jperez_current_user_v3',
    USERS: 'jperez_all_users_v3',
    ACTIVE_WORKOUT: 'jperez_active_workout_v3',
    WORKOUT_HISTORY: 'jperez_workout_history_v3',
    ROUTINES: 'jperez_all_routines_v3', // Almacén dinámico unificado de rutinas
    CUSTOM_EXERCISES: 'jperez_custom_exercises_v3',
    CHAT_COACH: 'jperez_chat_coach_v3',
    CHAT_TEAM: 'jperez_chat_team_v3',
    SETTINGS: 'jperez_app_settings_v3',
    PRS: 'jperez_personal_records_v3'
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
    routines: [], // Todas las rutinas activas (editables, borrables y exportables)
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
      this.loadRoutines();
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
          this.currentUser = this.users[0];
          this.saveCurrentUser();
        }
      } catch (e) {
        this.users = DEFAULT_USERS;
        this.currentUser = DEFAULT_USERS[0];
      }
    },

    saveCurrentUser: function() {
      try {
        if (this.currentUser) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
          var idx = this.users.findIndex(function(u) { return u.id === AppState.currentUser.id; });
          if (idx >= 0) {
            this.users[idx] = AppState.currentUser;
          } else {
            this.users.push(AppState.currentUser);
          }
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
        }
      } catch (e) {
        console.error('Error guardando usuario:', e);
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
    },

    addCompletedWorkout: function(workout) {
      if (!workout.id) {
        workout.id = 'w_' + Date.now();
      }
      this.workoutHistory.unshift(workout);
      this.saveWorkoutHistory();
      this.clearActiveWorkout();

      if (this.currentUser) {
        this.currentUser.streak = (this.currentUser.streak || 0) + 1;
        this.saveCurrentUser();
      }

      document.dispatchEvent(new CustomEvent('jperez:workout-completed', { detail: workout }));
      return workout;
    },

    // =========================================================================
    // GESTIÓN DINÁMICA DE RUTINAS (BORRAR, GUARDAR, RESTAURAR, EXPORTAR)
    // =========================================================================
    loadRoutines: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
        if (raw) {
          this.routines = JSON.parse(raw);
        } else {
          // Si es la primera vez, cargar las plantillas maestras oficiales de Jose Perez
          if (global.RutinasMaestras && global.RutinasMaestras.PLANTILLAS_OFICIALES) {
            this.routines = JSON.parse(JSON.stringify(global.RutinasMaestras.PLANTILLAS_OFICIALES));
          } else {
            this.routines = [];
          }
          this.saveRoutines();
        }
      } catch (e) {
        this.routines = [];
      }
    },

    saveRoutines: function() {
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(this.routines));
        document.dispatchEvent(new CustomEvent('jperez:routines-updated'));
      } catch (e) {
        console.error('Error guardando rutinas:', e);
      }
    },

    addRoutine: function(routine) {
      if (!routine.id) {
        routine.id = 'rutina_' + Date.now();
      }
      routine.createdAt = new Date().toISOString();
      this.routines.unshift(routine);
      this.saveRoutines();
      return routine;
    },

    updateRoutine: function(id, updatedData) {
      var idx = this.routines.findIndex(function(r) { return r.id === id; });
      if (idx >= 0) {
        this.routines[idx] = Object.assign({}, this.routines[idx], updatedData, { updatedAt: new Date().toISOString() });
        this.saveRoutines();
        return this.routines[idx];
      }
      return null;
    },

    deleteRoutine: function(id) {
      var initialCount = this.routines.length;
      this.routines = this.routines.filter(function(r) { return r.id !== id; });
      if (this.routines.length !== initialCount) {
        this.saveRoutines();
        return true;
      }
      return false;
    },

    clearAllRoutines: function() {
      this.routines = [];
      this.saveRoutines();
    },

    restoreDefaultRoutines: function() {
      if (global.RutinasMaestras && global.RutinasMaestras.PLANTILLAS_OFICIALES) {
        this.routines = JSON.parse(JSON.stringify(global.RutinasMaestras.PLANTILLAS_OFICIALES));
        this.saveRoutines();
        return true;
      }
      return false;
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
      } catch (e) {}
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
      } catch (e) {}
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
            }
          ],
          notes: 'Gran congestión en espalda. Dominadas muy sólidas con pausa abajo.'
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
          text: '¡Hola! Bienvenido a tu app JPEREZCOACH tipo Hevy. Puedes usar la rotación de 6 días, o borrarla y subir tu propia rutina en PDF o crearla desde cero. Recuerda: en cada serie efectiva ve a RIR 0 con excéntricas de 5 segundos.',
          timestamp: '2026-11-18T08:00:00.000Z'
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
          text: '¡Equipo! Acabo de terminar sesión de piernas. Sentadilla Hack a 5s de bajada y las piernas están ardiendo 🔥🦁',
          timestamp: '2026-11-18T10:30:00.000Z',
          reactions: { '🔥': ['David Otero', 'Jose Perez'] }
        }
      ];
    },

    exportAllData: function() {
      var backup = {
        exportedAt: new Date().toISOString(),
        version: '3.0.0',
        app: 'JPEREZCOACHAPP',
        user: this.currentUser,
        users: this.users,
        workoutHistory: this.workoutHistory,
        routines: this.routines,
        customExercises: this.customExercises,
        prs: this.prs,
        settings: this.settings,
        chatCoach: this.chatCoach,
        chatTeam: this.chatTeam
      };
      return JSON.stringify(backup, null, 2);
    },

    importAllData: function(jsonString) {
      try {
        var data = JSON.parse(jsonString);
        if (data.workoutHistory) this.workoutHistory = data.workoutHistory;
        if (data.routines) this.routines = data.routines;
        else if (data.customRoutines) this.routines = data.customRoutines;
        if (data.customExercises) this.customExercises = data.customExercises;
        if (data.user) this.currentUser = data.user;
        if (data.users) this.users = data.users;
        if (data.settings) this.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
        if (data.chatCoach) this.chatCoach = data.chatCoach;
        if (data.chatTeam) this.chatTeam = data.chatTeam;

        this.saveCurrentUser();
        this.saveWorkoutHistory();
        this.saveRoutines();
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

  AppState.init();
  global.AppState = AppState;
})(window);
