// =============================================================================
// JPEREZCOACH APP · CONTROLADOR PRINCIPAL Y GESTOR DE INTERFAZ DE USUARIO
// Navegación, Rutinas Dinámicas, Importador de PDF, Exportador y Seguimiento PRO
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
    exportTargetRoutineId: null,
    parsedImportResult: null,

    init: function() {
      this.bindEvents();
      this.initTabs();
      this.initPDFImporterEvents();
      this.initOnboardingEvents();
      this.renderAll();
      this.initServiceWorker();
      if (global.Onboarding) {
        global.Onboarding.checkAndShow();
      }
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

      // Botones de subida de PDF en cabecera y hero
      var btnHeaderUpload = document.getElementById('btn-header-upload-pdf');
      if (btnHeaderUpload) {
        btnHeaderUpload.addEventListener('click', function() {
          self.openPDFImporterModal();
        });
      }

      var btnHeroUpload = document.getElementById('btn-hero-upload-pdf');
      if (btnHeroUpload) {
        btnHeroUpload.addEventListener('click', function() {
          self.openPDFImporterModal();
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

      document.querySelectorAll('.nav-tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });

      document.querySelectorAll('.view-screen').forEach(function(screen) {
        screen.classList.toggle('active', screen.id === tabId);
      });

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

      var rutinas = global.RutinasMaestras ? global.RutinasMaestras.getAll() : [];
      var html = '';

      if (rutinas.length === 0) {
        html = '<div class="empty-state-card">' +
          '<div class="empty-icon">📋</div>' +
          '<h4>No tienes ninguna rutina cargada</h4>' +
          '<p>Sube tu rutina en PDF, crea una nueva desde cero o restaura el plan de Jose Perez.</p>' +
          '<div class="empty-actions-row">' +
            '<button class="btn btn-primary" id="btn-empty-upload-pdf">📄 Subir Rutina en PDF</button>' +
            '<button class="btn btn-secondary" id="btn-empty-new-routine">➕ Crear Rutina Manual</button>' +
            '<button class="btn btn-outline" id="btn-empty-restore-default">🔄 Restaurar Plan de Jose Perez (6 Días)</button>' +
          '</div>' +
        '</div>';
        container.innerHTML = html;

        var self = this;
        var btnEmptyPdf = document.getElementById('btn-empty-upload-pdf');
        if (btnEmptyPdf) btnEmptyPdf.onclick = function() { self.openPDFImporterModal(); };

        var btnEmptyNew = document.getElementById('btn-empty-new-routine');
        if (btnEmptyNew) btnEmptyNew.onclick = function() { self.openRoutineBuilder(null); };

        var btnEmptyRes = document.getElementById('btn-empty-restore-default');
        if (btnEmptyRes) btnEmptyRes.onclick = function() {
          global.RutinasMaestras.restaurarOficiales();
          self.showToast('Plan oficial de 6 días restaurado.');
        };
        return;
      }

      html += '<div class="section-title-wrap">' +
        '<h3 class="section-heading">Tus Rutinas Disponibles</h3>' +
        '<span class="count-pill">' + rutinas.length + ' rutinas</span>' +
      '</div>';
      html += '<p class="section-subtitle">Puedes iniciar cualquier sesión, editarla, borrarla o exportarla en PDF/JSON.</p>';

      html += '<div class="routines-grid">';
      rutinas.forEach(function(r) {
        html += App.generateRoutineCardHTML(r);
      });
      html += '</div>';

      container.innerHTML = html;
      this.bindRoutineCardEvents(container);
    },

    generateRoutineCardHTML: function(routine) {
      var numEjercicios = routine.ejercicios ? routine.ejercicios.length : 0;
      var focos = (routine.foco || []).join(' · ');
      var borderAccent = routine.color || '#38bdf8';

      return '<div class="routine-card" data-routine-id="' + routine.id + '" style="border-left: 4px solid ' + borderAccent + ';">' +
        '<div class="routine-card-header">' +
          '<div class="routine-meta">' +
            '<span class="routine-tag" style="background: ' + borderAccent + '22; color: ' + borderAccent + ';">' + (routine.etiqueta || 'RUTINA') + '</span>' +
            '<span class="routine-duration">⏱️ ~' + (routine.tiempoEstimadoMin || 60) + ' min</span>' +
          '</div>' +
          '<div class="routine-top-actions">' +
            '<button class="btn-icon-subtle btn-export-routine-trigger" data-id="' + routine.id + '" title="Exportar rutina (PDF, JSON o WhatsApp)">📤</button>' +
            '<button class="btn-icon-subtle btn-edit-routine" data-id="' + routine.id + '" title="Editar rutina">✏️</button>' +
            '<button class="btn-icon-subtle btn-delete-routine" data-id="' + routine.id + '" title="Eliminar rutina">🗑️</button>' +
          '</div>' +
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

      container.querySelectorAll('.btn-edit-routine').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          self.openRoutineBuilder(id);
        });
      });

      container.querySelectorAll('.btn-export-routine-trigger').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          self.openExportRoutineModal(id);
        });
      });

      container.querySelectorAll('.btn-delete-routine').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          var r = global.RutinasMaestras.getById(id);
          var nombre = r ? r.titulo : 'esta rutina';
          if (confirm('¿Eliminar "' + nombre + '" de tu lista de rutinas?')) {
            global.RutinasMaestras.borrarRutina(id);
            self.showToast('Rutina eliminada.');
          }
        });
      });
    },

    // =========================================================================
    // 2. PESTAÑA RUTINAS (ROUTINES HUB)
    // =========================================================================
    renderRoutinesTab: function() {
      var container = document.getElementById('routines-tab-container');
      if (!container) return;

      var rutinas = global.RutinasMaestras ? global.RutinasMaestras.getAll() : [];

      var html = '<div class="routines-tab-header">' +
        '<div class="tab-header-titles">' +
          '<h3>Gestor y Creador de Rutinas</h3>' +
          '<p>Sube tu PDF, diseña entrenamientos o adapta el sistema de Jose Perez.</p>' +
        '</div>' +
        '<div class="routines-header-btns">' +
          '<button class="btn btn-secondary btn-sm" id="btn-tab-upload-pdf">📄 Subir Rutina en PDF</button>' +
          '<button class="btn btn-primary btn-sm btn-trigger-new-routine">+ Nueva Rutina Manual</button>' +
        '</div>' +
      '</div>';

      // Barra de utilidades: Restaurar oficiales / Borrar todo / Guía
      html += '<div class="routines-toolbar-banner">' +
        '<button class="btn-toolbar-link" id="btn-open-guide-from-tab">📖 Ver Guía de Formato PDF</button>' +
        '<span class="toolbar-sep">·</span>' +
        '<button class="btn-toolbar-link" id="btn-restore-default-plan">🔄 Restaurar 6 Días Oficiales</button>' +
        '<span class="toolbar-sep">·</span>' +
        '<button class="btn-toolbar-link text-danger" id="btn-clear-all-routines">🗑️ Borrar Todo</button>' +
      '</div>';

      if (rutinas.length === 0) {
        html += '<div class="empty-state-card">' +
          '<div class="empty-icon">📋</div>' +
          '<h4>Tu biblioteca de rutinas está vacía</h4>' +
          '<p>Sube tu PDF o pulsa en "+ Nueva Rutina Manual" para crear tu plan personalizado.</p>' +
        '</div>';
      } else {
        html += '<div class="routines-grid">';
        rutinas.forEach(function(r) {
          html += App.generateRoutineCardHTML(r);
        });
        html += '</div>';
      }

      container.innerHTML = html;
      this.bindRoutineCardEvents(container);

      var self = this;
      var btnUploadPdf = document.getElementById('btn-tab-upload-pdf');
      if (btnUploadPdf) btnUploadPdf.onclick = function() { self.openPDFImporterModal(); };

      var btnNewRoutine = container.querySelector('.btn-trigger-new-routine');
      if (btnNewRoutine) btnNewRoutine.onclick = function() { self.openRoutineBuilder(null); };

      var btnOpenGuide = document.getElementById('btn-open-guide-from-tab');
      if (btnOpenGuide) btnOpenGuide.onclick = function() { self.openFormatGuideModal(); };

      var btnRestore = document.getElementById('btn-restore-default-plan');
      if (btnRestore) {
        btnRestore.onclick = function() {
          if (confirm('¿Restaurar el plan original de 6 días de Jose Perez?')) {
            global.RutinasMaestras.restaurarOficiales();
            self.showToast('Plan de 6 días restaurado.');
          }
        };
      }

      var btnClearAll = document.getElementById('btn-clear-all-routines');
      if (btnClearAll) {
        btnClearAll.onclick = function() {
          if (confirm('¿Eliminar TODAS las rutinas para empezar completamente en blanco?')) {
            global.RutinasMaestras.borrarTodas();
            self.showToast('Todas las rutinas han sido eliminadas.');
          }
        };
      }
    },

    // =========================================================================
    // 3. IMPORTADOR DE RUTINAS EN PDF Y TEXTO (PDF IMPORTER)
    // =========================================================================
    initPDFImporterEvents: function() {
      var self = this;
      var modal = document.getElementById('modal-pdf-importer');
      var dropzone = document.getElementById('pdf-dropzone');
      var fileInput = document.getElementById('pdf-file-input');
      var btnBrowse = document.getElementById('btn-browse-pdf');
      var selectedLabel = document.getElementById('selected-pdf-name');
      var btnClose = document.getElementById('btn-close-pdf-importer');
      var btnCancel = document.getElementById('btn-cancel-pdf-import');
      var btnProcess = document.getElementById('btn-process-import');
      var btnOpenGuide = document.getElementById('btn-open-format-guide');

      var selectedFile = null;

      function closeModal() {
        if (modal) modal.classList.remove('open');
        selectedFile = null;
        if (selectedLabel) selectedLabel.textContent = '';
      }

      if (btnClose) btnClose.onclick = closeModal;
      if (btnCancel) btnCancel.onclick = closeModal;

      if (btnBrowse && fileInput) {
        btnBrowse.onclick = function(e) {
          e.preventDefault();
          fileInput.click();
        };
      }

      if (fileInput) {
        fileInput.onchange = function(e) {
          if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            if (selectedLabel) selectedLabel.textContent = '📄 ' + selectedFile.name + ' (' + Math.round(selectedFile.size / 1024) + ' KB)';
          }
        };
      }

      // Drag & Drop
      if (dropzone) {
        ['dragenter', 'dragover'].forEach(function(eventName) {
          dropzone.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
          }, false);
        });

        ['dragleave', 'drop'].forEach(function(eventName) {
          dropzone.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
          }, false);
        });

        dropzone.addEventListener('drop', function(e) {
          var dt = e.dataTransfer;
          var files = dt.files;
          if (files && files[0]) {
            selectedFile = files[0];
            if (selectedLabel) selectedLabel.textContent = '📄 ' + selectedFile.name + ' (' + Math.round(selectedFile.size / 1024) + ' KB)';
          }
        }, false);
      }

      // Tabs entre Archivo PDF y Pegar Texto
      var importTabs = document.querySelectorAll('.import-tab-btn');
      importTabs.forEach(function(tab) {
        tab.onclick = function() {
          importTabs.forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');

          var targetId = this.getAttribute('data-target');
          document.querySelectorAll('.import-tab-panel').forEach(function(p) {
            p.classList.toggle('active', p.id === targetId);
          });
        };
      });

      // Procesar importación
      if (btnProcess) {
        btnProcess.onclick = async function() {
          var activeTab = document.querySelector('.import-tab-btn.active');
          var isPdfTab = activeTab && activeTab.getAttribute('data-target') === 'panel-pdf-file';

          try {
            self.showToast('Analizando estructura del documento...');
            var result = null;

            if (isPdfTab) {
              if (!selectedFile) {
                alert('Por favor selecciona o arrastra un archivo PDF primero.');
                return;
              }
              result = await global.PDFImporter.parsePDFFile(selectedFile);
            } else {
              var textIn = document.getElementById('plain-text-input');
              var txt = textIn ? textIn.value : '';
              if (!txt || !txt.trim()) {
                alert('Por favor pega el texto de tu rutina primero.');
                return;
              }
              result = global.PDFImporter.parsePlainText(txt);
            }

            if (!result || !result.dias || result.dias.length === 0) {
              alert('No se pudieron detectar días ni ejercicios. Revisa la Guía de Formato.');
              return;
            }

            closeModal();
            self.showPDFPreviewModal(result);
          } catch (err) {
            alert('Error al analizar la rutina: ' + err.message);
          }
        };
      }

      if (btnOpenGuide) {
        btnOpenGuide.onclick = function() {
          self.openFormatGuideModal();
        };
      }
    },

    openPDFImporterModal: function() {
      var modal = document.getElementById('modal-pdf-importer');
      if (modal) modal.classList.add('open');
    },

    showPDFPreviewModal: function(parsedResult) {
      this.parsedImportResult = parsedResult;
      var modal = document.getElementById('modal-pdf-preview');
      if (!modal) return;

      var titleEl = document.getElementById('pdf-preview-plan-title');
      var metaEl = document.getElementById('pdf-preview-meta');
      var bodyEl = document.getElementById('pdf-preview-body');

      if (titleEl) titleEl.textContent = parsedResult.tituloPlan || 'Rutina Analizada';
      if (metaEl) metaEl.textContent = (parsedResult.atleta ? 'Atleta: ' + parsedResult.atleta + ' · ' : '') + parsedResult.totalDias + ' día(s) detectado(s)';

      var html = '';
      parsedResult.dias.forEach(function(dia, dIdx) {
        html += '<div class="preview-import-day-card">' +
          '<div class="day-card-header">' +
            '<h4>' + dia.titulo + '</h4>' +
            '<span class="badge-role">' + dia.ejercicios.length + ' ejercicios</span>' +
          '</div>' +
          '<div class="day-exercises-table">';

        dia.ejercicios.forEach(function(ex, eIdx) {
          var matchedPill = ex.matchedId ? '<span class="pill-matched" title="Vinculado al catálogo oficial">🎬 Vídeo Verificado</span>' : '<span class="pill-unmatched">Nuevo Ejercicio</span>';

          html += '<div class="import-ex-row">' +
            '<div class="import-ex-info">' +
              '<strong>' + (eIdx + 1) + '. ' + ex.name + '</strong>' +
              (ex.notes ? '<p class="import-ex-notes">🎯 ' + ex.notes + '</p>' : '') +
            '</div>' +
            '<div class="import-ex-meta">' +
              '<span>' + (ex.defaultSets ? ex.defaultSets.length : 3) + ' series × ' + ex.targetReps + '</span>' +
              matchedPill +
            '</div>' +
          '</div>';
        });

        html += '</div></div>';
      });

      if (bodyEl) bodyEl.innerHTML = html;

      var self = this;
      var btnConfirm = document.getElementById('btn-confirm-import-routine');
      if (btnConfirm) {
        btnConfirm.onclick = function() {
          parsedResult.dias.forEach(function(dia) {
            dia.esOficial = false;
            dia.categoria = 'Rutinas Importadas';
            global.AppState.addRoutine(dia);
          });

          modal.classList.remove('open');
          self.showToast('¡' + parsedResult.totalDias + ' rutina(s) guardadas en tu aplicación!');
          self.renderWorkoutTab();
          self.renderRoutinesTab();
        };
      }

      var btnClose = document.getElementById('btn-close-pdf-preview');
      var btnBack = document.getElementById('btn-back-to-import');
      function closePreview() { modal.classList.remove('open'); }
      if (btnClose) btnClose.onclick = closePreview;
      if (btnBack) {
        btnBack.onclick = function() {
          closePreview();
          self.openPDFImporterModal();
        };
      }

      modal.classList.add('open');
    },

    openFormatGuideModal: function() {
      var modal = document.getElementById('modal-format-guide');
      if (!modal) return;

      var self = this;
      var btnClose = document.getElementById('btn-close-format-guide');
      var btnClose2 = document.getElementById('btn-close-format-guide-btn');
      var btnCopy = document.getElementById('btn-copy-sample-template');
      var btnUse = document.getElementById('btn-use-sample-in-importer');

      function closeGuide() { modal.classList.remove('open'); }
      if (btnClose) btnClose.onclick = closeGuide;
      if (btnClose2) btnClose2.onclick = closeGuide;

      if (btnCopy) {
        btnCopy.onclick = function() {
          var sampleText = document.getElementById('sample-template-text').textContent;
          navigator.clipboard.writeText(sampleText).then(function() {
            self.showToast('Plantilla de ejemplo copiada al portapapeles.');
          });
        };
      }

      if (btnUse) {
        btnUse.onclick = function() {
          var sampleText = document.getElementById('sample-template-text').textContent;
          closeGuide();
          self.openPDFImporterModal();

          // Activar pestaña de texto plano y pegar ejemplo
          var plainTab = document.querySelector('.import-tab-btn[data-target="panel-plain-text"]');
          if (plainTab) plainTab.click();
          var txtArea = document.getElementById('plain-text-input');
          if (txtArea) txtArea.value = sampleText;
        };
      }

      modal.classList.add('open');
    },

    // =========================================================================
    // ASISTENTE DE PERSONALIZACIÓN Y ONBOARDING
    // =========================================================================
    initOnboardingEvents: function() {
      var btnNext = document.getElementById('btn-onboarding-next');
      var btnPrev = document.getElementById('btn-onboarding-prev');

      if (btnNext) {
        btnNext.addEventListener('click', function() {
          if (global.Onboarding) global.Onboarding.nextStep();
        });
      }

      if (btnPrev) {
        btnPrev.addEventListener('click', function() {
          if (global.Onboarding) global.Onboarding.prevStep();
        });
      }

      // Tarjetas de elección de rutina en el onboarding
      var choiceCards = document.querySelectorAll('.routine-choice-card');
      var subpanelPdf = document.getElementById('onboard-subpanel-pdf');
      var subpanelText = document.getElementById('onboard-subpanel-text');

      choiceCards.forEach(function(card) {
        card.addEventListener('click', function() {
          choiceCards.forEach(function(c) { c.classList.remove('selected'); });
          this.classList.add('selected');
          var choice = this.getAttribute('data-choice');
          if (global.Onboarding) {
            global.Onboarding.athleteData.routineChoice = choice;
          }

          if (subpanelPdf) subpanelPdf.classList.toggle('active', choice === 'pdf');
          if (subpanelText) subpanelText.classList.toggle('active', choice === 'text');
        });
      });

      // Subida de PDF dentro del onboarding
      var btnUploadPdfOnboard = document.getElementById('btn-onboard-upload-pdf-trigger');
      var pdfSelectedStatus = document.getElementById('onboard-pdf-selected-status');

      if (btnUploadPdfOnboard) {
        btnUploadPdfOnboard.addEventListener('click', function() {
          var fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.pdf';
          fileInput.style.display = 'none';
          document.body.appendChild(fileInput);

          fileInput.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) {
              if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput);
              return;
            }

            if (pdfSelectedStatus) pdfSelectedStatus.textContent = '⏳ Analizando ' + file.name + '...';

            if (global.PDFImporter) {
              global.PDFImporter.extractTextFromPDF(file).then(function(extractedText) {
                var parsed = global.PDFImporter.parseText(extractedText);
                if (parsed.routines && parsed.routines.length > 0) {
                  if (global.Onboarding) {
                    global.Onboarding.athleteData.importedRoutines = parsed.routines;
                  }
                  if (pdfSelectedStatus) {
                    pdfSelectedStatus.textContent = '✅ ' + parsed.routines.length + ' rutinas detectadas en ' + file.name;
                  }
                } else {
                  if (pdfSelectedStatus) pdfSelectedStatus.textContent = '⚠️ No se detectaron días estructurados. Se creará vacía.';
                }
                if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput);
              }).catch(function(err) {
                if (pdfSelectedStatus) pdfSelectedStatus.textContent = '❌ Error al leer PDF: ' + err.message;
                if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput);
              });
            }
          };

          fileInput.click();
        });
      }

      // Input de texto plano en onboarding
      var onboardPlainText = document.getElementById('onboard-plain-text');
      if (onboardPlainText) {
        onboardPlainText.addEventListener('input', function() {
          var val = this.value;
          if (val && val.trim().length > 10 && global.PDFImporter) {
            var parsed = global.PDFImporter.parseText(val);
            if (parsed.routines && parsed.routines.length > 0 && global.Onboarding) {
              global.Onboarding.athleteData.importedRoutines = parsed.routines;
            }
          }
        });
      }
    },

    // Renderizar perfiles de atleta en modal auth
    renderAuthProfilesList: function() {
      var container = document.getElementById('auth-profiles-list');
      if (!container) return;
      var users = global.AuthService ? global.AuthService.getAllUsers() : [];
      var current = global.AppState ? global.AppState.currentUser : null;

      if (!users || users.length === 0) {
        container.innerHTML = '<p class="text-dim" style="font-size: 0.85rem; padding: 0.5rem;">No hay atletas registrados aún.</p>';
        return;
      }

      var html = '';
      users.forEach(function(u) {
        var isCurrent = current && current.id === u.id;
        var initial = (u.name || 'A').charAt(0).toUpperCase();
        var avatarHtml = u.avatar ? '<img src="' + u.avatar + '" alt="' + u.name + '">' : '<div class="avatar-placeholder">' + initial + '</div>';

        html += '<button type="button" class="demo-user-card ' + (isCurrent ? 'active' : '') + '" data-user-id="' + u.id + '">';
        html += avatarHtml;
        html += '<div style="flex: 1; text-align: left;">';
        html += '<strong>' + (u.name || 'Atleta') + (isCurrent ? ' (Activo)' : '') + '</strong>';
        html += '<span>' + (u.role || u.goal || 'Atleta') + ' · ' + (u.weight || 75) + ' kg</span>';
        html += '</div>';
        html += '</button>';
      });

      container.innerHTML = html;

      container.querySelectorAll('.demo-user-card').forEach(function(card) {
        card.addEventListener('click', function() {
          var uId = this.getAttribute('data-user-id');
          if (global.AuthService) {
            global.AuthService.switchAccount(uId);
            App.renderAuthProfilesList();
            var modalAuth = document.getElementById('modal-auth');
            if (modalAuth) modalAuth.classList.remove('open');
            App.showToast('Sesión cambiada a: ' + (AppState.currentUser ? AppState.currentUser.name : ''));
          }
        });
      });
    },

    // =========================================================================
    // 4. EXPORTACIÓN DE RUTINAS (MODAL EXPORT)
    // =========================================================================
    openExportRoutineModal: function(routineId) {
      this.exportTargetRoutineId = routineId;
      var modal = document.getElementById('modal-export-routine');
      if (!modal) return;

      var r = global.RutinasMaestras.getById(routineId);
      var titleEl = document.getElementById('export-routine-target-title');
      if (titleEl && r) titleEl.textContent = r.titulo;

      var self = this;
      var btnClose = document.getElementById('btn-close-export');
      if (btnClose) btnClose.onclick = function() { modal.classList.remove('open'); };

      var btnPdf = document.getElementById('btn-export-as-pdf');
      if (btnPdf) {
        btnPdf.onclick = function() {
          global.RutinasMaestras.exportarAPDFImprimible(self.exportTargetRoutineId);
          modal.classList.remove('open');
        };
      }

      var btnWa = document.getElementById('btn-export-as-wa');
      if (btnWa) {
        btnWa.onclick = function() {
          var text = global.RutinasMaestras.exportarAWhatsApp(self.exportTargetRoutineId);
          navigator.clipboard.writeText(text).then(function() {
            self.showToast('¡Texto copiado para WhatsApp! Pégalo en tu chat.');
            modal.classList.remove('open');
          });
        };
      }

      var btnJson = document.getElementById('btn-export-as-json');
      if (btnJson) {
        btnJson.onclick = function() {
          global.RutinasMaestras.exportarAJSON(self.exportTargetRoutineId);
          self.showToast('Archivo JSON descargado.');
          modal.classList.remove('open');
        };
      }

      modal.classList.add('open');
    },

    // =========================================================================
    // 5. MODAL DE ENTRENO EN VIVO (ACTIVE WORKOUT)
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
            '<button class="set-type-btn ' + badgeClass + '" data-exercise-index="' + exIdx + '" data-set-index="' + sIdx + '" title="Cambiar tipo de serie">' + setTypeBadge + '</button>' +
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

      html += '<div class="exercise-card-footer">' +
        '<button class="btn btn-outline-sm btn-add-set" data-exercise-index="' + exIdx + '">+ Añadir Serie</button>' +
      '</div></div>';

      return html;
    },

    bindActiveWorkoutEvents: function(container) {
      var self = this;

      container.querySelectorAll('.btn-check-set').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          var sIdx = parseInt(this.getAttribute('data-set-index'), 10);
          global.WorkoutEngine.toggleSetCompleted(exIdx, sIdx);
        });
      });

      container.querySelectorAll('.set-type-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          var sIdx = parseInt(this.getAttribute('data-set-index'), 10);
          global.WorkoutEngine.toggleSetType(exIdx, sIdx);
        });
      });

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

      container.querySelectorAll('.btn-add-set').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          global.WorkoutEngine.addSet(exIdx);
        });
      });

      container.querySelectorAll('.btn-remove-exercise').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exIdx = parseInt(this.getAttribute('data-exercise-index'), 10);
          if (confirm('¿Quitar este ejercicio del entrenamiento?')) {
            global.WorkoutEngine.removeExercise(exIdx);
          }
        });
      });

      container.querySelectorAll('.btn-video-chip').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var exId = this.getAttribute('data-exercise-id');
          var yt = this.getAttribute('data-youtube');
          var ex = global.EjerciciosDB.getById(exId);
          self.showVideoModal(ex || { nombre: 'Ejercicio', youtubeId: yt });
        });
      });

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
    // TEMPORIZADOR DE DESCANSO FLOTANTE
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
      if (widget) widget.classList.remove('visible');
    },

    updateRestTimerDisplay: function(detail) {
      var widget = document.getElementById('floating-rest-timer');
      if (!widget) return;

      var textEl = widget.querySelector('.rest-timer-time');
      var circle = widget.querySelector('.rest-progress-circle');

      if (textEl) textEl.textContent = global.WorkoutEngine.formatDuration(detail.remaining);
      if (circle) {
        var circumference = 2 * Math.PI * 40;
        var offset = circumference - (detail.progress / 100) * circumference;
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
      }
    },

    // =========================================================================
    // 6. SELECTOR DE EJERCICIOS (EXERCISE PICKER MODAL)
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
        html = '<div class="empty-state-card"><p>No se encontraron ejercicios con ese criterio.</p></div>';
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
    },

    // =========================================================================
    // 7. CREADOR Y EDITOR DE RUTINAS (ROUTINE BUILDER MODAL)
    // =========================================================================
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
                '<label>Reps Objetivo:</label>' +
                '<input type="text" class="form-control-sm builder-reps-input" data-index="' + idx + '" value="' + (ex.targetReps || '8-10') + '" placeholder="Ej: 8-10 o RIR 0">' +
              '</div>' +
              '<div class="input-group-row">' +
                '<label>Series: <strong>' + (ex.defaultSets ? ex.defaultSets.length : 3) + '</strong></label>' +
                '<div class="set-stepper">' +
                  '<button class="btn-stepper btn-sub-set" data-index="' + idx + '">-</button>' +
                  '<button class="btn-stepper btn-add-set" data-index="' + idx + '">+</button>' +
                '</div>' +
              '</div>' +
              '<div class="input-group-row">' +
                '<label>Directriz:</label>' +
                '<input type="text" class="form-control-sm builder-notes-input" data-index="' + idx + '" value="' + (ex.notes || '') + '" placeholder="Ej: 5s excéntrico">' +
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
    // 8. CHAT, HISTORIAL, PERFIL Y HERRAMIENTAS GYM
    // =========================================================================
    renderChatTab: function() {
      var curChannel = global.ChatEngine ? global.ChatEngine.currentChannel : 'coach';

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

      container.querySelectorAll('.reaction-tag').forEach(function(tag) {
        tag.addEventListener('click', function() {
          var mId = this.getAttribute('data-msg-id');
          var em = this.getAttribute('data-emoji');
          var uName = (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser.name : 'Atleta';
          global.AppState.addReactionToMessage(global.ChatEngine.currentChannel, mId, em, uName);
        });
      });
    },

    renderHistoryTab: function() {
      var container = document.getElementById('history-workouts-container');
      var statsWrap = document.getElementById('history-stats-banner');
      var heatmapWrap = document.getElementById('activity-heatmap-grid');
      var prsWrap = document.getElementById('history-prs-container');

      if (!global.Analytics) return;

      var stats = global.Analytics.getGlobalStats();

      if (statsWrap) {
        statsWrap.innerHTML = '<div class="stat-box"><span class="stat-number">' + stats.totalWorkouts + '</span><span class="stat-label">Entrenos</span></div>' +
          '<div class="stat-box"><span class="stat-number">' + stats.totalVolumeTonnes + ' t</span><span class="stat-label">Volumen Total</span></div>' +
          '<div class="stat-box"><span class="stat-number">' + stats.totalHours + ' h</span><span class="stat-label">Horas Gym</span></div>' +
          '<div class="stat-box"><span class="stat-number">🏆 ' + stats.totalPRs + '</span><span class="stat-label">Récords PR</span></div>';
      }

      if (heatmapWrap) {
        var heatmapCells = global.Analytics.getActivityHeatmapData();
        var heatHtml = '';
        heatmapCells.forEach(function(c) {
          var tooltip = c.date + (c.count > 0 ? ': ' + c.count + ' entreno(s), ' + c.volume + 'kg' : ': Sin entreno');
          heatHtml += '<div class="heat-cell heat-level-' + c.intensity + '" title="' + tooltip + '"></div>';
        });
        heatmapWrap.innerHTML = heatHtml;
      }

      if (prsWrap) {
        var prs = (global.AppState && global.AppState.prs) ? global.AppState.prs : {};
        var prKeys = Object.keys(prs);
        if (prKeys.length === 0) {
          prsWrap.innerHTML = '<p class="text-muted">Aún no hay récords registrados.</p>';
        } else {
          var prHtml = '<div class="prs-grid">';
          prKeys.forEach(function(k) {
            var pr = prs[k];
            prHtml += '<div class="pr-card">' +
              '<div class="pr-header"><span class="pr-trophy">🏆</span><h5 class="pr-title">' + (pr.exerciseName || k) + '</h5></div>' +
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

      if (container) {
        var workouts = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
        if (workouts.length === 0) {
          container.innerHTML = '<div class="empty-state-card"><div class="empty-icon">📊</div><h4>No tienes entrenamientos registrados</h4></div>';
        } else {
          var wHtml = '';
          workouts.forEach(function(w) {
            var durStr = global.WorkoutEngine ? global.WorkoutEngine.formatDuration(w.durationSeconds) : '45 min';
            var dateStr = w.endedAt ? new Date(w.endedAt).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Reciente';

            wHtml += '<div class="history-workout-card">' +
              '<div class="history-card-header">' +
                '<div><h4 class="history-workout-title">' + w.name + '</h4><span class="history-workout-date">📅 ' + dateStr + ' · ⏱️ ' + durStr + '</span></div>' +
                '<button class="btn btn-outline-sm btn-repeat-workout" data-workout-id="' + w.id + '">Repetir</button>' +
              '</div>' +
              '<div class="history-metrics-row">' +
                '<div class="metric-pill">⚖️ <strong>' + (w.totalVolumeKg || 0) + ' kg</strong> vol</div>' +
                '<div class="metric-pill">🔢 <strong>' + (w.totalSets || 0) + '</strong> series</div>' +
                (w.prsCount > 0 ? '<div class="metric-pill pr-pill">🏆 <strong>' + w.prsCount + ' PRs</strong></div>' : '') +
              '</div>' +
            '</div>';
          });
          container.innerHTML = wHtml;

          container.querySelectorAll('.btn-repeat-workout').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var wId = this.getAttribute('data-workout-id');
              var found = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory.find(function(item) { return item.id === wId; }) : null;
              if (found) {
                global.WorkoutEngine.startWorkoutFromRoutine({
                  id: found.routineId,
                  titulo: found.name,
                  ejercicios: found.exercises.map(function(e) {
                    return { exerciseId: e.exerciseId, name: e.name, defaultSets: e.sets };
                  })
                });
              }
            });
          });
        }
      }
    },

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

      var visualHtml = '<div class="barbell-graphic-wrap"><div class="barbell-sleeve left-sleeve">';
      res.platesPerSide.slice().reverse().forEach(function(plate) {
        visualHtml += '<div class="plate-visual" style="background-color: ' + plate.color + '; color: ' + plate.textColor + ';" title="' + plate.label + '">' + plate.label + '</div>';
      });
      visualHtml += '</div><div class="barbell-collar"></div><div class="barbell-shaft"><span class="barbell-shaft-label">BARRA ' + barKg + 'KG</span></div><div class="barbell-collar"></div><div class="barbell-sleeve right-sleeve">';
      res.platesPerSide.forEach(function(plate) {
        visualHtml += '<div class="plate-visual" style="background-color: ' + plate.color + '; color: ' + plate.textColor + ';" title="' + plate.label + '">' + plate.label + '</div>';
      });
      visualHtml += '</div></div>';
      platesWrap.innerHTML = visualHtml;

      var counts = {};
      res.platesPerSide.forEach(function(p) { counts[p.label] = (counts[p.label] || 0) + 1; });
      var textParts = [];
      for (var lbl in counts) { textParts.push('<strong>' + counts[lbl] + 'x ' + lbl + '</strong>'); }

      breakdownWrap.innerHTML = '<div class="breakdown-info"><p>Carga por lado: <strong>' + res.weightPerSide + ' kg</strong> (' + textParts.join(', ') + ')</p></div>';
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

      resultsWrap.innerHTML = '<div class="one-rm-hero"><span class="one-rm-label">1RM Estimado:</span><span class="one-rm-big-number">' + res.average + ' kg</span></div>';

      var tHtml = '<table class="table-percentages"><thead><tr><th>% 1RM</th><th>Carga (kg)</th><th>Reps</th></tr></thead><tbody>';
      res.percentages.forEach(function(p) {
        tHtml += '<tr><td><strong>' + p.percentage + '%</strong></td><td class="text-cyan"><strong>' + p.weightKg + ' kg</strong></td><td>' + p.repsGuide + '</td></tr>';
      });
      tHtml += '</tbody></table>';
      tableWrap.innerHTML = tHtml;
    },

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
        if (frameWrap) frameWrap.innerHTML = '';
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
      var exportBtn = document.getElementById('btn-preview-export-routine');

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

      var self = this;
      if (exportBtn) {
        exportBtn.onclick = function() {
          self.openExportRoutineModal(routineId);
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
          var prHtml = '<div class="summary-prs-banner"><h4>🏆 ¡' + summary.prsUnlocked.length + ' Nuevos Récords!</h4><ul>';
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

  document.addEventListener('DOMContentLoaded', function() {
    App.init();

    // Eventos de botones estáticos
    var btnStartEmpty = document.getElementById('btn-start-empty-workout');
    if (btnStartEmpty) {
      btnStartEmpty.addEventListener('click', function() {
        WorkoutEngine.startEmptyWorkout();
      });
    }

    var btnHeroNewRoutine = document.getElementById('btn-hero-new-routine');
    if (btnHeroNewRoutine) {
      btnHeroNewRoutine.addEventListener('click', function() {
        App.openRoutineBuilder(null);
      });
    }

    var btnMinimize = document.getElementById('btn-minimize-active-workout');
    if (btnMinimize) {
      btnMinimize.addEventListener('click', function() {
        App.hideActiveWorkoutModal();
        App.updateStickyWorkoutBar();
      });
    }

    var btnFinish = document.getElementById('btn-finish-workout');
    if (btnFinish) {
      btnFinish.addEventListener('click', function() {
        if (confirm('¿Deseas finalizar y guardar este entrenamiento?')) {
          WorkoutEngine.finishWorkout();
        }
      });
    }

    var btnDiscard = document.getElementById('btn-discard-workout');
    if (btnDiscard) {
      btnDiscard.addEventListener('click', function() {
        if (confirm('¿Estás seguro de descartar este entrenamiento?')) {
          WorkoutEngine.discardWorkout();
        }
      });
    }

    var btnAddExActive = document.getElementById('btn-add-exercise-to-active');
    if (btnAddExActive) {
      btnAddExActive.addEventListener('click', function() {
        App.openExercisePicker(function(exerciseId) {
          WorkoutEngine.addExerciseToWorkout(exerciseId);
        });
      });
    }

    var btnClosePicker = document.getElementById('btn-close-picker');
    if (btnClosePicker) btnClosePicker.onclick = function() { App.closeExercisePicker(); };

    var searchInput = document.getElementById('picker-search-input');
    if (searchInput) searchInput.oninput = function() { App.renderExercisePickerList(); };

    var muscleChips = document.querySelectorAll('#picker-muscle-chips .chip');
    muscleChips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        muscleChips.forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
        App.selectedFilterGroup = this.getAttribute('data-group');
        App.renderExercisePickerList();
      });
    });

    // Rutinas modal
    var btnCloseBuilder = document.getElementById('btn-close-builder');
    if (btnCloseBuilder) btnCloseBuilder.onclick = function() { App.closeRoutineBuilder(); };

    var btnSaveDraft = document.getElementById('btn-save-routine-draft');
    if (btnSaveDraft) {
      btnSaveDraft.addEventListener('click', function() {
        var titleIn = document.getElementById('builder-routine-title');
        var descIn = document.getElementById('builder-routine-desc');
        var catIn = document.getElementById('builder-routine-category');

        if (RoutineBuilder.currentDraft) {
          if (titleIn) RoutineBuilder.currentDraft.titulo = titleIn.value;
          if (descIn) RoutineBuilder.currentDraft.descripcion = descIn.value;
          if (catIn) RoutineBuilder.currentDraft.categoria = catIn.value;
        }

        var res = RoutineBuilder.saveCurrentDraft();
        if (res.success) {
          App.closeRoutineBuilder();
          App.showToast('¡Rutina guardada!');
          App.renderWorkoutTab();
          App.renderRoutinesTab();
        } else {
          alert(res.message);
        }
      });
    }

    var btnClosePreview = document.getElementById('btn-close-preview');
    if (btnClosePreview) {
      btnClosePreview.onclick = function() {
        document.getElementById('modal-routine-preview').classList.remove('open');
      };
    }

    var btnCloseVideo = document.getElementById('btn-close-video');
    if (btnCloseVideo) btnCloseVideo.onclick = function() { App.closeVideoModal(); };

    var btnCloseSummary = document.getElementById('btn-close-summary');
    if (btnCloseSummary) {
      btnCloseSummary.onclick = function() {
        document.getElementById('modal-workout-summary').classList.remove('open');
        App.switchTab('tab-history');
      };
    }

    // Controles de temporizador de descanso
    var btnRestPlus30 = document.getElementById('btn-rest-plus-30');
    if (btnRestPlus30) btnRestPlus30.onclick = function() { WorkoutEngine.addRestTime(30); };

    var btnRestMinus15 = document.getElementById('btn-rest-minus-15');
    if (btnRestMinus15) btnRestMinus15.onclick = function() { WorkoutEngine.addRestTime(-15); };

    var btnRestSkip = document.getElementById('btn-rest-skip');
    if (btnRestSkip) btnRestSkip.onclick = function() { WorkoutEngine.skipRestTimer(); };

    // Chat
    var chatChannelBtns = document.querySelectorAll('.chat-channel-btn');
    chatChannelBtns.forEach(function(b) {
      b.addEventListener('click', function() {
        var ch = this.getAttribute('data-channel');
        ChatEngine.setChannel(ch);
        App.renderChatTab();
      });
    });

    var chatForm = document.getElementById('chat-send-form');
    var chatInput = document.getElementById('chat-text-input');
    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var txt = chatInput.value;
        if (txt && txt.trim()) {
          ChatEngine.sendMessage(txt);
          chatInput.value = '';
        }
      });
    }

    var btnShareChat = document.getElementById('btn-share-last-workout-chat');
    if (btnShareChat) {
      btnShareChat.onclick = function() {
        ChatEngine.shareLastWorkout(ChatEngine.currentChannel);
      };
    }

    var btnWa = document.getElementById('btn-open-whatsapp');
    if (btnWa) {
      btnWa.onclick = function() {
        var url = ChatEngine.getWhatsAppUrl();
        window.open(url, '_blank');
      };
    }

    document.querySelectorAll('.prompt-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var prompt = this.getAttribute('data-prompt');
        ChatEngine.sendMessage(prompt, 'coach');
        ChatEngine.setChannel('coach');
        App.renderChatTab();
      });
    });

    // Herramientas Gym
    var plateTarget = document.getElementById('plate-calc-target');
    var plateBar = document.getElementById('plate-calc-bar');
    function updatePlates() {
      if (plateTarget && plateBar) {
        App.calculateAndRenderPlates(plateTarget.value, plateBar.value);
      }
    }
    if (plateTarget) plateTarget.oninput = updatePlates;
    if (plateBar) plateBar.onchange = updatePlates;
    updatePlates();

    var calc1rmWeight = document.getElementById('calc-1rm-weight');
    var calc1rmReps = document.getElementById('calc-1rm-reps');
    function update1RM() {
      if (calc1rmWeight && calc1rmReps) {
        App.calculateAndRender1RM(calc1rmWeight.value, calc1rmReps.value);
      }
    }
    if (calc1rmWeight) calc1rmWeight.oninput = update1RM;
    if (calc1rmReps) calc1rmReps.oninput = update1RM;
    update1RM();

    // Exportar / Importar JSON general
    var btnExport = document.getElementById('btn-export-data');
    if (btnExport) {
      btnExport.onclick = function() {
        var json = AppState.exportAllData();
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'jperezcoach_backup_' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
        App.showToast('Copia de seguridad descargada.');
      };
    }

    var fileImport = document.getElementById('file-import-data');
    if (fileImport) {
      fileImport.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(evt) {
          var ok = AppState.importAllData(evt.target.result);
          if (!ok) alert('El archivo no tiene un formato válido.');
        };
        reader.readAsText(file);
      };
    }

    // Gestión de Atletas y Modal Auth
    var btnHeaderProfile = document.getElementById('btn-header-profile');
    var btnOpenAuth = document.getElementById('btn-open-auth-modal');
    var modalAuth = document.getElementById('modal-auth');
    var btnCloseAuth = document.getElementById('btn-close-auth');
    var btnEditProfile = document.getElementById('btn-edit-profile-modal');
    var btnOpenOnboardAuth = document.getElementById('btn-open-onboarding-from-auth');

    function openAuth() {
      if (modalAuth) {
        modalAuth.classList.add('open');
        App.renderAuthProfilesList();
      }
    }
    function closeAuth() {
      if (modalAuth) modalAuth.classList.remove('open');
    }

    if (btnHeaderProfile) btnHeaderProfile.onclick = openAuth;
    if (btnOpenAuth) btnOpenAuth.onclick = openAuth;
    if (btnCloseAuth) btnCloseAuth.onclick = closeAuth;

    if (btnEditProfile) {
      btnEditProfile.onclick = function() {
        if (global.Onboarding) {
          global.Onboarding.open();
        }
      };
    }

    if (btnOpenOnboardAuth) {
      btnOpenOnboardAuth.onclick = function() {
        closeAuth();
        if (global.Onboarding) {
          global.Onboarding.open();
        }
      };
    }

    var registerForm = document.getElementById('auth-register-form');
    if (registerForm) {
      registerForm.onsubmit = function(e) {
        e.preventDefault();
        var nameEl = document.getElementById('reg-name');
        var usernameEl = document.getElementById('reg-username');
        var weightEl = document.getElementById('reg-weight');
        var heightEl = document.getElementById('reg-height');
        var goalEl = document.getElementById('reg-goal');

        var name = nameEl ? nameEl.value : '';
        var username = usernameEl ? usernameEl.value : '';
        var weight = weightEl ? weightEl.value : '75';
        var height = heightEl ? heightEl.value : '175';
        var goal = goalEl ? goalEl.value : 'Hipertrofia';

        var res = AuthService.register({ name: name, username: username, weight: weight, height: height, goal: goal });
        if (res.success) {
          closeAuth();
          App.showToast('¡Bienvenido, ' + res.user.name + '!');
        } else {
          alert(res.message);
        }
      };
    }
  });
})(window);
