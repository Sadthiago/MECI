const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlAaRGoqJUXO7CC-4xF46_PqWhLkD7mDpcR5aXkzHmO9wDXBGMuaiAbrtD_2M_w_EGIQ/exec";

// ---- MAPA DE PREGUNTAS (orden PDF) ----
const QUESTION_MAP = [
  'PER201', 'PER205', 'CIN203', 'CIN206', 'CIN207', 'CIN221', 'CIN222', 'CIN233', 'CIN234', 'CIN236',
  'CIN238', 'CIN239', 'CIN240', 'CIN241', 'CIN242', 'CIN243', 'CIN244', 'CIN246', 'CIN247', 'CIN252',
  'CIN253', 'CIN254', 'CIN255', 'CIN264', 'CIN268', 'CIN269', 'CIN270', 'CIN271', 'CIN272', 'CIN273',
  'CIN274', 'CIN275', 'CIN276', 'CIN287', 'CIN288', 'CIN289', 'CIN290', 'CIN300', 'CIN301', 'CIN304',
  'CIN305', 'CIN306'
];
const NEGATIVE_VALUES = ['ninguna', 'ninguno'];

// ---- RAMIFICACIÓN TIPO ENTIDAD ----
function ramificarEntidad() {
  var tipo = document.getElementById('tipo_entidad').value;
  document.querySelectorAll('.entidad-block').forEach(function (b) {
    b.classList.remove('visible');
    b.querySelector('select').required = false;
  });
  if (tipo === 'DESCENTRALIZADA') {
    document.getElementById('bloque-desc').classList.add('visible');
    document.getElementById('entidad_desc').required = true;
  } else if (tipo === 'MUNICIPIO') {
    document.getElementById('bloque-muni').classList.add('visible');
    document.getElementById('entidad_muni').required = true;
  } else if (tipo === 'ESES') {
    document.getElementById('bloque-eses').classList.add('visible');
    document.getElementById('entidad_ese').required = true;
  }
  actualizarProgreso();
}

// ---- HIGHLIGHT SELECCIÓN ----
function markSelected(radio) {
  var group = radio.closest('.radio-group');
  group.querySelectorAll(':scope > label').forEach(function (l) { l.classList.remove('selected'); });
  radio.closest('label').classList.add('selected');
  actualizarProgreso();
}
function markCheck(cb) {
  const isNegative = NEGATIVE_VALUES.includes(cb.value);
  const group = cb.closest('.check-group') || cb.closest('.campo'); // fallback to campo if no check-group class
  
  if (cb.checked) {
    if (isNegative) {
      // If "none" is checked, uncheck everything else
      group.querySelectorAll('input[type=checkbox]').forEach(el => {
        if (el !== cb) {
          el.checked = false;
          el.closest('label').classList.remove('selected');
        }
      });
    } else {
      // If something else is checked, uncheck "none"
      group.querySelectorAll('input[type=checkbox]').forEach(el => {
        if (NEGATIVE_VALUES.includes(el.value)) {
          el.checked = false;
          el.closest('label').classList.remove('selected');
        }
      });
    }
  }
  
  cb.closest('label').classList.toggle('selected', cb.checked);
  actualizarProgreso();
}

// ---- PROGRESO ----
var TOTAL_PREGUNTAS = 42;
function actualizarProgreso() {
  var respondidas = 0;
  document.querySelectorAll('.campo > .radio-group').forEach(function (rg) {
    if (rg.querySelector(':scope > label > input[type=radio]:checked')) respondidas++;
  });
  document.querySelectorAll('.campo > .check-group').forEach(function (cg) {
    if (cg.querySelector(':scope > label > input[type=checkbox]:checked')) respondidas++;
  });
  ['responsable_nombre', 'responsable_cedula', 'responsable_cargo', 'responsable_correo',
    'tipo_entidad'].forEach(function (id) {
      var el = document.getElementById(id) || document.querySelector('[name="' + id + '"]');
      if (el && el.value.trim()) respondidas++;
    });
  var pct = Math.min(100, Math.round(respondidas / TOTAL_PREGUNTAS * 100));
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = respondidas + ' de ' + TOTAL_PREGUNTAS + ' preguntas respondidas';
}

