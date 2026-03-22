// ============================================================
// Assessment Data – Desbrava.Ai
// All questions are in Portuguese (PT-BR)
// ============================================================

export type MBTIDimension = "EI" | "SN" | "TF" | "JP";

export interface MBTIQuestion {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  dimension: MBTIDimension;
  /** "A" maps to the first letter of the dimension (E, S, T, J) */
}

export interface BigFiveQuestion {
  id: number;
  question: string;
  trait: "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism";
  reversed: boolean;
}

export interface DISCOption {
  text: string;
  type: "D" | "I" | "S" | "C";
}

export interface DISCQuestion {
  id: number;
  situation: string;
  options: DISCOption[];
}

export interface FlowActivity {
  id: number;
  name: string;
  category: string;
}

export interface FlowTrigger {
  id: string;
  label: string;
}

export interface FlowBlocker {
  id: string;
  label: string;
}

// ============================================================
// MBTI – 20 questions
// ============================================================
export const mbtiQuestions: MBTIQuestion[] = [
  { id: 1, question: "Em uma festa, você prefere:", optionA: "Interagir com muitas pessoas, incluindo desconhecidos", optionB: "Conversar profundamente com poucas pessoas que já conhece", dimension: "EI" },
  { id: 2, question: "Quando precisa recarregar energias, você prefere:", optionA: "Sair e encontrar amigos ou fazer atividades sociais", optionB: "Ficar em casa sozinho(a) lendo, assistindo algo ou descansando", dimension: "EI" },
  { id: 3, question: "No trabalho, você rende melhor quando:", optionA: "Trabalha em equipe com discussões constantes", optionB: "Tem tempo e espaço para trabalhar de forma independente", dimension: "EI" },
  { id: 4, question: "Quando conhece alguém novo, você:", optionA: "Inicia a conversa facilmente e se sente energizado(a)", optionB: "Espera que a outra pessoa tome iniciativa e observa primeiro", dimension: "EI" },
  { id: 5, question: "Em reuniões, você costuma:", optionA: "Pensar enquanto fala e compartilhar ideias rapidamente", optionB: "Refletir internamente antes de contribuir com sua opinião", dimension: "EI" },
  { id: 6, question: "Ao aprender algo novo, você prefere:", optionA: "Começar pela prática e pelos detalhes concretos", optionB: "Entender primeiro o conceito geral e a teoria por trás", dimension: "SN" },
  { id: 7, question: "Quando descreve algo, você tende a ser:", optionA: "Específico(a) e factual, focando no que é real", optionB: "Metafórico(a) e conceitual, focando em possibilidades", dimension: "SN" },
  { id: 8, question: "Você se considera mais:", optionA: "Realista e prático(a), focado(a) no presente", optionB: "Imaginativo(a) e visionário(a), focado(a) no futuro", dimension: "SN" },
  { id: 9, question: "Ao ler instruções para montar algo, você:", optionA: "Segue o passo a passo cuidadosamente", optionB: "Dá uma olhada geral e tenta montar intuitivamente", dimension: "SN" },
  { id: 10, question: "Em um projeto, você prefere lidar com:", optionA: "Dados concretos, fatos e detalhes mensuráveis", optionB: "Padrões, conexões e significados por trás dos dados", dimension: "SN" },
  { id: 11, question: "Ao tomar uma decisão importante, você prioriza:", optionA: "Análise lógica, prós e contras objetivos", optionB: "Impacto nas pessoas e valores pessoais envolvidos", dimension: "TF" },
  { id: 12, question: "Quando um colega comete um erro, você:", optionA: "Aponta o erro diretamente para que seja corrigido", optionB: "Busca uma forma gentil de abordar o assunto", dimension: "TF" },
  { id: 13, question: "Você se considera mais:", optionA: "Justo(a) e firme, mesmo que alguém se chateie", optionB: "Empático(a) e diplomático(a), priorizando a harmonia", dimension: "TF" },
  { id: 14, question: "Em uma discussão, você valoriza mais:", optionA: "Estar correto(a) e apresentar argumentos sólidos", optionB: "Manter o relacionamento e encontrar um meio-termo", dimension: "TF" },
  { id: 15, question: "Ao avaliar um projeto, você foca mais em:", optionA: "Eficiência, resultados e métricas de sucesso", optionB: "Satisfação da equipe e propósito do trabalho", dimension: "TF" },
  { id: 16, question: "Em relação a prazos e planejamento, você:", optionA: "Gosta de ter tudo organizado e definido com antecedência", optionB: "Prefere manter opções abertas e se adaptar conforme necessário", dimension: "JP" },
  { id: 17, question: "Sua mesa de trabalho geralmente está:", optionA: "Organizada com cada coisa em seu lugar", optionB: "Com vários itens espalhados, mas você sabe onde tudo está", dimension: "JP" },
  { id: 18, question: "Quando viaja a lazer, você prefere:", optionA: "Ter um roteiro planejado com reservas e horários", optionB: "Improvisar e decidir no momento o que fazer", dimension: "JP" },
  { id: 19, question: "Em relação a mudanças de planos, você:", optionA: "Se sente desconfortável e prefere manter o que foi combinado", optionB: "Se adapta facilmente e até gosta de surpresas", dimension: "JP" },
  { id: 20, question: "Ao iniciar um projeto, você:", optionA: "Cria um plano detalhado com etapas e cronograma", optionB: "Começa a explorar ideias e vai estruturando ao longo do caminho", dimension: "JP" },
];

