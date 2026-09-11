# olhar.iaipsi.com

Protocolo assíncrono de autodesenvolvimento psicanalítico.  
30 situações de reflexão → devolutiva com hipóteses → ações semanais → ciclo contínuo.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (banco + auth + storage)
- **Vercel** (deploy)
- **Anthropic API** (geração de hipóteses e análise)
- **Tailwind CSS**

## Setup local

```bash
# 1. Clone e instale
git clone https://github.com/psicanalistaadilsoncosta-boop/olhar-iaipsi
cd olhar-iaipsi
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha com os valores do Supabase e Anthropic

# 3. Rode o schema no Supabase
# Cole o conteúdo de supabase/schema.sql no SQL Editor do projeto

# 4. Inicie o servidor
npm run dev
```

## Estrutura

```
app/
  (protocolo)/
    page.jsx              → boas-vindas
    questionario/
      page.jsx            → engine das 30 situações
    enviado/
      page.jsx            → confirmação de envio
    devolutiva/           → (próxima fase)

components/
  protocolo/
    QuestionCard.jsx      → card de situação
    InputText.jsx         → dissertativo + microfone
    InputOptions.jsx      → cards / pílulas / escala
    ProgressRing.jsx      → anel de progresso

lib/
  questions.js            → 30 situações com metadados
  supabase/
    client.js             → cliente browser

supabase/
  schema.sql              → tabelas + RLS
```

## Subdomínio no Vercel

No painel do projeto Vercel:  
Settings → Domains → Add → `olhar.iaipsi.com`

No DNS do iaipsi.com adicionar:  
`CNAME olhar cname.vercel-dns.com`

## Próximas fases

- [ ] Painel do analista (respostas + IA + envio de devolutiva)
- [ ] Tela de devolutiva do paciente (enunciado + "como isso soa?" + ações)
- [ ] Módulo de interações semanais assíncronas
- [ ] Onboarding com coleta de nome/email antes do questionário
- [ ] Autenticação do analista
- [ ] Supervisão (Adilson revisa analistas parceiros)
