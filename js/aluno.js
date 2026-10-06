//	New-Bit	—	Painel	do	Aluno
//	Depende	de	js/store.js	(precisa	estar	carregado	ANTES	deste	arquivo	no	HTML).
document.addEventListener('DOMContentLoaded',	()	=>	{
		let	sessao	=	NewBitStore.getSession();
		if	(!sessao	||	sessao.role	!==	'aluno')	{
				const	state	=	NewBitStore.getState();
				const	primeiro	=	state.alunos[0];
				if	(primeiro)	{
						sessao	=	{	id:	primeiro.id,	role:	'aluno',	nome:	primeiro.nome,	login:	primeiro.login	};
						NewBitStore.setSession(sessao);
				}
		}
		const	aluno	=	NewBitStore.getAluno(sessao.id);
		if	(!aluno)	{	window.location.href	=	'login.html';	return;	}
		const	iconIn	=	'<svg	viewBox="0	0	24	24"><path	d="M12	19V5"/><path	d="M5	12l7-7	7	7"/></svg>';
		const	iconOut	=	'<svg	viewBox="0	0	24	24"><path	d="M12	5v14"/><path	d="M19	12l-7	7-7-7"/></svg>';
		const	iconStore	=	'<svg	viewBox="0	0	24	24"><path	d="M4	8l1.5-4h13L20	8"/><path	d="M4	8h16v11a1	1	0	0	1-1	1H5a1	1	0	0	1-1-1V8z"/></svg>';
		const	nameEl	=	document.getElementById('studentName');
		if	(nameEl)	nameEl.textContent	=	aluno.nome;
		const	avatarEl	=	document.getElementById('avatarInitials');
		if	(avatarEl)	avatarEl.textContent	=	NewBitStore.initials(aluno.nome);
		const	roleEl	=	document.querySelector('.u-role');
		if	(roleEl)	roleEl.textContent	=	aluno.turma;
		function	renderTudo()	{
				const	saldo	=	NewBitStore.getSaldo(aluno.id);
				const	extrato	=	NewBitStore.getExtrato(aluno.id);
				const	ranking	=	NewBitStore.getRanking(aluno.turma);
				const	produtos	=	NewBitStore.getState().produtos;
				const	balanceEl	=	document.getElementById('balanceValue');
				if	(balanceEl)	balanceEl.textContent	=	saldo;
				const	storePill	=	document.getElementById('storePillBalance');
				if	(storePill)	storePill.textContent	=	`${saldo}	disponíveis`;
				const	rankingList	=	document.getElementById('rankingList');
				if	(rankingList)	{
						rankingList.innerHTML	=	ranking.length	===	0
								?	'<p	class="empty-state">Nenhum	aluno	na	turma	ainda.</p>'
								:	ranking.map((r,	i)	=>	`
										<div	class="rank-row	${r.id	===	aluno.id	?	'is-me'	:	''}">
												<span	class="rank-pos">${i	+	1}º</span>
												<span	class="rank-name">${r.nome}${r.id	===	aluno.id	?	'	(você)'	:	''}</span>
												<span	class="rank-points">${r.pontos}</span>
										</div>`).join('');
				}
				const	txList	=	document.getElementById('txList');
				if	(txList)	{
						txList.innerHTML	=	extrato.length	===	0
								?	'<p	class="empty-state">Nenhuma	movimentação	ainda.</p>'
								:	extrato.map(tx	=>	{
										const	out	=	tx.tipo	===	'debito';
										return	`
												<div	class="tx-row">
														<span	class="tx-icon	${out	?	'is-out'	:	''}">${out	?	iconOut	:	iconIn}</span>
														<span	class="tx-main">
																<span	class="t-label">${tx.motivo}</span>
																<span	class="t-date">${NewBitStore.formatDateTime(tx.data)}</span>
														</span>
														<span	class="tx-amount	${out	?	'is-out'	:	''}">${out	?	'-'	:	'+'}${tx.valor}</span>
												</div>`;
								}).join('');
				}
				const	storeGrid	=	document.getElementById('storeGrid');
				if	(storeGrid)	{
						storeGrid.innerHTML	=	produtos.map(item	=>	`
								<div	class="store-card">
										<div	class="store-thumb">${iconStore}</div>
										<span	class="store-name">${item.nome}</span>
										<span	class="store-price">${item.preco}	New-Bits</span>
										<button	class="store-btn"	data-produto="${item.id}"	${item.preco	>	saldo	?	'disabled'	:	''}>
												${item.preco	>	saldo	?	'Saldo	insuficiente'	:	'Trocar'}
										</button>
								</div>`).join('');
						storeGrid.querySelectorAll('[data-produto]').forEach(btn	=>	{
								btn.addEventListener('click',	()	=>	{
										const	produto	=	produtos.find(p	=>	p.id	===	Number(btn.dataset.produto));
										if	(!produto)	return;
										if	(!confirm(`Trocar	${produto.preco}	New-Bits	por	"${produto.nome}"?`))	return;
										const	resultado	=	NewBitStore.resgatarProduto({	alunoId:	aluno.id,	produtoId:	produto.id	});
										alert(resultado.message);
										renderTudo();
								});
						});
				}
				const	penaltyList	=	document.getElementById('penaltyList');
				if	(penaltyList)	{
						const	penalidades	=	extrato.filter(tx	=>	tx.origem	===	'penalidade');
						penaltyList.innerHTML	=	penalidades.length	===	0
								?	'<p	class="empty-state">Nenhuma	penalidade	registrada.	Continue	assim!</p>'
								:	penalidades.map(p	=>	`
										<div	class="tx-row">
												<span	class="tx-icon	is-out">${iconOut}</span>
												<span	class="tx-main">
														<span	class="t-label">${p.motivo}</span>
														<span	class="t-date">${NewBitStore.formatDateTime(p.data)}</span>
												</span>
												<span	class="tx-amount	is-out">-${p.valor}</span>
										</div>`).join('');
				}
		}
		renderTudo();
		const	feedbackBtn	=	document.getElementById('openFeedback');
		const	feedbackModal	=	document.getElementById('feedbackModal');
		if	(feedbackBtn	&&	feedbackModal)	{
				feedbackBtn.addEventListener('click',	()	=>	feedbackModal.classList.add('is-open'));
				feedbackModal.addEventListener('click',	(event)	=>	{	if	(event.target	===	feedbackModal)	feedbackModal.classList.remove('is-open');	});
				const	cancelBtn	=	document.getElementById('feedbackCancel');
				if	(cancelBtn)	cancelBtn.addEventListener('click',	()	=>	feedbackModal.classList.remove('is-open'));
				const	sendBtn	=	document.getElementById('feedbackEnviar');
				if	(sendBtn)	{
						sendBtn.addEventListener('click',	()	=>	{
								const	nota	=	document.getElementById('feedbackNota').value;
								const	comentario	=	document.getElementById('feedbackComentario').value;
								NewBitStore.addFeedback({	alunoId:	aluno.id,	nota,	comentario	});
								feedbackModal.classList.remove('is-open');
								document.getElementById('feedbackComentario').value	=	'';
								alert('Obrigado!	Sua	avaliação	foi	enviada.');
						});
				}
		}
});
