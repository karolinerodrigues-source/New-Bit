// New-Bit — interações da Tela Inicial e do Login
// Sem dependências externas: pensado para rodar via Live Server no VS Code.

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Tela inicial ----------
  const enterBtn = document.getElementById('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  // ---------- Login ----------
  const roleTabs = document.querySelectorAll('.role-tab');
  const emailInput = document.getElementById('email');
  const cardHint = document.getElementById('cardHint');
  const adminNote = document.getElementById('adminNote');
  const loginForm = document.getElementById('loginForm');
  const formError = document.getElementById('formError');
  const pwToggle = document.getElementById('pwToggle');
  const senhaInput = document.getElementById('senha');

  const placeholders = {
    aluno: 'nome.sobrenome@escola.pr.gov.br',
    professor: 'professor.sobrenome@escola.pr.gov.br',
    admin: 'admin.sobrenome@escola.pr.gov.br'
  };

  function setRole(role) {
    roleTabs.forEach(tab => {
      const isActive = tab.dataset.role === role;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (emailInput) emailInput.placeholder = placeholders[role] || placeholders.aluno;
    if (cardHint) cardHint.style.display = role === 'aluno' ? 'flex' : 'none';
    if (adminNote) adminNote.hidden = role !== 'admin';
  }

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => setRole(tab.dataset.role));
  });

  if (pwToggle && senhaInput) {
    pwToggle.addEventListener('click', () => {
      const isPassword = senhaInput.type === 'password';
      senhaInput.type = isPassword ? 'text' : 'password';
      pwToggle.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailOk = emailInput && emailInput.value.trim().length > 3;
      const senhaOk = senhaInput && senhaInput.value.length > 0;

      if (!emailOk || !senhaOk) {
        formError.hidden = false;
        return;
      }
      formError.hidden = true;

      // Ponto de integração: aqui entra a chamada real de autenticação
      // (API do sistema New-Bit). Por enquanto, navega direto para o painel
      // correspondente ao perfil escolhido, com dados de exemplo.
      const activeRole = document.querySelector('.role-tab.is-active')?.dataset.role || 'aluno';
      console.log('Login simulado:', { role: activeRole, email: emailInput.value });

      if (activeRole === 'professor') {
        window.location.href = 'professor.html';
      } else if (activeRole === 'aluno') {
        window.location.href = 'aluno.html';
      } else {
        window.location.href = 'admin.html';
      }
    });
  }

});
