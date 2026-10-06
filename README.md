# New-Bit — Tela Inicial + Login

Protótipo web (HTML/CSS/JS puro, sem instalação nem build) das duas primeiras telas do
sistema New-Bit: a tela inicial (brasão/emblema) e a tela de login com seleção de perfil
(Aluno / Professor / Administrador).

## Como abrir no VS Code

1. Abra a pasta `new-bit` no VS Code (`File > Open Folder...`).
2. Instale a extensão **Live Server** (de Ritwick Dey), se ainda não tiver.
3. Clique com o botão direito em `index.html` → **Open with Live Server**.
4. O navegador abre em `http://127.0.0.1:5500` (ou porta parecida) e atualiza sozinho
   a cada vez que você salvar um arquivo.

Não precisa de Node, npm nem nenhum outro programa instalado — é só HTML, CSS e JS.

## Estrutura

```
new-bit/
├─ index.html          → tela inicial (emblema + botão Entrar)
├─ login.html          → tela de login (abas Aluno/Professor/Administrador)
├─ aluno.html           → Painel do Aluno (saldo, extrato, ranking, loja, penalidades)
├─ professor.html       → Painel do Professor (turmas, alunos, dar/tirar pontos)
├─ css/style.css        → visual base (cores, tipografia, animações, telas estreitas)
├─ css/dashboard.css    → visual dos painéis (cards, tabelas, modal)
├─ js/app.js            → interações da tela inicial e do login (agora navega para o painel certo)
├─ js/aluno.js          → dados de exemplo e renderização do Painel do Aluno
├─ js/professor.js      → dados de exemplo, lista de alunos e modal de pontos
└─ assets/              → pasta vazia, reservada para imagens/ícones futuros
```

## O que já funciona

- Tela inicial com emblema animado (SVG, sem imagens externas) e botão **Entrar**.
- Tela de login com 3 abas de perfil, campo de senha com "mostrar/ocultar" e
  validação simples. Ao clicar em **Acessar**, o login **Aluno** leva direto para
  `aluno.html` e **Professor** leva para `professor.html` (o perfil Administrador
  ainda não tem painel — é o próximo a construir).
- **Painel do Aluno**: saldo em destaque, extrato de movimentações, ranking da
  turma (com o próprio aluno destacado), vitrine da loja (bloqueia "Trocar" se o
  saldo for insuficiente) e lista de penalidades.
- **Painel do Professor**: cartões com nº de alunos, total e média de pontos e
  limite restante no mês; lista de alunos com busca; botões **+ / −** que abrem um
  modal para dar ou tirar pontos, com **justificativa obrigatória apenas ao tirar
  pontos** (como pedido no cronograma do projeto); feed de atividade recente.

Todos os dados nessas duas telas são **mocks** (arrays no início de `aluno.js` e
`professor.js`) — é só editar esses arrays para testar outros cenários antes de
existir backend.

## Próximos passos sugeridos

- **Painel do Administrador**: cadastro de turmas/alunos/professores/produtos e
  termo de consentimento LGPD.
- **Autenticação real**: trocar a simulação em `js/app.js` por uma chamada `fetch`
  para o backend (ou Firebase/Supabase, se não quiserem manter servidor próprio).
- **Leitura de QR Code**: para a tela de check-in no tablet do pátio, a lib
  `html5-qrcode` (mesma usada no Bit-B) lê a câmera direto do navegador — não
  precisa de Java para isso.
- **Persistir os dados**: hoje os pontos dados/tirados no Painel do Professor só
  vivem na memória da aba aberta — somem ao recarregar a página. Isso resolve
  quando o backend entrar.

Qualquer uma dessas telas eu monto seguindo o mesmo estilo visual (o brasão dourado
sobre fundo azul-marinho) — é só pedir qual entra a seguir.
