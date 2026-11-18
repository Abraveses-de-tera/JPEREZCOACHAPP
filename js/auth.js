// =============================================================================
// JPEREZCOACH PRO · SISTEMA DE GESTIÓN DE PERFILES Y SESIÓN DE ATLETAS
// Multiperfil local, creación guiada de atletas y cambio rápido de cuenta
// =============================================================================

(function(global) {
  'use strict';

  var AuthService = {
    // Obtener atleta actualmente activo
    getCurrentUser: function() {
      return (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser : null;
    },

    // Obtener todos los perfiles de atleta guardados en este dispositivo
    getAllUsers: function() {
      return (global.AppState && global.AppState.users) ? global.AppState.users : [];
    },

    // Iniciar sesión con un usuario existente
    login: function(identifier) {
      if (!identifier) {
        return { success: false, message: 'Introduce tu nombre o apodo.' };
      }

      var users = this.getAllUsers();
      var cleanId = identifier.trim().toLowerCase();

      var found = users.find(function(u) {
        return (u.username && u.username.toLowerCase() === cleanId) ||
               (u.name && u.name.toLowerCase() === cleanId) ||
               (u.email && u.email.toLowerCase() === cleanId);
      });

      if (!found) {
        return { success: false, message: 'Atleta no encontrado en este dispositivo.' };
      }

      global.AppState.setCurrentUser(found);
      return { success: true, user: found };
    },

    // Crear y registrar un nuevo perfil de atleta
    register: function(userData) {
      if (!userData.name || !userData.name.trim()) {
        return { success: false, message: 'El nombre es obligatorio.' };
      }

      var name = userData.name.trim();
      var username = (userData.username || name.toLowerCase().replace(/\s+/g, '_')).trim();

      var newUser = {
        id: 'atleta_' + Date.now(),
        name: name,
        username: username,
        email: (userData.email || username + '@jperezcoach.com').trim().toLowerCase(),
        avatar: userData.avatar || '',
        role: userData.role || ('Atleta ' + (userData.goal || 'Fuerza')),
        weight: parseFloat(userData.weight) || 75.0,
        height: parseFloat(userData.height) || 175,
        goal: userData.goal || 'Hipertrofia',
        streak: 1,
        joinedDate: new Date().toISOString().split('T')[0],
        bio: userData.bio || 'Atleta entrenando con la metodología de Jose Perez.'
      };

      global.AppState.setCurrentUser(newUser);
      global.AppState.setOnboardingCompleted(true);
      return { success: true, user: newUser };
    },

    // Cambiar de perfil de atleta de forma inmediata
    switchAccount: function(userId) {
      var users = this.getAllUsers();
      var found = users.find(function(u) { return u.id === userId; });
      if (found) {
        global.AppState.setCurrentUser(found);
        return { success: true, user: found };
      }
      return { success: false, message: 'Perfil no encontrado.' };
    },

    // Cerrar sesión o iniciar asistente para nuevo atleta
    logout: function() {
      global.AppState.currentUser = null;
      global.AppState.saveCurrentUser();
      document.dispatchEvent(new CustomEvent('jperez:user-changed', { detail: null }));
      if (global.Onboarding) {
        global.Onboarding.open();
      }
      return { success: true };
    },

    // Actualizar datos del perfil activo
    updateProfile: function(updatedFields) {
      var user = this.getCurrentUser();
      if (!user) return { success: false, message: 'No hay perfil activo.' };

      if (updatedFields.name) user.name = updatedFields.name.trim();
      if (updatedFields.bio !== undefined) user.bio = updatedFields.bio.trim();
      if (updatedFields.weight) user.weight = parseFloat(updatedFields.weight) || user.weight;
      if (updatedFields.height) user.height = parseFloat(updatedFields.height) || user.height;
      if (updatedFields.goal) user.goal = updatedFields.goal.trim();
      if (updatedFields.avatar !== undefined) user.avatar = updatedFields.avatar;

      global.AppState.saveCurrentUser();
      document.dispatchEvent(new CustomEvent('jperez:user-changed', { detail: user }));
      return { success: true, user: user };
    },

    // Eliminar un perfil de atleta del dispositivo
    deleteProfile: function(userId) {
      if (!global.AppState) return false;
      var users = this.getAllUsers();
      global.AppState.users = users.filter(function(u) { return u.id !== userId; });

      if (global.AppState.currentUser && global.AppState.currentUser.id === userId) {
        global.AppState.currentUser = global.AppState.users[0] || null;
      }

      global.AppState.saveCurrentUser();
      document.dispatchEvent(new CustomEvent('jperez:user-changed', { detail: global.AppState.currentUser }));
      return true;
    }
  };

  global.AuthService = AuthService;
})(window);
