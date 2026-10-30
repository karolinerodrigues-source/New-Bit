// New-Bit — Tablet do pátio (check-in por QR Code)
// Precisa de: js/store.js (banco Supabase) e da biblioteca html5-qrcode (carregada no checkin.html).
// O QR Code do cartão guarda o LOGIN do aluno (ex.: ana.silva).
// IMPORTANTE: este arquivo NUNCA troca de página. Se der erro, só mostra a mensagem na tela.

document.addEventListener('DOMContentLoaded', () => {

    const feedbackEl = document.getElementById('checkinFeedback');
    const recentList = document.getElementById('recentList');
    const retryBtn = document.getElementById('cameraRetryBtn');
    const leitorEl = document.getElementById('qr-reader');
    const ultimos = [];

    function mostrarFeedback(ok, mensagem) {
        feedbackEl.textContent = mensagem;
        feedbackEl.className = 'checkin-feedback ' + (ok ? 'is-ok' : 'is-err');
        clearTimeout(mostrarFeedback.t);
        mostrarFeedback.t = setTimeout(() => { feedbackEl.className = 'checkin-feedback'; }, 6000);
    }

    function renderRecentes() {
        if (ultimos.length === 0) {
            recentList.innerHTML = '<p class="empty-state">Nenhuma presença registrada ainda hoje.</p>';
            return;
        }
        recentList.innerHTML = ultimos.map(item => `
            <div class="list-row">
                <span class="list-main">
                    <span class="l-name">${NewBitStore.esc(item.nome)}</span>
                    <span class="l-sub">${item.hora}</span>
                </span>
            </div>`).join('');
    }

    // Registra a presença no servidor. Qualquer erro aparece na tela (sem sair da página).
    async function processarCodigo(codigo) {
        const login = (codigo || '').trim().toLowerCase();
        if (!login) { mostrarFeedback(false, 'Código vazio. Tente ler o cartão de novo.'); return; }
        try {
            const r = await NewBitStore.registrarPresenca(login);
            mostrarFeedback(r.ok, r.message);
            if (r.ok && r.aluno) {
                const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                ultimos.unshift({ nome: r.aluno.nome || login, hora });
                if (ultimos.length > 10) ultimos.pop();
                renderRecentes();
            }
        } catch (e) {
            console.error('New-Bit: falha ao registrar presença', e);
            mostrarFeedback(false, e.message || 'Não foi possível registrar. Tente de novo.');
        }
    }

    renderRecentes();

    // ---------- Câmera ----------
    let leitor = null;
    let lendo = false;
    let ultimoCodigo = null;
    let ultimoMomento = 0;

    function aoLerQr(texto) {
        const agora = Date.now();
        // a câmera lê o mesmo cartão várias vezes por segundo: ignora repetições por 5 s
        if (texto === ultimoCodigo && agora - ultimoMomento < 5000) return;
        ultimoCodigo = texto;
        ultimoMomento = agora;
        processarCodigo(texto);
    }

    async function abrirCamera() {
        if (typeof Html5Qrcode === 'undefined') {
            leitorEl.innerHTML = '<p style="color:#fff;padding:20px;">A biblioteca da câmera não carregou (sem internet?). Use o campo manual abaixo.</p>';
            return;
        }
        if (lendo) return;
        try {
            if (!leitor) leitor = new Html5Qrcode('qr-reader');
            await leitor.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                aoLerQr,
                () => { /* frame sem QR: ignorar */ }
            );
            lendo = true;
            if (retryBtn) retryBtn.style.display = 'none';
        } catch (e) {
            console.error('New-Bit: não foi possível abrir a câmera', e);
            lendo = false;
            if (retryBtn) retryBtn.style.display = '';
            mostrarFeedback(false, 'Não consegui abrir a câmera. Permita o acesso à câmera no navegador e toque em "Abrir câmera", ou use o campo manual.');
        }
    }

    if (retryBtn) retryBtn.addEventListener('click', abrirCamera);
    abrirCamera();

    // ---------- Campo manual (sem câmera) ----------
    const inputManual = document.getElementById('manualLogin');
    const botaoManual = document.getElementById('manualBtn');
    botaoManual.addEventListener('click', () => {
        const codigo = inputManual.value;
        inputManual.value = '';
        processarCodigo(codigo);
    });
    inputManual.addEventListener('keydown', (e) => { if (e.key === 'Enter') botaoManual.click(); });

});
