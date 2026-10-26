# New-Bit

Sistema de pontos (New-Bits) para a escola: painéis de **aluno**, **professor** e **administrador**, mais o **check-in de presença** (tablet do pátio).

Site: https://karolinerodrigues-source.github.io/New-Bit/

## Como os dados são salvos

Os dados ficam em um banco **Supabase**, iguais em qualquer computador, celular ou tablet.

- `supabase.sql`: cria as tabelas e as funções do banco (rodar uma vez no *SQL Editor* do Supabase).
- `js/store.js`: conversa com o banco. Contém a URL do projeto e a chave **pública** (publishable), que pode ficar no código.
- As tabelas não são acessíveis diretamente: o site só usa funções `nb_*`, que conferem login e perfil.
- Senhas são guardadas criptografadas. A senha de um aluno ou professor só aparece uma vez, no cadastro; depois, o administrador pode gerar uma nova.

**Nunca** coloque no código a chave `service_role` nem a senha do banco.

## Primeira configuração

1. No Supabase, abra *SQL Editor*, cole o conteúdo de `supabase.sql` e clique em *Run*.
2. Crie o administrador rodando este comando (troque `SUA-SENHA-AQUI`; **não** salve a senha no GitHub):

   ```sql
   insert into nb.admins (nome, login, senha_hash)
   values ('Administrador', 'admin.master', extensions.crypt('SUA-SENHA-AQUI', extensions.gen_salt('bf')));
   ```
3. Entre em `login.html` pelo perfil **Administrador** com `admin.master@escola.pr.gov.br` e a senha escolhida.

## Check-in (tablet)

`checkin.html` exige um professor ou administrador logado no tablet. Se abrir sem login, ele leva para a tela de entrada e volta ao check-in depois.