// ============================================================
// Big Five – 30 questions (6 per trait)
// ============================================================
export const bigFiveQuestions: BigFiveQuestion[] = [
  // Openness (Abertura à experiência)
  { id: 1, question: "Eu me considero alguém que é original, que tem ideias novas.", trait: "openness", reversed: false },
  { id: 2, question: "Tenho curiosidade por muitos assuntos diferentes.", trait: "openness", reversed: false },
  { id: 3, question: "Sou engenhoso(a) e pensador(a) profundo(a).", trait: "openness", reversed: false },
  { id: 4, question: "Prefiro trabalho rotineiro e previsível.", trait: "openness", reversed: true },
  { id: 5, question: "Tenho imaginação ativa e gosto de fantasiar.", trait: "openness", reversed: false },
  { id: 6, question: "Não me interesso muito por arte ou estética.", trait: "openness", reversed: true },

  // Conscientiousness (Conscienciosidade)
  { id: 7, question: "Faço um trabalho completo e minucioso.", trait: "conscientiousness", reversed: false },
  { id: 8, question: "Tendo a ser desorganizado(a).", trait: "conscientiousness", reversed: true },
  { id: 9, question: "Sou um(a) trabalhador(a) confiável e disciplinado(a).", trait: "conscientiousness", reversed: false },
  { id: 10, question: "Costumo ser preguiçoso(a) para iniciar tarefas.", trait: "conscientiousness", reversed: true },
  { id: 11, question: "Persevero até que a tarefa esteja finalizada.", trait: "conscientiousness", reversed: false },
  { id: 12, question: "Faço planos e os sigo com determinação.", trait: "conscientiousness", reversed: false },

  // Extraversion (Extroversão)
  { id: 13, question: "Sou comunicativo(a) e falante.", trait: "extraversion", reversed: false },
  { id: 14, question: "Tendo a ser quieto(a) e reservado(a).", trait: "extraversion", reversed: true },
  { id: 15, question: "Sou cheio(a) de energia e entusiasmo.", trait: "extraversion", reversed: false },
  { id: 16, question: "Gero entusiasmo nas pessoas ao meu redor.", trait: "extraversion", reversed: false },
  { id: 17, question: "Às vezes sou tímido(a) e inibido(a).", trait: "extraversion", reversed: true },
  { id: 18, question: "Tenho uma personalidade assertiva e sociável.", trait: "extraversion", reversed: false },

  // Agreeableness (Amabilidade)
  { id: 19, question: "Costumo encontrar defeitos nos outros.", trait: "agreeableness", reversed: true },
  { id: 20, question: "Sou prestativo(a) e generoso(a) com os outros.", trait: "agreeableness", reversed: false },
  { id: 21, question: "Tendo a iniciar discussões e conflitos.", trait: "agreeableness", reversed: true },
  { id: 22, question: "Tenho um jeito de perdoar facilmente.", trait: "agreeableness", reversed: false },
  { id: 23, question: "Sou geralmente confiável e vejo o melhor nas pessoas.", trait: "agreeableness", reversed: false },
  { id: 24, question: "Considero os sentimentos dos outros antes de agir.", trait: "agreeableness", reversed: false },

  // Neuroticism (Neuroticismo)
  { id: 25, question: "Me preocupo muito com as coisas.", trait: "neuroticism", reversed: false },
  { id: 26, question: "Fico nervoso(a) e ansioso(a) facilmente.", trait: "neuroticism", reversed: false },
  { id: 27, question: "Sou emocionalmente estável, não me abalo facilmente.", trait: "neuroticism", reversed: true },
  { id: 28, question: "Fico estressado(a) com facilidade.", trait: "neuroticism", reversed: false },
  { id: 29, question: "Mantenho a calma em situações tensas.", trait: "neuroticism", reversed: true },
  { id: 30, question: "Às vezes me sinto triste ou melancólico(a) sem motivo.", trait: "neuroticism", reversed: false },
];

