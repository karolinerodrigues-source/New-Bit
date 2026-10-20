// New-Bit — Painel do Administrador
// Depende de js/store.js, que precisa ser carregado antes deste arquivo.

document.addEventListener('DOMContentLoaded', async () => {
    let sessao;
    try {
        sessao = await NewBitStore.init(['admin']);
    } catch (e) {
        return; // sessão inválida: o store já redirecionou para o login
    }
    if (!sessao) return;

    const TURMAS = NewBitStore.TURMAS;
    const esc = NewBitStore.esc;

    // Executa uma ação no servidor: bloqueia clique duplo e mostra o erro, se houver.
    async function executar(btn, acao) {
        if (btn) btn.disabled = true;
        try {
            return await acao();
        } catch (e) {
            alert(e.message || 'Não foi possível concluir. Tente novamente.');
            return undefined;
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    function renderStats() {
        const state = NewBitStore.getState();

        document.getElementById('statProfessores').textContent = state.professores.length;
        document.getElementById('statAlunos').textContent = state.alunos.length;
        document.getElementById('statProdutos').textContent = state.produtos.length;
    }

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

    function qrImg(login) {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(login)}`;

        return `<img src="${url}" alt="QR Code de ${esc(login)}" style="display:block;margin:14px auto;border-radius:8px;">`;
    }

    function renderProfessores(filter = '') {
        const professores = NewBitStore.getState().professores;
        const el = document.getElementById('professoresList');

        const filtered = professores.filter(p =>
            p.nome.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            el.innerHTML = '<p class="empty-state">Nenhum professor cadastrado ainda.</p>';
            return;
        }

        el.innerHTML = filtered.map(p => `
            <div class="list-row">
                <span class="avatar">${NewBitStore.initials(p.nome)}</span>

                <span class="list-main">
                    <span class="l-name">${esc(p.nome)}</span>
                    <span class="l-sub">
                        login: ${esc(p.login)} · ${esc(p.turmas.join(', ') || 'sem turma')} · limite ${Number(p.limiteMensal)}/mês
                    </span>
                </span>

                <span class="row-actions">
                    <button
                        class="btn-gold-outline"
                        data-view-professor="${p.id}"
                        style="padding:6px 12px; font-size:11px;">
                        Ver credenciais
                    </button>

                    <button
                        class="btn-gold-outline"
                        data-delete-professor="${p.id}"
                        style="padding:6px 12px; font-size:11px;">
                        Excluir
                    </button>
                </span>
            </div>
        `).join('');

        el.querySelectorAll('[data-view-professor]').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = NewBitStore.getProfessor(Number(btn.dataset.viewProfessor));

                if (!p) return;

                mostrarCredenciais({
                    titulo: 'Credenciais do professor',
                    role: 'professor',
                    id: p.id,
                    nome: p.nome,
                    perfil: 'Professor',
                    login: p.login,
                    senha: null,
                    extra: p.turmas.join(', ')
                });
            });
        });

        el.querySelectorAll('[data-delete-professor]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.deleteProfessor);
                const professor = NewBitStore.getProfessor(id);

                if (!professor) return;

                if (confirm(`Deseja realmente excluir o professor ${professor.nome}?`)) {
                    await executar(btn, () => NewBitStore.excluirProfessor(id));
                    renderAll();
                }
            });
        });
    }

    function renderAlunosAdmin(filter = '') {
        const alunos = NewBitStore.getState().alunos;
        const el = document.getElementById('alunosAdminList');

        const filtered = alunos.filter(a =>
            a.nome.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            el.innerHTML = '<p class="empty-state">Nenhum aluno cadastrado ainda.</p>';
            return;
        }

        el.innerHTML = filtered.map(a => `
            <div class="list-row">
                <span class="avatar">${NewBitStore.initials(a.nome)}</span>

                <span class="list-main">
                    <span class="l-name">${esc(a.nome)}</span>
                    <span class="l-sub">
                        login: ${esc(a.login)} · ${esc(a.turma)} · saldo: ${Number(NewBitStore.getSaldo(a.id))}
                    </span>
                </span>

                <span class="row-actions">
                    <button
                        class="btn-gold-outline"
                        data-view-aluno="${a.id}"
                        style="padding:6px 12px; font-size:11px;">
                        Ver cartão/credenciais
                    </button>

                    <button
                        class="btn-gold-outline"
                        data-delete-aluno="${a.id}"
                        style="padding:6px 12px; font-size:11px;">
                        Excluir
                    </button>
                </span>
            </div>
        `).join('');

        el.querySelectorAll('[data-view-aluno]').forEach(btn => {
            btn.addEventListener('click', () => {
                const a = NewBitStore.getAluno(Number(btn.dataset.viewAluno));

                if (!a) return;

                mostrarCredenciais({
                    titulo: 'Cartão do aluno',
                    role: 'aluno',
                    id: a.id,
                    nome: a.nome,
                    perfil: 'Aluno',
                    login: a.login,
                    senha: null,
                    extra: a.turma,
                    mostrarQr: true
                });
            });
        });

        el.querySelectorAll('[data-delete-aluno]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.deleteAluno);
                const aluno = NewBitStore.getAluno(id);

                if (!aluno) return;

                if (confirm(`Deseja realmente excluir o aluno ${aluno.nome}?`)) {
                    await executar(btn, () => NewBitStore.excluirAluno(id));
                    renderAll();
                }
            });
        });
    }

    function renderProdutos(filter = '') {
        const produtos = NewBitStore.getState().produtos;
        const el = document.getElementById('produtosList');

        const filtered = produtos.filter(p =>
            p.nome.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            el.innerHTML = '<p class="empty-state">Nenhum produto cadastrado ainda.</p>';
            return;
        }

        el.innerHTML = filtered.map(p => `
            <div class="list-row">
                <span class="list-main">
                    <span class="l-name">${esc(p.nome)}</span>
                </span>

                <span class="pill">${p.preco} New-Bits</span>
            </div>
        `).join('');
    }

    function renderAll() {
        renderStats();

        renderProfessores(
            document.getElementById('searchProfessores').value
        );

        renderAlunosAdmin(
            document.getElementById('searchAlunosAdmin').value
        );

        renderProdutos(
            document.getElementById('searchProdutos').value
        );
    }

    renderAll();

    document.getElementById('searchProfessores').addEventListener('input', e => {
        renderProfessores(e.target.value);
    });

    document.getElementById('searchAlunosAdmin').addEventListener('input', e => {
        renderAlunosAdmin(e.target.value);
    });

    document.getElementById('searchProdutos').addEventListener('input', e => {
        renderProdutos(e.target.value);
    });

    const modal = document.getElementById('adminModal');
    const modalContent = document.getElementById('adminModalContent');

    function closeModal() {
        modal.classList.remove('is-open');
        modalContent.innerHTML = '';
    }

    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });

    function openModal(html) {
        modalContent.innerHTML = html;
        modal.classList.add('is-open');
    }

    function credentialsScreen({
        titulo,
        nome,
        perfil,
        login,
        senha,
        id,
        extra,
        mostrarQr
    }) {
        return `
            <h3 class="modal-title">${esc(titulo)}</h3>

            <p class="modal-sub">
                ${senha ? 'Anote/copie os dados abaixo — a senha só aparece agora. Depois, só dá para gerar uma nova.' : 'Por segurança, a senha não pode ser consultada depois do cadastro. Se foi perdida, gere uma nova.'}
            </p>

            <div class="credential-card">
                <div class="credential-row">
                    <span class="credential-label">Nome</span>
                    <span class="credential-value">${esc(nome)}</span>
                </div>

                <div class="credential-row">
                    <span class="credential-label">Perfil</span>
                    <span class="credential-value">${esc(perfil)}</span>
                </div>

                <div class="credential-row">
                    <span class="credential-label">Login</span>
                    <span class="credential-value">${esc(login)}</span>
                </div>

                <div class="credential-row">
                    <span class="credential-label">Senha</span>
                    <span class="credential-value">${senha ? esc(senha) : 'não consultável (gere uma nova)'}</span>
                </div>

                ${extra ? `
                    <div class="credential-row">
                        <span class="credential-label">Turma(s)</span>
                        <span class="credential-value">${esc(extra)}</span>
                    </div>
                ` : ''}
            </div>

            ${mostrarQr ? qrImg(login) + '<p style="text-align:center;color:var(--muted);font-size:11.5px;">Este QR Code é o cartão do aluno — use-o no tablet do pátio (checkin.html).</p>' : ''}

            <div class="modal-actions">
                ${!senha && id ? `<button type="button" class="modal-cancel" id="credReset">Gerar nova senha</button>` : ''}
                <button type="button" class="modal-cancel" id="credCopy">
                    Copiar dados
                </button>

                <button type="button" class="btn-primary" id="credDone">
                    Concluído
                </button>
            </div>
        `;
    }

    function mostrarCredenciais(dados) {
        openModal(credentialsScreen(dados));
        wireCredentialsScreen(dados);
    }

    function wireCredentialsScreen(payload) {
        document.getElementById('credDone').addEventListener('click', closeModal);

        const resetBtn = document.getElementById('credReset');

        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                if (!confirm(`Gerar uma nova senha para ${payload.nome}? A senha atual deixará de funcionar.`)) return;

                const r = await executar(resetBtn, () => NewBitStore.redefinirSenha(payload.role, payload.id));

                if (r) {
                    mostrarCredenciais({ ...payload, titulo: 'Nova senha gerada', login: r.login, senha: r.senha });
                }
            });
        }

        document.getElementById('credCopy').addEventListener('click', () => {
            const texto =
                `Nome: ${payload.nome}\n` +
                `Perfil: ${payload.perfil}\n` +
                `Login: ${payload.login}` +
                (payload.senha ? `\nSenha: ${payload.senha}` : '');

            if (navigator.clipboard) {
                navigator.clipboard.writeText(texto)
                    .then(() => alert('Dados copiados!'));
            } else {
                alert(texto);
            }
        });
    }

    // CADASTRAR PROFESSOR
    document.getElementById('addProfessorBtn').addEventListener('click', () => {
        openModal(`
            <h3 class="modal-title">Novo professor</h3>

            <p class="modal-sub">
                Login e senha são gerados automaticamente a partir do nome.
            </p>

            <label class="field" style="margin-bottom:14px;">
                <span class="field-label">Nome completo</span>
                <input
                    class="field-input"
                    type="text"
                    id="fProfessorNome"
                    placeholder="Ex: Bruno Souza">
            </label>

            <label class="field" style="margin-bottom:14px;">
                <span class="field-label">Limite de New-Bits a distribuir por mês</span>
                <input
                    class="field-input"
                    type="number"
                    id="fProfessorLimite"
                    min="1"
                    value="300">
            </label>

            <span class="field-label" style="display:block;margin-bottom:10px;">
                Turmas que vai lecionar
            </span>

            <div class="turma-chips" id="professorTurmaChips">
                ${TURMAS.map(t => `
                    <button type="button" class="turma-chip" data-turma="${t}">
                        ${t}
                    </button>
                `).join('')}
            </div>

            <div class="modal-actions">
                <button type="button" class="modal-cancel" id="professorCancel">
                    Cancelar
                </button>

                <button type="button" class="btn-primary" id="professorSalvar">
                    Salvar e gerar login
                </button>
            </div>
        `);

        const selecionadas = new Set();

        modalContent.querySelectorAll('.turma-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const t = chip.dataset.turma;

                if (selecionadas.has(t)) {
                    selecionadas.delete(t);
                    chip.classList.remove('is-selected');
                } else {
                    selecionadas.add(t);
                    chip.classList.add('is-selected');
                }
            });
        });

        document.getElementById('professorCancel').addEventListener('click', closeModal);

        document.getElementById('professorSalvar').addEventListener('click', async (ev) => {
            const salvarBtn = ev.currentTarget;
            const nome = document.getElementById('fProfessorNome').value.trim();
            const limiteMensal = document.getElementById('fProfessorLimite').value;

            if (!nome) {
                alert('Digite o nome completo do professor.');
                return;
            }

            if (selecionadas.size === 0) {
                alert('Selecione ao menos uma turma para o professor.');
                return;
            }

            const novo = await executar(salvarBtn, () => NewBitStore.addProfessor({
                nome,
                turmas: Array.from(selecionadas),
                limiteMensal
            }));

            if (!novo) return;

            renderAll();

            mostrarCredenciais({
                titulo: 'Professor cadastrado!',
                role: 'professor',
                id: novo.id,
                nome: novo.nome,
                perfil: 'Professor',
                login: novo.login,
                senha: novo.senha,
                extra: novo.turmas.join(', ')
            });
        });
    });

    // CADASTRAR ALUNO
    document.getElementById('addAlunoBtn').addEventListener('click', () => {
        openModal(`
            <h3 class="modal-title">Novo aluno</h3>

            <p class="modal-sub">
                Login e senha são gerados automaticamente a partir do nome.
            </p>

            <label class="field" style="margin-bottom:14px;">
                <span class="field-label">Nome completo</span>
                <input
                    class="field-input"
                    type="text"
                    id="fAlunoNome"
                    placeholder="Ex: Ana Silva">
            </label>

            <label class="field" style="margin-bottom:14px;">
                <span class="field-label">Turma</span>
                <select class="field-input" id="fAlunoTurma">
                    ${TURMAS.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </label>

            <label class="form-checkbox-row">
                <input type="checkbox" id="fAlunoLgpd">
                <span>
                    Confirmo que o consentimento dos responsáveis para tratamento de dados
                    (LGPD) foi obtido antes deste cadastro.
                </span>
            </label>

            <div class="modal-actions">
                <button type="button" class="modal-cancel" id="alunoCancel">
                    Cancelar
                </button>

                <button type="button" class="btn-primary" id="alunoSalvar">
                    Salvar e gerar login
                </button>
            </div>
        `);

        document.getElementById('alunoCancel').addEventListener('click', closeModal);

        document.getElementById('alunoSalvar').addEventListener('click', async (ev) => {
            const salvarBtn = ev.currentTarget;
            const nome = document.getElementById('fAlunoNome').value.trim();
            const turma = document.getElementById('fAlunoTurma').value;
            const lgpd = document.getElementById('fAlunoLgpd').checked;

            if (!nome) {
                alert('Digite o nome completo do aluno.');
                return;
            }

            if (!lgpd) {
                alert('É preciso confirmar o consentimento LGPD antes de cadastrar o aluno.');
                return;
            }

            const novo = await executar(salvarBtn, () => NewBitStore.addAluno({ nome, turma }));

            if (!novo) return;

            renderAll();

            mostrarCredenciais({
                titulo: 'Aluno cadastrado!',
                role: 'aluno',
                id: novo.id,
                nome: novo.nome,
                perfil: 'Aluno',
                login: novo.login,
                senha: novo.senha,
                extra: novo.turma,
                mostrarQr: true
            });
        });
    });

    // CADASTRAR PRODUTO
    document.getElementById('addProdutoBtn').addEventListener('click', () => {
        openModal(`
            <h3 class="modal-title">Novo produto</h3>

            <p class="modal-sub">
                Esse produto aparece na loja do Painel do Aluno.
            </p>

            <label class="field" style="margin-bottom:14px;">
                <span class="field-label">Nome do produto</span>
                <input
                    class="field-input"
                    type="text"
                    id="fProdutoNome"
                    placeholder="Ex: Cupom de passeio">
            </label>

            <label class="field" style="margin-bottom:14px;">
                <span class="field-label">Preço (New-Bits)</span>
                <input
                    class="field-input"
                    type="number"
                    id="fProdutoPreco"
                    min="1"
                    placeholder="Ex: 100">
            </label>

            <div class="modal-actions">
                <button type="button" class="modal-cancel" id="produtoCancel">
                    Cancelar
                </button>

                <button type="button" class="btn-primary" id="produtoSalvar">
                    Salvar produto
                </button>
            </div>
        `);

        document.getElementById('produtoCancel').addEventListener('click', closeModal);

        document.getElementById('produtoSalvar').addEventListener('click', async (ev) => {
            const salvarBtn = ev.currentTarget;
            const nome = document.getElementById('fProdutoNome').value.trim();
            const preco = Number(document.getElementById('fProdutoPreco').value);

            if (!nome) {
                alert('Digite o nome do produto.');
                return;
            }

            if (!preco || preco <= 0) {
                alert('Informe um preço válido em New-Bits.');
                return;
            }

            const salvo = await executar(salvarBtn, () => NewBitStore.addProduto({ nome, preco }));

            if (!salvo) return;

            renderAll();
            closeModal();
        });
    });
});
