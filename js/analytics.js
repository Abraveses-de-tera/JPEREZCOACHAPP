// =============================================================================
// JPEREZCOACH APP · ANALÍTICA, HISTORIAL, RECORDS PERSONALES Y HERRAMIENTAS GYM
// Heatmap de actividad, Calculadora de Discos y Calculadora 1RM
// =============================================================================

(function(global) {
  'use strict';

  var Analytics = {
    // Calcular estadísticas globales agregadas
    getGlobalStats: function() {
      var workouts = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
      var totalVolume = 0;
      var totalSets = 0;
      var totalReps = 0;
      var totalSeconds = 0;
      var totalPRs = 0;

      workouts.forEach(function(w) {
        totalVolume += (w.totalVolumeKg || 0);
        totalSets += (w.totalSets || 0);
        totalReps += (w.totalReps || 0);
        totalSeconds += (w.durationSeconds || 0);
        totalPRs += (w.prsCount || 0);
      });

      var hours = Math.round((totalSeconds / 3600) * 10) / 10;
      var tonnes = Math.round((totalVolume / 1000) * 10) / 10;

      return {
        totalWorkouts: workouts.length,
        totalVolumeKg: Math.round(totalVolume),
        totalVolumeTonnes: tonnes,
        totalSets: totalSets,
        totalReps: totalReps,
        totalHours: hours,
        totalPRs: totalPRs
      };
    },

    // Generar datos para el Heatmap de actividad de las últimas 12 semanas (84 días)
    getActivityHeatmapData: function() {
      var workouts = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
      var today = new Date();
      var daysMap = {};

      // Mapear entrenamientos por fecha YYYY-MM-DD
      workouts.forEach(function(w) {
        var dateStr = (w.endedAt || w.date || '').split('T')[0];
        if (dateStr) {
          if (!daysMap[dateStr]) daysMap[dateStr] = { count: 0, volume: 0, names: [] };
          daysMap[dateStr].count++;
          daysMap[dateStr].volume += (w.totalVolumeKg || 0);
          daysMap[dateStr].names.push(w.name);
        }
      });

      // Generar últimos 84 días (12 semanas exactas)
      var cells = [];
      for (var i = 83; i >= 0; i--) {
        var d = new Date(today);
        d.setDate(d.getDate() - i);
        var iso = d.toISOString().split('T')[0];
        var info = daysMap[iso] || { count: 0, volume: 0, names: [] };

        var intensity = 0;
        if (info.count > 0) {
          if (info.volume > 10000) intensity = 4;
          else if (info.volume > 6000) intensity = 3;
          else if (info.volume > 3000) intensity = 2;
          else intensity = 1;
        }

        cells.push({
          date: iso,
          dayOfWeek: d.getDay(),
          count: info.count,
          volume: info.volume,
          names: info.names,
          intensity: intensity
        });
      }

      return cells;
    },

    // -------------------------------------------------------------------------
    // CALCULADORA DE DISCOS DE BARRA (PLATE CALCULATOR)
    // -------------------------------------------------------------------------
    calculatePlates: function(targetTotalKg, barWeightKg) {
      targetTotalKg = parseFloat(targetTotalKg) || 0;
      barWeightKg = parseFloat(barWeightKg) || 20;

      if (targetTotalKg <= barWeightKg) {
        return {
          valid: true,
          barWeight: barWeightKg,
          weightPerSide: 0,
          platesPerSide: [],
          remainder: 0
        };
      }

      var weightNeeded = targetTotalKg - barWeightKg;
      var perSide = weightNeeded / 2;

      // Discos estándar olímpicos disponibles (en kg) y sus colores oficiales
      var availablePlates = [
        { weight: 25, color: '#ef4444', label: '25kg', textColor: '#ffffff' },
        { weight: 20, color: '#3b82f6', label: '20kg', textColor: '#ffffff' },
        { weight: 15, color: '#eab308', label: '15kg', textColor: '#000000' },
        { weight: 10, color: '#22c55e', label: '10kg', textColor: '#ffffff' },
        { weight: 5,  color: '#f8fafc', label: '5kg',  textColor: '#0f172a' },
        { weight: 2.5,color: '#475569', label: '2.5',  textColor: '#ffffff' },
        { weight: 1.25,color: '#94a3b8',label: '1.25', textColor: '#0f172a' }
      ];

      var platesPerSide = [];
      var remainingSide = perSide;

      availablePlates.forEach(function(plate) {
        while (remainingSide >= plate.weight) {
          platesPerSide.push(plate);
          remainingSide = Math.round((remainingSide - plate.weight) * 100) / 100;
        }
      });

      return {
        valid: true,
        barWeight: barWeightKg,
        weightPerSide: perSide,
        platesPerSide: platesPerSide,
        remainder: remainingSide * 2 // lo que no se pudo cuadrar exactamente
      };
    },

    // -------------------------------------------------------------------------
    // CALCULADORA DE 1RM Y TABLA DE PORCENTAJES
    // -------------------------------------------------------------------------
    calculate1RM: function(weight, reps) {
      weight = parseFloat(weight) || 0;
      reps = parseInt(reps, 10) || 0;

      if (weight <= 0 || reps <= 0) return null;
      if (reps === 1) {
        return {
          epley: weight,
          brzycki: weight,
          lombardi: weight,
          average: weight,
          percentages: this.generatePercentages(weight)
        };
      }

      // Epley: w * (1 + r / 30)
      var epley = weight * (1 + (reps / 30));
      // Brzycki: w * (36 / (37 - r))
      var brzycki = reps < 37 ? weight * (36 / (37 - reps)) : epley;
      // Lombardi: w * (r ^ 0.10)
      var lombardi = weight * Math.pow(reps, 0.10);

      var avg = Math.round(((epley + brzycki + lombardi) / 3) * 10) / 10;

      return {
        epley: Math.round(epley * 10) / 10,
        brzycki: Math.round(brzycki * 10) / 10,
        lombardi: Math.round(lombardi * 10) / 10,
        average: avg,
        percentages: this.generatePercentages(avg)
      };
    },

    generatePercentages: function(oneRepMax) {
      var percents = [100, 95, 90, 85, 80, 75, 70, 65, 60, 50];
      var repsEstimate = {
        100: '1 rep',
        95: '2 reps',
        90: '3-4 reps',
        85: '5-6 reps',
        80: '7-8 reps',
        75: '9-10 reps',
        70: '11-12 reps',
        65: '15 reps',
        60: '20 reps',
        50: 'Calentamiento'
      };

      return percents.map(function(p) {
        var kg = Math.round((oneRepMax * (p / 100)) * 2) / 2; // redondear a 0.5kg
        return {
          percentage: p,
          weightKg: kg,
          repsGuide: repsEstimate[p]
        };
      });
    }
  };

  global.Analytics = Analytics;
})(window);