// ============================================================
// DISC – 20 situational questions
// ============================================================
export const discQuestions: DISCQuestion[] = [
  {
    id: 1,
    situation: "Quando enfrento um problema no trabalho, eu:",
    options: [
      { text: "Tomo uma decisão rápida e ajo imediatamente", type: "D" },
      { text: "Reúno a equipe e busco consenso do grupo", type: "I" },
      { text: "Analiso cuidadosamente todos os dados antes de decidir", type: "C" },
      { text: "Sigo o processo estabelecido e busco estabilidade", type: "S" },
    ],
  },
  {
    id: 2,
    situation: "Em um projeto em equipe, eu naturalmente assumo o papel de:",
    options: [
      { text: "Líder que direciona e cobra resultados", type: "D" },
      { text: "Motivador que mantém o grupo animado", type: "I" },
      { text: "Colaborador que mantém a harmonia", type: "S" },
      { text: "Analista que garante qualidade e precisão", type: "C" },
    ],
  },
  {
    id: 3,
    situation: "O que mais me frustra no ambiente de trabalho é:",
    options: [
      { text: "Lentidão e falta de resultados", type: "D" },
      { text: "Ambiente sério demais e sem interação", type: "I" },
      { text: "Mudanças constantes e falta de previsibilidade", type: "S" },
      { text: "Falta de padrões e trabalho malfeito", type: "C" },
    ],
  },
  {
    id: 4,
    situation: "Quando recebo feedback negativo, eu:",
    options: [
      { text: "Encaro como desafio e busco superar", type: "D" },
      { text: "Fico preocupado(a) com o que os outros pensam", type: "I" },
      { text: "Preciso de tempo para processar internamente", type: "S" },
      { text: "Analiso se o feedback é justo e fundamentado", type: "C" },
    ],
  },
  {
    id: 5,
    situation: "Meu estilo de comunicação é mais:",
    options: [
      { text: "Direto e objetivo, sem rodeios", type: "D" },
      { text: "Entusiasmado e expressivo, com histórias", type: "I" },
      { text: "Calmo e paciente, ouvindo antes de falar", type: "S" },
      { text: "Preciso e detalhado, com dados e fatos", type: "C" },
    ],
  },
  {
    id: 6,
    situation: "Quando preciso convencer alguém, eu:",
    options: [
      { text: "Mostro autoridade e resultados anteriores", type: "D" },
      { text: "Uso carisma e construo rapport pessoal", type: "I" },
      { text: "Demonstro confiança e compromisso a longo prazo", type: "S" },
      { text: "Apresento evidências, dados e lógica", type: "C" },
    ],
  },
  {
    id: 7,
    situation: "Em situações de conflito, eu tendo a:",
    options: [
      { text: "Enfrentar diretamente e resolver rápido", type: "D" },
      { text: "Usar humor e negociação para aliviar", type: "I" },
      { text: "Ceder para manter a paz e harmonia", type: "S" },
      { text: "Analisar os fatos e buscar a solução mais justa", type: "C" },
    ],
  },
  {
    id: 8,
    situation: "O que mais me motiva no trabalho é:",
    options: [
      { text: "Desafios, metas e resultados tangíveis", type: "D" },
      { text: "Reconhecimento, interação social e diversão", type: "I" },
      { text: "Segurança, estabilidade e trabalho em equipe", type: "S" },
      { text: "Qualidade, precisão e domínio técnico", type: "C" },
    ],
  },
  {
    id: 9,
    situation: "Quando trabalho sob pressão, eu:",
    options: [
      { text: "Fico mais focado(a) e competitivo(a)", type: "D" },
      { text: "Procuro apoio e motivação dos colegas", type: "I" },
      { text: "Fico ansioso(a) mas mantenho a consistência", type: "S" },
      { text: "Me apego aos processos e checo tudo duas vezes", type: "C" },
    ],
  },
  {
    id: 10,
    situation: "Ao planejar minha carreira, eu priorizo:",
    options: [
      { text: "Cargos de liderança e poder de decisão", type: "D" },
      { text: "Networking, visibilidade e reconhecimento", type: "I" },
      { text: "Estabilidade e crescimento gradual e seguro", type: "S" },
      { text: "Expertise técnica e excelência no que faço", type: "C" },
    ],
  },
  {
    id: 11,
    situation: "Quando tenho uma nova ideia, eu:",
    options: [
      { text: "Implemento imediatamente, sem esperar", type: "D" },
      { text: "Compartilho com entusiasmo e busco apoiadores", type: "I" },
      { text: "Testo com cuidado antes de propor mudanças", type: "S" },
      { text: "Pesquiso e documento antes de apresentar", type: "C" },
    ],
  },
  {
    id: 12,
    situation: "Meu ambiente de trabalho ideal é:",
    options: [
      { text: "Dinâmico, competitivo e orientado a resultados", type: "D" },
      { text: "Criativo, colaborativo e com muita interação", type: "I" },
      { text: "Tranquilo, estável e com equipe unida", type: "S" },
      { text: "Organizado, estruturado e com processos claros", type: "C" },
    ],
  },
  {
    id: 13,
    situation: "Quando delego tarefas, eu:",
    options: [
      { text: "Defino o que precisa ser feito e espero resultados", type: "D" },
      { text: "Inspiro e motivo as pessoas para a tarefa", type: "I" },
      { text: "Explico pacientemente e ofereço suporte", type: "S" },
      { text: "Dou instruções detalhadas e checo o progresso", type: "C" },
    ],
  },
  {
    id: 14,
    situation: "Em uma negociação, minha abordagem é:",
    options: [
      { text: "Focar no resultado e pressionar por acordo", type: "D" },
      { text: "Construir relacionamento e encontrar ganha-ganha", type: "I" },
      { text: "Ser paciente e buscar compromisso estável", type: "S" },
      { text: "Analisar cada detalhe do contrato cuidadosamente", type: "C" },
    ],
  },
  {
    id: 15,
    situation: "Quando erro, eu:",
    options: [
      { text: "Reconheço rápido e parto para a correção", type: "D" },
      { text: "Me preocupo com a percepção dos outros", type: "I" },
      { text: "Fico refletindo e me sinto responsável", type: "S" },
      { text: "Analiso o que deu errado para não repetir", type: "C" },
    ],
  },
  {
    id: 16,
    situation: "Meu maior ponto forte profissional é:",
    options: [
      { text: "Determinação e foco em resultados", type: "D" },
      { text: "Comunicação e habilidade de influenciar", type: "I" },
      { text: "Paciência e capacidade de dar suporte", type: "S" },
      { text: "Atenção aos detalhes e pensamento analítico", type: "C" },
    ],
  },
  {
    id: 17,
    situation: "Quando aprendo algo novo, eu prefiro:",
    options: [
      { text: "Ir direto à prática e aprender fazendo", type: "D" },
      { text: "Aprender em grupo com discussões animadas", type: "I" },
      { text: "Ter um ritmo tranquilo com acompanhamento", type: "S" },
      { text: "Estudar a teoria completa antes de praticar", type: "C" },
    ],
  },
  {
    id: 18,
    situation: "As pessoas me descrevem como alguém:",
    options: [
      { text: "Assertivo(a), decidido(a) e competitivo(a)", type: "D" },
      { text: "Carismático(a), otimista e comunicativo(a)", type: "I" },
      { text: "Leal, confiável e tranquilo(a)", type: "S" },
      { text: "Meticuloso(a), analítico(a) e organizado(a)", type: "C" },
    ],
  },
  {
    id: 19,
    situation: "Em momentos de mudança organizacional, eu:",
    options: [
      { text: "Abraço a mudança e lidero a transformação", type: "D" },
      { text: "Animo a equipe e vendo os aspectos positivos", type: "I" },
      { text: "Preciso de tempo para me adaptar e busco estabilidade", type: "S" },
      { text: "Avalio os riscos e planejo a transição com cuidado", type: "C" },
    ],
  },
  {
    id: 20,
    situation: "O que considero mais importante para o sucesso profissional:",
    options: [
      { text: "Atingir metas e superar desafios constantemente", type: "D" },
      { text: "Construir uma rede de contatos forte e influente", type: "I" },
      { text: "Ter relações de confiança e ambiente colaborativo", type: "S" },
      { text: "Desenvolver competência técnica e entregar qualidade", type: "C" },
    ],
  },
];