// ---- NUMERACIÓN DE PREGUNTAS ----
function initNumeracion() {
  QUESTION_MAP.forEach(function (code, i) {
    var campo = document.getElementById('campo-' + code);
    if (!campo) return;
    campo.setAttribute('data-pregunta', i + 1);
    var label = campo.querySelector(':scope > label');
    if (label) {
      var badge = document.createElement('span');
      badge.className = 'pregunta-num';
      badge.textContent = i + 1;
      label.insertBefore(badge, label.firstChild);
    }
  });
}

// ---- PANEL DE NAVEGACIÓN FIJO ----
function initNavPanel() {
  var nav = document.getElementById('nav-panel');
  if (!nav) return;
  var title = document.createElement('div');
  title.className = 'nav-title';
  title.textContent = '📋 Preguntas';
  nav.appendChild(title);
  var grid = document.createElement('div');
  grid.className = 'nav-grid';
  QUESTION_MAP.forEach(function (code, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-btn';
    btn.textContent = i + 1;
    btn.title = 'Pregunta ' + (i + 1) + ' — ' + code;
    btn.addEventListener('click', function () {
      var el = document.getElementById('campo-' + code);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    grid.appendChild(btn);
  });
  nav.appendChild(grid);
}

// ---- ¿VALIDÓ FRENTE AL 2024? ----
function crearBloquesValido2024() {
  QUESTION_MAP.forEach(function (code) {
    var campo = document.getElementById('campo-' + code);
    if (!campo) return;
    var block = document.createElement('div');
    block.className = 'bloque-valido-2024';
    block.style.display = 'none';
    var rName = code + '_val2024';
    block.innerHTML =
      '<div class="val2024-header">📋 Comparación con vigencia 2024</div>' +
      '<div class="val2024-options">' +
      '<label><input type="radio" name="' + rName + '" value="mejoro"> Sí mejoró</label>' +
      '<label><input type="radio" name="' + rName + '" value="sigue_igual"> Sigue igual</label>' +
      '<label><input type="radio" name="' + rName + '" value="no_mejoro"> No mejoró</label>' +
      '</div>' +
      '<textarea class="val2024-desc" name="' + rName + '_desc" rows="2" placeholder="Descripción (opcional)"></textarea>';
    block.addEventListener('click', function (e) { e.stopPropagation(); });
    campo.appendChild(block);
  });
}
function initValido2024() {
  document.querySelectorAll('input[name="valido_2024"]').forEach(function (r) {
    r.addEventListener('change', toggleValido2024);
  });
}
function toggleValido2024() {
  var val = document.querySelector('input[name="valido_2024"]:checked');
  var show = val && val.value === 'si';
  document.querySelectorAll('.bloque-valido-2024').forEach(function (b) {
    b.style.display = show ? 'block' : 'none';
    if (!show) {
      b.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = false; });
      b.querySelectorAll('textarea').forEach(function (t) { t.value = ''; });
    }
  });
}

// ---- FOLLOW-UP Verificación (Sí / No / Parcialmente) ----
function initFollowUps() {
  document.querySelectorAll('.campo .radio-group, .campo .check-group').forEach(function (group) {
    var campo = group.closest('.campo');
    if (!campo) return;
    if (campo.id === 'campo-valido-2024') return;
    var isCheckGroup = group.classList.contains('check-group');
    var inputs = Array.from(group.querySelectorAll(':scope > label > input'));
    inputs.forEach(function (inp) {
      var campoCode = (inp.name || inp.id);
      var fuId = campoCode + '_fu_' + inp.value;
      if (document.getElementById(fuId)) return;
      var isNegative = NEGATIVE_VALUES.includes(inp.value.toLowerCase());
      var block = document.createElement('div');
      block.className = 'followup-block';
      block.id = fuId;
      block.setAttribute('data-negative', isNegative ? 'true' : 'false');
      var labelText = isCheckGroup
        ? 'Verificación: ' + inp.closest('label').textContent.trim()
        : 'Verificación adicional';
      block.innerHTML =
        '<span class="fu-label">📝 ' + labelText + '</span>' +
        '<div class="followup-sn">' +
        '<label id="' + fuId + '_si_lbl" title="Contestó la pregunta Y tiene soportes">' +
        '<input type="radio" name="' + fuId + '_sn" value="si" onchange="markFuSN(this)"> ✅ Sí</label>' +
        '<label id="' + fuId + '_parcial_lbl" title="No ha contestado pero tiene soportes, o hay justificación válida">' +
        '<input type="radio" name="' + fuId + '_sn" value="parcial" onchange="markFuSN(this)"> ⚠️ Parcialmente</label>' +
        '<label id="' + fuId + '_no_lbl" title="No hay soportes, ni respuesta, ni justificación">' +
        '<input type="radio" name="' + fuId + '_sn" value="no" onchange="markFuSN(this)"> ❌ No</label>' +
        '</div>' +
        '<div class="fu-descriptions">' +
        '<small>✅ <b>Sí</b>: Contestó la pregunta Y tiene soportes → <b>100 pts</b></small><br>' +
        '<small>⚠️ <b>Parcialmente</b>: Tiene soportes parciales o justificación válida → <b>50 pts</b></small><br>' +
        '<small>❌ <b>No</b>: No hay soportes, ni respuesta, ni justificación → <b>0 pts</b></small>' +
        '</div>' +
        '<span class="followup-just-label">Descripción (opcional)</span>' +
        '<textarea class="followup-just" name="' + fuId + '_desc" rows="2" placeholder="Escriba una descripción..."></textarea>';
      block.addEventListener('click', function (e) { e.stopPropagation(); });
      var wrapperLabel = inp.closest('label');
      wrapperLabel.parentNode.insertBefore(block, wrapperLabel.nextSibling);
      inp.addEventListener('change', function () { actualizarVisibilidadFU(group); });
    });
  });
}

