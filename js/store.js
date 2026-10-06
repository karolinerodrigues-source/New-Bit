//	New-Bit	—	Camada	de	dados	compartilhada	(js/store.js)
//	Fonte	única	de	verdade	para	todas	as	telas:	aluno.html,	professor.html,
//	admin.html	e	checkin.html.	Usa	localStorage	para	persistir	entre	páginas
//	e	recarregamentos	(ponto	de	integração:	trocar	por	chamadas	fetch()	a	uma
//	API	real	quando	o	backend	em	Java	existir).
const	NewBitStore	=	(()	=>	{
		const	STORAGE_KEY	=	'newbit_state_v1';
		const	SESSION_KEY	=	'newbit_session_v1';
		const	TURMAS	=	['6º	Ano',	'7º	Ano',	'8º	Ano',	'9º	Ano',	'1ª	Série	EM',	'2ª	Série	EM',	'3ª	Série	EM'];
		function	normalize(str)	{
				return	(str	||	'')
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g,	'')
						.toLowerCase()
						.replace(/[^a-z]/g,	'');
		}
		function	gerarLogin(nomeCompleto)	{
				const	partes	=	nomeCompleto.trim().split(/\s+/).filter(Boolean);
				const	primeiro	=	normalize(partes[0]	||	'');
				const	ultimo	=	partes.length	>	1	?	normalize(partes[partes.length	-	1])	:	primeiro;
				return	`${primeiro}.${ultimo}`;
		}
		function	gerarSenha(nomeCompleto)	{
				const	partes	=	nomeCompleto.trim().split(/\s+/).filter(Boolean);
				const	primeiro	=	normalize(partes[0]	||	'');
				return	`${primeiro}123`;
		}
		function	initials(name)	{
				return	(name	||	'').split('	').filter(Boolean).slice(0,	2).map(w	=>	w[0]).join('').toUpperCase();
		}
		function	mesAtual(date	=	new	Date())	{
				return	`${date.getFullYear()}-${String(date.getMonth()	+	1).padStart(2,	'0')}`;
		}
		function	diaAtual(date	=	new	Date())	{
				return	`${date.getFullYear()}-${String(date.getMonth()	+	1).padStart(2,	'0')}-${String(date.getDate()).padStart(2,	'0')}`;
		}
		function	formatDateTime(iso)	{
				const	d	=	new	Date(iso);
				const	hoje	=	diaAtual();
				const	diaISO	=	diaAtual(d);
				const	hora	=	`${String(d.getHours()).padStart(2,	'0')}:${String(d.getMinutes()).padStart(2,	'0')}`;
				if	(diaISO	===	hoje)	return	`Hoje,	${hora}`;
				return	`${String(d.getDate()).padStart(2,	'0')}/${String(d.getMonth()	+	1).padStart(2,	'0')}`;
		}
		function	seedState()	{
				const	now	=	Date.now();
				const	dias	=	(n)	=>	new	Date(now	-	n	*	86400000).toISOString();
				return	{
						admins:	[
								{	id:	1,	nome:	'Administrador',	login:	'admin.master',	senha:	'admin123'	}
						],
						professores:	[
								{	id:	1,	nome:	'Bruno	Souza',	login:	'bruno.souza',	senha:	'bruno123',	turmas:	['6º	Ano',	'7º	Ano'],	limiteMensal:	300	}
						],
						alunos:	[
								{	id:	1,	nome:	'Ana	Silva',	login:	'ana.silva',	senha:	'ana123',	turma:	'6º	Ano'	},
								{	id:	2,	nome:	'Carlos	Lima',	login:	'carlos.lima',	senha:	'carlos123',	turma:	'6º	Ano'	},
								{	id:	3,	nome:	'Duda	Ferreira',	login:	'duda.ferreira',	senha:	'duda123',	turma:	'7º	Ano'	},
						],
						produtos:	[
								{	id:	1,	nome:	'Caderno	personalizado',	preco:	80	},
								{	id:	2,	nome:	'Lanche	da	cantina',	preco:	30	},
								{	id:	3,	nome:	'Cupom	de	passeio',	preco:	200	},
								{	id:	4,	nome:	'Kit	de	material',	preco:	60	},
		],
						movimentacoes:	[
								{	id:	1,	alunoId:	1,	tipo:	'credito',	valor:	10,	motivo:	'Presença	—	acolhimento',	origem:	'presenca',	data:	dias(4)	},
								{	id:	2,	alunoId:	1,	tipo:	'credito',	valor:	15,	motivo:	'Participação	em	aula',	origem:	'professor',	professorId:	1,	data:	dias(3)	},
								{	id:	3,	alunoId:	1,	tipo:	'debito',	valor:	5,	motivo:	'Penalidade:	atraso',	origem:	'penalidade',	professorId:	1,	data:	dias(3)	},
								{	id:	4,	alunoId:	1,	tipo:	'credito',	valor:	10,	motivo:	'Presença	—	acolhimento',	origem:	'presenca',	data:	dias(1)	},
								{	id:	5,	alunoId:	2,	tipo:	'credito',	valor:	10,	motivo:	'Presença	—	acolhimento',	origem:	'presenca',	data:	dias(2)	},
						],
						feedbacks:	[],
						nextIds:	{	aluno:	4,	professor:	2,	produto:	5,	movimentacao:	6,	feedback:	1	}
				};
		}
		function	loadState()	{
				try	{
						const	raw	=	localStorage.getItem(STORAGE_KEY);
						if	(!raw)	{
								const	seeded	=	seedState();
								saveState(seeded);
								return	seeded;
						}
						return	JSON.parse(raw);
				}	catch	(e)	{
						console.error('New-Bit:	falha	ao	ler	o	estado	salvo,	recriando	dados	de	exemplo.',	e);
						const	seeded	=	seedState();
						saveState(seeded);
						return	seeded;
				}
		}
		function	saveState(state)	{
				localStorage.setItem(STORAGE_KEY,	JSON.stringify(state));
		}
		function	getState()	{
				return	loadState();
		}
		function	resetState()	{
				const	seeded	=	seedState();
				saveState(seeded);
				return	seeded;
		}
		function	setSession(user)	{
				sessionStorage.setItem(SESSION_KEY,	JSON.stringify(user));
		}
		function	getSession()	{
				try	{
						const	raw	=	sessionStorage.getItem(SESSION_KEY);
						return	raw	?	JSON.parse(raw)	:	null;
				}	catch	(e)	{
						return	null;
				}
		}
		function	clearSession()	{
				sessionStorage.removeItem(SESSION_KEY);
		}
		function	authenticate(role,	login,	senha)	{
				const	state	=	loadState();
				const	loginNorm	=	(login	||	'').trim().toLowerCase();
				let	pessoa	=	null;
				if	(role	===	'aluno')	pessoa	=	state.alunos.find(a	=>	a.login	===	loginNorm	&&	a.senha	===	senha);
				else	if	(role	===	'professor')	pessoa	=	state.professores.find(p	=>	p.login	===	loginNorm	&&	p.senha	===	senha);
				else	if	(role	===	'admin')	pessoa	=	state.admins.find(a	=>	a.login	===	loginNorm	&&	a.senha	===	senha);
				if	(!pessoa)	return	null;
				const	user	=	{	id:	pessoa.id,	role,	nome:	pessoa.nome,	login:	pessoa.login	};
				setSession(user);
				return	user;
		}
		function	addAluno({	nome,	turma	})	{
				const	state	=	loadState();
				const	novo	=	{	id:	state.nextIds.aluno++,	nome,	turma,	login:	gerarLogin(nome),	senha:	gerarSenha(nome)	};
				state.alunos.push(novo);
				saveState(state);
				return	novo;
		}
		function	getAluno(alunoId)	{
				return	loadState().alunos.find(a	=>	a.id	===	Number(alunoId))	||	null;
		}
		function	getAlunosDaTurma(turma)	{
				return	loadState().alunos.filter(a	=>	a.turma	===	turma);
		}
		function	addProfessor({	nome,	turmas,	limiteMensal	})	{
				const	state	=	loadState();
				const	novo	=	{	id:	state.nextIds.professor++,	nome,	turmas,	limiteMensal:	Number(limiteMensal)	||	300,	login:	gerarLogin(nome),	senha:	gerarSenha(nome)	};
				state.professores.push(novo);
				saveState(state);
				return	novo;
		}
		function	getProfessor(professorId)	{
				return	loadState().professores.find(p	=>	p.id	===	Number(professorId))	||	null;
		}
		function	addProduto({	nome,	preco	})	{
				const	state	=	loadState();
				const	novo	=	{	id:	state.nextIds.produto++,	nome,	preco:	Number(preco)	};
				state.produtos.push(novo);
				saveState(state);
				return	novo;
		}
		function	addMovimentacao(state,	{	alunoId,	tipo,	valor,	motivo,	origem,	professorId	})	{
				const	mov	=	{	id:	state.nextIds.movimentacao++,	alunoId:	Number(alunoId),	tipo,	valor:	Math.abs(Number(valor)),	motivo,	origem,	professorId:	professorId	||	null,	data:	new	
Date().toISOString()	};
				state.movimentacoes.push(mov);
				return	mov;
		}
		function	getExtrato(alunoId)	{
				return	loadState().movimentacoes
						.filter(m	=>	m.alunoId	===	Number(alunoId))
						.sort((a,	b)	=>	new	Date(b.data)	-	new	Date(a.data));
		}
		function	getSaldo(alunoId)	{
				return	getExtrato(alunoId).reduce((sum,	m)	=>	sum	+	(m.tipo	===	'debito'	?	-m.valor	:	m.valor),	0);
		}
		function	getRanking(turma)	{
				return	getAlunosDaTurma(turma)
						.map(a	=>	({	id:	a.id,	nome:	a.nome,	pontos:	getSaldo(a.id)	}))
						.sort((a,	b)	=>	b.pontos	-	a.pontos);
		}
		function	registrarPresenca(codigoOuLogin)	{
				const	state	=	loadState();
				const	login	=	(codigoOuLogin	||	'').trim().toLowerCase();
				const	aluno	=	state.alunos.find(a	=>	a.login	===	login);
				if	(!aluno)	return	{	ok:	false,	message:	'Cartão	não	reconhecido.	Verifique	o	cadastro	do	aluno.'	};
				const	jaRegistrado	=	state.movimentacoes.some(m	=>
						m.alunoId	===	aluno.id	&&	m.origem	===	'presenca'	&&	diaAtual(new	Date(m.data))	===	diaAtual()
				);
				if	(jaRegistrado)	{
						return	{	ok:	false,	message:	`${aluno.nome}	já	registrou	presença	hoje.`,	aluno,	saldo:	getSaldo(aluno.id)	};
				}
				addMovimentacao(state,	{	alunoId:	aluno.id,	tipo:	'credito',	valor:	10,	motivo:	'Presença	—	acolhimento',	origem:	'presenca'	});
				saveState(state);
				return	{	ok:	true,	message:	`Presença	registrada	para	${aluno.nome}.`,	aluno,	saldo:	getSaldo(aluno.id)	};
		}
		function	limiteInfo(professorId)	{
				const	professor	=	getProfessor(professorId);
				if	(!professor)	return	{	limite:	0,	usado:	0,	restante:	0	};
				const	mes	=	mesAtual();
				const	usado	=	loadState().movimentacoes
						.filter(m	=>	m.professorId	===	Number(professorId)	&&	m.tipo	===	'credito'	&&	m.origem	===	'professor'	&&	mesAtual(new	Date(m.data))	===	mes)
						.reduce((sum,	m)	=>	sum	+	m.valor,	0);
				return	{	limite:	professor.limiteMensal,	usado,	restante:	Math.max(0,	professor.limiteMensal	-	usado)	};
		}
		function	darPontos({	professorId,	alunoId,	delta,	motivo	})	{
				if	(!delta)	return	{	ok:	false,	message:	'Informe	uma	quantidade	diferente	de	zero.'	};
				if	(!motivo	||	!motivo.trim())	return	{	ok:	false,	message:	'Escreva	uma	justificativa.'	};
				const	state	=	loadState();
				const	aluno	=	state.alunos.find(a	=>	a.id	===	Number(alunoId));
				if	(!aluno)	return	{	ok:	false,	message:	'Aluno	não	encontrado.'	};
				if	(delta	>	0)	{
						const	info	=	limiteInfo(professorId);
						if	(delta	>	info.restante)	{
								return	{	ok:	false,	message:	`Limite	mensal	insuficiente.	Restam	${info.restante}	New-Bits	para	distribuir	este	mês.`	};
						}
						addMovimentacao(state,	{	alunoId,	tipo:	'credito',	valor:	delta,	motivo,	origem:	'professor',	professorId	});
				}	else	{
						addMovimentacao(state,	{	alunoId,	tipo:	'debito',	valor:	Math.abs(delta),	motivo,	origem:	'penalidade',	professorId	});
				}
				saveState(state);
				return	{	ok:	true,	message:	'Lançamento	registrado.',	saldo:	getSaldo(alunoId)	};
		}
		function	resgatarProduto({	alunoId,	produtoId	})	{
				const	state	=	loadState();
				const	produto	=	state.produtos.find(p	=>	p.id	===	Number(produtoId));
				if	(!produto)	return	{	ok:	false,	message:	'Produto	não	encontrado.'	};
				const	saldo	=	getSaldo(alunoId);
				if	(saldo	<	produto.preco)	return	{	ok:	false,	message:	'Saldo	insuficiente	para	essa	troca.'	};
				addMovimentacao(state,	{	alunoId,	tipo:	'debito',	valor:	produto.preco,	motivo:	`Troca:	${produto.nome}`,	origem:	'loja'	});
				saveState(state);
				return	{	ok:	true,	message:	`Troca	realizada:	${produto.nome}.`,	saldo:	getSaldo(alunoId)	};
		}
		function	addFeedback({	alunoId,	nota,	comentario	})	{
				const	state	=	loadState();
				const	novo	=	{	id:	state.nextIds.feedback++,	alunoId,	nota:	Number(nota),	comentario:	(comentario	||	'').trim(),	data:	new	Date().toISOString()	};
				state.feedbacks.push(novo);
				saveState(state);
				return	novo;
		}
		return	{
				TURMAS,	gerarLogin,	gerarSenha,	initials,	formatDateTime,
				getState,	saveState,	resetState,
				setSession,	getSession,	clearSession,
				authenticate,
				addAluno,	getAluno,	getAlunosDaTurma,
				addProfessor,	getProfessor,
				addProduto,
				getExtrato,	getSaldo,	getRanking,
				registrarPresenca,
				limiteInfo,	darPontos,
				resgatarProduto,
				addFeedback
		};
})();