// ============================================================
// Ikigai – Prompts & Suggestions
// ============================================================
export const ikigaiData = {
  step1: {
    title: "O que você ama fazer?",
    subtitle: "Pense nas atividades que te fazem perder a noção do tempo, que você faria mesmo sem ser pago(a).",
    suggestions: [
      "Ensinar e mentorear pessoas",
      "Resolver problemas complexos",
      "Criar coisas novas (design, código, arte)",
      "Escrever e comunicar ideias",
      "Organizar e planejar projetos",
      "Analisar dados e encontrar padrões",
      "Liderar equipes e inspirar pessoas",
      "Pesquisar e aprender coisas novas",
      "Ajudar pessoas a se desenvolverem",
      "Construir produtos e soluções",
      "Negociar e vender ideias",
      "Trabalhar com tecnologia e inovação",
      "Cuidar do bem-estar das pessoas",
      "Trabalhar com números e finanças",
      "Criar estratégias e visão de futuro",
    ],
    placeholder: "Adicione outras atividades que você ama fazer...",
  },
  step2: {
    title: "No que você é bom(boa)?",
    subtitle: "Pense nas habilidades e competências que as pessoas reconhecem em você.",
    suggestions: [
      "Comunicação verbal e escrita",
      "Pensamento analítico",
      "Liderança e gestão de pessoas",
      "Programação e desenvolvimento",
      "Design e criatividade visual",
      "Gestão de projetos",
      "Resolução de conflitos",
      "Pensamento estratégico",
      "Trabalho em equipe",
      "Adaptabilidade e flexibilidade",
      "Negociação e persuasão",
      "Empatia e escuta ativa",
      "Organização e planejamento",
      "Aprendizado rápido",
      "Tomada de decisão sob pressão",
    ],
    placeholder: "Adicione outras habilidades e competências...",
  },
  step3: {
    title: "O que o mundo precisa?",
    subtitle: "Pense nos problemas que você gostaria de ajudar a resolver, nas necessidades que você vê ao redor.",
    suggestions: [
      "Educação acessível e de qualidade",
      "Saúde mental e bem-estar",
      "Sustentabilidade e meio ambiente",
      "Inclusão e diversidade",
      "Inovação tecnológica responsável",
      "Acesso à informação e transparência",
      "Desenvolvimento comunitário",
      "Redução da desigualdade social",
      "Transformação digital de empresas",
      "Mentoria e desenvolvimento de talentos",
      "Saúde e qualidade de vida",
      "Economia criativa e empreendedorismo",
      "Segurança da informação",
      "Inteligência artificial ética",
      "Mobilidade urbana sustentável",
    ],
    placeholder: "Adicione outras necessidades do mundo que te importam...",
  },
  step4: {
    title: "Pelo que você pode ser pago(a)?",
    subtitle: "Pense nas profissões, serviços e atividades pelas quais o mercado está disposto a pagar.",
    suggestions: [
      "Consultoria e assessoria especializada",
      "Desenvolvimento de software",
      "Gestão e liderança empresarial",
      "Marketing e comunicação digital",
      "Educação e treinamento corporativo",
      "Design de produtos e experiências",
      "Análise de dados e business intelligence",
      "Gestão de projetos e processos",
      "Vendas e desenvolvimento de negócios",
      "Recursos humanos e gestão de talentos",
      "Finanças e contabilidade",
      "Pesquisa e desenvolvimento (P&D)",
      "Produção de conteúdo e copywriting",
      "Coaching e desenvolvimento pessoal",
      "Engenharia e infraestrutura",
    ],
    placeholder: "Adicione outras formas de gerar renda...",
  },
};