function actualizarVisibilidadFU(group) {
  var inputs = Array.from(group.querySelectorAll(':scope > label > input'));
  inputs.forEach(function (inp) {
    var campoCode = (inp.name || inp.id);
    var fuId = campoCode + '_fu_' + inp.value;
    var block = document.getElementById(fuId);
    if (!block) return;
    if (inp.checked) {
      block.classList.add('visible');
    } else {
      block.classList.remove('visible');
      block.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = false; markFuSN(r); });
      var ta = block.querySelector('textarea');
      if (ta) ta.value = '';
      block.removeAttribute('data-score');
    }
  });
}

function markFuSN(radio) {
  var fuId = radio.name.replace('_sn', '');
  var siLbl = document.getElementById(fuId + '_si_lbl');
  var noLbl = document.getElementById(fuId + '_no_lbl');
  var parcialLbl = document.getElementById(fuId + '_parcial_lbl');
  [siLbl, noLbl, parcialLbl].forEach(function (lbl) {
    if (lbl) lbl.classList.remove('fu-selected-si', 'fu-selected-no', 'fu-selected-parcial');
  });
  if (radio.checked) {
    if (radio.value === 'si' && siLbl) siLbl.classList.add('fu-selected-si');
    if (radio.value === 'no' && noLbl) noLbl.classList.add('fu-selected-no');
    if (radio.value === 'parcial' && parcialLbl) parcialLbl.classList.add('fu-selected-parcial');
  }
  var block = document.getElementById(fuId);
  if (block && radio.checked) {
    var score = radio.value === 'si' ? 100 : (radio.value === 'parcial' ? 50 : 0);
    block.setAttribute('data-score', score);
  }
}

// ---- VALIDACIÓN Y ENVÍO ----
document.getElementById('form-meci').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!validarFormulario()) return;
  var btn = document.querySelector('.btn-submit');
  btn.textContent = '⏳ Enviando...';
  btn.disabled = true;
  var data = recopilarDatos();
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    document.getElementById('form-meci').style.display = 'none';
    document.getElementById('success-screen').style.display = 'block';
    window.scrollTo(0, 0);
  } catch (err) {
    alert('Error al enviar. Intente de nuevo.');
    btn.textContent = '✅ Enviar Formulario';
    btn.disabled = false;
  }
});

