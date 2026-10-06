// New-Bit — Painel do Professor
// Dados de exemplo (mock) — troque pelas chamadas reais à API quando o backend existir.

document.addEventListener('DOMContentLoaded', () => {

  const turmas = [
    {
      id: 't5',
      name: '5º Ano',
      alunos: [
        { id: 1, name: 'Ana Silva', email: 'ana@aluno.com', points: 25 },
        { id: 2, name: 'Bruno Souza', email: 'bruno@aluno.com', points: 40 },
        { id: 3, name: 'Carlos Lima', email: 'carlos@aluno.com', points: 15 },
      ]
    },
    {
      id: 't4',
      name: '4º Ano',
      alunos: [
        { id: 4, name: 'Duda Ferreira', email: 'duda@aluno.com', points: 30 },
        { id: 5, name: 'Enzo Martins', email: 'enzo@aluno.com', points: 10 },
      ]
    },
  ];

  let activeTurmaId = turmas[0]?.id || null;
  let activity = [];

  const turmaSelect = document.getElementById('turmaSelect');
  const alunosList = document.getElementById('alunosList');
  const activityList = document.getElementById('activityList');
  const statAlunos = document.getElementById('statAlunos');
  const statTotal = document.getElementById('statTotal');
  const statMedia = document.getElementById('statMedia');
  const searchInput = document.getElementById('searchAlunos');

  const iconMinus = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>';
  const iconPlus = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';

  function currentTurma() {
    return turmas.find(t => t.id === activeTurmaId) || turmas[0];
  }

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function populateTurmaSelect() {
    if (!turmaSelect) return;
    turmaSelect.innerHTML = turmas.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    turmaSelect.value = activeTurmaId;
  }

  function renderStats() {
    const turma = currentTurma();
    const alunos = turma ? turma.alunos : [];
    const total = alunos.reduce((s, a) => s + a.points, 0);
    if (statAlunos) statAlunos.textContent = alunos.length;
    if (statTotal) statTotal.textContent = total;
    if (statMedia) statMedia.textContent = alunos.length ? Math.round(total / alunos.length) : 0;
  }

  function renderAlunos(filter = '') {
    if (!alunosList) return;
    const turma = currentTurma();
    const alunos = turma ? turma.alunos : [];
    const filtered = alunos.filter(a => a.name.toLowerCase().includes(filter.toLowerCase()));

    if (filtered.length === 0) {
      alunosList.innerHTML = '<p class="empty-state">Nenhum aluno encontrado nesta turma.</p>';
      return;
    }

    alunosList.innerHTML = filtered.map(a => `
      <div class="list-row" data-id="${a.id}">
        <span class="avatar">${initials(a.name)}</span>
        <span class="list-main">
          <span class="l-name">${a.name}</span>
          <span class="l-sub">${a.email}</span>
        </span>
        <span class="pill">${a.points} pts</span>
        <span class="row-actions">
          <button class="mini-btn plus" data-id="${a.id}" aria-label="Ajustar pontos de ${a.name}">${iconPlus}</button>
        </span>
      </div>
    `).join('');
  }

  function renderActivity() {
    if (!activityList) return;
    if (activity.length === 0) {
      activityList.innerHTML = '<p class="empty-state">Nenhuma atividade recente nesta turma.</p>';
      return;
    }
    activityList.innerHTML = activity.map(a => `
      <div class="tx-row">
        <span class="tx-icon ${a.delta < 0 ? 'is-out' : ''}">${a.delta < 0 ? iconMinus : iconPlus}</span>
        <span class="tx-main">
          <span class="t-label">${a.text}</span>
          <span class="t-date">${a.date}</span>
        </span>
      </div>
    `).join('');
  }

  function renderAll() {
    renderStats();
    renderAlunos(searchInput ? searchInput.value : '');
    renderActivity();
  }

  populateTurmaSelect();
  renderAll();

  if (turmaSelect) {
    turmaSelect.addEventListener('change', () => {
      activeTurmaId = turmaSelect.value;
      activity = [];
      if (searchInput) searchInput.value = '';
      renderAll();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => renderAlunos(searchInput.value));
  }

  const addAlunoBtn = document.getElementById('addAlunoBtn');
  if (addAlunoBtn) {
    addAlunoBtn.addEventListener('click', () => {
      alert('Ponto de integração: abrir formulário de cadastro de aluno (vai para o Perfil de Administrador).');
    });
  }

  const modal = document.getElementById('pointsModal');
  const modalStudentName = document.getElementById('modalStudentName');
  const modalCurrentPoints = document.getElementById('modalCurrentPoints');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');
  const justificationInput = document.getElementById('pointsJustification');
  const stepperMinus = document.getElementById('stepperMinus');
  const stepperPlus = document.getElementById('stepperPlus');
  const stepperDelta = document.getElementById('stepperDelta');
  const STEP = 5;

  let activeStudentId = null;
  let delta = 0;

  function openModal(studentId) {
    const turma = currentTurma();
    const student = turma ? turma.alunos.find(a => a.id === studentId) : null;
    if (!student || !modal) return;
    activeStudentId = studentId;
    delta = 0;
    modalStudentName.textContent = student.name;
    modalCurrentPoints.textContent = `Saldo atual: ${student.points} pts`;
    justificationInput.value = '';
    updateStepperUI(student);
    modal.classList.add('is-open');
  }

  function closeModal() {
    if (modal) modal.classList.remove('is-open');
    activeStudentId = null;
  }

  function updateStepperUI(student) {
    stepperDelta.textContent = (delta > 0 ? '+' : '') + delta;
    stepperDelta.classList.toggle('is-positive', delta > 0);
    stepperDelta.classList.toggle('is-negative', delta < 0);
    stepperMinus.disabled = (student.points + delta - STEP) < 0;
  }

  if (stepperPlus) {
    stepperPlus.addEventListener('click', () => {
      const turma = currentTurma();
      const student = turma ? turma.alunos.find(a => a.id === activeStudentId) : null;
      if (!student) return;
      delta += STEP;
      updateStepperUI(student);
    });
  }

  if (stepperMinus) {
    stepperMinus.addEventListener('click', () => {
      const turma = currentTurma();
      const student = turma ? turma.alunos.find(a => a.id === activeStudentId) : null;
      if (!student) return;
      if ((student.points + delta - STEP) < 0) return;
      delta -= STEP;
      updateStepperUI(student);
    });
  }

  if (alunosList) {
    alunosList.addEventListener('click', (event) => {
      const btn = event.target.closest('.mini-btn');
      if (!btn) return;
      openModal(Number(btn.dataset.id));
    });
  }

  if (modalCancel) modalCancel.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  if (modalConfirm) {
    modalConfirm.addEventListener('click', () => {
      const turma = currentTurma();
      const student = turma ? turma.alunos.find(a => a.id === activeStudentId) : null;
      if (!student) return;

      if (delta === 0) {
        alert('Use os botões + e − para ajustar a pontuação antes de confirmar.');
        return;
      }

      const justification = justificationInput.value.trim();
      if (!justification) {
        alert('Escreva uma justificativa: por que está dando ou tirando esses pontos.');
        return;
      }

      student.points = Math.max(0, student.points + delta);

      activity.unshift({
        text: `${delta > 0 ? 'Concedidos' : 'Retirados'} ${Math.abs(delta)} pontos de ${student.name} — ${justification}`,
        date: 'agora',
        delta
      });

      renderAll();
      closeModal();
    });
  }

});