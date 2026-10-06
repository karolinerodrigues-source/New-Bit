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
