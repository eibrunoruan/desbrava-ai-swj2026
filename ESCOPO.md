# PDI Engine v2 — Escopo Completo
---
## 0. Fluxo Macro da Solução
```
Onboarding → Assessments → Perfil Consolidado → PDI (gerado ou importado) → Curadoria de Cursos → Acompanhamento
```
O usuário percorre dois caminhos possíveis:
- **Caminho A (Construção):** Passa pelos assessments, o sistema gera o PDI automaticamente.
- **Caminho B (Importação):** O usuário já possui um PDI pronto, faz upload do documento e o sistema o analisa, enriquece e conecta à curadoria de cursos.
Ambos os caminhos convergem no Motor de Curadoria e no painel de acompanhamento.
---
## 1. Módulo de Onboarding e Cadastro de Perfil
Primeiro contato do usuário com a plataforma. Coleta dados básicos que servirão de contexto para todos os assessments e análises posteriores.
### 1.1 Dados Pessoais e Profissionais
- Nome, e-mail, foto (opcional).
- Cargo atual e área de atuação.
- Anos de experiência no mercado.
- Formação acadêmica (nível, curso, instituição).
- Idiomas e nível de proficiência.
### 1.2 Objetivo de Carreira
- Cargo ou posição desejada (ex: "Tech Lead", "Product Manager", "Especialista em Cloud").
- Horizonte de tempo para alcançar o objetivo (6 meses, 1 ano, 2 anos).
- Motivação livre (campo de texto: "por que você quer chegar lá?").
### 1.3 Upload Opcional de CV
- Suporte a PDF e DOCX.
- Se fornecido, o sistema extrai hard skills, soft skills, experiências e formação via NLP/NER para pré-popular o perfil e reduzir perguntas redundantes nos assessments.
---
## 2. Módulo de Assessments de Autoconhecimento
Coração da nova proposta. Cada assessment gera um bloco de dados que alimenta o perfil consolidado. O usuário pode completá-los no seu ritmo (não precisa fazer todos de uma vez), mas o sistema indica o progresso e incentiva a conclusão.
### 2.1 MBTI (Myers-Briggs Type Indicator)
**Objetivo:** Mapear o tipo psicológico do usuário (ex: INTJ, ENFP) para entender como ele processa informações, toma decisões e interage com o mundo.
- Questionário adaptado (versão simplificada, ~20-30 perguntas).
- Saída: Tipo MBTI (4 letras) + descrição do perfil + implicações para carreira e estilo de aprendizagem.
- **Uso no PDI:** Personalizar o formato das recomendações (ex: perfis "J" preferem cronogramas rígidos; perfis "P" preferem flexibilidade).
### 2.2 Big Five (OCEAN)
**Objetivo:** Medir os cinco grandes traços de personalidade — Abertura, Conscienciosidade, Extroversão, Amabilidade, Neuroticismo.
- Questionário com escala Likert (~30-40 itens).
- Saída: Score percentual em cada traço + gráfico radar.
- **Uso no PDI:** Identificar pontos fortes naturais e áreas de desenvolvimento comportamental. Um score baixo em Conscienciosidade, por exemplo, sugere incluir módulos de gestão de tempo e disciplina no plano.
### 2.3 DISC
**Objetivo:** Identificar o estilo comportamental dominante (Dominância, Influência, Estabilidade, Conformidade) no contexto profissional.
- Questionário situacional (~20-25 perguntas).
- Saída: Perfil DISC primário e secundário + gráfico de distribuição.
- **Uso no PDI:** Direcionar soft skills prioritárias. Um perfil alto em "D" e baixo em "S" pode precisar trabalhar empatia e escuta ativa para cargos de liderança.
### 2.4 Ikigai
**Objetivo:** Ajudar o usuário a encontrar a interseção entre o que ama, o que faz bem, o que o mundo precisa e pelo que pode ser pago.
- Exercício guiado em 4 etapas (não é questionário fechado):
 1. **O que você ama fazer?** (seleção + texto livre)
 2. **No que você é bom?** (skills identificadas pelo CV + autocomplete)
 3. **O que o mundo precisa?** (tendências de mercado sugeridas pelo sistema)
 4. **Pelo que você pode ser pago?** (cruzamento com dados de mercado)
- Saída: Diagrama de Ikigai visual + análise de alinhamento entre momento atual e propósito.
- **Uso no PDI:** Validar se o objetivo de carreira declarado no onboarding está alinhado com o propósito. Se houver desalinhamento, o sistema sugere reflexão antes de montar o plano.
### 2.5 Flow (Mihaly Csikszentmihalyi) — OBRIGATÓRIO
**Objetivo:** Mapear em quais atividades e contextos o usuário atinge o estado de flow (engajamento máximo, perda da noção de tempo, desempenho ótimo).
- Questionário + exercício reflexivo:
 1. **Inventário de atividades:** Lista de atividades profissionais onde o usuário marca nível de desafio vs. nível de habilidade (matriz flow).
 2. **Gatilhos de flow:** Perguntas sobre ambiente (silêncio, música, equipe), horário, tipo de tarefa.
 3. **Bloqueadores:** O que tira o usuário do estado de flow (reuniões, interrupções, tarefas repetitivas).
