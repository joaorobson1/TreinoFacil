// Dados de seed do catálogo de exercícios e das fichas (FASE 5a).
// Conteúdo por regras — sem IA. Mídia (imagem/GIF/vídeo) é cadastrada no admin (FASE 6).

/**
 * Cada exercício: equipments = TODOS exigidos (matching). `muscle` = grupo primário.
 * secondary = grupos secundários ("músculos utilizados").
 */
export const EXERCISES = [
  // ---------------- PEITO ----------------
  { slug: "flexao_bracos", name: "Flexão de braços", category: "forca", muscle: "peito", level: "beginner",
    equipments: ["peso_corporal"], secondary: ["triceps", "ombros"],
    description: "Empurrão horizontal com o peso do corpo, ótimo para peito e tríceps.",
    execution: "Apoie as mãos na largura dos ombros, corpo alinhado. Desça o peito até quase tocar o chão e empurre de volta.",
    breathing: "Inspire ao descer, expire ao empurrar.", common_mistakes: "Deixar o quadril cair ou abrir demais os cotovelos.",
    tips: "Contraia o abdômen e mantenha o corpo em linha reta." },
  { slug: "supino_reto_halteres", name: "Supino reto com halteres", category: "forca", muscle: "peito", level: "beginner",
    equipments: ["halteres", "banco_reto"], secondary: ["triceps", "ombros"],
    description: "Empurrão no banco com halteres, maior amplitude que a barra.",
    execution: "Deitado no banco, empurre os halteres para cima até quase estender os cotovelos e desça controlando.",
    breathing: "Inspire ao descer, expire ao subir.", common_mistakes: "Arquear demais a lombar ou bater os halteres no topo.",
    tips: "Desça até sentir alongar o peito, sem forçar o ombro." },
  { slug: "supino_reto_barra", name: "Supino reto com barra", category: "forca", muscle: "peito", level: "intermediate",
    equipments: ["barra_olimpica", "banco_reto"], secondary: ["triceps", "ombros"],
    description: "Exercício base de força para o peito.",
    execution: "Pegada pouco mais aberta que os ombros. Desça a barra até o peito e empurre para cima.",
    breathing: "Inspire ao descer, expire ao empurrar.", common_mistakes: "Quicar a barra no peito ou tirar o quadril do banco.",
    tips: "Mantenha as escápulas retraídas e os pés firmes no chão." },
  { slug: "supino_maquina", name: "Supino na máquina", category: "forca", muscle: "peito", level: "beginner",
    equipments: ["maquina_supino"], secondary: ["triceps", "ombros"],
    description: "Versão guiada e segura do supino.",
    execution: "Ajuste o banco, empurre as manoplas até estender e retorne controlando.",
    breathing: "Expire ao empurrar, inspire ao voltar.", common_mistakes: "Usar carga alta demais e perder a amplitude.",
    tips: "Alinhe as manoplas na altura do meio do peito." },
  { slug: "crucifixo_crossover", name: "Crucifixo no crossover", category: "forca", muscle: "peito", level: "intermediate",
    equipments: ["crossover"], secondary: ["ombros"],
    description: "Isolamento do peito com tensão constante.",
    execution: "Com leve flexão de cotovelos, junte as mãos à frente do corpo e retorne alongando.",
    breathing: "Expire ao juntar, inspire ao abrir.", common_mistakes: "Dobrar muito os cotovelos (vira empurrão).",
    tips: "Foque em 'abraçar' com o peito, não com os braços." },

  // ---------------- COSTAS ----------------
  { slug: "superman", name: "Superman (extensão lombar)", category: "forca", muscle: "costas", level: "beginner",
    equipments: ["peso_corporal"], secondary: ["gluteos"],
    description: "Fortalece a cadeia posterior e a lombar sem carga.",
    execution: "Deitado de bruços, eleve braços e pernas ao mesmo tempo e segure brevemente.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Jogar a cabeça para trás forçando o pescoço.",
    tips: "Movimento curto e controlado, olhar para o chão." },
  { slug: "remada_elastico", name: "Remada com elástico", category: "forca", muscle: "costas", level: "beginner",
    equipments: ["elastico"], secondary: ["biceps"],
    description: "Puxada horizontal para costas em qualquer lugar.",
    execution: "Fixe o elástico à frente, puxe os cotovelos para trás juntando as escápulas e retorne.",
    breathing: "Expire ao puxar, inspire ao voltar.", common_mistakes: "Encolher os ombros ao puxar.",
    tips: "Puxe com os cotovelos, não com as mãos." },
  { slug: "remada_halteres", name: "Remada unilateral com halter", category: "forca", muscle: "costas", level: "beginner",
    equipments: ["halteres", "banco_reto"], secondary: ["biceps"],
    description: "Remada apoiada no banco, um lado por vez.",
    execution: "Apoie joelho e mão no banco, puxe o halter em direção ao quadril e desça controlando.",
    breathing: "Expire ao puxar, inspire ao descer.", common_mistakes: "Girar o tronco para ajudar a puxar.",
    tips: "Mantenha as costas retas e o abdômen firme." },
  { slug: "remada_maquina", name: "Remada na máquina", category: "forca", muscle: "costas", level: "beginner",
    equipments: ["maquina_remada"], secondary: ["biceps"],
    description: "Puxada horizontal guiada.",
    execution: "Peito apoiado, puxe as manoplas juntando as escápulas e retorne alongando.",
    breathing: "Expire ao puxar, inspire ao voltar.", common_mistakes: "Usar impulso do tronco.",
    tips: "Segure 1s na contração para sentir as costas." },
  { slug: "puxada_polia", name: "Puxada na polia alta", category: "forca", muscle: "costas", level: "beginner",
    equipments: ["polias"], secondary: ["biceps"],
    description: "Puxada vertical para dorsais (latíssimo).",
    execution: "Puxe a barra até a parte alta do peito, cotovelos para baixo, e retorne controlando.",
    breathing: "Expire ao puxar, inspire ao subir.", common_mistakes: "Puxar atrás da nuca ou inclinar demais.",
    tips: "Inicie o movimento levando os cotovelos ao tronco." },
  { slug: "remada_curvada_barra", name: "Remada curvada com barra", category: "forca", muscle: "costas", level: "intermediate",
    equipments: ["barra_olimpica"], secondary: ["biceps"],
    description: "Remada livre para costas e espessura.",
    execution: "Tronco inclinado ~45°, coluna neutra, puxe a barra ao abdômen e desça.",
    breathing: "Expire ao puxar, inspire ao descer.", common_mistakes: "Arredondar a lombar.",
    tips: "Mantenha o core firme durante todo o movimento." },

  // ---------------- OMBROS ----------------
  { slug: "flexao_pike", name: "Flexão pike", category: "forca", muscle: "ombros", level: "intermediate",
    equipments: ["peso_corporal"], secondary: ["triceps"],
    description: "Empurrão vertical com o peso do corpo para ombros.",
    execution: "Quadril elevado em 'V' invertido, desça a cabeça em direção ao chão e empurre de volta.",
    breathing: "Inspire ao descer, expire ao subir.", common_mistakes: "Baixar o quadril e virar flexão comum.",
    tips: "Quanto mais vertical o tronco, maior o estímulo no ombro." },
  { slug: "elevacao_lateral", name: "Elevação lateral", category: "forca", muscle: "ombros", level: "beginner",
    equipments: ["halteres"], secondary: [],
    description: "Isolamento da porção lateral do ombro.",
    execution: "Eleve os halteres pelos lados até a altura dos ombros e desça controlando.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Usar impulso e subir acima da linha dos ombros.",
    tips: "Cotovelos levemente flexionados, lidere com os cotovelos." },
  { slug: "desenvolvimento_halteres", name: "Desenvolvimento com halteres", category: "forca", muscle: "ombros", level: "beginner",
    equipments: ["halteres"], secondary: ["triceps"],
    description: "Empurrão vertical para os ombros.",
    execution: "Sentado, empurre os halteres para cima até quase estender e desça na linha das orelhas.",
    breathing: "Expire ao empurrar, inspire ao descer.", common_mistakes: "Arquear a lombar ao subir a carga.",
    tips: "Mantenha o abdômen contraído e o punho firme." },
  { slug: "desenvolvimento_militar_barra", name: "Desenvolvimento militar com barra", category: "forca", muscle: "ombros", level: "intermediate",
    equipments: ["barra_olimpica"], secondary: ["triceps"],
    description: "Empurrão vertical pesado para ombros.",
    execution: "Em pé, empurre a barra acima da cabeça e desça até o queixo controlando.",
    breathing: "Expire ao empurrar, inspire ao descer.", common_mistakes: "Arquear muito a lombar.",
    tips: "Aperte glúteos e abdômen para proteger a coluna." },

  // ---------------- BÍCEPS ----------------
  { slug: "rosca_elastico", name: "Rosca com elástico", category: "forca", muscle: "biceps", level: "beginner",
    equipments: ["elastico"], secondary: ["antebraco"],
    description: "Flexão de cotovelo com elástico.",
    execution: "Pise no elástico e flexione os cotovelos levando as mãos aos ombros.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Balançar o corpo.",
    tips: "Cotovelos fixos ao lado do tronco." },
  { slug: "rosca_alternada_halteres", name: "Rosca alternada", category: "forca", muscle: "biceps", level: "beginner",
    equipments: ["halteres"], secondary: ["antebraco"],
    description: "Rosca com halteres, um braço por vez.",
    execution: "Flexione um cotovelo por vez, girando o punho, e desça controlando.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Usar impulso do ombro.",
    tips: "Controle a fase de descida (negativa)." },
  { slug: "rosca_direta_barra", name: "Rosca direta com barra", category: "forca", muscle: "biceps", level: "beginner",
    equipments: ["barra_olimpica"], secondary: ["antebraco"],
    description: "Rosca clássica para bíceps.",
    execution: "Cotovelos fixos, suba a barra até a contração e desça controlando.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Afastar os cotovelos do corpo.",
    tips: "Não jogue o tronco para trás." },
  { slug: "rosca_polia", name: "Rosca na polia", category: "forca", muscle: "biceps", level: "beginner",
    equipments: ["polias"], secondary: ["antebraco"],
    description: "Rosca com tensão constante no cabo.",
    execution: "Puxe a barra do cabo baixo flexionando os cotovelos e retorne controlando.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Mover os cotovelos para frente.",
    tips: "Mantenha a tensão sem soltar no fim." },

  // ---------------- TRÍCEPS ----------------
  { slug: "mergulho_banco", name: "Mergulho no banco", category: "forca", muscle: "triceps", level: "beginner",
    equipments: ["peso_corporal", "banco_reto"], secondary: ["peito"],
    description: "Extensão de cotovelo com o peso do corpo no banco.",
    execution: "Mãos no banco atrás do corpo, desça o quadril flexionando os cotovelos e empurre de volta.",
    breathing: "Inspire ao descer, expire ao subir.", common_mistakes: "Descer demais forçando o ombro.",
    tips: "Cotovelos apontando para trás, não para os lados." },
  { slug: "triceps_polia", name: "Tríceps na polia", category: "forca", muscle: "triceps", level: "beginner",
    equipments: ["polias"], secondary: [],
    description: "Extensão de cotovelo no cabo.",
    execution: "Cotovelos fixos ao lado do corpo, estenda a barra para baixo e retorne controlando.",
    breathing: "Expire ao estender, inspire ao voltar.", common_mistakes: "Abrir os cotovelos.",
    tips: "Só o antebraço se move." },
  { slug: "triceps_frances_halter", name: "Tríceps francês", category: "forca", muscle: "triceps", level: "beginner",
    equipments: ["halteres"], secondary: [],
    description: "Extensão acima da cabeça para tríceps.",
    execution: "Segure um halter acima da cabeça, desça atrás da nuca flexionando e estenda.",
    breathing: "Inspire ao descer, expire ao estender.", common_mistakes: "Abrir os cotovelos para os lados.",
    tips: "Mantenha os cotovelos apontando para cima." },

  // ---------------- QUADRÍCEPS / PERNAS ----------------
  { slug: "agachamento_peso_corporal", name: "Agachamento livre (peso corporal)", category: "forca", muscle: "quadriceps", level: "beginner",
    equipments: ["peso_corporal"], secondary: ["gluteos", "posterior"],
    description: "Agachamento fundamental sem carga.",
    execution: "Pés na largura dos ombros, desça o quadril como se fosse sentar e suba.",
    breathing: "Inspire ao descer, expire ao subir.", common_mistakes: "Joelhos para dentro ou calcanhar do chão.",
    tips: "Peito aberto e peso nos calcanhares." },
  { slug: "agachamento_livre", name: "Agachamento livre com barra", category: "forca", muscle: "quadriceps", level: "intermediate",
    equipments: ["barra_olimpica"], secondary: ["gluteos", "posterior"],
    description: "Exercício-rei para pernas e glúteos.",
    execution: "Barra nas costas, desça até coxas paralelas mantendo a coluna neutra e suba.",
    breathing: "Inspire ao descer, expire ao subir.", common_mistakes: "Arredondar a lombar no fundo.",
    tips: "Empurre o chão com os calcanhares." },
  { slug: "leg_press_45", name: "Leg press 45°", category: "forca", muscle: "quadriceps", level: "beginner",
    equipments: ["leg_press"], secondary: ["gluteos"],
    description: "Empurrão de pernas guiado e seguro.",
    execution: "Pés na plataforma, desça controlando até ~90° e empurre sem travar os joelhos.",
    breathing: "Inspire ao descer, expire ao empurrar.", common_mistakes: "Descer demais tirando o quadril do apoio.",
    tips: "Não estenda os joelhos com força no topo." },
  { slug: "cadeira_extensora_ex", name: "Cadeira extensora", category: "forca", muscle: "quadriceps", level: "beginner",
    equipments: ["cadeira_extensora"], secondary: [],
    description: "Isolamento do quadríceps.",
    execution: "Estenda os joelhos até quase travar e desça controlando.",
    breathing: "Expire ao estender, inspire ao voltar.", common_mistakes: "Usar carga alta e dar impulso.",
    tips: "Segure 1s na contração no topo." },
  { slug: "afundo_halteres", name: "Afundo com halteres", category: "forca", muscle: "quadriceps", level: "intermediate",
    equipments: ["halteres"], secondary: ["gluteos"],
    description: "Passada trabalhando pernas e equilíbrio.",
    execution: "Dê um passo à frente e desça o joelho de trás em direção ao chão, depois suba.",
    breathing: "Inspire ao descer, expire ao subir.", common_mistakes: "Joelho da frente passar muito da ponta do pé.",
    tips: "Tronco ereto e passada firme." },

  // ---------------- POSTERIOR / GLÚTEOS ----------------
  { slug: "ponte_gluteo", name: "Elevação de quadril (ponte)", category: "forca", muscle: "gluteos", level: "beginner",
    equipments: ["peso_corporal"], secondary: ["posterior"],
    description: "Ativação de glúteos amigável aos joelhos.",
    execution: "Deitado, pés no chão, eleve o quadril contraindo os glúteos e desça.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Estender a lombar em vez do quadril.",
    tips: "Aperte os glúteos no topo por 1s." },
  { slug: "stiff_halteres", name: "Stiff com halteres", category: "forca", muscle: "posterior", level: "intermediate",
    equipments: ["halteres"], secondary: ["gluteos"],
    description: "Flexão de quadril para posteriores de coxa.",
    execution: "Joelhos semiflexionados, desça os halteres pela frente das pernas alongando e suba.",
    breathing: "Inspire ao descer, expire ao subir.", common_mistakes: "Curvar a coluna em vez de dobrar o quadril.",
    tips: "Empurre o quadril para trás mantendo as costas retas." },
  { slug: "mesa_flexora_ex", name: "Mesa flexora", category: "forca", muscle: "posterior", level: "beginner",
    equipments: ["mesa_flexora"], secondary: [],
    description: "Isolamento dos posteriores de coxa.",
    execution: "Flexione os joelhos trazendo o rolo em direção aos glúteos e retorne controlando.",
    breathing: "Expire ao flexionar, inspire ao voltar.", common_mistakes: "Tirar o quadril do apoio.",
    tips: "Movimento controlado, sem impulso." },
  { slug: "elevacao_pelvica", name: "Elevação pélvica com barra", category: "forca", muscle: "gluteos", level: "intermediate",
    equipments: ["barra_olimpica", "banco_reto"], secondary: ["posterior"],
    description: "Melhor exercício de carga para glúteos.",
    execution: "Costas apoiadas no banco, barra no quadril, eleve o quadril até a extensão e desça.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Hiperestender a lombar.",
    tips: "Queixo para baixo e costelas fechadas." },

  // ---------------- PANTURRILHA ----------------
  { slug: "panturrilha_pe", name: "Panturrilha em pé", category: "forca", muscle: "panturrilha", level: "beginner",
    equipments: ["peso_corporal"], secondary: [],
    description: "Elevação de panturrilha com o peso do corpo.",
    execution: "Em pé, eleve os calcanhares o máximo possível e desça controlando.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Fazer rápido demais sem amplitude.",
    tips: "Pausa de 1s no topo para máxima contração." },
  { slug: "panturrilha_halteres", name: "Panturrilha com halteres", category: "forca", muscle: "panturrilha", level: "beginner",
    equipments: ["halteres"], secondary: [],
    description: "Panturrilha com carga extra.",
    execution: "Segure halteres, eleve os calcanhares ao máximo e desça alongando.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Reduzir a amplitude.",
    tips: "Suba na ponta dos pés com controle." },

  // ---------------- ABDÔMEN / CORE ----------------
  { slug: "prancha", name: "Prancha", category: "forca", muscle: "abdomen", level: "beginner",
    equipments: ["peso_corporal"], secondary: [],
    description: "Isometria para estabilidade do core.",
    execution: "Apoie antebraços e pontas dos pés, corpo em linha reta, e segure o tempo indicado.",
    breathing: "Respire de forma contínua, sem prender o ar.", common_mistakes: "Deixar o quadril subir ou cair.",
    tips: "Contraia abdômen e glúteos o tempo todo." },
  { slug: "abdominal_supra", name: "Abdominal supra", category: "forca", muscle: "abdomen", level: "beginner",
    equipments: ["peso_corporal"], secondary: [],
    description: "Flexão de tronco para a parte superior do abdômen.",
    execution: "Deitado, joelhos flexionados, eleve o tronco contraindo o abdômen e desça.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Puxar o pescoço com as mãos.",
    tips: "Olhe para o teto e suba com o abdômen." },
  { slug: "elevacao_pernas", name: "Elevação de pernas", category: "forca", muscle: "abdomen", level: "intermediate",
    equipments: ["peso_corporal"], secondary: [],
    description: "Trabalha a parte inferior do abdômen.",
    execution: "Deitado, eleve as pernas estendidas até ~90° e desça sem tocar o chão.",
    breathing: "Expire ao subir, inspire ao descer.", common_mistakes: "Arquear a lombar ao descer.",
    tips: "Pressione a lombar contra o chão." },

  // ---------------- CARDIO ----------------
  { slug: "polichinelo", name: "Polichinelo", category: "cardio", muscle: "abdomen", level: "beginner",
    equipments: ["peso_corporal"], secondary: ["panturrilha", "ombros"],
    description: "Exercício aeróbico de corpo inteiro.",
    execution: "Salte abrindo pernas e braços simultaneamente e retorne, em ritmo constante.",
    breathing: "Respiração ritmada e contínua.", common_mistakes: "Aterrissar duro sobre os calcanhares.",
    tips: "Aterrisse leve, na ponta dos pés." },
];

