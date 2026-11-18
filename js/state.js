// =============================================================================
// JPEREZCOACH PRO · ESTADO GLOBAL REACTIVO Y PERSISTENCIA LOCAL MULTIUSUARIO
// Perfiles personalizados, rutinas dinámicas por atleta y almacenamiento seguro
// =============================================================================

(function(global) {
  'use strict';

  var STORAGE_KEYS = {
    USER: 'jperez_active_user_v4',
    USERS: 'jperez_profiles_v4',
    ACTIVE_WORKOUT: 'jperez_active_workout_v4',
    WORKOUT_HISTORY: 'jperez_workout_history_v4',
    ROUTINES: 'jperez_user_routines_v4',
    CUSTOM_EXERCISES: 'jperez_custom_exercises_v4',
    CHAT_COACH: 'jperez_chat_coach_v4',
    CHAT_TEAM: 'jperez_chat_team_v4',
    SETTINGS: 'jperez_app_settings_v4',
    PRS: 'jperez_personal_records_v4',
    ONBOARDING: 'jperez_onboarding_completed_v4'
  };

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
    routines: [],
    customExercises: [],
    chatCoach: [],
    chatTeam: [],
    settings: Object.assign({}, DEFAULT_SETTINGS),
    prs: {},
    hasCompletedOnboarding: false,

    init: function() {
      this.loadSettings();
      this.loadUsers();
      this.loadActiveWorkout();
      this.loadWorkoutHistory();
      this.loadRoutines();
      this.loadCustomExercises();
      this.loadChats();
      this.loadPRs();

      try {
        this.hasCompletedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
      } catch (e) {
        this.hasCompletedOnboarding = false;
      }

      return this;
    },

    loadUsers: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.USERS);
        this.users = raw ? JSON.parse(raw) : [];

        var currentRaw = localStorage.getItem(STORAGE_KEYS.USER);
        if (currentRaw) {
          this.currentUser = JSON.parse(currentRaw);
        } else if (this.users.length > 0) {
          this.currentUser = this.users[0];
          this.saveCurrentUser();
        } else {
          // Sin usuario configurado todavía; activará el asistente de bienvenida
          this.currentUser = null;
        }
      } catch (e) {
        this.users = [];
        this.currentUser = null;
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
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER);
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

    setOnboardingCompleted: function(completed) {
      this.hasCompletedOnboarding = !!completed;
      try {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING, completed ? 'true' : 'false');
      } catch (e) {}
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
        this.workoutHistory = raw ? JSON.parse(raw) : [];
      } catch (e) {
        this.workoutHistory = [];
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
    // GESTIÓN DINÁMICA DE RUTINAS
    // =========================================================================
    loadRoutines: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
        if (raw) {
          this.routines = JSON.parse(raw);
        } else {
          // Por defecto lista vacía esperando que el atleta suba su PDF o elija plantilla
          this.routines = [];
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
        routine.id = 'rutina_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
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

    generateSeedCoachChat: function() {
      var userName = this.currentUser ? this.currentUser.name : 'Atleta';
      return [
        {
          id: 'msg_seed_c1',
          sender: 'coach',
          authorName: 'Jose Perez (Head Coach)',
          avatar: 'assets/coach_photo.png',
          text: '¡Hola ' + userName + '! Bienvenido a tu aplicación JPEREZCOACH PRO. Aquí tienes el registro de tus series en tiempo real, tu temporizador de descanso y tus rutinas personalizadas. Recuerda nuestra premisa: en cada serie efectiva ve a RIR 0 con bajadas controladas de 5 segundos. ¡A por todas!',
          timestamp: new Date().toISOString()
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
          text: '¡Equipo! Acabo de terminar la sesión de piernas. Sentadilla Hack a 5 segundos de bajada y la congestión es increíble 🔥🦁',
          timestamp: new Date().toISOString(),
          reactions: { '🔥': ['Carlos M.'] }
        }
      ];
    },

    exportAllData: function() {
      var backup = {
        exportedAt: new Date().toISOString(),
        version: '4.0.0',
        app: 'JPEREZCOACH PRO',
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
