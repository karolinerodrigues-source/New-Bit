// New-Bit — Painel do Administrador
// Dados de exemplo (mock) — troque pelas chamadas reais à API quando o backend existir.

document.addEventListener('DOMContentLoaded', () => {

  const TURMAS = ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1ª Série EM', '2ª Série EM', '3ª Série EM'];

  let professores = [
    { id: 1, nome: 'Bruno Souza', login: 'bruno.souza', senha: 'bruno123', turmas: ['6º Ano', '7º Ano'] },
  ];

  let alunos = [
    { id: 1, nome: 'Ana Silva', login: 'ana.silva', senha: 'ana123', turma: '6º Ano' },
  ];

  let produtos = [
    { id: 1, nome: 'Caderno personalizado', preco: 80 },
    { id: 2, nome: 'Lanche da cantina', preco: 30 },
  ];

  let nextProfessorId = 2;
  let nextAlunoId = 2;
  let nextProdutoId = 3;

  // ---------- Utilitários de login/senha ----------

  function normalize(str) {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  }

  function gerarLogin(nomeCompleto) {
    const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
    const primeiro = normalize(partes[0] || '');
    const ultimo = partes.length > 1 ? normalize(partes[partes.length - 1]) : primeiro;
    return `${primeiro}.${ultimo}`;
  }

  function gerarSenha(nomeCompleto) {
    const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
    const primeiro = normalize(partes[0] || '');
    return `${primeiro}123`;
  }

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  // ---------- Stats ----------

  function renderStats() {
    document.getElementById('statProfessores').textContent = professores.length;
    document.getElementById('statAlunos').textContent = alunos.length;
    document.getElementById('statProdutos').textContent = produtos.length;
  }

  // ---------- Abas ----------

  const tabButtons = document.querySelectorAll('.role-tab[data-tab]');
  const tabPanels = document.querySelectorAll('.admin-tab');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.toggle('is-active', b === btn));
      tabPanels.forEach(p => {
        p.style.display = p.dataset.tabPanel === btn.dataset.tab ? '' : 'none';
      });
    });
  });

  // ---------- Listas ----------

  function renderProfessores(filter = '') {
    const el = document.getElementById('professoresList');
    const filtered = professores.filter(p => p.nome.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
      el.innerHTML = '<p class="empty-state">Nenhum professor cadastrado ainda.</p>';
      return;
    }
    el.innerHTML = filtered.map(p => `
      <div class="list-row">
        <span class="avatar">${initials(p.nome)}</span>
        <span class="list-main">
          <span class="l-name">${p.nome}</span>
          <span class="l-sub">login: ${p.login} · ${p.turmas.join(', ') || 'sem turma'}</span>
        </span>
        <span class="row-actions">
          <button class="btn-gold-outline" data-view-professor="${p.id}" style="padding:6px 12px; font-size:11px;">Ver credenciais</button>
        </span>
      </div>
    `).join('');

    el.querySelectorAll('[data-view-professor]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = professores.find(x => x.id === Number(btn.dataset.viewProfessor));
        if (!p) return;
        openModal(credentialsScreen({
          titulo: 'Credenciais do professor',
          nome: p.nome, perfil: 'Professor', login: p.login, senha: p.senha, extra: p.turmas.join(', ')
        }));
        wireCredentialsScreen({ nome: p.nome, perfil: 'Professor', login: p.login, senha: p.senha });
      });
    });
  }

  function renderAlunosAdmin(filter = '') {
    const el = document.getElementById('alunosAdminList');
    const filtered = alunos.filter(a => a.nome.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
      el.innerHTML = '<p class="empty-state">Nenhum aluno cadastrado ainda.</p>';
      return;
    }
    el.innerHTML = filtered.map(a => `
      <div class="list-row">
        <span class="avatar">${initials(a.nome)}</span>
        <span class="list-main">
          <span class="l-name">${a.nome}</span>
          <span class="l-sub">login: ${a.login} · ${a.turma}</span>
        </span>
        <span class="row-actions">
          <button class="btn-gold-outline" data-view-aluno="${a.id}" style="padding:6px 12px; font-size:11px;">Ver credenciais</button>
        </span>
      </div>
    `).join('');

    el.querySelectorAll('[data-view-aluno]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = alunos.find(x => x.id === Number(btn.dataset.viewAluno));
        if (!a) return;
        openModal(credentialsScreen({
          titulo: 'Credenciais do aluno',
          nome: a.nome, perfil: 'Aluno', login: a.login, senha: a.senha, extra: a.turma
        }));
        wireCredentialsScreen({ nome: a.nome, perfil: 'Aluno', login: a.login, senha: a.senha });
      });
    });
  }

  function renderProdutos(filter = '') {
    const el = document.getElementById('produtosList');
    const filtered = produtos.filter(p => p.nome.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
      el.innerHTML = '<p class="empty-state">Nenhum produto cadastrado ainda.</p>';
      return;
    }
    el.innerHTML = filtered.map(p => `
      <div class="list-row">
        <span class="list-main">
          <span class="l-name">${p.nome}</span>
        </span>
        <span class="pill">${p.preco} New-Bits</span>
      </div>
    `).join('');
  }

  function renderAll() {
    renderStats();
    renderProfessores(document.getElementById('searchProfessores').value);
    renderAlunosAdmin(document.getElementById('searchAlunosAdmin').value);
    renderProdutos(document.getElementById('searchProdutos').value);
  }

  renderAll();

  document.getElementById('searchProfessores').addEventListener('input', (e) => renderProfessores(e.target.value));
  document.getElementById('searchAlunosAdmin').addEventListener('input', (e) => renderAlunosAdmin(e.target.value));
  document.getElementById('searchProdutos').addEventListener('input', (e) => renderProdutos(e.target.value));

  // ---------- Modal genérico ----------

  const modal = document.getElementById('adminModal');
  const modalContent = document.getElementById('adminModalContent');

  function closeModal() {
    modal.classList.remove('is-open');
    modalContent.innerHTML = '';
  }

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  function openModal(html) {
    modalContent.innerHTML = html;
    modal.classList.add('is-open');
  }

  // ---------- Tela de credenciais ----------

  function credentialsScreen({ titulo, nome, perfil, login, senha, extra }) {
    return `
      <h3 class="modal-title">${titulo}</h3>
      <p class="modal-sub">Anote ou copie os dados abaixo para entregar à pessoa.</p>
      <div class="credential-card">
        <div class="credential-row"><span class="credential-label">Nome</span><span class="credential-value">${nome}</span></div>
        <div class="credential-row"><span class="credential-label">Perfil</span><span class="credential-value">${perfil}</span></div>
        <div class="credential-row"><span class="credential-label">Login</span><span class="credential-value">${login}</span></div>
        <div class="credential-row"><span class="credential-label">Senha</span><span class="credential-value">${senha}</span></div>
        ${extra ? `<div class="credential-row"><span class="credential-label">Turma(s)</span><span class="credential-value">${extra}</span></div>` : ''}
      </div>
      <div class="modal-actions">
        <button type="button" class="modal-cancel" id="credCopy">Copiar dados</button>
        <button type="button" class="btn-primary" id="credDone">Concluído</button>
      </div>
    `;
  }

  function wireCredentialsScreen(payload) {
    document.getElementById('credDone').addEventListener('click', closeModal);
    document.getElementById('credCopy').addEventListener('click', () => {
      const texto = `Nome: ${payload.nome}\nPerfil: ${payload.perfil}\nLogin: ${payload.login}\nSenha: ${payload.senha}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => alert('Credenciais copiadas!'));
      } else {
        alert(texto);
      }
    });
  }

  // ---------- Formulário: Novo Professor ----------

  document.getElementById('addProfessorBtn').addEventListener('click', () => {
    openModal(`
      <h3 class="modal-title">Novo professor</h3>
      <p class="modal-sub">Login e senha são gerados automaticamente a partir do nome.</p>

      <label class="field" style="margin-bottom:14px;">
        <span class="field-label">Nome completo</span>
        <input class="field-input" type="text" id="fProfessorNome" placeholder="Ex: Bruno Souza">
      </label>

      <span class="field-label" style="display:block; margin-bottom:10px;">Turmas que vai lecionar</span>
      <div class="turma-chips" id="professorTurmaChips">
        ${TURMAS.map(t => `<button type="button" class="turma-chip" data-turma="${t}">${t}</button>`).join('')}
      </div>

      <div class="modal-actions">
        <button type="button" class="modal-cancel" id="professorCancel">Cancelar</button>
        <button type="button" class="btn-primary" id="professorSalvar">Salvar e gerar login</button>
      </div>
    `);

    const selecionadas = new Set();
    modalContent.querySelectorAll('.turma-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const t = chip.dataset.turma;
        if (selecionadas.has(t)) { selecionadas.delete(t); chip.classList.remove('is-selected'); }
        else { selecionadas.add(t); chip.classList.add('is-selected'); }
      });
    });

    document.getElementById('professorCancel').addEventListener('click', closeModal);
    document.getElementById('professorSalvar').addEventListener('click', () => {
      const nome = document.getElementById('fProfessorNome').value.trim();
      if (!nome) { alert('Digite o nome completo do professor.'); return; }
      if (selecionadas.size === 0) { alert('Selecione ao menos uma turma para o professor.'); return; }

      const novo = {
        id: nextProfessorId++,
        nome,
        login: gerarLogin(nome),
        senha: gerarSenha(nome),
        turmas: Array.from(selecionadas)
      };
      professores.push(novo);
      renderAll();

      openModal(credentialsScreen({
        titulo: 'Professor cadastrado!',
        nome: novo.nome,
        perfil: 'Professor',
        login: novo.login,
        senha: novo.senha,
        extra: novo.turmas.join(', ')
      }));
      wireCredentialsScreen({ nome: novo.nome, perfil: 'Professor', login: novo.login, senha: novo.senha });
    });
  });

  // ---------- Formulário: Novo Aluno ----------

  document.getElementById('addAlunoBtn').addEventListener('click', () => {
    openModal(`
      <h3 class="modal-title">Novo aluno</h3>
      <p class="modal-sub">Login e senha são gerados automaticamente a partir do nome.</p>

      <label class="field" style="margin-bottom:14px;">
        <span class="field-label">Nome completo</span>
        <input class="field-input" type="text" id="fAlunoNome" placeholder="Ex: Ana Silva">
      </label>

      <label class="field" style="margin-bottom:14px;">
        <span class="field-label">Turma</span>
        <select class="field-input" id="fAlunoTurma">
          ${TURMAS.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </label>

      <label class="form-checkbox-row">
        <input type="checkbox" id="fAlunoLgpd">
        <span>Confirmo que o consentimento dos responsáveis para tratamento de dados (LGPD) foi obtido antes deste cadastro.</span>
      </label>

      <div class="modal-actions">
        <button type="button" class="modal-cancel" id="alunoCancel">Cancelar</button>
        <button type="button" class="btn-primary" id="alunoSalvar">Salvar e gerar login</button>
      </div>
    `);

    document.getElementById('alunoCancel').addEventListener('click', closeModal);
    document.getElementById('alunoSalvar').addEventListener('click', () => {
      const nome = document.getElementById('fAlunoNome').value.trim();
      const turma = document.getElementById('fAlunoTurma').value;
      const lgpd = document.getElementById('fAlunoLgpd').checked;

      if (!nome) { alert('Digite o nome completo do aluno.'); return; }
      if (!lgpd) { alert('É preciso confirmar o consentimento LGPD antes de cadastrar o aluno.'); return; }

      const novo = {
        id: nextAlunoId++,
        nome,
        login: gerarLogin(nome),
        senha: gerarSenha(nome),
        turma
      };
      alunos.push(novo);
      renderAll();

      openModal(credentialsScreen({
        titulo: 'Aluno cadastrado!',
        nome: novo.nome,
        perfil: 'Aluno',
        login: novo.login,
        senha: novo.senha,
        extra: novo.turma
      }));
      wireCredentialsScreen({ nome: novo.nome, perfil: 'Aluno', login: novo.login, senha: novo.senha });
    });
  });

  // ---------- Formulário: Novo Produto ----------

  document.getElementById('addProdutoBtn').addEventListener('click', () => {
    openModal(`
      <h3 class="modal-title">Novo produto</h3>
      <p class="modal-sub">Esse produto aparece na loja do Painel do Aluno.</p>

      <label class="field" style="margin-bottom:14px;">
        <span class="field-label">Nome do produto</span>
        <input class="field-input" type="text" id="fProdutoNome" placeholder="Ex: Cupom de passeio">
      </label>

      <label class="field" style="margin-bottom:14px;">
        <span class="field-label">Preço (New-Bits)</span>
        <input class="field-input" type="number" id="fProdutoPreco" min="1" placeholder="Ex: 100">
      </label>

      <div class="modal-actions">
        <button type="button" class="modal-cancel" id="produtoCancel">Cancelar</button>
        <button type="button" class="btn-primary" id="produtoSalvar">Salvar produto</button>
      </div>
    `);

    document.getElementById('produtoCancel').addEventListener('click', closeModal);
    document.getElementById('produtoSalvar').addEventListener('click', () => {
      const nome = document.getElementById('fProdutoNome').value.trim();
      const preco = Number(document.getElementById('fProdutoPreco').value);

      if (!nome) { alert('Digite o nome do produto.'); return; }
      if (!preco || preco <= 0) { alert('Informe um preço válido em New-Bits.'); return; }

      produtos.push({ id: nextProdutoId++, nome, preco });
      renderAll();
      closeModal();
    });
  });

});