/** Contraindicações: exercício → limitações que o impedem ('avoid') ou exigem cautela ('caution'). */
export const CONTRAINDICATIONS = {
  avoid: {
    dor_joelho: ["agachamento_livre", "leg_press_45", "afundo_halteres", "cadeira_extensora_ex"],
    dor_ombro: ["desenvolvimento_halteres", "desenvolvimento_militar_barra", "flexao_pike"],
    hernia_disco: ["agachamento_livre", "remada_curvada_barra", "stiff_halteres", "elevacao_pelvica", "desenvolvimento_militar_barra"],
    lombar: ["agachamento_livre", "remada_curvada_barra", "stiff_halteres", "elevacao_pelvica"],
  },
  caution: {
    hipertensao: ["polichinelo", "prancha", "desenvolvimento_militar_barra"],
  },
};

/** Estrutura dos 3 dias do fallback (somente peso_corporal → válido para todos). */
export const FALLBACK_DAYS = [
  { name: "Corpo inteiro A", focus: "Full body", exercises: [
    { slug: "agachamento_peso_corporal", sets: 3, reps: "12", rest: 60 },
    { slug: "flexao_bracos", sets: 3, reps: "10", rest: 60 },
    { slug: "remada_elastico", sets: 3, reps: "12", rest: 60 },
    { slug: "ponte_gluteo", sets: 3, reps: "15", rest: 45 },
    { slug: "prancha", sets: 3, reps: "30s", rest: 45 },
  ]},
  { name: "Corpo inteiro B", focus: "Full body", exercises: [
    { slug: "agachamento_peso_corporal", sets: 3, reps: "15", rest: 60 },
    { slug: "flexao_pike", sets: 3, reps: "8", rest: 60 },
    { slug: "superman", sets: 3, reps: "12", rest: 45 },
    { slug: "elevacao_pernas", sets: 3, reps: "12", rest: 45 },
    { slug: "panturrilha_pe", sets: 3, reps: "20", rest: 30 },
  ]},
  { name: "Corpo inteiro C", focus: "Full body", exercises: [
    { slug: "flexao_bracos", sets: 3, reps: "12", rest: 60 },
    { slug: "ponte_gluteo", sets: 3, reps: "15", rest: 45 },
    { slug: "remada_elastico", sets: 3, reps: "15", rest: 60 },
    { slug: "abdominal_supra", sets: 3, reps: "15", rest: 45 },
    { slug: "polichinelo", sets: 3, reps: "40s", rest: 30 },
  ]},
];

