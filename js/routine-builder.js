// =============================================================================
// JPEREZCOACH APP · CREADOR Y EDITOR DE RUTINAS PERSONALIZADAS
// Interfaz Hevy Style: Constructor de rutinas, reordenación, plantillas y exportación
// =============================================================================

(function(global) {
  'use strict';

  var RoutineBuilder = {
    // Rutina actualmente en edición en el constructor
    currentDraft: null,

    // Iniciar nuevo borrador de rutina
    startNewRoutine: function() {
      this.currentDraft = {
        id: null, // se generará al guardar
        titulo: '',
        categoria: 'Mis Rutinas',
        etiqueta: 'CUSTOM',
        descripcion: '',
        color: '#38bdf8',
        tiempoEstimadoMin: 60,
        foco: [],
        ejercicios: []
      };
      return this.currentDraft;
    },

    // Cargar una rutina existente para editar
    loadForEditing: function(routineId) {
      var all = global.RutinasMaestras ? global.RutinasMaestras.getAll() : [];
      var found = all.find(function(r) { return r.id === routineId; });
      if (!found) return null;

      // Clonar profundamente
      this.currentDraft = JSON.parse(JSON.stringify(found));
      return this.currentDraft;
    },

    // Duplicar una rutina (oficial o personalizada) para adaptarla
    duplicateRoutine: function(routineId) {
      var all = global.RutinasMaestras ? global.RutinasMaestras.getAll() : [];
      var found = all.find(function(r) { return r.id === routineId; });
      if (!found) return null;

      var copy = JSON.parse(JSON.stringify(found));
      copy.id = null;
      copy.titulo = copy.titulo + ' (Copia)';
      copy.categoria = 'Mis Rutinas';
      copy.esOficial = false;

      return this.saveRoutine(copy);
    },

    // Añadir ejercicio al borrador actual
    addExerciseToDraft: function(exerciseId) {
      if (!this.currentDraft) this.startNewRoutine();

      var baseEx = global.EjerciciosDB ? global.EjerciciosDB.getById(exerciseId) : null;
      var name = baseEx ? baseEx.nombre : 'Ejercicio';

      this.currentDraft.ejercicios.push({
        exerciseId: exerciseId,
        name: name,
        targetReps: '8-10',
        notes: baseEx ? baseEx.descripcion : '',
        defaultSets: [
          { type: 'normal', reps: '8-10', weight: 0 },
          { type: 'normal', reps: '8-10', weight: 0 },
          { type: 'normal', reps: '8-10', weight: 0 }
        ]
      });

      // Actualizar foco muscular si no está
      if (baseEx && baseEx.grupo && this.currentDraft.foco.indexOf(baseEx.grupo) < 0) {
        this.currentDraft.foco.push(baseEx.grupo);
      }

      return this.currentDraft;
    },

    // Eliminar ejercicio del borrador
    removeExerciseFromDraft: function(index) {
      if (!this.currentDraft || !this.currentDraft.ejercicios[index]) return;
      this.currentDraft.ejercicios.splice(index, 1);
    },

    // Mover ejercicio arriba/abajo en el orden
    moveExerciseInDraft: function(index, direction) {
      if (!this.currentDraft) return;
      var list = this.currentDraft.ejercicios;
      var targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= list.length) return;

      var temp = list[index];
      list[index] = list[targetIdx];
      list[targetIdx] = temp;
    },

    // Añadir serie por defecto a un ejercicio en el borrador
    addSetToDraftExercise: function(exerciseIndex) {
      if (!this.currentDraft || !this.currentDraft.ejercicios[exerciseIndex]) return;
      var ex = this.currentDraft.ejercicios[exerciseIndex];
      var last = ex.defaultSets[ex.defaultSets.length - 1];
      ex.defaultSets.push({
        type: last ? last.type : 'normal',
        reps: last ? last.reps : '8-10',
        weight: 0
      });
    },

    // Eliminar serie por defecto de un ejercicio en el borrador
    removeSetFromDraftExercise: function(exerciseIndex, setIndex) {
      if (!this.currentDraft || !this.currentDraft.ejercicios[exerciseIndex]) return;
      var ex = this.currentDraft.ejercicios[exerciseIndex];
      if (ex.defaultSets.length > 1) {
        ex.defaultSets.splice(setIndex, 1);
      }
    },

    // Guardar borrador como rutina definitiva
    saveCurrentDraft: function() {
      if (!this.currentDraft) return { success: false, message: 'No hay rutina en edición.' };
      if (!this.currentDraft.titulo || !this.currentDraft.titulo.trim()) {
        return { success: false, message: 'La rutina necesita un título o nombre.' };
      }
      if (!this.currentDraft.ejercicios || this.currentDraft.ejercicios.length === 0) {
        return { success: false, message: 'Añade al menos un ejercicio a la rutina.' };
      }

      var result = this.saveRoutine(this.currentDraft);
      this.currentDraft = null;
      return { success: true, routine: result };
    },

    // Guardar o actualizar rutina en AppState
    saveRoutine: function(routineData) {
      if (!global.AppState) return null;

      if (routineData.id && !routineData.esOficial) {
        // Actualizar existente
        return global.AppState.updateCustomRoutine(routineData.id, routineData);
      } else {
        // Nueva rutina
        routineData.id = 'rutina_custom_' + Date.now();
        routineData.esOficial = false;
        return global.AppState.addCustomRoutine(routineData);
      }
    },

    // Eliminar rutina personalizada
    deleteRoutine: function(id) {
      if (!global.AppState) return false;
      global.AppState.deleteCustomRoutine(id);
      return true;
    },

    // Exportar una rutina a formato JSON
    exportRoutineToJSON: function(routineId) {
      var all = global.RutinasMaestras ? global.RutinasMaestras.getAll() : [];
      var found = all.find(function(r) { return r.id === routineId; });
      if (!found) return null;
      return JSON.stringify(found, null, 2);
    },

    // Importar una rutina desde archivo JSON
    importRoutineFromJSON: function(jsonString) {
      try {
        var parsed = JSON.parse(jsonString);
        if (!parsed.titulo || !parsed.ejercicios) {
          return { success: false, message: 'El formato del archivo no es una rutina válida.' };
        }
        parsed.id = null; // forzar nueva ID
        parsed.esOficial = false;
        parsed.titulo = parsed.titulo + ' (Importada)';
        var saved = this.saveRoutine(parsed);
        return { success: true, routine: saved };
      } catch (e) {
        return { success: false, message: 'Error procesando el JSON de la rutina: ' + e.message };
      }
    }
  };

  global.RoutineBuilder = RoutineBuilder;
})(window);