// ============================================================
// Flow – Activities, Triggers & Blockers
// ============================================================
export const flowActivities: FlowActivity[] = [
  { id: 1, name: "Programar / Desenvolver software", category: "Técnico" },
  { id: 2, name: "Escrever documentação ou relatórios", category: "Comunicação" },
  { id: 3, name: "Criar apresentações", category: "Comunicação" },
  { id: 4, name: "Participar de reuniões de equipe", category: "Colaboração" },
  { id: 5, name: "Planejar e definir estratégias", category: "Gestão" },
  { id: 6, name: "Analisar dados e métricas", category: "Análise" },
  { id: 7, name: "Fazer design (visual, UX, produto)", category: "Criativo" },
  { id: 8, name: "Resolver problemas técnicos complexos", category: "Técnico" },
  { id: 9, name: "Mentorear e treinar colegas", category: "Pessoas" },
  { id: 10, name: "Negociar com clientes ou stakeholders", category: "Negócios" },
  { id: 11, name: "Pesquisar novas tecnologias ou tendências", category: "Aprendizado" },
  { id: 12, name: "Gerenciar projetos e cronogramas", category: "Gestão" },
  { id: 13, name: "Revisar código ou trabalho de outros", category: "Técnico" },
  { id: 14, name: "Brainstorming e ideação", category: "Criativo" },
  { id: 15, name: "Atender e dar suporte a clientes", category: "Pessoas" },
];