/** Fichas ricas (academia). goal por slug. */
export const RICH_TEMPLATES = [
  {
    name: "Hipertrofia • Iniciante • 3 dias (academia)", goal: "hipertrofia", experience: "beginner",
    days_per_week: 3, session: 60, min_location: "full_gym", split: "full_body", priority: 10,
    days: [
      { name: "Treino A — Peito e Costas", focus: "Peito, Costas", exercises: [
        { slug: "supino_reto_halteres", sets: 3, reps: "12", rest: 75 },
        { slug: "remada_maquina", sets: 3, reps: "12", rest: 75 },
        { slug: "supino_maquina", sets: 3, reps: "12", rest: 60 },
        { slug: "puxada_polia", sets: 3, reps: "12", rest: 60 },
      ]},
      { name: "Treino B — Pernas", focus: "Pernas", exercises: [
        { slug: "leg_press_45", sets: 3, reps: "12", rest: 90 },
        { slug: "cadeira_extensora_ex", sets: 3, reps: "12", rest: 60 },
        { slug: "mesa_flexora_ex", sets: 3, reps: "12", rest: 60 },
        { slug: "panturrilha_halteres", sets: 4, reps: "15", rest: 45 },
      ]},
      { name: "Treino C — Ombros e Braços", focus: "Ombros, Braços", exercises: [
        { slug: "desenvolvimento_halteres", sets: 3, reps: "12", rest: 75 },
        { slug: "elevacao_lateral", sets: 3, reps: "15", rest: 45 },
        { slug: "rosca_alternada_halteres", sets: 3, reps: "12", rest: 60 },
        { slug: "triceps_polia", sets: 3, reps: "12", rest: 60 },
      ]},
    ],
  },
  {
    name: "Hipertrofia • Iniciante • 4 dias (academia)", goal: "hipertrofia", experience: "beginner",
    days_per_week: 4, session: 60, min_location: "full_gym", split: "abcd", priority: 20,
    days: [
      { name: "Treino A — Peito e Tríceps", focus: "Peito, Tríceps", exercises: [
        { slug: "supino_reto_halteres", sets: 4, reps: "10", rest: 75 },
        { slug: "supino_maquina", sets: 3, reps: "12", rest: 60 },
        { slug: "crucifixo_crossover", sets: 3, reps: "15", rest: 60 },
        { slug: "triceps_polia", sets: 3, reps: "12", rest: 45 },
        { slug: "triceps_frances_halter", sets: 3, reps: "12", rest: 45 },
      ]},
      { name: "Treino B — Costas e Bíceps", focus: "Costas, Bíceps", exercises: [
        { slug: "puxada_polia", sets: 4, reps: "10", rest: 75 },
        { slug: "remada_maquina", sets: 3, reps: "12", rest: 60 },
        { slug: "remada_halteres", sets: 3, reps: "12", rest: 60 },
        { slug: "rosca_alternada_halteres", sets: 3, reps: "12", rest: 45 },
        { slug: "rosca_polia", sets: 3, reps: "12", rest: 45 },
      ]},
      { name: "Treino C — Pernas", focus: "Pernas", exercises: [
        { slug: "leg_press_45", sets: 4, reps: "12", rest: 90 },
        { slug: "cadeira_extensora_ex", sets: 3, reps: "15", rest: 60 },
        { slug: "mesa_flexora_ex", sets: 3, reps: "12", rest: 60 },
        { slug: "ponte_gluteo", sets: 3, reps: "15", rest: 45 },
        { slug: "panturrilha_halteres", sets: 4, reps: "15", rest: 45 },
      ]},
      { name: "Treino D — Ombros e Abdômen", focus: "Ombros, Abdômen", exercises: [
        { slug: "desenvolvimento_halteres", sets: 4, reps: "10", rest: 75 },
        { slug: "elevacao_lateral", sets: 4, reps: "15", rest: 45 },
        { slug: "prancha", sets: 3, reps: "40s", rest: 45 },
        { slug: "abdominal_supra", sets: 3, reps: "20", rest: 45 },
        { slug: "elevacao_pernas", sets: 3, reps: "15", rest: 45 },
      ]},
    ],
  },
  {
    name: "Emagrecer • Iniciante • 3 dias (academia)", goal: "emagrecer", experience: "beginner",
    days_per_week: 3, session: 45, min_location: "full_gym", split: "full_body", priority: 10,
    days: [
      { name: "Treino A — Full body", focus: "Corpo inteiro", exercises: [
        { slug: "leg_press_45", sets: 3, reps: "15", rest: 45 },
        { slug: "supino_maquina", sets: 3, reps: "15", rest: 45 },
        { slug: "remada_maquina", sets: 3, reps: "15", rest: 45 },
        { slug: "polichinelo", sets: 3, reps: "45s", rest: 30 },
      ]},
      { name: "Treino B — Full body", focus: "Corpo inteiro", exercises: [
        { slug: "agachamento_peso_corporal", sets: 3, reps: "20", rest: 45 },
        { slug: "puxada_polia", sets: 3, reps: "15", rest: 45 },
        { slug: "desenvolvimento_halteres", sets: 3, reps: "15", rest: 45 },
        { slug: "prancha", sets: 3, reps: "40s", rest: 30 },
      ]},
      { name: "Treino C — Full body", focus: "Corpo inteiro", exercises: [
        { slug: "afundo_halteres", sets: 3, reps: "12", rest: 45 },
        { slug: "supino_reto_halteres", sets: 3, reps: "15", rest: 45 },
        { slug: "remada_halteres", sets: 3, reps: "15", rest: 45 },
        { slug: "elevacao_pernas", sets: 3, reps: "20", rest: 30 },
      ]},
    ],
  },
];

