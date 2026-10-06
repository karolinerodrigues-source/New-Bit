//	New-Bit	—	Painel	do	Administrador
//	Depende	de	js/store.js	(precisa	estar	carregado	ANTES	deste	arquivo	no	HTML).
document.addEventListener('DOMContentLoaded',	()	=>	{
		const	TURMAS	=	NewBitStore.TURMAS;
		function	renderStats()	{
				const	state	=	NewBitStore.getState();
				document.getElementById('statProfessores').textContent	=	state.professores.length;
				document.getElementById('statAlunos').textContent	=	state.alunos.length;
				document.getElementById('statProdutos').textContent	=	state.produtos.length;
		}
		const	tabButtons	=	document.querySelectorAll('.role-tab[data-tab]');
		const	tabPanels	=	document.querySelectorAll('.admin-tab');
		tabButtons.forEach(btn	=>	{
				btn.addEventListener('click',	()	=>	{
						tabButtons.forEach(b	=>	b.classList.toggle('is-active',	b	===	btn));
						tabPanels.forEach(p	=>	{	p.style.display	=	p.dataset.tabPanel	===	btn.dataset.tab	?	''	:	'none';	});
				});
		});
		function	qrImg(login)	{
				const	url	=	`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(login)}`;
				return	`<img	src="${url}"	alt="QR	Code	de	${login}"	style="display:block;margin:14px	auto;border-radius:8px;">`;
		}
		function	renderProfessores(filter	=	'')	{
				const	professores	=	NewBitStore.getState().professores;
				const	el	=	document.getElementById('professoresList');
				const	filtered	=	professores.filter(p	=>	p.nome.toLowerCase().includes(filter.toLowerCase()));
				if	(filtered.length	===	0)	{	el.innerHTML	=	'<p	class="empty-state">Nenhum	professor	cadastrado	ainda.</p>';	return;	}
				el.innerHTML	=	filtered.map(p	=>	`
						<div	class="list-row">
								<span	class="avatar">${NewBitStore.initials(p.nome)}</span>
								<span	class="list-main">
										<span	class="l-name">${p.nome}</span>
										<span	class="l-sub">login:	${p.login}	·	${p.turmas.join(',	')	||	'sem	turma'}	·	limite	${p.limiteMensal}/mês</span>
								</span>
								<span	class="row-actions">
										<button	class="btn-gold-outline"	data-view-professor="${p.id}"	style="padding:6px	12px;	font-size:11px;">Ver	credenciais</button>
								</span>
						</div>`).join('');
				el.querySelectorAll('[data-view-professor]').forEach(btn	=>	{
						btn.addEventListener('click',	()	=>	{
								const	p	=	NewBitStore.getProfessor(Number(btn.dataset.viewProfessor));
								if	(!p)	return;
								openModal(credentialsScreen({	titulo:	'Credenciais	do	professor',	nome:	p.nome,	perfil:	'Professor',	login:	p.login,	senha:	p.senha,	extra:	p.turmas.join(',	')	}));
								wireCredentialsScreen({	nome:	p.nome,	perfil:	'Professor',	login:	p.login,	senha:	p.senha	});
						});
				});
		}
		function	renderAlunosAdmin(filter	=	'')	{
				const	alunos	=	NewBitStore.getState().alunos;
				const	el	=	document.getElementById('alunosAdminList');
				const	filtered	=	alunos.filter(a	=>	a.nome.toLowerCase().includes(filter.toLowerCase()));
				if	(filtered.length	===	0)	{	el.innerHTML	=	'<p	class="empty-state">Nenhum	aluno	cadastrado	ainda.</p>';	return;	}
				el.innerHTML	=	filtered.map(a	=>	`
						<div	class="list-row">
								<span	class="avatar">${NewBitStore.initials(a.nome)}</span>
								<span	class="list-main">
										<span	class="l-name">${a.nome}</span>
										<span	class="l-sub">login:	${a.login}	·	${a.turma}	·	saldo:	${NewBitStore.getSaldo(a.id)}</span>
								</span>
								<span	class="row-actions">
										<button	class="btn-gold-outline"	data-view-aluno="${a.id}"	style="padding:6px	12px;	font-size:11px;">Ver	cartão/credenciais</button>
								</span>
						</div>`).join('');
				el.querySelectorAll('[data-view-aluno]').forEach(btn	=>	{
						btn.addEventListener('click',	()	=>	{
								const	a	=	NewBitStore.getAluno(Number(btn.dataset.viewAluno));
								if	(!a)	return;
								openModal(credentialsScreen({	titulo:	'Cartão	do	aluno',	nome:	a.nome,	perfil:	'Aluno',	login:	a.login,	senha:	a.senha,	extra:	a.turma,	mostrarQr:	true	}));
								wireCredentialsScreen({	nome:	a.nome,	perfil:	'Aluno',	login:	a.login,	senha:	a.senha	});
						});
				});
		}
		function	renderProdutos(filter	=	'')	{
				const	produtos	=	NewBitStore.getState().produtos;
				const	el	=	document.getElementById('produtosList');
				const	filtered	=	produtos.filter(p	=>	p.nome.toLowerCase().includes(filter.toLowerCase()));
				if	(filtered.length	===	0)	{	el.innerHTML	=	'<p	class="empty-state">Nenhum	produto	cadastrado	ainda.</p>';	return;	}
				el.innerHTML	=	filtered.map(p	=>	`
						<div	class="list-row">
								<span	class="list-main"><span	class="l-name">${p.nome}</span></span>
								<span	class="pill">${p.preco}	New-Bits</span>
						</div>`).join('');
		}
		function	renderAll()	{
				renderStats();
				renderProfessores(document.getElementById('searchProfessores').value);
				renderAlunosAdmin(document.getElementById('searchAlunosAdmin').value);
				renderProdutos(document.getElementById('searchProdutos').value);
		}
		renderAll();
		document.getElementById('searchProfessores').addEventListener('input',	(e)	=>	renderProfessores(e.target.value));
		document.getElementById('searchAlunosAdmin').addEventListener('input',	(e)	=>	renderAlunosAdmin(e.target.value));
		document.getElementById('searchProdutos').addEventListener('input',	(e)	=>	renderProdutos(e.target.value));
		const	modal	=	document.getElementById('adminModal');
		const	modalContent	=	document.getElementById('adminModalContent');
		function	closeModal()	{	modal.classList.remove('is-open');	modalContent.innerHTML	=	'';	}
		modal.addEventListener('click',	(event)	=>	{	if	(event.target	===	modal)	closeModal();	});
		function	openModal(html)	{	modalContent.innerHTML	=	html;	modal.classList.add('is-open');	}
		function	credentialsScreen({	titulo,	nome,	perfil,	login,	senha,	extra,	mostrarQr	})	{
				return	`
						<h3	class="modal-title">${titulo}</h3>
						<p	class="modal-sub">Anote/copie	os	dados	abaixo,	ou	imprima	o	QR	Code	para	o	cartão	físico.</p>
						<div	class="credential-card">
								<div	class="credential-row"><span	class="credential-label">Nome</span><span	class="credential-value">${nome}</span></div>
								<div	class="credential-row"><span	class="credential-label">Perfil</span><span	class="credential-value">${perfil}</span></div>
								<div	class="credential-row"><span	class="credential-label">Login</span><span	class="credential-value">${login}</span></div>
								<div	class="credential-row"><span	class="credential-label">Senha</span><span	class="credential-value">${senha}</span></div>
								${extra	?	`<div	class="credential-row"><span	class="credential-label">Turma(s)</span><span	class="credential-value">${extra}</span></div>`	:	''}
						</div>
						${mostrarQr	?	qrImg(login)	+	'<p	style="text-align:center;color:var(--muted);font-size:11.5px;">Este	QR	Code	é	o	cartão	do	aluno	—	use-o	no	tablet	do	pátio	(checkin.html).
</p>'	:	''}
						<div	class="modal-actions">
								<button	type="button"	class="modal-cancel"	id="credCopy">Copiar	dados</button>
								<button	type="button"	class="btn-primary"	id="credDone">Concluído</button>
						</div>`;
		}
		function	wireCredentialsScreen(payload)	{
				document.getElementById('credDone').addEventListener('click',	closeModal);
				document.getElementById('credCopy').addEventListener('click',	()	=>	{
						const	texto	=	`Nome:	${payload.nome}\nPerfil:	${payload.perfil}\nLogin:	${payload.login}\nSenha:	${payload.senha}`;
						if	(navigator.clipboard)	navigator.clipboard.writeText(texto).then(()	=>	alert('Credenciais	copiadas!'));
						else	alert(texto);
				});
		}
		document.getElementById('addProfessorBtn').addEventListener('click',	()	=>	{
				openModal(`
						<h3	class="modal-title">Novo	professor</h3>
						<p	class="modal-sub">Login	e	senha	são	gerados	automaticamente	a	partir	do	nome.</p>
						<label	class="field"	style="margin-bottom:14px;">
								<span	class="field-label">Nome	completo</span>
								<input	class="field-input"	type="text"	id="fProfessorNome"	placeholder="Ex:	Bruno	Souza">
						</label>
						<label	class="field"	style="margin-bottom:14px;">
								<span	class="field-label">Limite	de	New-Bits	a	distribuir	por	mês</span>
								<input	class="field-input"	type="number"	id="fProfessorLimite"	min="1"	value="300">
						</label>
						<span	class="field-label"	style="display:block;	margin-bottom:10px;">Turmas	que	vai	lecionar</span>
						<div	class="turma-chips"	id="professorTurmaChips">
								${TURMAS.map(t	=>	`<button	type="button"	class="turma-chip"	data-turma="${t}">${t}</button>`).join('')}
						</div>
						<div	class="modal-actions">
								<button	type="button"	class="modal-cancel"	id="professorCancel">Cancelar</button>
								<button	type="button"	class="btn-primary"	id="professorSalvar">Salvar	e	gerar	login</button>
						</div>`);
				const	selecionadas	=	new	Set();
				modalContent.querySelectorAll('.turma-chip').forEach(chip	=>	{
						chip.addEventListener('click',	()	=>	{
								const	t	=	chip.dataset.turma;
								if	(selecionadas.has(t))	{	selecionadas.delete(t);	chip.classList.remove('is-selected');	}
								else	{	selecionadas.add(t);	chip.classList.add('is-selected');	}
						});
				});
				document.getElementById('professorCancel').addEventListener('click',	closeModal);
				document.getElementById('professorSalvar').addEventListener('click',	()	=>	{
						const	nome	=	document.getElementById('fProfessorNome').value.trim();
						const	limiteMensal	=	document.getElementById('fProfessorLimite').value;
						if	(!nome)	{	alert('Digite	o	nome	completo	do	professor.');	return;	}
						if	(selecionadas.size	===	0)	{	alert('Selecione	ao	menos	uma	turma	para	o	professor.');	return;	}
						const	novo	=	NewBitStore.addProfessor({	nome,	turmas:	Array.from(selecionadas),	limiteMensal	});
						renderAll();
						openModal(credentialsScreen({	titulo:	'Professor	cadastrado!',	nome:	novo.nome,	perfil:	'Professor',	login:	novo.login,	senha:	novo.senha,	extra:	novo.turmas.join(',	')	
}));
						wireCredentialsScreen({	nome:	novo.nome,	perfil:	'Professor',	login:	novo.login,	senha:	novo.senha	});
				});
		});
		document.getElementById('addAlunoBtn').addEventListener('click',	()	=>	{
				openModal(`
						<h3	class="modal-title">Novo	aluno</h3>
						<p	class="modal-sub">Login	e	senha	são	gerados	automaticamente	a	partir	do	nome.</p>
						<label	class="field"	style="margin-bottom:14px;">
								<span	class="field-label">Nome	completo</span>
								<input	class="field-input"	type="text"	id="fAlunoNome"	placeholder="Ex:	Ana	Silva">
						</label>
						<label	class="field"	style="margin-bottom:14px;">
								<span	class="field-label">Turma</span>
								<select	class="field-input"	id="fAlunoTurma">
										${TURMAS.map(t	=>	`<option	value="${t}">${t}</option>`).join('')}
								</select>
						</label>
						<label	class="form-checkbox-row">
								<input	type="checkbox"	id="fAlunoLgpd">
								<span>Confirmo	que	o	consentimento	dos	responsáveis	para	tratamento	de	dados	(LGPD)	foi	obtido	antes	deste	cadastro.</span>
						</label>
						<div	class="modal-actions">
								<button	type="button"	class="modal-cancel"	id="alunoCancel">Cancelar</button>
								<button	type="button"	class="btn-primary"	id="alunoSalvar">Salvar	e	gerar	login</button>
						</div>`);
				document.getElementById('alunoCancel').addEventListener('click',	closeModal);
				document.getElementById('alunoSalvar').addEventListener('click',	()	=>	{
						const	nome	=	document.getElementById('fAlunoNome').value.trim();
						const	turma	=	document.getElementById('fAlunoTurma').value;
						const	lgpd	=	document.getElementById('fAlunoLgpd').checked;
						if	(!nome)	{	alert('Digite	o	nome	completo	do	aluno.');	return;	}
						if	(!lgpd)	{	alert('É	preciso	confirmar	o	consentimento	LGPD	antes	de	cadastrar	o	aluno.');	return;	}
						const	novo	=	NewBitStore.addAluno({	nome,	turma	});
						renderAll();
						openModal(credentialsScreen({	titulo:	'Aluno	cadastrado!',	nome:	novo.nome,	perfil:	'Aluno',	login:	novo.login,	senha:	novo.senha,	extra:	novo.turma,	mostrarQr:	true	}));
						wireCredentialsScreen({	nome:	novo.nome,	perfil:	'Aluno',	login:	novo.login,	senha:	novo.senha	});
				});
		});
		document.getElementById('addProdutoBtn').addEventListener('click',	()	=>	{
				openModal(`
						<h3	class="modal-title">Novo	produto</h3>
						<p	class="modal-sub">Esse	produto	aparece	na	loja	do	Painel	do	Aluno.</p>
						<label	class="field"	style="margin-bottom:14px;">
								<span	class="field-label">Nome	do	produto</span>
								<input	class="field-input"	type="text"	id="fProdutoNome"	placeholder="Ex:	Cupom	de	passeio">
						</label>
						<label	class="field"	style="margin-bottom:14px;">
								<span	class="field-label">Preço	(New-Bits)</span>
								<input	class="field-input"	type="number"	id="fProdutoPreco"	min="1"	placeholder="Ex:	100">
						</label>
						<div	class="modal-actions">
								<button	type="button"	class="modal-cancel"	id="produtoCancel">Cancelar</button>
								<button	type="button"	class="btn-primary"	id="produtoSalvar">Salvar	produto</button>
						</div>`);
				document.getElementById('produtoCancel').addEventListener('click',	closeModal);
				document.getElementById('produtoSalvar').addEventListener('click',	()	=>	{
						const	nome	=	document.getElementById('fProdutoNome').value.trim();
						const	preco	=	Number(document.getElementById('fProdutoPreco').value);
						if	(!nome)	{	alert('Digite	o	nome	do	produto.');	return;	}
						if	(!preco	||	preco	<=	0)	{	alert('Informe	um	preço	válido	em	New-Bits.');	return;	}
						NewBitStore.addProduto({	nome,	preco	});
						renderAll();
						closeModal();
				});
		});
});
