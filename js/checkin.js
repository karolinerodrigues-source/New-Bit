// New-Bit — Tablet do pátio (check-in por QR Code)
// Depende de js/store.js e da biblioteca html5-qrcode (carregada via CDN no HTML).
// O "código" lido do QR Code do cartão é o LOGIN do aluno (ex: ana.silva).

document.addEventListener('DOMContentLoaded', () => {
    const feedbackEl = document.getElementById('checkinFeedback');
    const recentList = document.getElementById('recentList');
    let ultimosHoje = [];

    function mostrarFeedback(ok, mensagem) {
        feedbackEl.textContent = mensagem;
        feedbackEl.className = 'checkin-feedback ' + (ok ? 'is-ok' : 'is-err');
        setTimeout(() => { feedbackEl.className = 'checkin-feedback'; }, 4000);
    }

    function renderRecentList() {
        recentList.innerHTML = ultimosHoje.length === 0
            ? '<p class="empty-state">Nenhuma presença registrada ainda hoje.</p>'
            : ultimosHoje.map(item => `
                <div class="list-row">
                    <span class="list-main">
                        <span class="l-name">${item.nome}</span>
                        <span class="l-sub">${item.hora}</span>
                    </span>
                </div>`).join('');
    }

    function processarCodigo(codigo) {
        if (typeof NewBitStore !== 'undefined' && NewBitStore.registrarPresenca) {
            const resultado = NewBitStore.registrarPresenca(codigo);
            mostrarFeedback(resultado.ok, resultado.message);
            if (resultado.ok && resultado.aluno) {
                const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                ultimosHoje.unshift({ nome: resultado.aluno.nome, hora });
                renderRecentList();
            }
        } else {
            // Caso o store.js não esteja carregado para testes rápidos
            const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            mostrarFeedback(true, `Presença registrada: ${codigo}`);
            ultimosHoje.unshift({ nome: codigo, hora });
            renderRecentList();
        }
    }

    renderRecentList();

    // ---------- Leitura por câmera (QR Code) ----------
    let ultimoCodigoLido = null;
    let ultimoTimestamp = 0;

    function onScanSuccess(decodedText) {
        const agora = Date.now();
        if (decodedText === ultimoCodigoLido && (agora - ultimoTimestamp) < 4000) return;
        ultimoCodigoLido = decodedText;
        ultimoTimestamp = agora;
        processarCodigo(decodedText);
    }

    function onScanFailure() {
        // Ignora frames sem leitura
    }

    if (typeof Html5QrcodeScanner !== 'undefined') {
        try {
            // Ajustado qrbox para formato de objeto { width, height }
            const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, onScanFailure);
        } catch (e) {
            console.error('New-Bit: não foi possível iniciar a câmera.', e);
            document.getElementById('qr-reader').innerHTML =
                '<p class="empty-state" style="padding:20px;">Não foi possível acessar a câmera. Use o campo manual abaixo.</p>';
        }
    } else {
        document.getElementById('qr-reader').innerHTML =
            '<p class="empty-state" style="padding:20px;">Biblioteca de câmera não carregou (sem internet?). Use o campo manual abaixo.</p>';
    }

    // ---------- Entrada manual (sem câmera) ----------
    const manualBtn = document.getElementById('manualBtn');
    const manualInput = document.getElementById('manualLogin');

    if (manualBtn && manualInput) {
        manualBtn.addEventListener('click', () => {
            const codigo = manualInput.value.trim();
            if (!codigo) { mostrarFeedback(false, 'Digite o login do aluno.'); return; }
            processarCodigo(codigo);
            manualInput.value = '';
        });

        manualInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') manualBtn.click();
        });
    }
});
