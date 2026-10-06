import { api, clearToken, getSavedToken, login, register, saveToken } from './api.js';
import { showMessage } from './ui.js';

export function createAuthController({ onSession, onLogout }) {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleAuth = document.getElementById('toggle-auth');
  const authSwitchPrompt = document.getElementById('auth-switch-prompt');
  const authError = document.getElementById('auth-error');
  const authHeading = document.getElementById('auth-heading');

  function endSession(message = '') {
    clearToken();
    authScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    appScreen.classList.remove('md:flex');
    showMessage(authError, message);
    onLogout();
  }

  async function startSession(auth) {
    saveToken(auth.token);
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    appScreen.classList.add('md:flex');
    showMessage(authError);
    await onSession(auth.user);
  }

  window.addEventListener('auth:expired', () => {
    endSession('Tu sesión finalizó. Inicia sesión nuevamente.');
  });

  toggleAuth.addEventListener('click', () => {
    const registering = registerForm.classList.contains('hidden');
    loginForm.classList.toggle('hidden', registering);
    registerForm.classList.toggle('hidden', !registering);
    authSwitchPrompt.textContent = registering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
    toggleAuth.textContent = registering ? 'Inicia sesión' : 'Regístrate';
    authHeading.textContent = registering ? 'Crear cuenta' : 'Iniciar sesión';
    showMessage(authError);
  });

  for (const button of document.querySelectorAll('[data-password-toggle]')) {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
      button.innerHTML = `<i class="fa-regular ${visible ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
    });
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;
    const values = new FormData(loginForm);
    try {
      await startSession(await login({
        email: values.get('email'),
        password: values.get('password')
      }));
    } catch (error) {
      showMessage(authError, error.message);
    }
  });

  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!registerForm.reportValidity()) return;
    const values = new FormData(registerForm);
    try {
      await startSession(await register({
        nombre: values.get('nombre'),
        email: values.get('email'),
        password: values.get('password'),
        rol: values.get('rol')
      }));
    } catch (error) {
      showMessage(authError, error.message);
    }
  });

  async function restoreSession() {
    if (!getSavedToken()) return;
    try {
      const result = await api('/api/auth/me');
      authScreen.classList.add('hidden');
      appScreen.classList.remove('hidden');
      appScreen.classList.add('md:flex');
      await onSession(result.user);
    } catch (error) {
      showMessage(authError, error.message);
    }
  }

  return { endSession, restoreSession };
}
