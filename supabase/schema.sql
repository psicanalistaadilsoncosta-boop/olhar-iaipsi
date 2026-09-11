-- ============================================================
-- olhar.iaipsi.com — Schema Supabase
-- ============================================================

-- RESPONDENTES
-- Cada pessoa que inicia o protocolo
create table if not exists olhar_respondentes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  nome          text,                        -- opcional, preenchido na entrada
  email         text,                        -- para envio da devolutiva
  telefone      text,                        -- opcional
  plano         text default 'base',         -- base | plus | premium
  analista_id   uuid references auth.users,  -- analista responsável
  status        text default 'questionario', -- questionario | aguardando | devolutiva | ativo | encerrado
  ciclo_atual   int default 1,
  proxima_sessao date,
  notas_internas text                        -- visível só para o analista
);

-- RESPOSTAS DO QUESTIONÁRIO
-- Uma linha por situação respondida
create table if not exists olhar_respostas (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  respondente_id  uuid references olhar_respondentes not null,
  ciclo           int default 1,
  situacao_index  int not null,              -- 0–29
  bloco           text not null,             -- Presença | Vínculos | etc.
  tipo_resposta   text not null,             -- text | images | select | scale | skip
  resposta_texto  text,                      -- dissertativa ou transcrição de voz
  resposta_opcao  int,                       -- índice da opção selecionada
  pulada          boolean default false,
  audio_url       text                       -- URL do áudio no Storage (se ditado)
);

-- DEVOLUTIVAS
-- Uma por ciclo, gerada pela IA e revisada pelo analista
create table if not exists olhar_devolutivas (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  enviada_at      timestamptz,
  respondente_id  uuid references olhar_respondentes not null,
  ciclo           int default 1,
  analista_id     uuid references auth.users,

  -- gerado pela IA
  analise_ia      text,                      -- análise interna (visível só para analista)
  tags_ia         text[],                    -- ex: ['Self fragmentado', 'Ambivalência objetal']
  opcoes_enunciado jsonb,                    -- array de 3 textos gerados pela IA

  -- escolhido/editado pelo analista
  enunciado_final text,                      -- texto enviado ao paciente
  acoes           jsonb,                     -- [{tipo, texto}] — 3 a 4 itens
  nota_supervisor text,                      -- nota interna do supervisor (Adilson)

  -- resposta do paciente
  resposta_paciente     text,
  resposta_paciente_at  timestamptz,
  audio_paciente_url    text,

  status          text default 'rascunho'    -- rascunho | enviada | respondida
);

-- INTERAÇÕES ASSÍNCRONAS
-- Mensagens semanais além das devolutivas formais
create table if not exists olhar_interacoes (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  respondente_id  uuid references olhar_respondentes not null,
  ciclo           int default 1,
  origem          text not null,             -- analista | paciente
  tipo            text default 'mensagem',   -- mensagem | lembrete | reflexao
  conteudo        text,
  audio_url       text,
  lida            boolean default false
);

-- RLS — apenas o analista responsável acessa os dados do seu paciente
alter table olhar_respondentes enable row level security;
alter table olhar_respostas    enable row level security;
alter table olhar_devolutivas  enable row level security;
alter table olhar_interacoes   enable row level security;

create policy "analista acessa seus respondentes"
  on olhar_respondentes for all
  using (analista_id = auth.uid());

create policy "analista acessa respostas dos seus respondentes"
  on olhar_respostas for all
  using (
    respondente_id in (
      select id from olhar_respondentes where analista_id = auth.uid()
    )
  );

create policy "analista acessa devolutivas dos seus respondentes"
  on olhar_devolutivas for all
  using (
    respondente_id in (
      select id from olhar_respondentes where analista_id = auth.uid()
    )
  );

create policy "analista acessa interacoes dos seus respondentes"
  on olhar_interacoes for all
  using (
    respondente_id in (
      select id from olhar_respondentes where analista_id = auth.uid()
    )
  );

-- Respondente acessa somente os próprios dados via token anônimo
-- (implementado via link tokenizado — sem login para o paciente)