export const flowQuestions = [
  { id: 1, question: "Com que frequência você se sente completamente absorvido(a) em uma atividade profissional?", type: "frequency" as const },
  { id: 2, question: "Quando está no seu melhor momento de trabalho, quanto tempo consegue manter a concentração?", type: "duration" as const },
  { id: 3, question: "Você costuma perder a noção do tempo quando está trabalhando em algo que gosta?", type: "likert" as const },
  { id: 4, question: "Com que frequência você sente que suas habilidades são bem aproveitadas no trabalho?", type: "frequency" as const },
  { id: 5, question: "Você sente que os desafios do seu trabalho são compatíveis com suas habilidades?", type: "likert" as const },
  { id: 6, question: "Com que frequência você tem feedback imediato sobre a qualidade do seu trabalho?", type: "frequency" as const },
  { id: 7, question: "Você se sente no controle das suas atividades profissionais?", type: "likert" as const },
  { id: 8, question: "Com que frequência você sente prazer genuíno ao realizar suas tarefas?", type: "frequency" as const },
  { id: 9, question: "Você consegue definir metas claras para suas atividades diárias?", type: "likert" as const },
  { id: 10, question: "Em que período do dia você se sente mais produtivo(a) e focado(a)?", type: "time_of_day" as const },
  { id: 11, question: "Quanto do seu dia de trabalho você passa em estado de alta concentração?", type: "percentage" as const },
  { id: 12, question: "Você prefere trabalhar em tarefas com resultados imediatos ou projetos de longo prazo?", type: "preference" as const },
  { id: 13, question: "Como você lida com interrupções durante o trabalho focado?", type: "likert" as const },
  { id: 14, question: "Você sente que seu trabalho atual permite que você use seus pontos fortes?", type: "likert" as const },
  { id: 15, question: "Com que frequência você termina o dia de trabalho se sentindo realizado(a)?", type: "frequency" as const },
];

