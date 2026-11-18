// =============================================================================
// JPEREZCOACH PRO · ASISTENTE DE PERSONALIZACIÓN Y ONBOARDING INTERACTIVO
// Preguntas iniciales, creación de perfil de atleta y vinculación de su rutina
// =============================================================================

(function(global) {
  'use strict';

  var Onboarding = {
    currentStep: 1,
    athleteData: {
      name: '',
      username: '',
      avatar: 'assets/coach_photo.png',
      weight: 78.0,
      height: 178,
      goal: 'Hipertrofia',
      level: 'Intermedio',
      routineChoice: 'template', // 'pdf' | 'text' | 'template' | 'manual'
      importedRoutines: []
    },

    // Comprobar si es necesario mostrar el asistente al arrancar la app
    checkAndShow: function() {
      if (!global.AppState) return;
      var hasUser = !!global.AppState.currentUser;
      var completed = global.AppState.hasCompletedOnboarding;

      if (!hasUser || !completed) {
        this.open();
      }
    },

    open: function() {
      var modal = document.getElementById('modal-onboarding');
      if (modal) {
        modal.classList.add('open');
        this.currentStep = 1;
        this.renderStep(1);
      }
    },

    close: function() {
      var modal = document.getElementById('modal-onboarding');
      if (modal) modal.classList.remove('open');
    },

    renderStep: function(step) {
      this.currentStep = step;

      // Actualizar indicadores de pasos (1, 2, 3)
      document.querySelectorAll('.onboarding-step-indicator').forEach(function(ind, idx) {
        ind.classList.toggle('active', (idx + 1) === step);
        ind.classList.toggle('completed', (idx + 1) < step);
      });

      // Actualizar paneles
      document.querySelectorAll('.onboarding-panel').forEach(function(panel) {
        panel.classList.toggle('active', panel.getAttribute('data-step') === step.toString());
      });

      var btnPrev = document.getElementById('btn-onboarding-prev');
      var btnNext = document.getElementById('btn-onboarding-next');

      if (btnPrev) {
        btnPrev.style.display = (step === 1) ? 'none' : 'inline-flex';
      }
      if (btnNext) {
        btnNext.textContent = (step === 3) ? '¡Comenzar a Entrenar! ➔' : 'Siguiente ➔';
      }
    },

    nextStep: function() {
      if (this.currentStep === 1) {
        var nameInput = document.getElementById('onboard-name');
        var usernameInput = document.getElementById('onboard-username');
        var nameVal = nameInput ? nameInput.value.trim() : '';
        if (!nameVal) {
          alert('Por favor introduce tu nombre para personalizar tu cuenta.');
          if (nameInput) nameInput.focus();
          return;
        }

        this.athleteData.name = nameVal;
        this.athleteData.username = (usernameInput && usernameInput.value.trim()) ? usernameInput.value.trim() : nameVal.toLowerCase().replace(/\s+/g, '_');
        this.renderStep(2);
      } else if (this.currentStep === 2) {
        var weightInput = document.getElementById('onboard-weight');
        var heightInput = document.getElementById('onboard-height');
        var goalSelect = document.getElementById('onboard-goal');
        var levelSelect = document.getElementById('onboard-level');

        if (weightInput && weightInput.value) this.athleteData.weight = parseFloat(weightInput.value);
        if (heightInput && heightInput.value) this.athleteData.height = parseFloat(heightInput.value);
        if (goalSelect) this.athleteData.goal = goalSelect.value;
        if (levelSelect) this.athleteData.level = levelSelect.value;

        this.renderStep(3);
      } else if (this.currentStep === 3) {
        this.finishOnboarding();
      }
    },

    prevStep: function() {
      if (this.currentStep > 1) {
        this.renderStep(this.currentStep - 1);
      }
    },

    // Finalizar proceso de personalización
    finishOnboarding: function() {
      var self = this;
      var newProfile = {
        id: 'atleta_' + Date.now(),
        name: this.athleteData.name,
        username: this.athleteData.username,
        email: this.athleteData.username + '@jperezcoach.com',
        avatar: this.athleteData.avatar || '',
        role: 'Atleta ' + this.athleteData.goal,
        weight: this.athleteData.weight,
        height: this.athleteData.height,
        goal: this.athleteData.goal,
        streak: 1,
        joinedDate: new Date().toISOString().split('T')[0],
        bio: 'Atleta enfocado en ' + this.athleteData.goal.toLowerCase() + ' con la metodología de Jose Perez.'
      };

      // Guardar usuario en AppState
      global.AppState.setCurrentUser(newProfile);
      global.AppState.setOnboardingCompleted(true);

      // Gestionar la rutina elegida en el paso 3
      if (this.athleteData.routineChoice === 'template') {
        // Cargar las plantillas oficiales del sistema de Jose Perez
        global.AppState.restoreDefaultRoutines();
      } else if (this.athleteData.routineChoice === 'pdf' || this.athleteData.routineChoice === 'text') {
        // Si ya procesó rutinas en el paso 3
        if (this.athleteData.importedRoutines && this.athleteData.importedRoutines.length > 0) {
          this.athleteData.importedRoutines.forEach(function(r) {
            global.AppState.addRoutine(r);
          });
        }
      } else {
        // Opción manual o empezar en blanco
        global.AppState.clearAllRoutines();
      }

      this.close();

      if (global.App) {
        global.App.renderAll();
        global.App.showToast('¡Bienvenido, ' + newProfile.name + '! Tu aplicación está lista.');
      }
    }
  };

  global.Onboarding = Onboarding;
})(window);
