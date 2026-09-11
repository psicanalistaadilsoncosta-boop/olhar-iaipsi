// ============================================================
// olhar.iaipsi.com — 30 Situações do Protocolo
// Metadados técnicos visíveis somente para o analista
// ============================================================

export const BLOCOS = [
  'Presença',
  'Vínculos',
  'Trabalho e realizações',
  'Repetição',
  'Self e identidade',
  'Desejo e tempo',
]

export const QUESTIONS = [
  // ── BLOCO 1: PRESENÇA ──────────────────────────────────────
  {
    index: 0,
    bloco: 'Presença',
    type: 'text',
    text: 'Como você está chegando aqui hoje? Não o que está fazendo — mas o que está sentindo.',
    placeholder: 'Escreva o que vier... sem pressa, sem censura.',
    meta: { escola: 'Bion', conceito: 'Rêverie / continência', eixo: 'estado emocional de entrada' },
  },
  {
    index: 1,
    bloco: 'Presença',
    type: 'images',
    text: 'Se seu estado de espírito desta semana fosse uma paisagem, como ela seria?',
    options: [
      { emoji: '🌫️', label: 'Nebulosa' },
      { emoji: '🌊', label: 'Agitada' },
      { emoji: '🌅', label: 'Calma' },
      { emoji: '⛈️', label: 'Tempestuosa' },
      { emoji: '🌵', label: 'Árida' },
      { emoji: '🌸', label: 'Florescendo' },
    ],
    meta: { escola: 'Winnicott', conceito: 'Ambiente interno / estado do Self', eixo: 'tonalidade afetiva' },
  },
  {
    index: 2,
    bloco: 'Presença',
    type: 'text',
    text: 'Existe algo que você vem carregando em silêncio há algum tempo — algo que não compartilhou com ninguém?',
    placeholder: 'Pode ser qualquer coisa. Aqui é seguro.',
    meta: { escola: 'Bion', conceito: 'Elementos beta não metabolizados', eixo: 'conteúdo represado' },
  },
  {
    index: 3,
    bloco: 'Presença',
    type: 'scale',
    text: 'O quanto você consegue estar presente no momento em que está — sem estar mentalmente em outro lugar?',
    labels: ['Quase nunca', 'Às vezes', 'Frequentemente', 'Quase sempre'],
    meta: { escola: 'Bion/Winnicott', conceito: 'Capacidade de estar só / presença', eixo: 'qualidade de presença' },
  },
  {
    index: 4,
    bloco: 'Presença',
    type: 'text',
    text: 'Quando foi a última vez que você se sentiu verdadeiramente em paz? O que estava acontecendo naquele momento?',
    placeholder: 'Descreva a cena, o lugar, quem estava lá...',
    meta: { escola: 'Winnicott', conceito: 'Holding / ambiente suficientemente bom', eixo: 'referência de bem-estar' },
  },

  // ── BLOCO 2: VÍNCULOS ──────────────────────────────────────
  {
    index: 5,
    bloco: 'Vínculos',
    type: 'text',
    text: 'Pense nas relações mais importantes da sua vida agora. Qual delas te dá mais energia? Qual mais te esgota?',
    placeholder: 'Não precisa explicar — só nomear já diz muito.',
    meta: { escola: 'Relacional / Klein', conceito: 'Objetos bons e maus / transferência', eixo: 'campo relacional atual' },
  },
  {
    index: 6,
    bloco: 'Vínculos',
    type: 'select',
    text: 'Como você costuma agir quando alguém próximo te decepciona?',
    options: ['Guardo para mim', 'Falo na hora', 'Me afasto da pessoa', 'Fico ruminando', 'Tento entender o outro'],
    meta: { escola: 'Klein', conceito: 'Posição depressiva / cisão', eixo: 'manejo da decepção objetal' },
  },
  {
    index: 7,
    bloco: 'Vínculos',
    type: 'text',
    text: 'Existe alguém com quem você perdeu o contato — e ainda pensa nessa pessoa? O que ficou sem ser dito?',
    placeholder: 'Pode ser uma pessoa viva ou que já se foi...',
    meta: { escola: 'Freud / Luto', conceito: 'Elaboração do luto / objeto perdido', eixo: 'vínculos interrompidos' },
  },
  {
    index: 8,
    bloco: 'Vínculos',
    type: 'text',
    text: 'Em sua família de origem, como eram tratadas as emoções? Chorava-se? Discutia-se? Silenciava-se?',
    placeholder: 'Pense em cenas concretas, não em resumos...',
    meta: { escola: 'Winnicott / Relacional', conceito: 'Ambiente primitivo / transmissão geracional', eixo: 'clima emocional familiar de origem' },
  },
  {
    index: 9,
    bloco: 'Vínculos',
    type: 'scale',
    text: 'O quanto você se permite receber ajuda — sem sentir que isso te fragiliza ou te coloca em dívida?',
    labels: ['Muito difícil', 'Difícil', 'Com alguma facilidade', 'Com facilidade'],
    meta: { escola: 'Kohut', conceito: 'Dependência / selfobject / narcisismo', eixo: 'capacidade de receber' },
  },

  // ── BLOCO 3: TRABALHO E REALIZAÇÕES ───────────────────────
  {
    index: 10,
    bloco: 'Trabalho e realizações',
    type: 'text',
    text: 'Você sente que o que faz no trabalho ainda faz sentido para você — ou está funcionando no automático?',
    placeholder: 'Seja honesto. Ninguém vai julgar.',
    meta: { escola: 'Kohut', conceito: 'Self coeso / vitalidade / self fragmentado', eixo: 'sentido no trabalho' },
  },
  {
    index: 11,
    bloco: 'Trabalho e realizações',
    type: 'select',
    text: 'Quando você pensa em sua trajetória profissional, o que predomina?',
    options: ['Orgulho', 'Arrependimento', 'Ambivalência', 'Cansaço', 'Gratidão', 'Vazio'],
    meta: { escola: 'Freud / Kohut', conceito: 'Ideal do Ego / realização narcísica', eixo: 'avaliação da trajetória' },
  },
  {
    index: 12,
    bloco: 'Trabalho e realizações',
    type: 'text',
    text: 'Sua relação com dinheiro e segurança financeira — como ela é por dentro? O que o dinheiro representa para você?',
    placeholder: 'Liberdade? Poder? Ansiedade? Controle?',
    meta: { escola: 'Freud', conceito: 'Pulsão / anal / controle', eixo: 'significado do dinheiro' },
  },
  {
    index: 13,
    bloco: 'Trabalho e realizações',
    type: 'text',
    text: 'Existe algo que você conquistou e que ainda não se deu o direito de celebrar — ou comemorou por fora mas por dentro ficou vazio?',
    placeholder: 'O sucesso que não chegou a ser sentido...',
    meta: { escola: 'Kohut', conceito: 'Grandiosidade não integrada / narcisismo saudável', eixo: 'reconhecimento interno' },
  },
  {
    index: 14,
    bloco: 'Trabalho e realizações',
    type: 'scale',
    text: 'O quanto sua ambição e seus valores caminham juntos — ou você sente que às vezes precisou abrir mão de um pelo outro?',
    labels: ['Muito separados', 'Às vezes em conflito', 'Razoavelmente alinhados', 'Bem alinhados'],
    meta: { escola: 'Freud / Lacan', conceito: 'Conflito pulsional / ideal x desejo', eixo: 'ambição e ética interna' },
  },

  // ── BLOCO 4: REPETIÇÃO ─────────────────────────────────────
  {
    index: 15,
    bloco: 'Repetição',
    type: 'text',
    text: 'Existe alguma situação ou tipo de conflito que parece se repetir na sua vida — mesmo em contextos e pessoas diferentes?',
    placeholder: 'Pense em padrões, não em episódios isolados...',
    meta: { escola: 'Freud', conceito: 'Compulsão à repetição / transferência', eixo: 'padrão repetitivo central' },
  },
  {
    index: 16,
    bloco: 'Repetição',
    type: 'text',
    text: 'Você já se pegou escolhendo algo que sabia que não era bom para você? O que estava por trás dessa escolha?',
    placeholder: 'Uma relação, um hábito, uma decisão...',
    meta: { escola: 'Freud / Lacan', conceito: 'Pulsão de morte / gozo / acting out', eixo: 'auto-sabotagem' },
  },
  {
    index: 17,
    bloco: 'Repetição',
    type: 'select',
    text: 'Como você se comporta diante de situações que não consegue controlar?',
    options: ['Paraliso', 'Fico irritado', 'Busco controlar mais ainda', 'Aceito com dificuldade', 'Confio no processo'],
    meta: { escola: 'Psicologia do Ego / Freud', conceito: 'Mecanismos de defesa / onipotência', eixo: 'resposta ao descontrole' },
  },
  {
    index: 18,
    bloco: 'Repetição',
    type: 'text',
    text: 'Pense num padrão seu que você gostaria de mudar e ainda não conseguiu. Há quanto tempo esse padrão existe? Quando ele começou?',
    placeholder: 'Tente localizar no tempo...',
    meta: { escola: 'Freud / Relacional', conceito: 'Fixação / repetição / trauma precoce', eixo: 'origem do padrão' },
  },
  {
    index: 19,
    bloco: 'Repetição',
    type: 'select',
    text: 'Quando algo dá errado, qual é sua primeira tendência?',
    options: ['Me culpo', 'Culpo os outros', 'Busco entender', 'Evito pensar nisso', 'Depende muito do contexto'],
    meta: { escola: 'Klein / Freud', conceito: 'Posição esquizo-paranoide / introjeção / projeção', eixo: 'atribuição de responsabilidade' },
  },

  // ── BLOCO 5: SELF E IDENTIDADE ─────────────────────────────
  {
    index: 20,
    bloco: 'Self e identidade',
    type: 'text',
    text: 'Se você precisasse se descrever em três palavras — não como os outros te veem, mas como você se vê por dentro —, quais seriam?',
    placeholder: 'Três palavras. Sem filtro.',
    meta: { escola: 'Kohut / Winnicott', conceito: 'Self verdadeiro vs falso / self coeso', eixo: 'auto-percepção interna' },
  },
  {
    index: 21,
    bloco: 'Self e identidade',
    type: 'text',
    text: 'Existe uma versão de você que ficou para trás — algo que você era ou queria ser, e que foi abandonado pelo caminho?',
    placeholder: 'Um talento, uma escolha, uma forma de ser...',
    meta: { escola: 'Winnicott', conceito: 'Self verdadeiro / falso self / cisão', eixo: 'self abandonado' },
  },
  {
    index: 22,
    bloco: 'Self e identidade',
    type: 'scale',
    text: 'O quanto o que você faz no dia a dia reflete quem você realmente quer ser?',
    labels: ['Muito pouco', 'Um pouco', 'Bastante', 'Muito'],
    meta: { escola: 'Kohut / Existencial', conceito: 'Coerência do Self / autenticidade', eixo: 'alinhamento self-vida' },
  },
  {
    index: 23,
    bloco: 'Self e identidade',
    type: 'select',
    text: 'Você se sente mais confortável dando ou recebendo — atenção, cuidado, reconhecimento?',
    options: ['Dando', 'Recebendo', 'Igualmente', 'Depende de quem', 'Nenhum dos dois me é fácil'],
    meta: { escola: 'Kohut / Klein', conceito: 'Narcisismo / rêverie / inveja', eixo: 'posição no cuidado' },
  },
  {
    index: 24,
    bloco: 'Self e identidade',
    type: 'text',
    text: 'O que as pessoas mais próximas diriam sobre você — e o que isso tem a ver com quem você sente que é de verdade?',
    placeholder: 'O que bate? O que diverge?',
    meta: { escola: 'Lacan / Winnicott', conceito: 'Eu ideal / ideal do Eu / olhar do Outro', eixo: 'identidade e reconhecimento externo' },
  },

  // ── BLOCO 6: DESEJO E TEMPO ────────────────────────────────
  {
    index: 25,
    bloco: 'Desejo e tempo',
    type: 'text',
    text: 'Se você tivesse total liberdade — sem responsabilidades, sem julgamentos — o que você faria diferente na sua vida?',
    placeholder: 'Não pense no viável. Pense no verdadeiro.',
    meta: { escola: 'Lacan', conceito: 'Desejo / falta estrutural / lei', eixo: 'desejo censurado' },
  },
  {
    index: 26,
    bloco: 'Desejo e tempo',
    type: 'text',
    text: 'Existe algo que você deseja há muito tempo, mas nunca se permitiu perseguir de verdade? O que te trava?',
    placeholder: 'O desejo que ficou esperando...',
    meta: { escola: 'Lacan / Freud', conceito: 'Desejo / recalque / procrastinação existencial', eixo: 'desejo suspenso' },
  },
  {
    index: 27,
    bloco: 'Desejo e tempo',
    type: 'text',
    text: 'Como você se relaciona com o tempo que passou — com as escolhas que fez, os caminhos que não tomou?',
    placeholder: 'Com paz? Com arrependimento? Com curiosidade?',
    meta: { escola: 'Freud / Luto', conceito: 'Luto de si mesmo / elaboração', eixo: 'relação com o passado' },
  },
  {
    index: 28,
    bloco: 'Desejo e tempo',
    type: 'select',
    text: 'Quando você pensa nos próximos 10 anos da sua vida, o que predomina?',
    options: ['Esperança', 'Ansiedade', 'Incerteza', 'Clareza', 'Medo', 'Curiosidade'],
    meta: { escola: 'Existencial / Kohut', conceito: 'Temporalidade / self no futuro', eixo: 'orientação para o futuro' },
  },
  {
    index: 29,
    bloco: 'Desejo e tempo',
    type: 'text',
    text: 'Se sua vida daqui a cinco anos pudesse ser exatamente como você quer — não como deveria ser, mas como você realmente quer — o que você veria?',
    placeholder: 'Descreva a cena. O que você está fazendo? Com quem? Como se sente?',
    meta: { escola: 'Kohut / Lacan', conceito: 'Self ideal / desejo / projeto de vida', eixo: 'visão de self futuro' },
  },
]

// Agrupa as questões por bloco
export function getQuestoesPorBloco() {
  return BLOCOS.map(bloco => ({
    bloco,
    questoes: QUESTIONS.filter(q => q.bloco === bloco),
  }))
}

// Retorna uma questão pelo índice
export function getQuestao(index) {
  return QUESTIONS[index] ?? null
}

// Total de situações
export const TOTAL = QUESTIONS.length
