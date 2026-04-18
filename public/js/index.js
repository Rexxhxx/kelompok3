// ─── State ────────────────────────────────────────────────────────────────────
let currentAttempts = 0;

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function showAlert(type, msg) {
  ['alertError', 'alertWarn', 'alertSuccess'].forEach(id => {
    document.getElementById(id).classList.remove('show');
  });
  const mapEl  = { error: 'alertError',    warn: 'alertWarn',    success: 'alertSuccess'    };
  const mapMsg = { error: 'alertErrorMsg', warn: 'alertWarnMsg', success: 'alertSuccessMsg' };
  document.getElementById(mapMsg[type]).textContent = msg;
  document.getElementById(mapEl[type]).classList.add('show');
}

function hideAlerts() {
  ['alertError', 'alertWarn', 'alertSuccess'].forEach(id => {
    document.getElementById(id).classList.remove('show');
  });
}

function updateDots(n) {
  for (let i = 1; i <= 3; i++) {
    document.getElementById('dot' + i).classList.toggle('used', i <= n);
  }
  document.getElementById('attemptLabel').textContent = `Percobaan login: ${n} / 3`;
}

function shakeCard() {
  const card = document.querySelector('.card');
  card.classList.remove('shake');
  void card.offsetWidth; // force reflow
  card.classList.add('shake');
}

function setLoading(active) {
  const btn    = document.getElementById('btnLogin');
  const txt    = document.getElementById('btnText');
  const spin   = document.getElementById('spinner');
  btn.disabled = active;
  btn.classList.toggle('loading', active);
  txt.textContent      = active ? 'Memverifikasi...' : 'Masuk';
  spin.style.display   = active ? 'inline-block' : 'none';
}

function markFieldError(id, active) {
  document.getElementById(id).classList.toggle('field-error', active);
}

// ─── Toggle Password ──────────────────────────────────────────────────────────
function togglePass() {
  const inp = document.getElementById('password');
  const btn = document.getElementById('toggleBtn');
  if (inp.type === 'password') {
    inp.type        = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type        = 'password';
    btn.textContent = '👁';
  }
}

// ─── Show overlays ────────────────────────────────────────────────────────────
function showSuccessOverlay(user) {
  document.getElementById('successName').textContent = `Selamat, ${user.username}! 🎉`;
  document.getElementById('successRole').textContent = `role: ${user.role} · ${user.email}`;
  document.getElementById('successOverlay').classList.add('show');
}

function showBlockedOverlay(username) {
  document.getElementById('blockedUser').textContent = username;
  document.getElementById('blockedOverlay').classList.add('show');
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function doLogin() {
  hideAlerts();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showAlert('error', 'Semua field wajib diisi!');
    return;
  }

  setLoading(true);

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      showSuccessOverlay(result.user);
      return;
    }

    if (result.code === 'NOT_FOUND') {
      showAlert('error', 'Akun tidak ditemukan');
      return;
    }

    if (result.code === 'BLOCKED') {
      showBlockedOverlay(username);
      return;
    }

    if (result.code === 'BLOCKED_NOW') {
      showBlockedOverlay(username);
      return;
    }

    if (result.code === 'WRONG_PASSWORD') {
      showAlert('error', `Password salah (${result.sisa}x lagi)`);
      return;
    }

  } catch (err) {
    setLoading(false);
    showAlert('error', 'Server error');
  }
}

// ─── Reset Form ───────────────────────────────────────────────────────────────
function resetForm() {
  document.getElementById('username').value  = '';
  document.getElementById('password').value  = '';
  document.getElementById('password').type   = 'password';
  document.getElementById('toggleBtn').textContent = '👁';
  hideAlerts();
  markFieldError('username', false);
  markFieldError('password', false);
  currentAttempts = 0;
  updateDots(0);
}

function resetAll() {
  document.getElementById('successOverlay').classList.remove('show');
  document.getElementById('blockedOverlay').classList.remove('show');
  resetForm();
}

// ─── Enter Key ────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});