export const flowTriggers: FlowTrigger[] = [
  { id: "silence", label: "Silêncio e ambiente calmo" },
  { id: "music", label: "Música (qualquer tipo)" },
  { id: "instrumental", label: "Música instrumental / lo-fi" },
  { id: "morning", label: "Trabalhar de manhã cedo" },
  { id: "night", label: "Trabalhar à noite" },
  { id: "deadline", label: "Ter um prazo desafiador" },
  { id: "autonomy", label: "Autonomia total na tarefa" },
  { id: "novelty", label: "Tarefas novas e desafiadoras" },
  { id: "clear_goals", label: "Objetivos claros e definidos" },
  { id: "coffee", label: "Café ou chá" },
  { id: "exercise", label: "Exercício físico antes do trabalho" },
  { id: "nature", label: "Ambiente com natureza / ar livre" },
  { id: "routine", label: "Ter uma rotina estabelecida" },
  { id: "pair_work", label: "Trabalhar em par com alguém" },
  { id: "deep_work", label: "Blocos longos sem reuniões" },
];

export const flowBlockers: FlowBlocker[] = [
  { id: "notifications", label: "Notificações constantes (celular, e-mail)" },
  { id: "meetings", label: "Reuniões excessivas e desnecessárias" },
  { id: "noise", label: "Barulho e conversas ao redor" },
  { id: "multitask", label: "Ter que fazer muitas coisas ao mesmo tempo" },
  { id: "unclear_goals", label: "Falta de clareza nos objetivos" },
  { id: "micromanagement", label: "Microgerenciamento e falta de autonomia" },
  { id: "boring_tasks", label: "Tarefas repetitivas e monótonas" },
  { id: "stress", label: "Estresse e ansiedade elevados" },
  { id: "lack_skill", label: "Tarefas muito acima das minhas habilidades" },
  { id: "easy_tasks", label: "Tarefas fáceis demais, sem desafio" },
  { id: "interruptions", label: "Interrupções frequentes de colegas" },
  { id: "poor_tools", label: "Ferramentas e tecnologia inadequadas" },
  { id: "conflicts", label: "Conflitos interpessoais na equipe" },
  { id: "fatigue", label: "Cansaço físico ou mental" },
  { id: "no_feedback", label: "Falta de feedback sobre meu trabalho" },
];

// ============================================================
// Assessment metadata for the hub page
// ============================================================
export type AssessmentType = "mbti" | "big_five" | "disc" | "ikigai" | "flow";

export interface AssessmentMeta {
  type: AssessmentType;
  name: string;
  description: string;
  estimatedMinutes: number;
  questionCount: number;
  required: boolean;
  gradient: string;
}

export const assessmentsMeta: AssessmentMeta[] = [
  {
    type: "flow",
    name: "Mapa de Flow",
    description: "Descubra quais atividades te colocam em estado de flow — aquele momento em que você está 100% imerso e no seu melhor desempenho. Essencial para montar seu PDI.",
    estimatedMinutes: 12,
    questionCount: 15,
    required: true,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    type: "mbti",
    name: "Tipologia MBTI",
    description: "Identifique seu tipo de personalidade entre 16 perfis possíveis. Descubra como você se energiza, processa informações, toma decisões e se organiza.",
    estimatedMinutes: 8,
    questionCount: 20,
    required: false,
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    type: "big_five",
    name: "Big Five (OCEAN)",
    description: "Avalie seus cinco grandes traços de personalidade: Abertura, Conscienciosidade, Extroversão, Amabilidade e Neuroticismo.",
    estimatedMinutes: 10,
    questionCount: 30,
    required: false,
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    type: "disc",
    name: "Perfil DISC",
    description: "Descubra seu perfil comportamental no trabalho: Dominância, Influência, Estabilidade e Conformidade. Ideal para entender seu estilo de liderança.",
    estimatedMinutes: 8,
    questionCount: 20,
    required: false,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    type: "ikigai",
    name: "Ikigai",
    description: "Encontre seu propósito na interseção entre o que ama, o que sabe fazer, o que o mundo precisa e pelo que pode ser pago.",
    estimatedMinutes: 15,
    questionCount: 4,
    required: false,
    gradient: "from-pink-500 to-rose-600",
  },
];
