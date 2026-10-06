//	New-Bit	—	Painel	do	Professor
//	Depende	de	js/store.js	(precisa	estar	carregado	ANTES	deste	arquivo	no	HTML).
document.addEventListener('DOMContentLoaded',	()	=>	{
		let	sessao	=	NewBitStore.getSession();
		if	(!sessao	||	sessao.role	!==	'professor')	{
				const	state	=	NewBitStore.getState();
				const	primeiro	=	state.professores[0];
				if	(primeiro)	{
						sessao	=	{	id:	primeiro.id,	role:	'professor',	nome:	primeiro.nome,	login:	primeiro.login	};
						NewBitStore.setSession(sessao);
				}
		}
		const	professor	=	NewBitStore.getProfessor(sessao.id);
		if	(!professor)	{	window.location.href	=	'login.html';	return;	}
		document.getElementById('professorName').textContent	=	professor.nome;
		document.getElementById('avatarInitials').textContent	=	NewBitStore.initials(professor.nome);
		const	turmaSelect	=	document.getElementById('turmaSelect');
		turmaSelect.innerHTML	=	professor.turmas.map(t	=>	`<option	value="${t}">${t}</option>`).join('');
		let	turmaAtual	=	professor.turmas[0];
		turmaSelect.addEventListener('change',	()	=>	{	turmaAtual	=	turmaSelect.value;	renderTudo();	});
		const	searchInput	=	document.getElementById('searchAlunos');
		searchInput.addEventListener('input',	()	=>	renderTudo());
		function	renderTudo()	{
				const	alunosTurma	=	NewBitStore.getAlunosDaTurma(turmaAtual);
				const	filtro	=	searchInput.value.toLowerCase();
				const	alunosFiltrados	=	alunosTurma.filter(a	=>	a.nome.toLowerCase().includes(filtro));
				const	pontosPorAluno	=	alunosTurma.map(a	=>	NewBitStore.getSaldo(a.id));
				const	totalTurma	=	pontosPorAluno.reduce((s,	p)	=>	s	+	p,	0);
				const	media	=	alunosTurma.length	?	Math.round(totalTurma	/	alunosTurma.length)	:	0;
				const	limite	=	NewBitStore.limiteInfo(professor.id);
				document.getElementById('statAlunos').textContent	=	alunosTurma.length;
				document.getElementById('statTotal').textContent	=	totalTurma;
				document.getElementById('statMedia').textContent	=	media;
				document.getElementById('statLimite').textContent	=	limite.restante;
				const	alunosList	=	document.getElementById('alunosList');
				alunosList.innerHTML	=	alunosFiltrados.length	===	0
						?	'<p	class="empty-state">Nenhum	aluno	encontrado	nessa	turma.</p>'
						:	alunosFiltrados.map(a	=>	`
								<div	class="list-row">
										<span	class="avatar">${NewBitStore.initials(a.nome)}</span>
										<span	class="list-main">
												<span	class="l-name">${a.nome}</span>
												<span	class="l-sub">${NewBitStore.getSaldo(a.id)}	New-Bits</span>
										</span>
										<span	class="row-actions">
												<button	class="btn-gold-outline"	data-aluno="${a.id}"	style="padding:6px	12px;	font-size:11px;">Dar/tirar	pontos</button>
										</span>
								</div>`).join('');
				alunosList.querySelectorAll('[data-aluno]').forEach(btn	=>	{
						btn.addEventListener('click',	()	=>	abrirModalPontos(Number(btn.dataset.aluno)));
				});
				const	activityList	=	document.getElementById('activityList');
				const	movimentos	=	NewBitStore.getState().movimentacoes
						.filter(m	=>	m.professorId	===	professor.id)
						.sort((a,	b)	=>	new	Date(b.data)	-	new	Date(a.data))
						.slice(0,	10);
				activityList.innerHTML	=	movimentos.length	===	0
						?	'<p	class="empty-state">Nenhuma	atividade	ainda.</p>'
						:	movimentos.map(m	=>	{
								const	aluno	=	NewBitStore.getAluno(m.alunoId);
								const	out	=	m.tipo	===	'debito';
								return	`
										<div	class="list-row">
												<span	class="list-main">
														<span	class="l-name">${aluno	?	aluno.nome	:	'Aluno	removido'}</span>
														<span	class="l-sub">${m.motivo}	·	${NewBitStore.formatDateTime(m.data)}</span>
												</span>
												<span	class="pill	${out	?	'is-danger'	:	'is-success'}">${out	?	'-'	:	'+'}${m.valor}</span>
										</div>`;
						}).join('');
		}
		renderTudo();
		const	modal	=	document.getElementById('pointsModal');
		const	modalStudentName	=	document.getElementById('modalStudentName');
		const	modalCurrentPoints	=	document.getElementById('modalCurrentPoints');
		const	typePlusBtn	=	document.getElementById('typePlusBtn');
		const	typeMinusBtn	=	document.getElementById('typeMinusBtn');
		const	stepperMinus	=	document.getElementById('stepperMinus');
		const	stepperPlus	=	document.getElementById('stepperPlus');
		const	stepperDelta	=	document.getElementById('stepperDelta');
		const	justification	=	document.getElementById('pointsJustification');
		const	modalCancel	=	document.getElementById('modalCancel');
		const	modalConfirm	=	document.getElementById('modalConfirm');
		const	STEP	=	5;
		let	alunoSelecionadoId	=	null;
		let	tipoAtual	=	'plus';
		let	quantidade	=	STEP;
		function	atualizarStepper()	{
				stepperDelta.textContent	=	quantidade;
				stepperDelta.className	=	tipoAtual	===	'plus'	?	'is-positive'	:	'is-negative';
		}
		function	abrirModalPontos(alunoId)	{
				const	aluno	=	NewBitStore.getAluno(alunoId);
				if	(!aluno)	return;
				alunoSelecionadoId	=	alunoId;
				tipoAtual	=	'plus';
				quantidade	=	STEP;
				justification.value	=	'';
				modalStudentName.textContent	=	aluno.nome;
				modalCurrentPoints.textContent	=	NewBitStore.getSaldo(aluno.id);
				typePlusBtn.classList.add('is-active');
				typeMinusBtn.classList.remove('is-active');
				atualizarStepper();
				modal.classList.add('is-open');
		}
		modal.addEventListener('click',	(event)	=>	{	if	(event.target	===	modal)	modal.classList.remove('is-open');	});
		modalCancel.addEventListener('click',	()	=>	modal.classList.remove('is-open'));
		typePlusBtn.addEventListener('click',	()	=>	{
				tipoAtual	=	'plus';
				typePlusBtn.classList.add('is-active');
				typeMinusBtn.classList.remove('is-active');
				atualizarStepper();
		});
		typeMinusBtn.addEventListener('click',	()	=>	{
				tipoAtual	=	'minus';
				typeMinusBtn.classList.add('is-active');
				typePlusBtn.classList.remove('is-active');
				atualizarStepper();
		});
		stepperPlus.addEventListener('click',	()	=>	{	quantidade	+=	STEP;	atualizarStepper();	});
		stepperMinus.addEventListener('click',	()	=>	{	quantidade	=	Math.max(STEP,	quantidade	-	STEP);	atualizarStepper();	});
		modalConfirm.addEventListener('click',	()	=>	{
				const	delta	=	tipoAtual	===	'plus'	?	quantidade	:	-quantidade;
				const	resultado	=	NewBitStore.darPontos({	professorId:	professor.id,	alunoId:	alunoSelecionadoId,	delta,	motivo:	justification.value	});
				if	(!resultado.ok)	{	alert(resultado.message);	return;	}
				modal.classList.remove('is-open');
				renderTudo();
		});
});