// ---------------------------------------------------------------------------
// Fichas geradas por combinação (objetivo × split). Só exercícios de academia
// pequena → encaixam em small_gym (e full_gym) e são adaptadas pelo Generator
// para ambientes menores. Preenchem a cobertura de 4/5/6 dias.
// ---------------------------------------------------------------------------
const SPLITS = {
  upper_lower_4: {
    days: 4,
    label: "4 dias",
    split: "upper_lower",
    blocks: [
      { name: "Superiores A", focus: "Peito, Costas, Ombros, Braços",
        slugs: ["supino_reto_halteres", "remada_maquina", "desenvolvimento_halteres", "rosca_alternada_halteres", "triceps_polia"] },
      { name: "Inferiores A", focus: "Pernas",
        slugs: ["leg_press_45", "mesa_flexora_ex", "cadeira_extensora_ex", "panturrilha_halteres", "prancha"] },
      { name: "Superiores B", focus: "Peito, Costas, Ombros, Braços",
        slugs: ["supino_maquina", "puxada_polia", "elevacao_lateral", "rosca_direta_barra", "triceps_frances_halter"] },
      { name: "Inferiores B", focus: "Pernas, Glúteos",
        slugs: ["agachamento_livre", "stiff_halteres", "afundo_halteres", "ponte_gluteo", "abdominal_supra"] },
    ],
  },
  bro_5: {
    days: 5,
    label: "5 dias",
    split: "bro",
    blocks: [
      { name: "Peito e Tríceps", focus: "Empurrar",
        slugs: ["supino_reto_halteres", "supino_maquina", "supino_reto_barra", "triceps_polia", "triceps_frances_halter"] },
      { name: "Costas e Bíceps", focus: "Puxar",
        slugs: ["puxada_polia", "remada_maquina", "remada_halteres", "rosca_direta_barra", "rosca_alternada_halteres"] },
      { name: "Pernas", focus: "Membros inferiores",
        slugs: ["leg_press_45", "cadeira_extensora_ex", "mesa_flexora_ex", "afundo_halteres", "panturrilha_halteres"] },
      { name: "Ombros e Abdômen", focus: "Ombros e core",
        slugs: ["desenvolvimento_halteres", "elevacao_lateral", "desenvolvimento_militar_barra", "prancha", "elevacao_pernas"] },
      { name: "Braços e Panturrilha", focus: "Bíceps, tríceps e panturrilha",
        slugs: ["rosca_polia", "rosca_alternada_halteres", "triceps_polia", "mergulho_banco", "panturrilha_pe"] },
    ],
  },
  ppl_6: {
    days: 6,
    label: "6 dias",
    split: "ppl",
    blocks: [
      { name: "Empurrar A", focus: "Peito, Ombros, Tríceps",
        slugs: ["supino_reto_halteres", "supino_maquina", "desenvolvimento_halteres", "elevacao_lateral", "triceps_polia"] },
      { name: "Puxar A", focus: "Costas e Bíceps",
        slugs: ["puxada_polia", "remada_maquina", "remada_halteres", "rosca_alternada_halteres", "rosca_polia"] },
      { name: "Pernas A", focus: "Pernas e Glúteos",
        slugs: ["leg_press_45", "cadeira_extensora_ex", "mesa_flexora_ex", "ponte_gluteo", "panturrilha_halteres"] },
      { name: "Empurrar B", focus: "Peito, Ombros, Tríceps",
        slugs: ["supino_reto_barra", "supino_maquina", "desenvolvimento_militar_barra", "elevacao_lateral", "triceps_frances_halter"] },
      { name: "Puxar B", focus: "Costas e Bíceps",
        slugs: ["remada_curvada_barra", "puxada_polia", "remada_halteres", "rosca_direta_barra", "rosca_polia"] },
      { name: "Pernas B", focus: "Pernas e Abdômen",
        slugs: ["agachamento_livre", "afundo_halteres", "stiff_halteres", "panturrilha_pe", "abdominal_supra"] },
    ],
  },
};

