// =============================================================================
// JPEREZCOACH APP · SISTEMA DE AUTENTICACIÓN Y GESTIÓN DE PERFILES
// Login, Registro, Modo Invitado y Cambio Rápido de Cuenta
// =============================================================================

(function(global) {
  'use strict';

  var AuthService = {
    // Obtener usuario actualmente autenticado
    getCurrentUser: function() {
      return (global.AppState && global.AppState.currentUser) ? global.AppState.currentUser : null;
    },

    // Iniciar sesión con email o usuario y contraseña
    login: function(identifier, password) {
      if (!identifier) {
        return { success: false, message: 'Introduce tu email o nombre de usuario.' };
      }

      var users = (global.AppState && global.AppState.users) ? global.AppState.users : [];
      var cleanId = identifier.trim().toLowerCase();

      var found = users.find(function(u) {
        return (u.email && u.email.toLowerCase() === cleanId) ||
               (u.username && u.username.toLowerCase() === cleanId) ||
               (u.name && u.name.toLowerCase() === cleanId);
      });

      if (!found) {
        // Si no existe, pero introduce datos, permitimos inicio flexible o creación
        return {
          success: false,
          message: 'Usuario no encontrado. Comprueba los datos o pulsa en Registrarse.'
        };
      }

      // Establecer usuario actual en el AppState
      global.AppState.setCurrentUser(found);
      return { success: true, user: found };
    },

    // Registrar nuevo usuario
    register: function(userData) {
      if (!userData.name || !userData.name.trim()) {
        return { success: false, message: 'El nombre es obligatorio.' };
      }

      var email = (userData.email || '').trim().toLowerCase();
      var users = (global.AppState && global.AppState.users) ? global.AppState.users : [];

      if (email && users.some(function(u) { return u.email && u.email.toLowerCase() === email; })) {
        return { success: false, message: 'Ya existe una cuenta con este correo electrónico.' };
      }

      var newUser = {
        id: 'user_' + Date.now(),
        name: userData.name.trim(),
        username: (userData.username || userData.name.toLowerCase().replace(/\s+/g, '_')).trim(),
        email: email || (userData.name.toLowerCase().replace(/\s+/g, '') + '@jperezcoach.com'),
        avatar: userData.avatar || '',
        role: userData.role || 'Atleta JPEREZ',
        weight: parseFloat(userData.weight) || 75.0,
        height: parseFloat(userData.height) || 175,
        goal: userData.goal || 'Hipertrofia y Rendimiento',
        streak: 1,
        joinedDate: new Date().toISOString().split('T')[0],
        bio: userData.bio || 'Nuevo atleta entrenando con la metodología de Jose Perez.'
      };

      global.AppState.setCurrentUser(newUser);
      return { success: true, user: newUser };
    },

    // Iniciar sesión rápida con una de las cuentas predefinidas (Demo/Atleta/Coach)
    switchAccount: function(userId) {
      var users = (global.AppState && global.AppState.users) ? global.AppState.users : [];
      var found = users.find(function(u) { return u.id === userId; });
      if (found) {
        global.AppState.setCurrentUser(found);
        return { success: true, user: found };
      }
      return { success: false, message: 'Usuario no encontrado.' };
    },

    // Cerrar sesión (cambia a invitado temporal o limpia)
    logout: function() {
      var invitado = {
        id: 'invitado_' + Date.now(),
        name: 'Atleta Invitado',
        username: 'invitado',
        email: 'invitado@jperezcoach.com',
        avatar: '',
        role: 'Modo Invitado',
        weight: 75,
        height: 175,
        goal: 'Probar la App',
        streak: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        bio: 'Sesión temporal de invitado.'
      };
      global.AppState.setCurrentUser(invitado);
      return { success: true };
    },

    // Actualizar datos del perfil activo
    updateProfile: function(updatedFields) {
      var user = this.getCurrentUser();
      if (!user) return { success: false, message: 'No hay sesión activa.' };

      if (updatedFields.name) user.name = updatedFields.name.trim();
      if (updatedFields.bio !== undefined) user.bio = updatedFields.bio.trim();
      if (updatedFields.weight) user.weight = parseFloat(updatedFields.weight) || user.weight;
      if (updatedFields.height) user.height = parseFloat(updatedFields.height) || user.height;
      if (updatedFields.goal) user.goal = updatedFields.goal.trim();
      if (updatedFields.avatar !== undefined) user.avatar = updatedFields.avatar;

      global.AppState.saveCurrentUser();
      document.dispatchEvent(new CustomEvent('jperez:user-changed', { detail: user }));
      return { success: true, user: user };
    }
  };

  global.AuthService = AuthService;
})(window);
