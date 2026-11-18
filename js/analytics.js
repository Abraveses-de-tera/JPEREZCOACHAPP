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
    },

    // -------------------------------------------------------------------------
    // CALCULADORA DE CALENTAMIENTO (WARM-UP RAMP-UP SETS)
    // -------------------------------------------------------------------------
    calculateWarmUpSets: function(workingWeightKg, barWeightKg) {
      workingWeightKg = parseFloat(workingWeightKg) || 0;
      barWeightKg = parseFloat(barWeightKg) || 20;

      if (workingWeightKg <= 0) return [];

      var sets = [
        {
          order: 1,
          type: 'warmup',
          label: 'Barra Sola (Activación y Movilidad)',
          percentage: Math.round((barWeightKg / workingWeightKg) * 100),
          weight: barWeightKg,
          reps: 10,
          restSec: 45,
          notes: 'Velocidad controlada, foco en la trayectoria y rango articular completo.'
        },
        {
          order: 2,
          type: 'warmup',
          label: '50% Carga (Patrón Motor)',
          percentage: 50,
          weight: Math.round((workingWeightKg * 0.5) * 2) / 2,
          reps: 5,
          restSec: 60,
          notes: 'Acomodación de trayectoria con excéntrica de 3-4 segundos.'
        },
        {
          order: 3,
          type: 'warmup',
          label: '70% Carga (Activación Neural)',
          percentage: 70,
          weight: Math.round((workingWeightKg * 0.7) * 2) / 2,
          reps: 3,
          restSec: 75,
          notes: 'Fuerza explosiva concéntrica, sin generar fatiga metabólica.'
        },
        {
          order: 4,
          type: 'warmup',
          label: '85% Carga (Aclimatación Pesada)',
          percentage: 85,
          weight: Math.round((workingWeightKg * 0.85) * 2) / 2,
          reps: 1,
          restSec: 90,
          notes: 'Sensación de carga máxima. Preparación del sistema nervioso central.'
        },
        {
          order: 5,
          type: 'efectiva',
          label: '100% Serie Efectiva (RIR 0 · Metodología JPEREZ)',
          percentage: 100,
          weight: workingWeightKg,
          reps: '6-10',
          restSec: 120,
          notes: 'Serie de trabajo al fallo concéntrico con excéntrica en 5 segundos.'
        }
      ];

      return sets;
    },

    // -------------------------------------------------------------------------
    // HISTORIAL Y PROGRESIÓN POR EJERCICIO (1RM PROGRESSION)
    // -------------------------------------------------------------------------
    getExerciseHistory: function(exerciseId) {
      if (!exerciseId) return [];
      var workouts = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
      var points = [];

      workouts.forEach(function(w) {
        if (!w.exercises) return;
        var foundEx = w.exercises.find(function(e) {
          return e.exerciseId === exerciseId || e.id === exerciseId;
        });

        if (foundEx && foundEx.sets && foundEx.sets.length > 0) {
          var bestWeight = 0;
          var bestReps = 0;
          var best1RM = 0;
          var totalVol = 0;
          var completedSets = 0;

          foundEx.sets.forEach(function(s) {
            if (s.completed) {
              var wKg = parseFloat(s.weight) || 0;
              var r = parseInt(s.reps, 10) || 0;
              if (wKg > 0 && r > 0) {
                completedSets++;
                totalVol += (wKg * r);
                if (wKg > bestWeight) {
                  bestWeight = wKg;
                  bestReps = r;
                }
                var e1rm = Math.round(wKg * (1 + (r / 30)) * 10) / 10;
                if (e1rm > best1RM) best1RM = e1rm;
              }
            }
          });

          if (completedSets > 0) {
            points.push({
              date: (w.endedAt || w.date || '').split('T')[0],
              workoutName: w.name,
              bestWeight: bestWeight,
              bestReps: bestReps,
              estimated1RM: best1RM,
              totalVolume: Math.round(totalVol),
              completedSets: completedSets
            });
          }
        }
      });

      // Ordenar por fecha cronológica ascendente
      points.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
      });

      return points;
    },

    // Gráfico vectorial interactivo SVG de la evolución de 1RM
    generateProgressionSvgChart: function(exerciseId, width, height) {
      width = width || 500;
      height = height || 220;

      var data = this.getExerciseHistory(exerciseId);
      if (!data || data.length === 0) {
        return '<div class="empty-chart-box"><p>No hay sesiones registradas con este ejercicio todavía.</p></div>';
      }

      var padding = { top: 30, right: 30, bottom: 40, left: 55 };
      var chartW = width - padding.left - padding.right;
      var chartH = height - padding.top - padding.bottom;

      var values = data.map(function(d) { return d.estimated1RM; });
      var maxVal = Math.max.apply(null, values);
      var minVal = Math.min.apply(null, values);

      // Si todos son iguales o solo hay 1 sesión, dar holgura
      if (maxVal === minVal) {
        maxVal = maxVal + 10;
        minVal = Math.max(0, minVal - 10);
      } else {
        var diff = maxVal - minVal;
        maxVal = Math.ceil(maxVal + (diff * 0.15));
        minVal = Math.floor(Math.max(0, minVal - (diff * 0.15)));
      }

      var getX = function(index) {
        if (data.length === 1) return padding.left + (chartW / 2);
        return padding.left + (index / (data.length - 1)) * chartW;
      };

      var getY = function(val) {
        var range = maxVal - minVal;
        if (range === 0) return padding.top + (chartH / 2);
        return padding.top + chartH - ((val - minVal) / range) * chartH;
      };

      // Construir línea y área poligonal
      var pathD = '';
      var areaD = '';

      data.forEach(function(d, idx) {
        var x = getX(idx);
        var y = getY(d.estimated1RM);
        if (idx === 0) {
          pathD += 'M ' + x + ' ' + y;
          areaD += 'M ' + x + ' ' + (padding.top + chartH) + ' L ' + x + ' ' + y;
        } else {
          pathD += ' L ' + x + ' ' + y;
          areaD += ' L ' + x + ' ' + y;
        }
      });

      if (data.length > 1) {
        var lastX = getX(data.length - 1);
        areaD += ' L ' + lastX + ' ' + (padding.top + chartH) + ' Z';
      }

      var svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" class="progression-svg-chart" preserveAspectRatio="none">';
      svg += '<defs>';
      svg += '<linearGradient id="cyanGradArea" x1="0" y1="0" x2="0" y2="1">';
      svg += '<stop offset="0%" stop-color="#00d2ff" stop-opacity="0.35"/>';
      svg += '<stop offset="100%" stop-color="#00d2ff" stop-opacity="0.0"/>';
      svg += '</linearGradient>';
      svg += '</defs>';

      // Ejes y líneas de cuadrícula horizontales
      var gridSteps = 4;
      for (var s = 0; s <= gridSteps; s++) {
        var stepVal = Math.round(minVal + (s / gridSteps) * (maxVal - minVal));
        var stepY = getY(stepVal);
        svg += '<line x1="' + padding.left + '" y1="' + stepY + '" x2="' + (width - padding.right) + '" y2="' + stepY + '" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3"/>';
        svg += '<text x="' + (padding.left - 8) + '" y="' + (stepY + 4) + '" fill="#94a3b8" font-size="11" text-anchor="end">' + stepVal + 'kg</text>';
      }

      // Área y línea
      if (data.length > 1) {
        svg += '<path d="' + areaD + '" fill="url(#cyanGradArea)" />';
        svg += '<path d="' + pathD + '" fill="none" stroke="#00d2ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
      }

      // Puntos y etiquetas
      data.forEach(function(d, idx) {
        var x = getX(idx);
        var y = getY(d.estimated1RM);
        var isLast = (idx === data.length - 1);

        svg += '<g class="chart-point-group" data-val="' + d.estimated1RM + 'kg (' + d.bestWeight + 'kg × ' + d.bestReps + ')" data-date="' + d.date + '">';
        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + (isLast ? 6 : 4.5) + '" fill="' + (isLast ? '#00d2ff' : '#ffffff') + '" stroke="#080c14" stroke-width="2"/>';
        svg += '<text x="' + x + '" y="' + (y - 10) + '" fill="' + (isLast ? '#00d2ff' : '#f1f5f9') + '" font-size="11" font-weight="700" text-anchor="middle">' + d.estimated1RM + '</text>';
        // Fecha abajo
        var dateLabel = d.date.split('-').slice(1).join('/'); // MM/DD
        svg += '<text x="' + x + '" y="' + (height - 12) + '" fill="#64748b" font-size="10" text-anchor="middle">' + dateLabel + '</text>';
        svg += '</g>';
      });

      svg += '</svg>';
      return svg;
    },

    // -------------------------------------------------------------------------
    // DISTRIBUCIÓN MUSCULAR Y VOLUMEN SEMANAL (TARGET MUSCLE BREAKDOWN)
    // -------------------------------------------------------------------------
    getMuscleVolumeDistribution: function(daysBack) {
      daysBack = daysBack || 14;
      var workouts = (global.AppState && global.AppState.workoutHistory) ? global.AppState.workoutHistory : [];
      var cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysBack);

      var muscleSets = {
        'Espalda': 0,
        'Pecho': 0,
        'Pierna': 0,
        'Hombro': 0,
        'Bíceps': 0,
        'Tríceps': 0,
        'Abdomen': 0
      };

      workouts.forEach(function(w) {
        var d = new Date(w.endedAt || w.date);
        if (d >= cutoff && w.exercises) {
          w.exercises.forEach(function(ex) {
            var g = ex.group || 'General';
            var setsCount = 0;
            if (ex.sets) {
              ex.sets.forEach(function(s) {
                if (s.completed && s.type !== 'warmup') {
                  setsCount++;
                }
              });
            }

            if (/espalda|dorsal/i.test(g)) muscleSets['Espalda'] += setsCount;
            else if (/pecho|pectoral/i.test(g)) muscleSets['Pecho'] += setsCount;
            else if (/pierna|cuadriceps|femoral|gluteo/i.test(g)) muscleSets['Pierna'] += setsCount;
            else if (/hombro|deltoid/i.test(g)) muscleSets['Hombro'] += setsCount;
            else if (/b[ií]ceps/i.test(g)) muscleSets['Bíceps'] += setsCount;
            else if (/tr[ií]ceps/i.test(g)) muscleSets['Tríceps'] += setsCount;
            else if (/abdomen|core/i.test(g)) muscleSets['Abdomen'] += setsCount;
            else muscleSets['Espalda'] += setsCount;
          });
        }
      });

      var targetWeekly = 14; // promedio de 12-16 series efectivas semanales
      var result = [];

      for (var m in muscleSets) {
        var count = muscleSets[m];
        var pct = Math.min(100, Math.round((count / targetWeekly) * 100));
        var status = 'Óptimo';
        var color = '#10b981'; // emerald
        if (count < 6) { status = 'Volumen Bajo'; color = '#f59e0b'; }
        else if (count > 22) { status = 'Volumen Elevado'; color = '#ef4444'; }
        else if (count >= 10 && count <= 18) { status = 'Rango Óptimo JPEREZ'; color = '#00d2ff'; }

        result.push({
          muscle: m,
          effectiveSets: count,
          targetSets: targetWeekly,
          percentage: pct,
          status: status,
          color: color
        });
      }

      return result;
    },

    // -------------------------------------------------------------------------
    // CONSEJO DE SOBRECARGA PROGRESIVA DEL COACH JOSE PEREZ
    // -------------------------------------------------------------------------
    getProgressiveOverloadAdvice: function(exerciseId) {
      if (!exerciseId) return null;
      var history = this.getExerciseHistory(exerciseId);
      if (!history || history.length === 0) {
        return {
          hasHistory: false,
          message: 'Primera vez realizando este ejercicio. Busca una carga que te lleve a RIR 0 en 6-8 reps.'
        };
      }

      var last = history[history.length - 1];
      var nextWeight = Math.round((last.bestWeight + 2.5) * 2) / 2;
      var nextReps = last.bestReps + 1;

      return {
        hasHistory: true,
        lastDate: last.date,
        lastWeight: last.bestWeight,
        lastReps: last.bestReps,
        recommendedWeight: nextWeight,
        recommendedReps: nextReps,
        message: 'Última sesión: ' + last.bestWeight + ' kg × ' + last.bestReps + ' reps. 🎯 Meta hoy: ' + nextWeight + ' kg × ' + Math.max(6, last.bestReps - 2) + ' reps o ' + last.bestWeight + ' kg × ' + nextReps + ' reps (Sobrecarga RIR 0).'
      };
    }
  };

  global.Analytics = Analytics;
})(window);