- Saída: Mapa de flow pessoal (quais atividades colocam o usuário em flow, tédio ou ansiedade) + condições ideais de trabalho.
- **Uso no PDI:** Este é o filtro mais importante. O plano prioriza desenvolvimento nas áreas que naturalmente geram flow, porque é onde o crescimento será mais rápido e sustentável. Cursos e projetos são recomendados levando em conta o nível de desafio ideal para manter o usuário na zona de flow.
---
## 3. Perfil Consolidado (Intelligence Layer)
Camada que unifica todos os dados coletados em um retrato único do usuário.
### 3.1 Composição do Perfil
- **Identidade Profissional:** Cargo, experiência, formação, skills técnicas e comportamentais.
- **Mapa de Personalidade:** MBTI + Big Five + DISC (visão integrada, não isolada).
- **Propósito:** Ikigai + objetivo de carreira declarado.
- **Zona de Flow:** Atividades, contextos e condições que maximizam performance.
- **Gap Analysis:** Cruzamento entre "onde estou" (perfil atual) e "onde quero chegar" (objetivo de carreira), considerando skills técnicas, comportamentais e experiências.
### 3.2 Score de Prontidão
- Indicador percentual de quanto o perfil atual está próximo do objetivo desejado.
- Breakdown por dimensão: técnico, comportamental, experiencial, propósito.
### 3.3 Insights Cruzados
A IA gera observações que nenhum assessment isolado entregaria. Exemplos:
- "Seu MBTI indica preferência por planejamento, mas seu Big Five mostra baixa Conscienciosidade. Isso pode gerar frustração. Recomendamos módulos de produtividade."
- "Seu Ikigai aponta forte interesse em dados, e suas atividades de flow envolvem análise — o caminho de Data Engineering está bem alinhado."
- "Seu DISC alto em Influência combinado com o objetivo de Tech Lead sugere que você será um líder inspirador, mas precisará desenvolver habilidades de decisão técnica rápida."
---
## 4. Módulo de Geração / Importação do PDI
### 4.1 Caminho A — Geração Automática do PDI
Com base no perfil consolidado, a IA estrutura o plano:
**Módulo 1: Fundamentos (Preencher a Base)**
- Skills técnicas faltantes identificadas no gap analysis.
- Soft skills prioritárias definidas pelo cruzamento DISC + Big Five + objetivo.
- Prazo sugerido com base no horizonte informado pelo usuário.
**Módulo 2: Especialização (Aprofundamento)**
- Cursos da Udemy curados pelo motor de scraping (seção 5).
- Projetos práticos sugeridos (alinhados com zona de flow para maximizar engajamento).
- Leituras e recursos complementares.
**Módulo 3: Consolidação (Provar Competência)**
- Projeto real para GitHub (spec gerada pela IA com base no cargo-alvo).
- Simulação de cenários de liderança/gestão (se aplicável ao cargo).
- Checklist de validação: "Você está pronto para o próximo passo quando..."
**Personalização pelo Flow:**
- Cada item do PDI recebe um indicador de "potencial de flow" (alto, médio, baixo) baseado no mapa de flow do usuário.
- Itens com alto potencial são priorizados para manter motivação.
- Itens com baixo potencial recebem estratégias de mitigação (ex: "Faça em blocos curtos de 25 min", "Combine com uma atividade que gera flow").
### 4.2 Caminho B — Importação de PDI Existente
- Upload de PDF, DOCX ou texto livre.
- O sistema faz parsing do documento, extrai objetivos, ações e prazos.
- Cruza o PDI importado com o perfil consolidado para:
 - Validar se o plano está alinhado com o perfil de personalidade e zona de flow.
 - Identificar gaps que o PDI atual não cobre.
 - Sugerir enriquecimentos (cursos, projetos, ajustes de prazo).
- O usuário pode aceitar ou rejeitar cada sugestão.
---
## 5. Motor de Scraping e Curadoria (Udemy Integration)
Mantido do escopo original com ajustes para integrar com o novo perfil.
### 5.1 Scraper de Cursos
- Buscas na Udemy com base nas skills faltantes do gap analysis.
- Critérios de filtro:
 - Avaliação mínima de 4.5 estrelas.
 - Número de alunos matriculados.
 - Idioma conforme perfil do usuário (PT-BR ou EN).
 - Preço (promoções e Best Sellers priorizados).
### 5.2 Ranking Inteligente
- **Novo:** Além dos critérios de filtro, o ranking considera:
 - Compatibilidade com o estilo de aprendizagem do usuário (derivado do MBTI).
 - Nível de desafio do curso vs. skill atual do usuário (manter na zona de flow).
 - Duração do curso vs. tempo disponível declarado.
### 5.3 Cache de Resultados
- Resultados armazenados em banco local por 15-30 dias.
- Skills comuns (React, Python, AWS, Liderança) pré-cacheadas.
---
## 6. Painel de Acompanhamento e Evolução
### 6.1 Dashboard do Usuário
- Progresso do PDI (% concluído por módulo).
- Score de prontidão atualizado conforme o usuário completa ações.
- Mapa de flow atualizado (o usuário pode reclassificar atividades ao longo do tempo).
### 6.2 Check-ins Periódicos
- A cada 30 dias, o sistema sugere um check-in rápido:
 - "Como você está se sentindo com o plano?"
 - "Alguma atividade gerou mais flow do que esperado?"
 - "Seu objetivo mudou?"
- O PDI é recalibrado com base nas respostas.
### 6.3 Re-assessment
- A cada 90 dias (ou sob demanda), o usuário pode refazer os assessments para capturar evolução.
- O sistema mostra comparativo "antes vs. depois".