// esquema de séries/reps/descanso por objetivo
const GOAL_SCHEME = {
  emagrecer: { sets: 3, reps: "15", rest: 40 },
  hipertrofia: { sets: 4, reps: "10", rest: 75 },
  definicao: { sets: 3, reps: "15", rest: 45 },
  condicionamento: { sets: 3, reps: "18", rest: 30 },
  ganho_forca: { sets: 5, reps: "6", rest: 120 },
  saude: { sets: 3, reps: "12", rest: 60 },
};

// mapa slug → grupo muscular (para afinar reps/séries por tipo de exercício)
const MUSCLE_BY_SLUG = Object.fromEntries(EXERCISES.map((e) => [e.slug, e.muscle]));
const SMALL_MUSCLES = new Set(["biceps", "triceps", "antebraco", "panturrilha", "abdomen"]);

/** Repetições ajustadas por exercício (isolados/pequenos com mais reps; prancha por tempo). */
function repsFor(slug, scheme) {
  if (slug === "prancha") return "30-45s";
  const m = MUSCLE_BY_SLUG[slug];
  if (m === "panturrilha" || m === "abdomen") return "15-20";
  return scheme.reps;
}

/** Força e hipertrofia usam menos séries em músculos pequenos (evita volume exagerado). */
function setsFor(slug, scheme) {
  if (scheme.sets >= 4 && SMALL_MUSCLES.has(MUSCLE_BY_SLUG[slug])) return 3;
  return scheme.sets;
}

// quais (objetivo × split) gerar
const COMBOS = [
  ...["emagrecer", "hipertrofia", "definicao", "condicionamento", "ganho_forca", "saude"].flatMap(
    (goal) => [
      { goal, splitKey: "upper_lower_4" },
      { goal, splitKey: "bro_5" },
    ],
  ),
  { goal: "hipertrofia", splitKey: "ppl_6" },
];

/** Constrói as fichas geradas (nomes usam o display name do objetivo). */
export function buildGeneratedTemplates(goalNameBySlug) {
  return COMBOS.map(({ goal, splitKey }) => {
    const s = SPLITS[splitKey];
    const scheme = GOAL_SCHEME[goal];
    return {
      name: `${goalNameBySlug[goal]} • Iniciante • ${s.label} (academia)`,
      goal,
      experience: "beginner",
      days_per_week: s.days,
      session: 60,
      min_location: "small_gym",
      split: s.split,
      priority: 12,
      days: s.blocks.map((b) => ({
        name: b.name,
        focus: b.focus,
        exercises: b.slugs.map((slug) => ({
          slug,
          sets: setsFor(slug, scheme),
          reps: repsFor(slug, scheme),
          rest: scheme.rest,
        })),
      })),
    };
  });
}
