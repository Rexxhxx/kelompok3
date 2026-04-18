// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
let currentAttempts = 0;


// ─────────────────────────────────────────────────────────
// INIT EVENTS
// ─────────────────────────────────────────────────────────
document.getElementById('password').addEventListener('input', () => {
  markFieldError('password', false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});


// ─────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────
function showAlert(type, msg) {
  const alertMap = {
    error: { box: 'alertError', msg: 'alertErrorMsg' },
    warn: { box: 'alertWarn', msg: 'alertWarnMsg' },
    success: { box: 'alertSuccess', msg: 'alertSuccessMsg' }
  };

  // Hide semua alert
  Object.values(alertMap).forEach(a => {
    document.getElementById(a.box).classList.remove('show');
  });

  // Show alert sesuai type
  document.getElementById(alertMap[type].msg).textContent = msg;
  document.getElementById(alertMap[type].box).classList.add('show');
}

function hideAlerts() {
  ['alertError', 'alertWarn', 'alertSuccess'].forEach(id => {
    document.getElementById(id).classList.remove('show');
  });
}

function updateDots(attempts) {
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`dot${i}`).classList.toggle('used', i <= attempts);
  }

  document.getElementById('attemptLabel').textContent =
    `Percobaan login: ${attempts} / 3`;
}

function shakeCard() {
  const card = document.querySelector('.card');
  card.classList.remove('shake');
  void card.offsetWidth; // reflow
  card.classList.add('shake');
}

function setLoading(isLoading) {
  const btn  = document.getElementById('btnLogin');
  const txt  = document.getElementById('btnText');
  const spin = document.getElementById('spinner');

  btn.disabled = isLoading;
  btn.classList.toggle('loading', isLoading);

  txt.textContent    = isLoading ? 'Memverifikasi...' : 'Masuk';
  spin.style.display = isLoading ? 'inline-block' : 'none';
}

function markFieldError(id, active) {
  document.getElementById(id).classList.toggle('field-error', active);
}


// ─────────────────────────────────────────────────────────
// PASSWORD TOGGLE
// ─────────────────────────────────────────────────────────
function togglePass() {
  const input = document.getElementById('password');
  const btn   = document.getElementById('toggleBtn');

  const isHidden = input.type === 'password';

  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}


// ─────────────────────────────────────────────────────────
// OVERLAYS
// ─────────────────────────────────────────────────────────
function showSuccessOverlay(user) {
  document.getElementById('successName').textContent =
    `Selamat, ${user.username}! 🎉`;

  document.getElementById('successRole').textContent =
    `role: ${user.role} · ${user.email}`;

  document.getElementById('successOverlay').classList.add('show');
}

function showBlockedOverlay(username) {
  document.getElementById('blockedUser').textContent = username;
  document.getElementById('blockedOverlay').classList.add('show');
}


// ─────────────────────────────────────────────────────────
// LOGIN HANDLER
// ─────────────────────────────────────────────────────────
async function doLogin() {
  hideAlerts();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // VALIDASI
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

    // ───── SUCCESS ─────
    if (result.success) {
      showSuccessOverlay(result.user);
      return;
    }

    // ───── ERROR HANDLING ─────
    switch (result.code) {
      case 'NOT_FOUND':
        showAlert('error', 'Akun tidak ditemukan');
        break;

      case 'BLOCKED':
      case 'BLOCKED_NOW':
        showBlockedOverlay(username);
        break;

      case 'WRONG_PASSWORD':
        handleWrongPassword(result, username);
        break;

      default:
        showAlert('error', 'Terjadi kesalahan');
    }

  } catch (err) {
    setLoading(false);
    showAlert('error', 'Server error');
  }
}


// ─────────────────────────────────────────────────────────
// WRONG PASSWORD HANDLER
// ─────────────────────────────────────────────────────────
function handleWrongPassword(result, username) {
  const usedAttempts = 3 - result.sisa;

  currentAttempts = usedAttempts;
  updateDots(currentAttempts);

  shakeCard();
  markFieldError('password', true);

  const sisa = 3 - currentAttempts;
  showAlert('error', `Password salah (${sisa}x lagi)`);

  if (currentAttempts >= 3) {
    showBlockedOverlay(username);
  }
}


// ─────────────────────────────────────────────────────────
// RESET
// ─────────────────────────────────────────────────────────
function resetForm() {
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password').type  = 'password';

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
