// New-Bit — Painel do Aluno
// Dados de exemplo (mock) — troque pelas chamadas reais à API quando o backend existir.

document.addEventListener('DOMContentLoaded', () => {

  const ranking = [
    { name: 'Ana Silva', points: 460, me: true },
    { name: 'Bruno Souza', points: 340 },
    { name: 'Carlos Lima', points: 95 },
  ];

  const extrato = [
    { label: 'Presença — acolhimento', date: 'Hoje, 07:32', amount: 10, out: false },
    { label: 'Participação em aula', date: 'Ontem', amount: 15, out: false },
    { label: 'Troca: caderno personalizado', date: '18/08', amount: 80, out: true },
    { label: 'Presença — acolhimento', date: '18/08', amount: 10, out: false },
    { label: 'Penalidade: atraso', date: '15/08', amount: 5, out: true },
  ];

  const loja = [
    { name: 'Caderno personalizado', price: 80 },
    { name: 'Lanche da cantina', price: 30 },
    { name: 'Cupom de passeio', price: 200 },
    { name: 'Kit de material', price: 60 },
  ];

  const penalidades = [
    { label: 'Atraso no acolhimento', date: '15/08', amount: 5 },
  ];

  const iconIn = '<svg viewBox="0 0 24 24"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
  const iconOut = '<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>';
  const iconStore = '<svg viewBox="0 0 24 24"><path d="M4 8l1.5-4h13L20 8"/><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8z"/></svg>';

  const balance = extrato.reduce((sum, tx) => sum + (tx.out ? -tx.amount : tx.amount), 0);

  const balanceEl = document.getElementById('balanceValue');
  if (balanceEl) balanceEl.textContent = balance;

  const rankingList = document.getElementById('rankingList');
  if (rankingList) {
    if (ranking.length === 0) {
      rankingList.innerHTML = '<p class="empty-state">Nenhum aluno na turma ainda.</p>';
    } else {
      rankingList.innerHTML = ranking
        .sort((a, b) => b.points - a.points)
        .map((r, i) => `
          <div class="rank-row ${r.me ? 'is-me' : ''}">
            <span class="rank-pos">${i + 1}º</span>
            <span class="rank-name">${r.name}${r.me ? ' (você)' : ''}</span>
            <span class="rank-points">${r.points}</span>
          </div>
        `).join('');
    }
  }

  const txList = document.getElementById('txList');
  if (txList) {
    if (extrato.length === 0) {
      txList.innerHTML = '<p class="empty-state">Nenhuma movimentação ainda.</p>';
    } else {
      txList.innerHTML = extrato.map(tx => `
        <div class="tx-row">
          <span class="tx-icon ${tx.out ? 'is-out' : ''}">${tx.out ? iconOut : iconIn}</span>
          <span class="tx-main">
            <span class="t-label">${tx.label}</span>
            <span class="t-date">${tx.date}</span>
          </span>
          <span class="tx-amount ${tx.out ? 'is-out' : ''}">${tx.out ? '-' : '+'}${tx.amount}</span>
        </div>
      `).join('');
    }
  }

  const storeGrid = document.getElementById('storeGrid');
  if (storeGrid) {
    storeGrid.innerHTML = loja.map(item => `
      <div class="store-card">
        <div class="store-thumb">${iconStore}</div>
        <span class="store-name">${item.name}</span>
        <span class="store-price">${item.price} New-Bits</span>
        <button class="store-btn" ${item.price > balance ? 'disabled' : ''}>
          ${item.price > balance ? 'Saldo insuficiente' : 'Trocar'}
        </button>
      </div>
    `).join('');
  }

  const penaltyList = document.getElementById('penaltyList');
  if (penaltyList) {
    if (penalidades.length === 0) {
      penaltyList.innerHTML = '<p class="empty-state">Nenhuma penalidade registrada. Continue assim!</p>';
    } else {
      penaltyList.innerHTML = penalidades.map(p => `
        <div class="tx-row">
          <span class="tx-icon is-out">${iconOut}</span>
          <span class="tx-main">
            <span class="t-label">${p.label}</span>
            <span class="t-date">${p.date}</span>
          </span>
          <span class="tx-amount is-out">-${p.amount}</span>
        </div>
      `).join('');
    }
  }

  const feedbackBtn = document.getElementById('openFeedback');
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      alert('Ponto de integração: abrir formulário de avaliação do site.');
    });
  }

});
