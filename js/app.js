// =============================================================================
// JPEREZCOACH APP · CONTROLADOR PRINCIPAL Y GESTOR DE INTERFAZ DE USUARIO
// Navegación de pestañas, modales, renderizado reactivo y experiencia Hevy
// =============================================================================

(function(global) {
  'use strict';

  // Motor de confeti ultraligero integrado para celebraciones de fin de entrenamiento
  function dispararConfeti() {
    var canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var piezas = [];
    var colores = ['#38bdf8', '#00d2ff', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];

    for (var i = 0; i < 90; i++) {
      piezas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 50 + 10,
        color: colores[Math.floor(Math.random() * colores.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0
      });
    }

    var duracion = 3000;
    var inicio = Date.now();

    function animar() {
      var transcurrido = Date.now() - inicio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      piezas.forEach(function(p) {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2);
        p.x += Math.sin(p.d);
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      });

      if (transcurrido < duracion) {
        requestAnimationFrame(animar);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(animar);
  }

  var App = {
    activeTab: 'tab-workout',
    selectedFilterGroup: 'todos',
    selectedEquipment: 'todos',
    exercisePickerCallback: null,
    videoModalExercise: null,

    init: function() {
      this.bindEvents();
      this.initTabs();
      this.renderAll();
      this.initServiceWorker();
      return this;
    },

    bindEvents: function() {
      var self = this;

      // Eventos globales del estado y motor
      document.addEventListener('jperez:workout-started', function() {
        self.showActiveWorkoutModal();
        self.renderActiveWorkout();
        self.updateStickyWorkoutBar();
      });

      document.addEventListener('jperez:workout-updated', function() {
        self.renderActiveWorkout();
        self.updateStickyWorkoutBar();
      });

      document.addEventListener('jperez:timer-tick', function(e) {
        self.updateWorkoutTimerDisplay(e.detail.seconds);
      });

      document.addEventListener('jperez:rest-tick', function(e) {
        self.updateRestTimerDisplay(e.detail);
      });

      document.addEventListener('jperez:rest-started', function(e) {
        self.showRestTimerWidget(e.detail.total);
      });

      document.addEventListener('jperez:rest-finished', function() {
        self.hideRestTimerWidget();
      });

      document.addEventListener('jperez:workout-finished', function(e) {
        self.hideActiveWorkoutModal();
        self.updateStickyWorkoutBar();
        self.showWorkoutSummaryModal(e.detail);
        dispararConfeti();
        self.renderWorkoutTab();
        self.renderHistoryTab();
        self.renderProfileTab();
      });

      document.addEventListener('jperez:workout-discarded', function() {
        self.hideActiveWorkoutModal();
        self.updateStickyWorkoutBar();
        self.renderWorkoutTab();
      });

      document.addEventListener('jperez:user-changed', function() {
        self.renderHeader();
        self.renderProfileTab();
        self.renderChatTab();
      });

      document.addEventListener('jperez:routines-updated', function() {
        self.renderWorkoutTab();
        self.renderRoutinesTab();
      });

      document.addEventListener('jperez:chat-updated', function() {
        self.renderChatMessages();
      });

      document.addEventListener('jperez:data-imported', function() {
        self.renderAll();
        self.showToast('¡Datos importados correctamente!');
      });

      // Botón flotante de entreno activo minimizado
      var stickyBar = document.getElementById('sticky-active-bar');
      if (stickyBar) {
        stickyBar.addEventListener('click', function() {
          self.showActiveWorkoutModal();
        });
      }
    },

    initTabs: function() {
      var self = this;
      var tabButtons = document.querySelectorAll('.nav-tab-btn');
      tabButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var targetTab = this.getAttribute('data-tab');
          self.switchTab(targetTab);
        });
      });
    },

    switchTab: function(tabId) {
      this.activeTab = tabId;

      // Actualizar botones de navegación
      document.querySelectorAll('.nav-tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });

      // Actualizar vistas
      document.querySelectorAll('.view-screen').forEach(function(screen) {
        screen.classList.toggle('active', screen.id === tabId);
      });

      // Refrescar datos específicos de la vista
      if (tabId === 'tab-workout') this.renderWorkoutTab();
      else if (tabId === 'tab-routines') this.renderRoutinesTab();
      else if (tabId === 'tab-chat') this.renderChatTab();
      else if (tabId === 'tab-history') this.renderHistoryTab();
      else if (tabId === 'tab-profile') this.renderProfileTab();

      window.scrollTo(0, 0);
    },

    renderAll: function() {
      this.renderHeader();
      this.renderWorkoutTab();
      this.renderRoutinesTab();
      this.renderChatTab();
      this.renderHistoryTab();
      this.renderProfileTab();
      this.updateStickyWorkoutBar();
    },

    renderHeader: function() {
      var user = global.AppState ? global.AppState.currentUser : null;
      var userAvatarEl = document.getElementById('header-user-avatar');
      var userNameEl = document.getElementById('header-user-name');
      var streakEl = document.getElementById('header-streak-badge');

      if (user && userNameEl) {
        userNameEl.textContent = user.name || 'Atleta';
      }
      if (user && userAvatarEl) {
        if (user.avatar) {
          userAvatarEl.innerHTML = '<img src="' + user.avatar + '" alt="Avatar" class="avatar-img">';
        } else {
          var initial = (user.name || 'A').charAt(0).toUpperCase();
          userAvatarEl.innerHTML = '<div class="avatar-placeholder">' + initial + '</div>';
        }
      }
      if (user && streakEl) {
        streakEl.innerHTML = '🔥 ' + (user.streak || 1) + 'd';
      }
    },

    // =========================================================================
    // 1. PESTAÑA ENTRENAR (WORKOUT TAB)
    // =========================================================================
    renderWorkoutTab: function() {
      var container = document.getElementById('routines-list-container');
      if (!container) return;

      var oficiales = global.RutinasMaestras ? global.RutinasMaestras.getOficiales() : [];
      var personalizadas = global.RutinasMaestras ? global.RutinasMaestras.getPersonalizadas() : [];

      var html = '';

      // Sección Rutinas Personalizadas si hay
      if (personalizadas.length > 0) {
        html += '<div class="section-title-wrap"><h3 class="section-heading">Tus Rutinas Creadas</h3><span class="count-pill">' + personalizadas.length + '</span></div>';
        html += '<div class="routines-grid">';
        personalizadas.forEach(function(r) {
          html += App.generateRoutineCardHTML(r, true);
        });
        html += '</div>';
      }

      // Sección Rotación Oficial Jose Perez
      html += '<div class="section-title-wrap" style="margin-top: 1.5rem;"><h3 class="section-heading">Rotación Oficial JPEREZCOACH (6 Días)</h3><span class="count-pill official-pill">Oficial</span></div>';
      html += '<p class="section-subtitle">Entrena a tu ritmo: completa la secuencia en orden sin atarte a días fijos.</p>';
      html += '<div class="routines-grid">';
      oficiales.forEach(function(r) {
        html += App.generateRoutineCardHTML(r, false);
      });
      html += '</div>';

      container.innerHTML = html;
      this.bindRoutineCardEvents(container);
    },

    generateRoutineCardHTML: function(routine, isCustom) {
      var numEjercicios = routine.ejercicios ? routine.ejercicios.length : 0;
      var focos = (routine.foco || []).join(' · ');
      var borderAccent = routine.color || '#38bdf8';

      return '<div class="routine-card" data-routine-id="' + routine.id + '" style="border-left: 4px solid ' + borderAccent + ';">' +
        '<div class="routine-card-header">' +
          '<div class="routine-meta">' +
            '<span class="routine-tag" style="background: ' + borderAccent + '22; color: ' + borderAccent + ';">' + (routine.etiqueta || 'RUTINA') + '</span>' +
            '<span class="routine-duration">⏱️ ~' + (routine.tiempoEstimadoMin || 60) + ' min</span>' +
          '</div>' +
          (isCustom ? '<button class="btn-icon-subtle btn-delete-routine" data-id="' + routine.id + '" title="Eliminar rutina">🗑️</button>' : '') +
        '</div>' +
        '<h4 class="routine-title">' + routine.titulo + '</h4>' +
        '<p class="routine-description">' + (routine.descripcion || focos) + '</p>' +
        '<div class="routine-exercises-preview">' +
          '<span>📋 ' + numEjercicios + ' ejercicios</span>' +
          (focos ? '<span class="routine-focus">🎯 ' + focos + '</span>' : '') +
        '</div>' +
        '<div class="routine-card-actions">' +
          '<button class="btn btn-primary btn-start-routine" data-id="' + routine.id + '">▶ Iniciar Rutina</button>' +
          '<button class="btn btn-secondary btn-preview-routine" data-id="' + routine.id + '">Ver Ejercicios</button>' +
        '</div>' +
      '</div>';
    },

    bindRoutineCardEvents: function(container) {
      var self = this;

      container.querySelectorAll('.btn-start-routine').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          var routine = global.RutinasMaestras.getById(id);
          if (routine) {
            global.WorkoutEngine.startWorkoutFromRoutine(routine);
          }
        });
      });

      container.querySelectorAll('.btn-preview-routine').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          self.showRoutinePreviewModal(id);
        });
      });

      container.querySelectorAll('.btn-delete-routine').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          if (confirm('¿Estás seguro de que deseas eliminar esta rutina?')) {
            global.RoutineBuilder.deleteRoutine(id);
            self.showToast('Rutina eliminada.');
          }
        });
      });
    },

    // =========================================================================
    // 2. MODAL Y MOTOR DE ENTRENAMIENTO EN VIVO (HEVY ACTIVE WORKOUT)
    // =========================================================================
    showActiveWorkoutModal: function() {
      var modal = document.getElementById('modal-active-workout');
      if (modal) {
        modal.classList.add('open');
        document.body.classList.add('modal-open');
      }
    },

    hideActiveWorkoutModal: function() {
      var modal = document.getElementById('modal-active-workout');
      if (modal) {
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
      }
    },

    updateStickyWorkoutBar: function() {
      var stickyBar = document.getElementById('sticky-active-bar');
      if (!stickyBar) return;

      var active = global.WorkoutEngine ? global.WorkoutEngine.getActiveWorkout() : null;
      if (active) {
        stickyBar.classList.add('visible');
        var titleEl = stickyBar.querySelector('.sticky-workout-title');
        var timerEl = stickyBar.querySelector('.sticky-workout-timer');
        var setsEl = stickyBar.querySelector('.sticky-workout-sets');

        if (titleEl) titleEl.textContent = active.name || 'Entrenamiento';
        if (timerEl) timerEl.textContent = global.WorkoutEngine.formatDuration(active.elapsedSeconds || 0);

        var doneSets = 0;
        var totalSets = 0;
        active.exercises.forEach(function(ex) {
          if (ex.sets) {
            totalSets += ex.sets.length;
            doneSets += ex.sets.filter(function(s) { return s.completed; }).length;
          }
        });
        if (setsEl) setsEl.textContent = doneSets + '/' + totalSets + ' series';
      } else {
        stickyBar.classList.remove('visible');
      }
    },

    updateWorkoutTimerDisplay: function(seconds) {
      var timerEls = document.querySelectorAll('.live-timer-text');
      var str = global.WorkoutEngine.formatDuration(seconds);
      timerEls.forEach(function(el) { el.textContent = str; });

      var stickyTimer = document.querySelector('.sticky-workout-timer');
      if (stickyTimer) stickyTimer.textContent = str;
    },

    renderActiveWorkout: function() {
      var active = global.WorkoutEngine ? global.WorkoutEngine.getActiveWorkout() : null;
      var container = document.getElementById('active-workout-exercises-container');
      var titleInput = document.getElementById('active-workout-title-input');
      var volumeEl = document.getElementById('active-workout-volume');

      if (!active || !container) return;

      if (titleInput) {
        titleInput.value = active.name;
        titleInput.oninput = function() {
          active.name = this.value;
          global.AppState.saveActiveWorkout();
        };
      }

      // Calcular volumen actual
      var currentVol = 0;
      active.exercises.forEach(function(ex) {
        if (ex.sets) {
          ex.sets.forEach(function(s) {
            if (s.completed) {
              currentVol += ((parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0));
            }
          });
        }
      });
      if (volumeEl) volumeEl.textContent = Math.round(currentVol) + ' kg';

      // Renderizar ejercicios
      var html = '';
      if (active.exercises.length === 0) {
        html = '<div class="empty-state-card">' +
          '<div class="empty-icon">🏋️‍♂️</div>' +
          '<h4>Tu entrenamiento está vacío</h4>' +
          '<p>Añade ejercicios para empezar a registrar tus series, pesos y marcas.</p>' +
          '<button class="btn btn-primary btn-add-exercise-trigger">+ Añadir Primer Ejercicio</button>' +
        '</div>';
      } else {
        active.exercises.forEach(function(ex, exIdx) {
          html += App.generateActiveExerciseCardHTML(ex, exIdx);
        });
      }

      container.innerHTML = html;
      this.bindActiveWorkoutEvents(container);
    },

    generateActiveExerciseCardHTML: function(ex, exIdx) {
      var html = '<div class="active-exercise-card" data-exercise-index="' + exIdx + '">' +
        '<div class="active-exercise-header">' +
          '<div class="exercise-info">' +
            '<h4 class="exercise-name">' + ex.name + '</h4>' +
            '<span class="exercise-group-pill">' + (ex.group || 'General') + '</span>' +
          '</div>' +
          '<div class="exercise-header-actions">' +
            (ex.youtubeId ? '<button class="btn-video-chip" data-exercise-id="' + ex.exerciseId + '" data-youtube="' + ex.youtubeId + '" title="Ver vídeo técnica">🎬 Vídeo</button>' : '') +
            '<button class="btn-icon-subtle btn-remove-exercise" data-exercise-index="' + exIdx + '" title="Quitar ejercicio">✕</button>' +
          '</div>' +
        '</div>';

      if (ex.notes) {
        html += '<div class="exercise-coach-note">💡 ' + ex.notes + '</div>';
      }

      // Tabla de series estilo Hevy
      html += '<div class="sets-table-wrap">' +
        '<table class="sets-table">' +
          '<thead>' +
            '<tr>' +
              '<th style="width: 14%;">SERIE</th>' +
              '<th style="width: 26%;">ANTERIOR</th>' +
              '<th style="width: 24%;">KG</th>' +
              '<th style="width: 22%;">REPS</th>' +
              '<th style="width: 14%; text-align: center;">✓</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>';

      ex.sets.forEach(function(s, sIdx) {
        var setTypeBadge = s.setNumber;
        var badgeClass = 'badge-normal';
        if (s.type === 'warmup') { setTypeBadge = 'W'; badgeClass = 'badge-warmup'; }
        else if (s.type === 'drop_set') { setTypeBadge = 'D'; badgeClass = 'badge-dropset'; }
        else if (s.type === 'fallo') { setTypeBadge = 'F'; badgeClass = 'badge-failure'; }

        var completedClass = s.completed ? 'set-completed' : '';
        var prBadge = s.isPR ? '<span class="set-pr-tag" title="¡Nuevo récord personal!">🏆 PR</span>' : '';

        html += '<tr class="set-row ' + completedClass + '" data-set-index="' + sIdx + '">' +
          '<td>' +
            '<button class="set-type-btn ' + badgeClass + '" data-exercise-index="' + exIdx + '" data-set-index="' + sIdx + '" title="Cambiar tipo de serie (Normal / Calentamiento / Drop / Fallo)">' + setTypeBadge + '</button>' +
          '</td>' +
          '<td class="prev-value-cell">' + (s.previous || '-') + prBadge + '</td>' +
          '<td>' +
            '<input type="number" step="0.5" class="set-input set-weight-input" data-exercise-index="' + exIdx + '" data-set-index="' + sIdx + '" value="' + (s.weight || '') + '" placeholder="0" ' + (s.completed ? 'readonly' : '') + '>' +
          '</td>' +
          '<td>' +
            '<input type="number" step="1" class="set-input set-reps-input" data-exercise-index="' + exIdx + '" data-set-index="' + sIdx + '" value="' + (s.reps || '') + '" placeholder="0" ' + (s.completed ? 'readonly' : '') + '>' +
          '</td>' +
          '<td style="text-align: center;">' +
            '<button class="btn-check-set ' + (s.completed ? 'checked' : '') + '" data-exercise-index="' + exIdx + '" data-set-index="' + sIdx + '">' +
              (s.completed ? '✓' : '') +
            '</button>' +
          '</td>' +
        '</tr>';
      });

      html += '</tbody></table></div>';

      // Acciones inferiores del ejercicio
      html += '<div class="exercise-card-footer">' +
        '<button class="btn btn-outline-sm btn-add-set" data-exercise-index="' + exIdx + '">+ Añadir Serie</button>' +
      '</div></div>';

      return html;
    },

    bindActiveWorkoutEvents: function(container) {
      var self = this;

      // Marcar / desmarcar serie
      container.querySelectorAll('.btn-check-set').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          var sIdx = parseInt(this.getAttribute('data-set-index'), 10);
          global.WorkoutEngine.toggleSetCompleted(exIdx, sIdx);
        });
      });

      // Cambiar tipo de serie (Normal -> Calentamiento -> Drop Set -> Fallo)
      container.querySelectorAll('.set-type-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          var sIdx = parseInt(this.getAttribute('data-set-index'), 10);
          global.WorkoutEngine.toggleSetType(exIdx, sIdx);
        });
      });

      // Inputs de peso y repeticiones
      container.querySelectorAll('.set-weight-input').forEach(function(input) {
        input.addEventListener('change', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          var sIdx = parseInt(this.getAttribute('data-set-index'), 10);
          global.WorkoutEngine.updateSetValues(exIdx, sIdx, this.value, undefined);
        });
      });

      container.querySelectorAll('.set-reps-input').forEach(function(input) {
        input.addEventListener('change', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          var sIdx = parseInt(this.getAttribute('data-set-index'), 10);
          global.WorkoutEngine.updateSetValues(exIdx, sIdx, undefined, this.value);
        });
      });

      // Botón añadir serie
      container.querySelectorAll('.btn-add-set').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          global.WorkoutEngine.addSet(exIdx);
        });
      });

      // Quitar ejercicio
      container.querySelectorAll('.btn-remove-exercise').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          if (confirm('¿Quitar este ejercicio del entrenamiento?')) {
            global.WorkoutEngine.removeExercise(exIdx);
          }
        });
      });

      // Botón vídeo técnica
      container.querySelectorAll('.btn-video-chip').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exId = this.getAttribute('data-exercise-id');
          var yt = this.getAttribute('data-youtube');
          var ex = global.EjerciciosDB.getById(exId);
          self.showVideoModal(ex || { nombre: 'Ejercicio', youtubeId: yt });
        });
      });

      // Botón trigger añadir ejercicio
      var emptyTrigger = container.querySelector('.btn-add-exercise-trigger');
      if (emptyTrigger) {
        emptyTrigger.addEventListener('click', function() {
          self.openExercisePicker(function(exerciseId) {
            global.WorkoutEngine.addExerciseToWorkout(exerciseId);
          });
        });
      }
    },

    // -------------------------------------------------------------------------
    // TEMPORIZADOR DE DESCANSO FLOTANTE (REST TIMER)
    // -------------------------------------------------------------------------
    showRestTimerWidget: function(totalSeconds) {
      var widget = document.getElementById('floating-rest-timer');
      if (widget) {
        widget.classList.add('visible');
        this.updateRestTimerDisplay({ remaining: totalSeconds, total: totalSeconds, progress: 0 });
      }
    },

    hideRestTimerWidget: function() {
      var widget = document.getElementById('floating-rest-timer');
      if (widget) {
        widget.classList.remove('visible');
      }
    },

    updateRestTimerDisplay: function(detail) {
      var widget = document.getElementById('floating-rest-timer');
      if (!widget) return;

      var textEl = widget.querySelector('.rest-timer-time');
      var circle = widget.querySelector('.rest-progress-circle');

      if (textEl) {
        textEl.textContent = global.WorkoutEngine.formatDuration(detail.remaining);
      }
      if (circle) {
        var circumference = 2 * Math.PI * 40; // radio 40
        var offset = circumference - (detail.progress / 100) * circumference;
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
      }
    },

    // =========================================================================
    // 3. SELECTOR DE EJERCICIOS (EXERCISE PICKER MODAL)
    // =========================================================================
    openExercisePicker: function(callback) {
      this.exercisePickerCallback = callback;
      var modal = document.getElementById('modal-exercise-picker');
      if (modal) {
        modal.classList.add('open');
        this.renderExercisePickerList();
      }
    },

    closeExercisePicker: function() {
      var modal = document.getElementById('modal-exercise-picker');
      if (modal) modal.classList.remove('open');
      this.exercisePickerCallback = null;
    },

    renderExercisePickerList: function() {
      var container = document.getElementById('picker-exercises-list');
      var searchInput = document.getElementById('picker-search-input');
      if (!container) return;

      var query = searchInput ? searchInput.value : '';
      var list = global.EjerciciosDB ? global.EjerciciosDB.search(query, this.selectedFilterGroup, this.selectedEquipment) : [];

      var html = '';
      if (list.length === 0) {
        html = '<div class="empty-state-card">' +
          '<p>No se encontraron ejercicios con ese criterio.</p>' +
          '<button class="btn btn-secondary btn-create-custom-ex">+ Crear Ejercicio Personalizado</button>' +
        '</div>';
      } else {
        list.forEach(function(ex) {
          html += '<div class="picker-exercise-item" data-id="' + ex.id + '">' +
            '<div class="picker-item-info">' +
              '<h4 class="picker-item-name">' + ex.nombre + '</h4>' +
              '<span class="picker-item-meta">' + ex.grupo + ' · ' + (ex.equipo || 'Máquina') + '</span>' +
              (ex.descripcion ? '<p class="picker-item-desc">' + ex.descripcion + '</p>' : '') +
            '</div>' +
            '<button class="btn btn-outline-sm btn-select-this-ex" data-id="' + ex.id + '">+ Añadir</button>' +
          '</div>';
        });
      }

      container.innerHTML = html;

      var self = this;
      container.querySelectorAll('.picker-exercise-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          if (self.exercisePickerCallback) {
            self.exercisePickerCallback(id);
            self.closeExercisePicker();
          }
        });
      });

      var createBtn = container.querySelector('.btn-create-custom-ex');
      if (createBtn) {
        createBtn.addEventListener('click', function() {
          self.closeExercisePicker();
          self.showCreateCustomExerciseModal();
        });
      }
    },

    // =========================================================================
    // 4. PESTAÑA RUTINAS Y CREADOR (ROUTINES TAB & BUILDER)
    // =========================================================================
    renderRoutinesTab: function() {
      var container = document.getElementById('routines-tab-container');
      if (!container) return;

      var custom = global.RutinasMaestras ? global.RutinasMaestras.getPersonalizadas() : [];
      var oficiales = global.RutinasMaestras ? global.RutinasMaestras.getOficiales() : [];

      var html = '<div class="routines-tab-header">' +
        '<div class="tab-header-titles">' +
          '<h3>Mis Rutinas y Plantillas</h3>' +
          '<p>Diseña tus propias rutinas o adapta el sistema de Jose Perez.</p>' +
        '</div>' +
        '<button class="btn btn-primary btn-trigger-new-routine">+ Nueva Rutina</button>' +
      '</div>';

      // Rutinas del usuario
      html += '<div class="section-title-wrap"><h4 class="section-heading">Creadas por Ti (' + custom.length + ')</h4></div>';
      if (custom.length === 0) {
        html += '<div class="empty-state-card">' +
          '<div class="empty-icon">📋</div>' +
          '<h4>Aún no has creado rutinas propias</h4>' +
          '<p>Pulsa en "+ Nueva Rutina" para armar tu rutina personalizada con tus ejercicios y series.</p>' +
          '<button class="btn btn-primary btn-trigger-new-routine">+ Crear mi Primera Rutina</button>' +
        '</div>';
      } else {
        html += '<div class="routines-grid">';
        custom.forEach(function(r) {
          html += App.generateRoutineCardHTML(r, true);
        });
        html += '</div>';
      }

      // Rutinas oficiales
      html += '<div class="section-title-wrap" style="margin-top: 2rem;"><h4 class="section-heading">Plantillas Oficiales Jose Perez</h4><span class="count-pill official-pill">Oficial</span></div>';
      html += '<div class="routines-grid">';
      oficiales.forEach(function(r) {
        html += App.generateRoutineCardHTML(r, false);
      });
      html += '</div>';

      container.innerHTML = html;
      this.bindRoutineCardEvents(container);

      var self = this;
      container.querySelectorAll('.btn-trigger-new-routine').forEach(function(btn) {
        btn.addEventListener('click', function() {
          self.openRoutineBuilder(null);
        });
      });
    },

    openRoutineBuilder: function(routineId) {
      if (routineId) {
        global.RoutineBuilder.loadForEditing(routineId);
      } else {
        global.RoutineBuilder.startNewRoutine();
      }

      var modal = document.getElementById('modal-routine-builder');
      if (modal) {
        modal.classList.add('open');
        this.renderRoutineBuilderModal();
      }
    },

    closeRoutineBuilder: function() {
      var modal = document.getElementById('modal-routine-builder');
      if (modal) modal.classList.remove('open');
    },

    renderRoutineBuilderModal: function() {
      var draft = global.RoutineBuilder ? global.RoutineBuilder.currentDraft : null;
      if (!draft) return;

      var titleInput = document.getElementById('builder-routine-title');
      var descInput = document.getElementById('builder-routine-desc');
      var catSelect = document.getElementById('builder-routine-category');
      var exercisesContainer = document.getElementById('builder-exercises-list');

      if (titleInput) titleInput.value = draft.titulo || '';
      if (descInput) descInput.value = draft.descripcion || '';
      if (catSelect && draft.categoria) catSelect.value = draft.categoria;

      var html = '';
      if (!draft.ejercicios || draft.ejercicios.length === 0) {
        html = '<div class="empty-state-card">' +
          '<p>Esta rutina no tiene ejercicios todavía.</p>' +
          '<button class="btn btn-secondary btn-builder-add-ex">+ Añadir Ejercicios a la Rutina</button>' +
        '</div>';
      } else {
        draft.ejercicios.forEach(function(ex, idx) {
          html += '<div class="builder-exercise-card" data-index="' + idx + '">' +
            '<div class="builder-ex-header">' +
              '<span class="ex-number-pill">' + (idx + 1) + '</span>' +
              '<h4 class="builder-ex-name">' + ex.name + '</h4>' +
              '<div class="builder-ex-actions">' +
                (idx > 0 ? '<button class="btn-icon-subtle btn-move-up" data-index="' + idx + '" title="Mover arriba">▲</button>' : '') +
                (idx < draft.ejercicios.length - 1 ? '<button class="btn-icon-subtle btn-move-down" data-index="' + idx + '" title="Mover abajo">▼</button>' : '') +
                '<button class="btn-icon-subtle btn-builder-remove-ex" data-index="' + idx + '" title="Eliminar">✕</button>' +
              '</div>' +
            '</div>' +
            '<div class="builder-ex-body">' +
              '<div class="input-group-row">' +
                '<label>Rango de Repeticiones Objetivo:</label>' +
                '<input type="text" class="form-control-sm builder-reps-input" data-index="' + idx + '" value="' + (ex.targetReps || '8-10') + '" placeholder="Ej: 8-10 o RIR 0">' +
              '</div>' +
              '<div class="input-group-row">' +
                '<label>Series predeterminadas: <strong>' + (ex.defaultSets ? ex.defaultSets.length : 3) + ' series</strong></label>' +
                '<div class="set-stepper">' +
                  '<button class="btn-stepper btn-sub-set" data-index="' + idx + '">-</button>' +
                  '<button class="btn-stepper btn-add-set" data-index="' + idx + '">+</button>' +
                '</div>' +
              '</div>' +
              '<div class="input-group-row">' +
                '<label>Directriz / Notas:</label>' +
                '<input type="text" class="form-control-sm builder-notes-input" data-index="' + idx + '" value="' + (ex.notes || '') + '" placeholder="Ej: Excéntrico en 5s, pausa abajo">' +
              '</div>' +
            '</div>' +
          '</div>';
        });
      }

      if (exercisesContainer) exercisesContainer.innerHTML = html;
      this.bindRoutineBuilderEvents();
    },

    bindRoutineBuilderEvents: function() {
      var self = this;
      var draft = global.RoutineBuilder.currentDraft;
      if (!draft) return;

      var container = document.getElementById('builder-exercises-list');
      if (!container) return;

      container.querySelectorAll('.btn-move-up').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          global.RoutineBuilder.moveExerciseInDraft(idx, -1);
          self.renderRoutineBuilderModal();
        });
      });

      container.querySelectorAll('.btn-move-down').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          global.RoutineBuilder.moveExerciseInDraft(idx, 1);
          self.renderRoutineBuilderModal();
        });
      });

      container.querySelectorAll('.btn-builder-remove-ex').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          global.RoutineBuilder.removeExerciseFromDraft(idx);
          self.renderRoutineBuilderModal();
        });
      });

      container.querySelectorAll('.btn-add-set').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          global.RoutineBuilder.addSetToDraftExercise(idx);
          self.renderRoutineBuilderModal();
        });
      });

      container.querySelectorAll('.btn-sub-set').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          global.RoutineBuilder.removeSetFromDraftExercise(idx, 0);
          self.renderRoutineBuilderModal();
        });
      });

      container.querySelectorAll('.builder-reps-input').forEach(function(input) {
        input.addEventListener('change', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          if (draft.ejercicios[idx]) draft.ejercicios[idx].targetReps = this.value;
        });
      });

      container.querySelectorAll('.builder-notes-input').forEach(function(input) {
        input.addEventListener('change', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          if (draft.ejercicios[idx]) draft.ejercicios[idx].notes = this.value;
        });
      });

      var addExBtn = document.getElementById('btn-builder-add-exercise');
      if (addExBtn) {
        addExBtn.onclick = function() {
          self.openExercisePicker(function(exerciseId) {
            global.RoutineBuilder.addExerciseToDraft(exerciseId);
            self.renderRoutineBuilderModal();
          });
        };
      }
    },

    // =========================================================================
    // 5. PESTAÑA CHAT (COACH JOSE PEREZ & TEAM FEED)
    // =========================================================================
    renderChatTab: function() {
      var self = this;
      var curChannel = global.ChatEngine ? global.ChatEngine.currentChannel : 'coach';

      // Actualizar selector de canal
      document.querySelectorAll('.chat-channel-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-channel') === curChannel);
      });

      var channelTitleEl = document.getElementById('chat-active-channel-title');
      var channelSubtitleEl = document.getElementById('chat-active-channel-desc');
      var waBtn = document.getElementById('btn-open-whatsapp');

      if (curChannel === 'coach') {
        if (channelTitleEl) channelTitleEl.textContent = 'Jose Perez · Head Coach';
        if (channelSubtitleEl) channelSubtitleEl.textContent = 'Respuestas directas con la metodología oficial JPEREZCOACH';
        if (waBtn) waBtn.style.display = 'inline-flex';
      } else {
        if (channelTitleEl) channelTitleEl.textContent = 'Comunidad JPEREZ TEAM';
        if (channelSubtitleEl) channelSubtitleEl.textContent = 'Atletas compartiendo entrenos, marcas y motivación';
        if (waBtn) waBtn.style.display = 'none';
      }

      this.renderChatMessages();
    },

    renderChatMessages: function() {
      var container = document.getElementById('chat-messages-container');
      if (!container) return;

      var messages = global.ChatEngine ? global.ChatEngine.getMessages() : [];
      var curUser = global.AppState ? global.AppState.currentUser : { name: 'Atleta' };

      var html = '';
      messages.forEach(function(msg) {
        var isMe = (msg.sender === 'user' || (msg.authorName && curUser && msg.authorName === curUser.name));
        var msgClass = isMe ? 'message-out' : 'message-in';

        html += '<div class="chat-message-row ' + msgClass + '">' +
          (!isMe ? '<div class="chat-author-avatar"><img src="' + (msg.avatar || 'assets/coach_photo.png') + '" onerror="this.src=\'assets/icon.png\'" alt="Avatar"></div>' : '') +
          '<div class="chat-bubble">' +
            (!isMe ? '<span class="chat-bubble-author">' + (msg.authorName || 'Jose Perez') + '</span>' : '') +
            '<div class="chat-bubble-text">' + msg.text.replace(/\n/g, '<br>') + '</div>' +
            '<div class="chat-bubble-time">' + (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '') + '</div>';

        // Reacciones de emojis si tiene
        if (msg.reactions && Object.keys(msg.reactions).length > 0) {
          html += '<div class="chat-reactions-row">';
          for (var emoji in msg.reactions) {
            var count = msg.reactions[emoji].length;
            html += '<span class="reaction-tag" data-msg-id="' + msg.id + '" data-emoji="' + emoji + '">' + emoji + ' ' + count + '</span>';
          }
          html += '</div>';
        }

        html += '</div></div>';
      });

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;

      // Eventos de reacción en emojis
      container.querySelectorAll('.reaction-tag').forEach(function(tag) {
        tag.addEventListener('click', function() {
          var mId = this.getAttribute('data-msg-id');
          var em = this.getAttribute('data-emoji');
          var uName = (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser.name : 'Atleta';
          global.AppState.addReactionToMessage(global.ChatEngine.currentChannel, mId, em, uName);
        });
      });
    },

    // =========================================================================
    // 6. PESTAÑA HISTORIAL Y ANALÍTICA (HISTORY & STATS TAB)
    // =========================================================================
    renderHistoryTab: function() {
      var container = document.getElementById('history-workouts-container');
      var statsWrap = document.getElementById('history-stats-banner');
      var heatmapWrap = document.getElementById('activity-heatmap-grid');
      var prsWrap = document.getElementById('history-prs-container');

      if (!global.Analytics) return;

      var stats = global.Analytics.getGlobalStats();

      // Renderizar banner de estadísticas
      if (statsWrap) {
        statsWrap.innerHTML = '<div class="stat-box">' +
          '<span class="stat-number">' + stats.totalWorkouts + '</span>' +
          '<span class="stat-label">Entrenos</span>' +
        '</div>' +
        '<div class="stat-box">' +
          '<span class="stat-number">' + stats.totalVolumeTonnes + ' t</span>' +
          '<span class="stat-label">Volumen Total</span>' +
        '</div>' +
        '<div class="stat-box">' +
          '<span class="stat-number">' + stats.totalHours + ' h</span>' +
          '<span class="stat-label">Horas Gym</span>' +
        '</div>' +
        '<div class="stat-box">' +
          '<span class="stat-number">🏆 ' + stats.totalPRs + '</span>' +
          '<span class="stat-label">Récords PR</span>' +
        '</div>';
      }

      // Renderizar Heatmap de actividad (12 semanas)
      if (heatmapWrap) {
        var heatmapCells = global.Analytics.getActivityHeatmapData();
        var heatHtml = '';
        heatmapCells.forEach(function(c) {
          var tooltip = c.date + (c.count > 0 ? ': ' + c.count + ' entreno(s), ' + c.volume + 'kg' : ': Sin entreno');
          heatHtml += '<div class="heat-cell heat-level-' + c.intensity + '" title="' + tooltip + '"></div>';
        });
        heatmapWrap.innerHTML = heatHtml;
      }

      // Renderizar Récords Personales (PRs)
      if (prsWrap) {
        var prs = (global.AppState && global.AppState.prs) ? global.AppState.prs : {};
        var prKeys = Object.keys(prs);
        if (prKeys.length === 0) {
          prsWrap.innerHTML = '<p class="text-muted">Aún no hay récords registrados. ¡Completa tu próximo entreno para desbloquear tus marcas!</p>';
        } else {
          var prHtml = '<div class="prs-grid">';
          prKeys.forEach(function(k) {
            var pr = prs[k];
            prHtml += '<div class="pr-card">' +
              '<div class="pr-header">' +
                '<span class="pr-trophy">🏆</span>' +
                '<h5 class="pr-title">' + (pr.exerciseName || k) + '</h5>' +
              '</div>' +
              '<div class="pr-numbers">' +
                '<div class="pr-metric"><span class="pr-val">' + pr.maxWeight + ' kg</span><span class="pr-sub">Máx Carga (' + pr.maxRepsAtMaxWeight + ' reps)</span></div>' +
                (pr.maxEstimated1RM ? '<div class="pr-metric"><span class="pr-val">' + pr.maxEstimated1RM + ' kg</span><span class="pr-sub">1RM Est.</span></div>' : '') +
              '</div>' +
            '</div>';
          });
          prHtml += '</div>';
          prsWrap.innerHTML = prHtml;
        }
      }

      // Renderizar Lista de entrenamientos pasados
      if (container) {
        var workouts = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
        if (workouts.length === 0) {
          container.innerHTML = '<div class="empty-state-card">' +
            '<div class="empty-icon">📊</div>' +
            '<h4>No tienes entrenamientos registrados</h4>' +
            '<p>Comienza un entrenamiento libre o elige una de las 6 rutinas de Jose Perez.</p>' +
          '</div>';
        } else {
          var wHtml = '';
          workouts.forEach(function(w) {
            var durStr = global.WorkoutEngine ? global.WorkoutEngine.formatDuration(w.durationSeconds) : '45 min';
            var dateStr = w.endedAt ? new Date(w.endedAt).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Reciente';

            wHtml += '<div class="history-workout-card">' +
              '<div class="history-card-header">' +
                '<div>' +
                  '<h4 class="history-workout-title">' + w.name + '</h4>' +
                  '<span class="history-workout-date">📅 ' + dateStr + ' · ⏱️ ' + durStr + '</span>' +
                '</div>' +
                '<button class="btn btn-outline-sm btn-repeat-workout" data-workout-id="' + w.id + '">Repetir</button>' +
              '</div>' +
              '<div class="history-metrics-row">' +
                '<div class="metric-pill">⚖️ <strong>' + (w.totalVolumeKg || 0) + ' kg</strong> vol</div>' +
                '<div class="metric-pill">🔢 <strong>' + (w.totalSets || 0) + '</strong> series</div>' +
                (w.prsCount > 0 ? '<div class="metric-pill pr-pill">🏆 <strong>' + w.prsCount + ' PRs</strong></div>' : '') +
              '</div>' +
              '<div class="history-exercises-breakdown">';

            if (w.exercises) {
              w.exercises.forEach(function(ex) {
                var bestSet = '-';
                if (ex.sets) {
                  var maxW = 0;
                  var maxR = 0;
                  ex.sets.forEach(function(s) {
                    if (s.completed && s.weight >= maxW) { maxW = s.weight; maxR = s.reps; }
                  });
                  if (maxW > 0) bestSet = maxW + ' kg × ' + maxR;
                }
                wHtml += '<div class="history-ex-row"><span>' + ex.name + '</span><span class="ex-best-val">' + bestSet + '</span></div>';
              });
            }

            wHtml += '</div></div>';
          });
          container.innerHTML = wHtml;

          var self = this;
          container.querySelectorAll('.btn-repeat-workout').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var wId = this.getAttribute('data-workout-id');
              var found = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory.find(function(item) { return item.id === wId; }) : null;
              if (found) {
                global.WorkoutEngine.startWorkoutFromRoutine({
                  id: found.routineId,
                  titulo: found.name,
                  ejercicios: found.exercises.map(function(e) {
                    return {
                      exerciseId: e.exerciseId,
                      name: e.name,
                      defaultSets: e.sets
                    };
                  })
                });
              }
            });
          });
        }
      }
    },

    // =========================================================================
    // 7. PESTAÑA PERFIL Y HERRAMIENTAS GYM (PROFILE TAB)
    // =========================================================================
    renderProfileTab: function() {
      var user = global.AppState ? global.AppState.currentUser : null;
      var nameEl = document.getElementById('profile-name');
      var emailEl = document.getElementById('profile-email');
      var roleEl = document.getElementById('profile-role');
      var bioEl = document.getElementById('profile-bio');
      var weightEl = document.getElementById('profile-weight');
      var heightEl = document.getElementById('profile-height');
      var goalEl = document.getElementById('profile-goal');
      var avatarWrap = document.getElementById('profile-avatar-wrap');

      if (!user) return;

      if (nameEl) nameEl.textContent = user.name || 'Atleta';
      if (emailEl) emailEl.textContent = user.email || 'atleta@jperezcoach.com';
      if (roleEl) roleEl.textContent = user.role || 'Atleta JPEREZ';
      if (bioEl) bioEl.textContent = user.bio || 'Atleta enfocado en intensidad y sobrecarga progresiva.';
      if (weightEl) weightEl.textContent = (user.weight || 75) + ' kg';
      if (heightEl) heightEl.textContent = (user.height || 175) + ' cm';
      if (goalEl) goalEl.textContent = user.goal || 'Hipertrofia';

      if (avatarWrap) {
        if (user.avatar) {
          avatarWrap.innerHTML = '<img src="' + user.avatar + '" alt="Avatar" class="profile-big-avatar">';
        } else {
          avatarWrap.innerHTML = '<div class="profile-big-avatar placeholder">' + (user.name || 'A').charAt(0).toUpperCase() + '</div>';
        }
      }
    },

    // =========================================================================
    // 8. HERRAMIENTAS GYM (CALCULADORA DE DISCOS Y 1RM)
    // =========================================================================
    calculateAndRenderPlates: function(targetKg, barKg) {
      var res = global.Analytics.calculatePlates(targetKg, barKg);
      var platesWrap = document.getElementById('plate-calc-visual-barbell');
      var breakdownWrap = document.getElementById('plate-calc-breakdown');

      if (!platesWrap || !breakdownWrap) return;

      if (!res.valid || res.platesPerSide.length === 0) {
        platesWrap.innerHTML = '<div class="empty-barbell-label">Solo barra (' + barKg + ' kg)</div>';
        breakdownWrap.innerHTML = '<p>No se necesitan discos adicionales para esta carga.</p>';
        return;
      }

      // Visualización gráfica de la barra con discos de colores
      var visualHtml = '<div class="barbell-graphic-wrap">' +
        '<div class="barbell-sleeve left-sleeve">';

      res.platesPerSide.slice().reverse().forEach(function(plate) {
        visualHtml += '<div class="plate-visual" style="background-color: ' + plate.color + '; color: ' + plate.textColor + ';" title="' + plate.label + '">' + plate.label + '</div>';
      });

      visualHtml += '</div>' +
        '<div class="barbell-collar"></div>' +
        '<div class="barbell-shaft"><span class="barbell-shaft-label">BARRA ' + barKg + 'KG</span></div>' +
        '<div class="barbell-collar"></div>' +
        '<div class="barbell-sleeve right-sleeve">';

      res.platesPerSide.forEach(function(plate) {
        visualHtml += '<div class="plate-visual" style="background-color: ' + plate.color + '; color: ' + plate.textColor + ';" title="' + plate.label + '">' + plate.label + '</div>';
      });

      visualHtml += '</div></div>';
      platesWrap.innerHTML = visualHtml;

      // Resumen textual de discos por lado
      var counts = {};
      res.platesPerSide.forEach(function(p) {
        counts[p.label] = (counts[p.label] || 0) + 1;
      });

      var textParts = [];
      for (var lbl in counts) {
        textParts.push('<strong>' + counts[lbl] + 'x ' + lbl + '</strong>');
      }

      var textHtml = '<div class="breakdown-info">' +
        '<p>Carga por cada lado: <strong>' + res.weightPerSide + ' kg</strong></p>' +
        '<p>Discos a poner por lado: ' + textParts.join(', ') + '</p>' +
        (res.remainder > 0 ? '<p class="warning-text">⚠️ Quedan ' + res.remainder + ' kg que no se pueden cuadrar con discos estándar.</p>' : '') +
      '</div>';

      breakdownWrap.innerHTML = textHtml;
    },

    calculateAndRender1RM: function(weight, reps) {
      var res = global.Analytics.calculate1RM(weight, reps);
      var resultsWrap = document.getElementById('calc-1rm-results');
      var tableWrap = document.getElementById('calc-1rm-table-wrap');

      if (!resultsWrap || !tableWrap) return;

      if (!res) {
        resultsWrap.innerHTML = '<p class="text-muted">Introduce el peso levantado y las repeticiones.</p>';
        tableWrap.innerHTML = '';
        return;
      }

      resultsWrap.innerHTML = '<div class="one-rm-hero">' +
        '<span class="one-rm-label">1RM Estimado:</span>' +
        '<span class="one-rm-big-number">' + res.average + ' kg</span>' +
        '<span class="one-rm-formulas">Epley: ' + res.epley + 'kg · Brzycki: ' + res.brzycki + 'kg</span>' +
      '</div>';

      var tHtml = '<table class="table-percentages">' +
        '<thead><tr><th>% 1RM</th><th>Carga (kg)</th><th>Rango de Repeticiones</th></tr></thead>' +
        '<tbody>';

      res.percentages.forEach(function(p) {
        tHtml += '<tr><td><strong>' + p.percentage + '%</strong></td><td class="text-cyan"><strong>' + p.weightKg + ' kg</strong></td><td>' + p.repsGuide + '</td></tr>';
      });

      tHtml += '</tbody></table>';
      tableWrap.innerHTML = tHtml;
    },

    // =========================================================================
    // 9. MODALES SECUNDARIOS (VÍDEO, RESUMEN FIN ENTRENAMIENTO, LOGIN)
    // =========================================================================
    showVideoModal: function(exercise) {
      var modal = document.getElementById('modal-video-player');
      if (!modal) return;

      var titleEl = document.getElementById('video-modal-title');
      var groupEl = document.getElementById('video-modal-group');
      var frameWrap = document.getElementById('video-frame-container');
      var tipsWrap = document.getElementById('video-tips-container');

      if (titleEl) titleEl.textContent = exercise.nombre || exercise.name;
      if (groupEl) groupEl.textContent = exercise.grupo || 'Técnica de Ejecución';

      if (frameWrap) {
        if (exercise.youtubeId) {
          frameWrap.innerHTML = '<iframe class="responsive-video-iframe" src="https://www.youtube-nocookie.com/embed/' + exercise.youtubeId + '?autoplay=1&rel=0" title="Vídeo técnica" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        } else {
          frameWrap.innerHTML = '<div class="no-video-placeholder"><p>No hay vídeo asignado para este ejercicio.</p></div>';
        }
      }

      if (tipsWrap) {
        var tips = exercise.tips || [exercise.descripcion || 'Mantén la fase excéntrica estricta en 5 segundos.'];
        var tHtml = '<ul class="coach-tips-list">';
        tips.forEach(function(tip) { tHtml += '<li>🎯 ' + tip + '</li>'; });
        tHtml += '</ul>';
        tipsWrap.innerHTML = tHtml;
      }

      modal.classList.add('open');
    },

    closeVideoModal: function() {
      var modal = document.getElementById('modal-video-player');
      if (modal) {
        modal.classList.remove('open');
        var frameWrap = document.getElementById('video-frame-container');
        if (frameWrap) frameWrap.innerHTML = ''; // Detener reproducción
      }
    },

    showRoutinePreviewModal: function(routineId) {
      var r = global.RutinasMaestras.getById(routineId);
      if (!r) return;

      var modal = document.getElementById('modal-routine-preview');
      if (!modal) return;

      var titleEl = document.getElementById('preview-routine-title');
      var descEl = document.getElementById('preview-routine-desc');
      var exListEl = document.getElementById('preview-routine-exercises');
      var startBtn = document.getElementById('btn-preview-start-routine');

      if (titleEl) titleEl.textContent = r.titulo;
      if (descEl) descEl.textContent = r.descripcion || (r.foco ? r.foco.join(' · ') : '');

      if (exListEl) {
        var html = '';
        (r.ejercicios || []).forEach(function(ex, idx) {
          var base = global.EjerciciosDB.getById(ex.exerciseId);
          var setsCount = ex.defaultSets ? ex.defaultSets.length : 3;
          html += '<div class="preview-ex-item">' +
            '<div class="preview-ex-num">' + (idx + 1) + '</div>' +
            '<div class="preview-ex-details">' +
              '<h5>' + (ex.name || (base ? base.nombre : 'Ejercicio')) + '</h5>' +
              '<span class="preview-ex-meta">' + setsCount + ' series · ' + (ex.targetReps || '8-10 reps') + '</span>' +
              (ex.notes ? '<p class="preview-ex-notes">💡 ' + ex.notes + '</p>' : '') +
            '</div>' +
            (base && base.youtubeId ? '<button class="btn-video-chip btn-preview-video" data-id="' + base.id + '">🎬 Vídeo</button>' : '') +
          '</div>';
        });
        exListEl.innerHTML = html;

        var self = this;
        exListEl.querySelectorAll('.btn-preview-video').forEach(function(b) {
          b.addEventListener('click', function() {
            var exId = this.getAttribute('data-id');
            var ex = global.EjerciciosDB.getById(exId);
            if (ex) self.showVideoModal(ex);
          });
        });
      }

      if (startBtn) {
        startBtn.onclick = function() {
          modal.classList.remove('open');
          global.WorkoutEngine.startWorkoutFromRoutine(r);
        };
      }

      modal.classList.add('open');
    },

    showWorkoutSummaryModal: function(summary) {
      var modal = document.getElementById('modal-workout-summary');
      if (!modal) return;

      var nameEl = document.getElementById('summary-workout-name');
      var timeEl = document.getElementById('summary-duration');
      var volEl = document.getElementById('summary-volume');
      var setsEl = document.getElementById('summary-sets');
      var prsWrap = document.getElementById('summary-prs-container');
      var shareChatBtn = document.getElementById('btn-summary-share-chat');
      var shareWaBtn = document.getElementById('btn-summary-share-wa');

      if (nameEl) nameEl.textContent = summary.name;
      if (timeEl) timeEl.textContent = global.WorkoutEngine.formatDuration(summary.durationSeconds);
      if (volEl) volEl.textContent = (summary.totalVolumeKg || 0) + ' kg';
      if (setsEl) setsEl.textContent = summary.totalSets || 0;

      if (prsWrap) {
        if (summary.prsUnlocked && summary.prsUnlocked.length > 0) {
          var prHtml = '<div class="summary-prs-banner"><h4>🏆 ¡' + summary.prsUnlocked.length + ' Nuevos Récords Personales!</h4><ul>';
          summary.prsUnlocked.forEach(function(pr) {
            prHtml += '<li><strong>' + pr.exerciseName + '</strong>: ' + pr.weight + ' kg × ' + pr.reps + ' reps</li>';
          });
          prHtml += '</ul></div>';
          prsWrap.innerHTML = prHtml;
          prsWrap.style.display = 'block';
        } else {
          prsWrap.innerHTML = '';
          prsWrap.style.display = 'none';
        }
      }

      var self = this;
      if (shareChatBtn) {
        shareChatBtn.onclick = function() {
          global.ChatEngine.shareLastWorkout('team');
          modal.classList.remove('open');
          self.switchTab('tab-chat');
          self.showToast('¡Entrenamiento compartido en la comunidad!');
        };
      }

      if (shareWaBtn) {
        shareWaBtn.onclick = function() {
          var url = global.ChatEngine.getWhatsAppUrl();
          window.open(url, '_blank');
        };
      }

      modal.classList.add('open');
    },

    showToast: function(message) {
      var toast = document.getElementById('app-toast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('visible');
      setTimeout(function() { toast.classList.remove('visible'); }, 3000);
    },

    initServiceWorker: function() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(function(err) {
          console.warn('SW registration failed:', err);
        });
      }
    }
  };

  global.App = App;

  // Arrancar al cargar el DOM
  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });
})(window);
