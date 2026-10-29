// New-Bit — camada de dados (Supabase)
//
// Os dados ficam no banco do Supabase, então são os mesmos em qualquer dispositivo.
// O site só chama as funções "nb_*" criadas pelo arquivo supabase.sql.
// A chave abaixo é a chave PÚBLICA (publishable) — ela pode ficar no código.
// NUNCA coloque aqui a chave "service_role" nem a senha do banco.

const NewBitStore = (() => {
    const API_URL = 'https://aahxkfakgfrxqahfcmjv.supabase.co';
    const API_KEY = 'sb_publishable_Vlc-pFL7WkeOqGxoGwapaQ_VaKS8aXd';
    const SESSION_KEY = 'newbit_session_v2';

    const TURMAS = ['6º Ano A', '6º Ano B', '7º Ano A', '7º Ano B', '8º Ano A', '8º Ano B', '9º Ano A', '1ª Série EM', '2ª Série EM', '3ª Série EM'];

    function estadoVazio() {
        return {
            professores: [],
            alunos: [],
            produtos: [],
            movimentacoes: [],
            ranking: [],
            limite: { limite: 0, usado: 0, restante: 0 }
        };
    }

    let cache = estadoVazio();

    // ---------- utilidades ----------
    function esc(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    }

    function initials(name) {
        return (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }

    function diaAtual(date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function formatDateTime(iso) {
        const d = new Date(iso);
        const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        if (diaAtual(d) === diaAtual()) return `Hoje, ${hora}`;
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    // ---------- sessão (fica só nesta aba do navegador) ----------
    function getSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch (e) {
            return null;
        }
    }

    function setSession(sessao) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
        cache = estadoVazio();
    }

    function token() {
        const s = getSession();
        return s ? s.token : null;
    }

    // ---------- comunicação com o servidor ----------
    async function rpc(nome, args = {}) {
        let res;
        try {
            res = await fetch(`${API_URL}/rest/v1/rpc/${nome}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', apikey: API_KEY },
                body: JSON.stringify(args)
            });
        } catch (e) {
            throw new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.');
        }

        let corpo = null;
        try { corpo = await res.json(); } catch (e) { /* resposta vazia */ }

        if (!res.ok) {
            const msg = (corpo && corpo.message) || '';
            if (msg.includes('sessao_invalida')) {
                clearSession();
                if (!window.location.pathname.endsWith('login.html')) {
                    const voltarAoCheckin = window.location.pathname.endsWith('checkin.html');
                    window.location.href = voltarAoCheckin ? 'login.html?next=checkin.html' : 'login.html';
                }
                throw new Error('Sua sessão expirou. Entre novamente.');
            }
            console.error('New-Bit: erro do servidor em', nome, corpo);
            throw new Error('Erro no servidor. Tente novamente em instantes.');
        }
        return corpo;
    }

    async function refresh() {
        cache = Object.assign(estadoVazio(), await rpc('nb_estado', { p_token: token() }));
        return cache;
    }

    // Garante que há alguém logado com um dos perfis permitidos.
    function requireSession(perfis) {
        const s = getSession();
        if (!s || !s.token || (perfis && !perfis.includes(s.role))) {
            window.location.href = 'login.html';
            return null;
        }
        return s;
    }

    // Chamar no início de cada painel: valida o login e carrega os dados.
    async function init(perfis) {
        const s = requireSession(perfis);
        if (!s) return null;
        await refresh();
        return s;
    }

    async function authenticate(role, login, senha) {
        const r = await rpc('nb_login', { p_role: role, p_login: login, p_senha: senha });
        if (!r || r.erro === 'credenciais') {
            return { ok: false, message: 'Login ou senha inválidos para esse perfil.' };
        }
        if (r.erro === 'bloqueado') {
            return { ok: false, message: 'Muitas tentativas erradas. Aguarde 15 minutos e tente de novo.' };
        }
        setSession({ token: r.token, id: r.user.id, role: r.user.role, nome: r.user.nome, login: r.user.login });
        return { ok: true, user: r.user };
    }

    async function logout() {
        const t = token();
        clearSession();
        if (t) {
            try { await rpc('nb_logout', { p_token: t }); } catch (e) { /* já saiu */ }
        }
    }

    // ---------- leitura (usa os dados já carregados por init/refresh) ----------
    function getState() { return cache; }
    function getAluno(id) { return cache.alunos.find(a => a.id === Number(id)) || null; }
    function getProfessor(id) { return cache.professores.find(p => p.id === Number(id)) || null; }
    function getAlunosDaTurma(turma) { return cache.alunos.filter(a => a.turma === turma); }
    function getSaldo(alunoId) { const a = getAluno(alunoId); return a ? a.saldo : 0; }

    function getExtrato(alunoId) {
        return cache.movimentacoes
            .filter(m => m.alunoId === Number(alunoId))
            .sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    function getRanking(turma) {
        if (cache.ranking.length) return cache.ranking;
        return getAlunosDaTurma(turma)
            .map(a => ({ id: a.id, nome: a.nome, pontos: a.saldo }))
            .sort((x, y) => y.pontos - x.pontos);
    }

    function limiteInfo() { return cache.limite; }

    // ---------- escrita (todas conferidas no servidor) ----------
    async function acao(nome, args) {
        const r = await rpc(nome, Object.assign({ p_token: token() }, args));
        if (r && r.ok === false) throw new Error(r.message || 'Não foi possível concluir.');
        await refresh();
        return r;
    }

    async function addAluno({ nome, turma }) {
        return (await acao('nb_add_aluno', { p_nome: nome, p_turma: turma })).aluno;
    }

    async function addProfessor({ nome, turmas, limiteMensal }) {
        return (await acao('nb_add_professor', {
            p_nome: nome, p_turmas: turmas, p_limite: Number(limiteMensal) || 300
        })).professor;
    }

    async function addProduto({ nome, preco }) {
        return (await acao('nb_add_produto', { p_nome: nome, p_preco: Number(preco) })).produto;
    }

    async function excluirAluno(id) { await acao('nb_excluir_aluno', { p_id: Number(id) }); return true; }
    async function excluirProfessor(id) { await acao('nb_excluir_professor', { p_id: Number(id) }); return true; }

    async function redefinirSenha(role, id) {
        return acao('nb_redefinir_senha', { p_role: role, p_id: Number(id) });
    }

    // Regras de limite, turma e justificativa são checadas no servidor.
    async function darPontos({ alunoId, delta, motivo }) {
        try {
            const r = await acao('nb_dar_pontos', {
                p_aluno_id: Number(alunoId), p_delta: Number(delta), p_motivo: motivo || ''
            });
            return { ok: true, message: r.message, saldo: r.saldo };
        } catch (e) {
            return { ok: false, message: e.message };
        }
    }

    async function resgatarProduto({ produtoId }) {
        try {
            const r = await acao('nb_resgatar', { p_produto_id: Number(produtoId) });
            return { ok: true, message: r.message, saldo: r.saldo };
        } catch (e) {
            return { ok: false, message: e.message };
        }
    }

    async function addFeedback({ nota, comentario }) {
        await acao('nb_feedback', { p_nota: Number(nota), p_comentario: comentario || '' });
        return true;
    }

    async function registrarPresenca(login) {
        const r = await rpc('nb_presenca', { p_token: token(), p_login: login });
        return { ok: !!r.ok, message: r.message, aluno: r.aluno, saldo: r.saldo };
    }

    // Botão "Sair" das páginas: encerra a sessão no servidor antes de voltar ao login.
    document.addEventListener('click', (event) => {
        const link = event.target.closest && event.target.closest('a[aria-label="Sair"]');
        if (!link) return;
        event.preventDefault();
        logout().finally(() => { window.location.href = 'login.html'; });
    });

    return {
        TURMAS, esc, initials, formatDateTime,
        getSession, setSession, clearSession, requireSession, init, refresh,
        authenticate, logout,
        getState, getAluno, getProfessor, getAlunosDaTurma, getSaldo, getExtrato, getRanking, limiteInfo,
        addAluno, addProfessor, addProduto, excluirAluno, excluirProfessor, redefinirSenha,
        darPontos, resgatarProduto, addFeedback, registrarPresenca
    };
})();
