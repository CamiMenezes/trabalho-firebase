# Login Web — Firebase Auth + Realtime Database

Aplicação web com autenticação e controle de acesso por cargo (admin e user) usando Firebase.

## Estrutura do Banco de Dados

```json
{
  "users": {
    "uid_do_usuario": {
      "email": "usuario@email.com",
      "cargo": "admin ou user",
      "criadoEm": "2024-01-01T00:00:00.000Z"
    }
  },
  "admin-data": {
    "uid_do_admin": {
      "email": "admin@email.com",
      "nivelAcesso": "total",
      "criadoEm": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Cargos e Acessos

| Funcionalidade        | Admin | User |
|-----------------------|-------|------|
| Ver perfil            | ✅    | ✅   |
| Editar perfil         | ✅    | ✅   |
| Ver histórico         | ✅    | ❌   |
| Ver todos usuários    | ✅    | ❌   |
| Relatórios            | ✅    | ❌   |
| Configurações         | ✅    | ❌   |
| Área admin-data       | ✅    | ❌   |

## Firebase Security Rules

- `/users` — cada usuário lê e escreve apenas os próprios dados. Admin lê todos.
- `/admin-data` — somente usuários com cargo admin têm acesso.

## Tecnologias

- HTML, CSS e JavaScript
- Firebase Authentication
- Firebase Realtime Database
- Firebase Security Rules

## Como rodar

1. Clone o repositório
2. Abra a pasta no VS Code
3. Instale a extensão Live Server
4. Clique com botão direito no `index.html` e selecione Open with Live Server