# Pocabin

Binder digital para organizar coleções de cards (photocards de K-pop, Pokémon, sports cards, Yu-Gi-Oh!, MTG…) com um **repositório de imagens** no backend.

O frontend nasceu do protótipo feito no Claude Design (`design/binder-organizer.html`, guardado como referência visual) e foi convertido em um app React de verdade, agora persistindo tudo numa API.

## Estrutura

```
pocabin/
├── backend/             API Node.js + Express + SQLite
│   ├── src/
│   │   ├── app.js         rotas HTTP
│   │   ├── binders.js     binders → folhas (sheets) → cards
│   │   ├── images.js      repositório de imagens (disco + metadados)
│   │   ├── db.js          schema e migrações (SQLite)
│   │   ├── seed-data.js   coleção demo do protótipo
│   │   └── server.js
│   └── test/            testes da API (node:test)
├── frontend/            React 18 + Vite
│   └── src/
│       ├── App.jsx        estado da aplicação, conectado à API
│       ├── components/    componentes do protótipo (core, modals, BinderView, views, stats-scanner)
│       ├── lib/api.js     cliente HTTP
│       ├── lib/theme.js   valores escolhidos no painel "Tweaks" do Claude Design
│       └── styles.css     CSS original do design
└── design/              HTML exportado do Claude Design (referência)
```

## Rodando

Requer Node.js 20+.

```bash
npm install
```

```bash
npm run dev
```

- Frontend: http://localhost:5173 (o Vite faz proxy de `/api` para o backend)
- API: http://localhost:4000/api

No primeiro boot, com o banco vazio, a API cria os binders de demonstração do protótipo. Para voltar ao estado demo a qualquer momento (apaga todos os binders):

```bash
npm run seed
```

Produção (a API serve o frontend compilado na mesma porta):

```bash
npm run build && npm start
```

Testes da API:

```bash
npm test
```

### Variáveis de ambiente (backend)

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `4000` | Porta da API |
| `POCABIN_DATA_DIR` | `backend/data` | Onde ficam o banco (`pocabin.db`) e as imagens (`uploads/`) |
| `POCABIN_MAX_UPLOAD_MB` | `15` | Tamanho máximo por imagem |
| `POCABIN_SEED_DEMO` | `true` | Popular com a coleção demo quando o banco está vazio |

## Modelo de dados

Um **binder** é uma lista ordenada de **folhas** (sheets); cada folha tem frente e verso, e cada face tem `N` slots conforme o grid (1×1, 2×2 ou 3×3). As capas são implícitas, então `N` folhas viram `N+1` spreads na tela. Cada slot vazio é `null` ou um **card**:

```json
{ "mode": "image", "image": "/api/images/<id>/file", "color": "#ffd1dc",
  "sleeve": { "type": "holographic", "color": "#ffffff" },
  "status": "have", "notes": "", "meta": { "member": "Minji", "album": "Get Up" } }
```

`meta` segue o schema do tipo de coleção (definido em `frontend/src/components/core.jsx` → `COLLECTIONS`). Grid e tipo de coleção são fixos depois que o binder é criado.

## Repositório de imagens

- Imagens ficam em disco em `uploads/<sha[0:2]>/<sha256>.<ext>`, com os metadados na tabela `images`.
- O endereçamento é por conteúdo (SHA-256): enviar os mesmos bytes duas vezes devolve a mesma imagem, sem duplicar.
- O tipo é detectado pelos bytes (PNG, JPEG, GIF, WebP, AVIF, SVG); o `Content-Type` enviado pelo cliente não é usado.
- Os arquivos são servidos com cache `immutable` e com uma CSP restritiva, para que um SVG aberto direto no navegador não execute scripts.
- Uma imagem em uso por algum card não pode ser apagada (`409`).
- No frontend, a imagem escolhida/recortada no modal de card é enviada para `POST /api/images` antes de salvar o card, e o card guarda só a URL.

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/binders` | Lista todos os binders (com folhas e cards) |
| POST | `/api/binders` | Cria: `{ name, gridType, sheetCount, collectionType, skin, colorId }` |
| GET / PATCH / DELETE | `/api/binders/:id` | Lê / edita (`name`, `skin`, `colorId`) / apaga |
| POST | `/api/binders/:id/sheets` | Adiciona folha: `{ index? }` (sem `index` = no final) |
| PATCH | `/api/binders/:id/sheets` | Reordena e renomeia: `{ order: [sheetId], renames: [{ sheetId, face, name }] }` |
| DELETE | `/api/binders/:id/sheets/:sheetId` | Remove folha (mínimo de 1) |
| PUT / DELETE | `/api/binders/:id/sheets/:sheetId/:face/:slot` | Grava / remove o card de um slot |
| GET | `/api/images?limit&offset` | Lista o repositório (com `usage` = nº de cards usando) |
| POST | `/api/images` | Upload `multipart/form-data`, campo `file` |
| GET | `/api/images/:id` | Metadados |
| GET | `/api/images/:id/file` | Arquivo |
| DELETE | `/api/images/:id` | Apaga, se não estiver em uso |

Toda mutação de binder responde com o binder completo atualizado.

## O que ainda é mock do protótipo

- **Community**: coleções de outros usuários são dados fixos.
- **Stats**: totais, completude e valor estimado são calculados dos binders reais; o gráfico "Value over time" e o "Recent activity" ainda são ilustrativos.
- **Scan cards (AI)**: simula o reconhecimento. O card "reconhecido" é gravado de verdade no binder escolhido.

## Próximos passos sugeridos

- Autenticação e binders por usuário (pré-requisito para a Community real)
- Storage de imagens em S3/R2 (o módulo `images.js` já isola essa parte)
- Thumbnails e conversão para WebP no upload
- Scanner real com um modelo de visão
- Histórico de atividade e de valor para alimentar o Stats
