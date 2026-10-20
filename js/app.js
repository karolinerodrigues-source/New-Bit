//	New-Bit	—	interações	da	Tela	Inicial	e	do	Login
//	Depende	de	js/store.js	(precisa	estar	carregado	ANTES	deste	arquivo	no	HTML).
document.addEventListener('DOMContentLoaded',	()	=>	{
		const	enterBtn	=	document.getElementById('enterBtn');
		if	(enterBtn)	{
				enterBtn.addEventListener('click',	()	=>	{	window.location.href	=	'login.html';	});
		}
		const	roleTabs	=	document.querySelectorAll('.role-tab[data-role]');
		const	emailInput	=	document.getElementById('email');
		const	cardHint	=	document.getElementById('cardHint');
		const	adminNote	=	document.getElementById('adminNote');
		const	loginForm	=	document.getElementById('loginForm');
		const	formError	=	document.getElementById('formError');
		const	pwToggle	=	document.getElementById('pwToggle');
		const	senhaInput	=	document.getElementById('senha');
		if	(!loginForm)	return;
		const	placeholders	=	{
				aluno:	'nome.sobrenome@escola.pr.gov.br',
				professor:	'professor.sobrenome@escola.pr.gov.br',
				admin:	'admin.sobrenome@escola.pr.gov.br'
		};
		function	setRole(role)	{
				roleTabs.forEach(tab	=>	{
						const	isActive	=	tab.dataset.role	===	role;
						tab.classList.toggle('is-active',	isActive);
						tab.setAttribute('aria-selected',	isActive	?	'true'	:	'false');
				});
				if	(emailInput)	emailInput.placeholder	=	placeholders[role]	||	placeholders.aluno;
				if	(cardHint)	cardHint.style.display	=	role	===	'aluno'	?	'flex'	:	'none';
				if	(adminNote)	adminNote.hidden	=	role	!==	'admin';
				formError.hidden	=	true;
		}
		roleTabs.forEach(tab	=>	tab.addEventListener('click',	()	=>	setRole(tab.dataset.role)));
		if	(pwToggle	&&	senhaInput)	{
				pwToggle.addEventListener('click',	()	=>	{
						const	isPassword	=	senhaInput.type	===	'password';
						senhaInput.type	=	isPassword	?	'text'	:	'password';
						pwToggle.setAttribute('aria-label',	isPassword	?	'Ocultar	senha'	:	'Mostrar	senha');
				});
		}
		loginForm.addEventListener('submit',	(event)	=>	{
				event.preventDefault();
				const	emailOk	=	emailInput	&&	emailInput.value.trim().length	>	3;
				const	senhaOk	=	senhaInput	&&	senhaInput.value.length	>	0;
				if	(!emailOk	||	!senhaOk)	{
						formError.textContent	=	'Preencha	e-mail	e	senha	para	continuar.';
						formError.hidden	=	false;
						return;
				}
				const	activeRole	=	document.querySelector('.role-tab.is-active')?.dataset.role	||	'aluno';
				const	login	=	emailInput.value.trim().split('@')[0];
				const	senha	=	senhaInput.value;
				const	usuario	=	NewBitStore.authenticate(activeRole,	login,	senha);
				if	(!usuario)	{
						formError.textContent	=	'E-mail	ou	senha	inválidos	para	esse	perfil.';
						formError.hidden	=	false;
						return;
				}
				formError.hidden	=	true;
				if	(activeRole	===	'professor')	window.location.href	=	'professor.html';
				else	if	(activeRole	===	'aluno')	window.location.href	=	'aluno.html';
				else	window.location.href	=	'admin.html';
		});
});
// New-Bit — Tablet do pátio (check-in por QR Code)
// Depende de js/store.js e da biblioteca html5-qrcode (carregada via CDN no HTML).
// O "código" lido do QR Code do cartão é o LOGIN do aluno (ex: ana.silva).

document.addEventListener('DOMContentLoaded', () => {
    // O tablet precisa de um professor ou administrador logado.
    const sessaoCheckin = NewBitStore.getSession();
    if (!sessaoCheckin || !['admin', 'professor'].includes(sessaoCheckin.role)) {
        window.location.href = 'login.html?next=checkin.html';
        return;
    }

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
                        <span class="l-name">${NewBitStore.esc(item.nome)}</span>
                        <span class="l-sub">${item.hora}</span>
                    </span>
                </div>`).join('');
    }

    async function processarCodigo(codigo) {
        try {
            const resultado = await NewBitStore.registrarPresenca(codigo);
            mostrarFeedback(resultado.ok, resultado.message);

            if (resultado.ok && resultado.aluno) {
                const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                ultimosHoje.unshift({ nome: resultado.aluno.nome, hora });
                renderRecentList();
            }
        } catch (e) {
            mostrarFeedback(false, e.message || 'Não foi possível registrar a presença.');
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