function validarFormulario() {
  var ok = true;
  document.querySelectorAll('.campo.has-error').forEach(function (c) { c.classList.remove('has-error'); });
  document.querySelectorAll('input[required], select[required]').forEach(function (el) {
    if (!el.offsetParent) return;
    var v = el.value.trim();
    if (!v || (el.type === 'number' && el.value === '')) { marcarError(el.closest('.campo')); ok = false; }
  });
  document.querySelectorAll('.campo').forEach(function (campo) {
    var radios = campo.querySelectorAll(':scope > .radio-group > label > input[type=radio][required]');
    if (radios.length > 0) {
      var checked = campo.querySelector(':scope > .radio-group > label > input[type=radio]:checked');
      if (!checked) { marcarError(campo); ok = false; }
    }
  });
  var checkCampos = ['CIN203', 'CIN206', 'CIN207', 'CIN222', 'CIN240', 'CIN241', 'CIN242', 'CIN244',
    'CIN246', 'CIN247', 'CIN252', 'CIN253', 'CIN254', 'CIN271', 'CIN276', 'CIN300', 'CIN301'];
  checkCampos.forEach(function (nombre) {
    var campo = document.getElementById('campo-' + nombre);
    if (!campo) return;
    var checked = campo.querySelector('input[type=checkbox]:checked');
    if (!checked) { marcarError(campo); ok = false; }
  });
  if (!ok) {
    var firstErr = document.querySelector('.campo.has-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return ok;
}
function marcarError(campo) { if (campo) campo.classList.add('has-error'); }

function recopilarDatos() {
  var data = { timestamp: new Date().toISOString() };
  var fd = new FormData(document.getElementById('form-meci'));
  var tipo = document.getElementById('tipo_entidad').value;
  if (tipo === 'DESCENTRALIZADA') data.entidad_nombre = document.getElementById('entidad_desc').value;
  else if (tipo === 'MUNICIPIO') data.entidad_nombre = document.getElementById('entidad_muni').value;
  else if (tipo === 'ESES') data.entidad_nombre = document.getElementById('entidad_ese').value;
  data.tipo_entidad = tipo;
  var checkNames = {};
  for (var pair of fd.entries()) {
    var k = pair[0], v = pair[1];
    if (k === 'entidad_nombre') continue;
    if (data[k]) {
      if (!checkNames[k]) checkNames[k] = [];
      checkNames[k].push(v);
    } else {
      data[k] = v;
      checkNames[k] = [v];
    }
  }
  Object.keys(checkNames).forEach(function (k) {
    if (checkNames[k].length > 1) data[k] = checkNames[k].join(',');
  });
  // Collect followup scores
  document.querySelectorAll('.followup-block.visible[data-score]').forEach(function (block) {
    data[block.id + '_score'] = parseInt(block.getAttribute('data-score'));
  });
  // Collect 2024 validation data
  QUESTION_MAP.forEach(function (code) {
    var rName = code + '_val2024';
    var checked = document.querySelector('input[name="' + rName + '"]:checked');
    if (checked) data[rName] = checked.value;
    var desc = document.querySelector('textarea[name="' + rName + '_desc"]');
    if (desc && desc.value.trim()) data[rName + '_desc'] = desc.value.trim();
  });

  // Construct readable Resumen for each question
  QUESTION_MAP.forEach(function (code) {
    if (!data[code]) return;
    var res = [];
    var ans = data[code];
    res.push("Respuesta: " + ans);

    // Follow-ups
    var ansParts = ans.split(',');
    var sops = [];
    ansParts.forEach(function(opt) {
      opt = opt.trim();
      if (!opt) return;
      var fuKey = code + '_fu_' + opt + '_sn';
      if (!data[fuKey]) fuKey = 'fu_' + code + '_' + opt + '_sn'; // fallback
      var fuVal = data[fuKey];
      if (fuVal) {
        var lbl = (fuVal === 'si') ? '✅ Sí' : (fuVal === 'parcial' ? '⚠️ Parcialmente' : '❌ No');
        var just = data[code + '_fu_' + opt + '_desc'] || data['fu_' + code + '_' + opt + '_desc'];
        sops.push(opt + " -> " + lbl + (just ? " (" + just + ")" : ""));
      }
    });
    if (sops.length > 0) res.push("Soportes:\n  " + sops.join('\n  '));

    // 2024
    var compVal = data[code + '_val2024'] || data['val2024_' + code];
    if (compVal) {
      var cLbl = (compVal === 'mejoro') ? '📈 Mejoró' : (compVal === 'sigue_igual' ? '⚖️ Sigue Igual' : '📉 No Mejoró');
      var cJust = data[code + '_val2024_desc'] || data['val2024_' + code + '_desc'];
      res.push("Vs 2024: " + cLbl + (cJust ? " (" + cJust + ")" : ""));
    }
    
    data[code + '_Resumen'] = res.join('\n');
  });

  return data;
}

// Escuchar cambios en inputs
document.querySelectorAll('input, select, textarea').forEach(function (el) {
  el.addEventListener('input', actualizarProgreso);
  el.addEventListener('change', actualizarProgreso);
});

// ---- INICIALIZACIÓN ----
function initAll() {
  initNumeracion();
  initNavPanel();
  crearBloquesValido2024();
  initValido2024();
  initFollowUps();
}
document.addEventListener('DOMContentLoaded', initAll);
if (document.readyState !== 'loading') initAll();
