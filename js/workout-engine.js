// =============================================================================
// JPEREZCOACH PRO · MOTOR DE ENTRENAMIENTO EN VIVO
// Cronómetro en vivo, registro serie a serie, temporizador de descanso y audio Web Audio
// =============================================================================

(function(global) {
  'use strict';

  var audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      var AudioContextClass = global.AudioContext || global.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Reproductor de tonos sintéticos nativos (Web Audio API) sin dependencias externas
  var SoundEffects = {
    playSetComplete: function() {
      if (!global.AppState || !global.AppState.settings.soundEnabled) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {
        // Fallback silencioso si el navegador bloquea audio
      }
    },

    playRestFinished: function() {
      if (!global.AppState || !global.AppState.settings.soundEnabled) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;

        [0, 0.18, 0.36].forEach(function(delay, idx) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          var freq = (idx === 2) ? 1046.50 : 880; // C6 al final

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);

          gain.gain.setValueAtTime(0.2, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.14);
        });
      } catch (e) {}
    },

    playCountdownBeep: function(secondsLeft) {
      if (!global.AppState || !global.AppState.settings.soundEnabled) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        // 880 Hz para 3, 2, 1
        osc.frequency.setValueAtTime(880, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    },

    playPRFanfare: function() {
      if (!global.AppState || !global.AppState.settings.soundEnabled) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        var notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C

        notes.forEach(function(freq, idx) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + (idx * 0.1));

          gain.gain.setValueAtTime(0.25, now + (idx * 0.1));
          gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.1) + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + (idx * 0.1));
          osc.stop(now + (idx * 0.1) + 0.25);
        });
      } catch (e) {}
    }
  };

  var WorkoutEngine = {
    timerInterval: null,
    restInterval: null,
    restRemainingSeconds: 0,
    restTotalSeconds: 90,
    isRestActive: false,

    // Comprobar si hay un entrenamiento en curso
    hasActiveWorkout: function() {
      return !!(global.AppState && global.AppState.activeWorkout);
    },

    getActiveWorkout: function() {
      return (global.AppState && global.AppState.activeWorkout) ? global.AppState.activeWorkout : null;
    },

    // Iniciar entrenamiento a partir de una rutina o plantilla
    startWorkoutFromRoutine: function(routine) {
      if (this.hasActiveWorkout()) {
        if (!confirm('Ya tienes un entrenamiento en curso. ¿Deseas descartarlo y comenzar este nuevo?')) {
          return false;
        }
      }

      var workoutExercises = [];
      if (routine.ejercicios && routine.ejercicios.length > 0) {
        workoutExercises = routine.ejercicios.map(function(item) {
          var baseEx = global.EjerciciosDB ? global.EjerciciosDB.getById(item.exerciseId) : null;
          var exName = item.name || (baseEx ? baseEx.nombre : 'Ejercicio');
          var lastSession = global.AppState ? global.AppState.getLastSessionForExercise(item.exerciseId) : null;

          var sets = [];
          if (item.defaultSets && item.defaultSets.length > 0) {
            sets = item.defaultSets.map(function(s, idx) {
              var prevStr = '-';
              if (lastSession && lastSession.sets && lastSession.sets[idx]) {
                prevStr = lastSession.sets[idx].weight + ' kg × ' + lastSession.sets[idx].reps;
              }
              return {
                setNumber: idx + 1,
                type: s.type || 'normal',
                weight: (lastSession && lastSession.sets && lastSession.sets[idx]) ? lastSession.sets[idx].weight : (s.weight || 0),
                reps: (lastSession && lastSession.sets && lastSession.sets[idx]) ? lastSession.sets[idx].reps : (parseInt(s.reps, 10) || 10),
                completed: false,
                isPR: false,
                previous: prevStr
              };
            });
          } else {
            // Por defecto 3 series
            for (var i = 1; i <= 3; i++) {
              sets.push({
                setNumber: i,
                type: 'normal',
                weight: 0,
                reps: 10,
                completed: false,
                isPR: false,
                previous: '-'
              });
            }
          }

          return {
            exerciseId: item.exerciseId,
            name: exName,
            group: baseEx ? baseEx.grupo : 'General',
            youtubeId: baseEx ? baseEx.youtubeId : '',
            notes: item.notes || (baseEx ? baseEx.descripcion : ''),
            sets: sets
          };
        });
      }

      var newActive = {
        id: 'workout_act_' + Date.now(),
        routineId: routine.id || null,
        name: routine.titulo || routine.name || 'Entrenamiento',
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
        isPaused: false,
        exercises: workoutExercises,
        notes: ''
      };

      global.AppState.activeWorkout = newActive;
      global.AppState.saveActiveWorkout();

      this.startWorkoutTimer();
      document.dispatchEvent(new CustomEvent('jperez:workout-started', { detail: newActive }));
      return true;
    },

    // Iniciar entrenamiento libre desde cero (Empty Workout)
    startEmptyWorkout: function() {
      var routine = global.RutinasMaestras ? global.RutinasMaestras.crearEntrenamientoVacio() : { titulo: 'Entrenamiento Libre', ejercicios: [] };
      return this.startWorkoutFromRoutine(routine);
    },

    // Iniciar o reanudar el cronómetro del entrenamiento
    startWorkoutTimer: function() {
      if (this.timerInterval) clearInterval(this.timerInterval);

      var self = this;
      this.timerInterval = setInterval(function() {
        var active = self.getActiveWorkout();
        if (active && !active.isPaused) {
          active.elapsedSeconds = (active.elapsedSeconds || 0) + 1;
          // Guardar periódicamente cada 10 segundos
          if (active.elapsedSeconds % 10 === 0) {
            global.AppState.saveActiveWorkout();
          }
          document.dispatchEvent(new CustomEvent('jperez:timer-tick', { detail: { seconds: active.elapsedSeconds } }));
        }
      }, 1000);
    },

    stopWorkoutTimer: function() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    togglePauseWorkout: function() {
      var active = this.getActiveWorkout();
      if (!active) return;
      active.isPaused = !active.isPaused;
      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    // Añadir ejercicio al entrenamiento en vivo
    addExerciseToWorkout: function(exerciseId) {
      var active = this.getActiveWorkout();
      if (!active) return false;

      var baseEx = global.EjerciciosDB ? global.EjerciciosDB.getById(exerciseId) : null;
      var name = baseEx ? baseEx.nombre : 'Ejercicio';
      var lastSession = global.AppState ? global.AppState.getLastSessionForExercise(exerciseId) : null;

      var sets = [];
      for (var i = 1; i <= 3; i++) {
        var prevStr = '-';
        var prevW = 0;
        var prevR = 10;
        if (lastSession && lastSession.sets && lastSession.sets[i - 1]) {
          prevStr = lastSession.sets[i - 1].weight + ' kg × ' + lastSession.sets[i - 1].reps;
          prevW = lastSession.sets[i - 1].weight;
          prevR = lastSession.sets[i - 1].reps;
        }

        sets.push({
          setNumber: i,
          type: 'normal',
          weight: prevW,
          reps: prevR,
          completed: false,
          isPR: false,
          previous: prevStr
        });
      }

      active.exercises.push({
        exerciseId: exerciseId,
        name: name,
        group: baseEx ? baseEx.grupo : 'General',
        youtubeId: baseEx ? baseEx.youtubeId : '',
        notes: baseEx ? baseEx.descripcion : '',
        sets: sets
      });

      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
      return true;
    },

    // Eliminar ejercicio del entrenamiento en vivo
    removeExercise: function(exerciseIndex) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;

      active.exercises.splice(exerciseIndex, 1);
      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    // Añadir serie a un ejercicio
    addSet: function(exerciseIndex) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;

      var ex = active.exercises[exerciseIndex];
      var nextNum = ex.sets.length + 1;
      var lastSet = ex.sets[ex.sets.length - 1];

      ex.sets.push({
        setNumber: nextNum,
        type: lastSet ? lastSet.type : 'normal',
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
        isPR: false,
        previous: '-'
      });

      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    // Eliminar serie
    removeSet: function(exerciseIndex, setIndex) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;

      var ex = active.exercises[exerciseIndex];
      ex.sets.splice(setIndex, 1);
      // Renumerar
      ex.sets.forEach(function(s, idx) { s.setNumber = idx + 1; });

      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    // Cambiar tipo de serie (normal, calentamiento 'W', drop set 'D', fallo/RIR 0 'F')
    toggleSetType: function(exerciseIndex, setIndex) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;

      var s = active.exercises[exerciseIndex].sets[setIndex];
      if (!s) return;

      var types = ['normal', 'warmup', 'drop_set', 'fallo'];
      var curIdx = types.indexOf(s.type);
      var nextType = types[(curIdx + 1) % types.length];
      s.type = nextType;

      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    // Actualizar peso o repeticiones de una serie
    updateSetValues: function(exerciseIndex, setIndex, weight, reps) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;

      var s = active.exercises[exerciseIndex].sets[setIndex];
      if (!s) return;

      if (weight !== undefined) s.weight = parseFloat(weight) || 0;
      if (reps !== undefined) s.reps = parseInt(reps, 10) || 0;

      global.AppState.saveActiveWorkout();
    },

    // Marcar / desmarcar serie completada
    toggleSetCompleted: function(exerciseIndex, setIndex) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;

      var ex = active.exercises[exerciseIndex];
      var s = ex.sets[setIndex];
      if (!s) return;

      s.completed = !s.completed;

      if (s.completed) {
        // Sonido y vibración
        SoundEffects.playSetComplete();
        if (navigator.vibrate && global.AppState.settings.vibrateEnabled) {
          navigator.vibrate([40, 30, 40]);
        }

        // Comprobar si es un nuevo Record Personal (PR)
        var weight = parseFloat(s.weight) || 0;
        var existingPR = (global.AppState && global.AppState.prs) ? global.AppState.prs[ex.exerciseId] : null;
        if (weight > 0 && (!existingPR || weight > existingPR.maxWeight)) {
          s.isPR = true;
          SoundEffects.playPRFanfare();
        }

        // Iniciar temporizador de descanso automáticamente
        if (global.AppState.settings.autoStartRest) {
          var restSecs = global.AppState.settings.restTimerSeconds || 90;
          this.startRestTimer(restSecs);
        }
      }

      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    // -------------------------------------------------------------------------
    // TEMPORIZADOR DE DESCANSO AUTOMÁTICO
    // -------------------------------------------------------------------------
    startRestTimer: function(seconds) {
      if (this.restInterval) clearInterval(this.restInterval);

      this.restTotalSeconds = seconds || 90;
      this.restRemainingSeconds = this.restTotalSeconds;
      this.isRestActive = true;

      var self = this;
      this.restInterval = setInterval(function() {
        self.restRemainingSeconds--;

        // Beep de cuenta atrás en los últimos 3 segundos (3, 2, 1)
        if (self.restRemainingSeconds >= 1 && self.restRemainingSeconds <= 3) {
          SoundEffects.playCountdownBeep(self.restRemainingSeconds);
          if (navigator.vibrate && global.AppState && global.AppState.settings.vibrateEnabled) {
            navigator.vibrate(50);
          }
        }

        document.dispatchEvent(new CustomEvent('jperez:rest-tick', {
          detail: {
            remaining: self.restRemainingSeconds,
            total: self.restTotalSeconds,
            progress: ((self.restTotalSeconds - self.restRemainingSeconds) / self.restTotalSeconds) * 100
          }
        }));

        if (self.restRemainingSeconds <= 0) {
          self.finishRestTimer();
        }
      }, 1000);

      document.dispatchEvent(new CustomEvent('jperez:rest-started', {
        detail: { total: this.restTotalSeconds }
      }));
    },

    addRestTime: function(deltaSeconds) {
      this.restRemainingSeconds = Math.max(5, this.restRemainingSeconds + deltaSeconds);
      this.restTotalSeconds = Math.max(this.restRemainingSeconds, this.restTotalSeconds + deltaSeconds);
      document.dispatchEvent(new CustomEvent('jperez:rest-tick', {
        detail: {
          remaining: this.restRemainingSeconds,
          total: this.restTotalSeconds,
          progress: ((this.restTotalSeconds - this.restRemainingSeconds) / this.restTotalSeconds) * 100
        }
      }));
    },

    skipRestTimer: function() {
      if (this.restInterval) {
        clearInterval(this.restInterval);
        this.restInterval = null;
      }
      this.isRestActive = false;
      this.restRemainingSeconds = 0;
      document.dispatchEvent(new CustomEvent('jperez:rest-finished', { detail: { skipped: true } }));
    },

    finishRestTimer: function() {
      if (this.restInterval) {
        clearInterval(this.restInterval);
        this.restInterval = null;
      }
      this.isRestActive = false;
      this.restRemainingSeconds = 0;

      // Alerta sonora y háptica
      SoundEffects.playRestFinished();
      if (navigator.vibrate && global.AppState.settings.vibrateEnabled) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }

      document.dispatchEvent(new CustomEvent('jperez:rest-finished', { detail: { skipped: false } }));
    },

    // -------------------------------------------------------------------------
    // AJUSTES RÁPIDOS Y STEPPERS DE PESO / REPS
    // -------------------------------------------------------------------------
    adjustSetWeight: function(exerciseIndex, setIndex, delta) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;
      var s = active.exercises[exerciseIndex].sets[setIndex];
      if (!s) return;
      var current = parseFloat(s.weight) || 0;
      s.weight = Math.max(0, Math.round((current + delta) * 10) / 10);
      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    adjustSetReps: function(exerciseIndex, setIndex, delta) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;
      var s = active.exercises[exerciseIndex].sets[setIndex];
      if (!s) return;
      var current = parseInt(s.reps, 10) || 0;
      s.reps = Math.max(0, current + delta);
      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    insertWarmUpSets: function(exerciseIndex, workingWeightKg, barWeightKg) {
      var active = this.getActiveWorkout();
      if (!active || !active.exercises[exerciseIndex]) return;
      var ex = active.exercises[exerciseIndex];

      var warmupList = global.Analytics ? global.Analytics.calculateWarmUpSets(workingWeightKg, barWeightKg) : [];
      if (!warmupList || warmupList.length === 0) return;

      var toInsert = warmupList.filter(function(w) { return w.type === 'warmup'; });

      var newSets = [];
      toInsert.forEach(function(item, idx) {
        newSets.push({
          setNumber: idx + 1,
          type: 'warmup',
          weight: item.weight,
          reps: item.reps,
          completed: false,
          previous: item.label
        });
      });

      var num = 1;
      newSets.forEach(function(s) { s.setNumber = num++; });
      ex.sets.forEach(function(s) {
        s.setNumber = num++;
        newSets.push(s);
      });

      ex.sets = newSets;
      global.AppState.saveActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-updated'));
    },

    // -------------------------------------------------------------------------
    // FINALIZAR Y GUARDAR ENTRENAMIENTO
    // -------------------------------------------------------------------------
    finishWorkout: function() {
      var active = this.getActiveWorkout();
      if (!active) return null;

      this.stopWorkoutTimer();
      this.skipRestTimer();

      var totalVolume = 0;
      var totalSetsCount = 0;
      var totalRepsCount = 0;
      var prsUnlocked = [];

      active.exercises.forEach(function(ex) {
        if (!ex.sets) return;
        ex.sets.forEach(function(s) {
          if (s.completed) {
            var w = parseFloat(s.weight) || 0;
            var r = parseInt(s.reps, 10) || 0;
            totalVolume += (w * r);
            totalSetsCount++;
            totalRepsCount += r;

            if (s.isPR) {
              prsUnlocked.push({
                exerciseName: ex.name,
                weight: w,
                reps: r
              });
            }
          }
        });
      });

      var completedWorkout = {
        id: 'workout_' + Date.now(),
        name: active.name,
        routineId: active.routineId,
        startedAt: active.startedAt,
        endedAt: new Date().toISOString(),
        durationSeconds: active.elapsedSeconds || 1,
        totalVolumeKg: Math.round(totalVolume * 10) / 10,
        totalSets: totalSetsCount,
        totalReps: totalRepsCount,
        prsCount: prsUnlocked.length,
        prsUnlocked: prsUnlocked,
        exercises: active.exercises,
        notes: active.notes || ''
      };

      // Guardar en el historial a través de AppState
      global.AppState.addCompletedWorkout(completedWorkout);

      // Lanzar fanfarria si hay PRs
      if (prsUnlocked.length > 0) {
        SoundEffects.playPRFanfare();
      }

      document.dispatchEvent(new CustomEvent('jperez:workout-finished', { detail: completedWorkout }));
      return completedWorkout;
    },

    // Descartar entrenamiento sin guardar
    discardWorkout: function() {
      this.stopWorkoutTimer();
      this.skipRestTimer();
      global.AppState.clearActiveWorkout();
      document.dispatchEvent(new CustomEvent('jperez:workout-discarded'));
    },

    // Formatear segundos a HH:MM:SS o MM:SS
    formatDuration: function(seconds) {
      seconds = Math.max(0, parseInt(seconds, 10) || 0);
      var hrs = Math.floor(seconds / 3600);
      var mins = Math.floor((seconds % 3600) / 60);
      var secs = seconds % 60;

      if (hrs > 0) {
        return (hrs < 10 ? '0' : '') + hrs + ':' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
      }
      return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
  };

  // Si había un entrenamiento activo al recargar la página, reanudar el temporizador
  if (global.AppState && global.AppState.activeWorkout) {
    WorkoutEngine.startWorkoutTimer();
  }

  global.WorkoutEngine = WorkoutEngine;
  global.SoundEffects = SoundEffects;
})(window);
