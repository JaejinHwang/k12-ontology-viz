// K-12 학습 행동 온톨로지 데이터

export interface Relation {
  type: string;
  target: string;
  condition?: string;
}

export interface Signal {
  type: 'verbal' | 'behavioral' | 'output';
  indicator: string;
}

export interface StateSignals {
  [state: string]: Signal[];
}

export interface ContentIO {
  format: string[];
  function: string | string[];
  examples: string[];
}

export interface Category {
  id: string;
  name: string;
  name_en: string;
  description: string;
  examples: string[];
  state_signals: StateSignals;
  relations: Relation[];
  content: {
    consumes: ContentIO[] | null;
    produces: ContentIO[] | null;
  };
}

export interface Phase {
  id: string;
  name: string;
  name_en: string;
  description: string;
  categories: Category[];
}

export interface CompoundRule {
  id: string;
  name: string;
  description?: string;
  conditions: any;
  recommended_action: string[];
  confidence?: string;
}

export const RELATION_TYPES = [
  { id: 'precedes', name: '선행', description: 'A가 B보다 시간적으로 먼저 발생', color: '#94a3b8', dash: '' },
  { id: 'triggers', name: '트리거', description: 'A가 발생하면 B가 유발됨', color: '#f97316', dash: '6,3' },
  { id: 'enables', name: '가능조건', description: 'A가 있어야 B가 가능', color: '#22c55e', dash: '' },
  { id: 'improves', name: '강화', description: 'A가 B의 효과를 높임', color: '#3b82f6', dash: '8,4' },
  { id: 'inhibits', name: '저해', description: 'A가 B를 방해함', color: '#ef4444', dash: '' },
];

export const SIGNAL_TYPES = [
  { id: 'verbal', name: '언어적', icon: '💬' },
  { id: 'behavioral', name: '행동적', icon: '👁' },
  { id: 'output', name: '산출물', icon: '📊' },
];

export const CONTENT_FORMATS = [
  { id: 'text', name: '텍스트' },
  { id: 'image', name: '이미지' },
  { id: 'video', name: '영상' },
  { id: 'audio', name: '오디오' },
  { id: 'interactive', name: '인터랙티브' },
];

export const CONTENT_FUNCTIONS = [
  { id: 'expository', name: '개념전달' },
  { id: 'exemplary', name: '예시제공' },
  { id: 'evaluative', name: '평가측정' },
  { id: 'corrective', name: '교정피드백' },
  { id: 'referential', name: '참조용' },
  { id: 'motivational', name: '동기부여' },
];

export const PHASE_COLORS: Record<string, string> = {
  L1_01: '#8b5cf6', // purple
  L1_02: '#06b6d4', // cyan
  L1_03: '#10b981', // emerald
  L1_04: '#f59e0b', // amber
  L1_05: '#ef4444', // red
  L1_06: '#ec4899', // pink
  L1_07: '#6366f1', // indigo
  L1_08: '#14b8a6', // teal
  L1_09: '#84cc16', // lime
  L1_10: '#f97316', // orange
};

export const PHASES: Phase[] = [
  {
    id: 'L1_01',
    name: '계획/목표',
    name_en: 'Planning & Goal-setting',
    description: '학습의 방향, 목표, 시간 배분을 설정하고 조정하는 활동',
    categories: [
      {
        id: 'L2_01_01', name: '목표 설정', name_en: 'goal_setting',
        description: '무엇을 달성할지 정함',
        examples: ['이번 주 수학 단원 끝내기', '시험 90점 목표'],
        content: {
          consumes: [{ format: ['text'], function: 'referential', examples: ['커리큘럼', '시험범위', '이전 성적'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['목표 리스트', '목표 문장'] }],
        },
        state_signals: {
          appropriate: [
            { type: 'output', indicator: '구체적 + 측정 가능한 목표 존재' },
            { type: 'verbal', indicator: '"오늘 수학 20문제", "이번 주 2단원"' },
          ],
          inappropriate: [
            { type: 'output', indicator: '모호하거나 비현실적 목표' },
            { type: 'verbal', indicator: '"열심히 할 거야", "다 끝낼 거야"' },
          ],
        },
        relations: [
          { type: 'precedes', target: 'L2_01_02' },
          { type: 'precedes', target: 'L2_01_03' },
        ],
      },
      {
        id: 'L2_01_02', name: '우선순위 결정', name_en: 'prioritization',
        description: '뭘 먼저 할지 정함',
        examples: ['취약 과목 먼저', '급한 숙제 먼저'],
        content: {
          consumes: [{ format: ['text'], function: 'referential', examples: ['할일 목록', '마감일 정보', '성적 데이터'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['우선순위 리스트'] }],
        },
        state_signals: {
          complete: [
            { type: 'output', indicator: '순서가 정해진 리스트 존재' },
            { type: 'behavioral', indicator: '1순위 항목부터 착수' },
          ],
          incomplete: [
            { type: 'behavioral', indicator: '이것저것 왔다갔다' },
            { type: 'verbal', indicator: '"뭐부터 하지"' },
          ],
        },
        relations: [{ type: 'precedes', target: 'L2_02_01' }],
      },
      {
        id: 'L2_01_03', name: '시간 배분', name_en: 'time_allocation',
        description: '언제/얼마나 할지 정함',
        examples: ['하루 2시간', '저녁 7시부터'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'referential', examples: ['캘린더', '시간표', '가용시간 정보'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['학습 스케줄', '시간 블록'] }],
        },
        state_signals: {
          appropriate: [
            { type: 'output', indicator: '구체적 시간 블록 존재' },
            { type: 'behavioral', indicator: '배분대로 실행' },
          ],
          unrealistic: [
            { type: 'output', indicator: '총 시간 > 가용 시간' },
            { type: 'behavioral', indicator: '매번 시간 초과' },
          ],
        },
        relations: [{ type: 'precedes', target: 'L2_02_01' }],
      },
      {
        id: 'L2_01_04', name: '마감 관리', name_en: 'deadline_management',
        description: '데드라인 인식 및 추적',
        examples: ['시험 D-7 체크', '숙제 제출일 확인'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'referential', examples: ['시험일정', '과제마감', 'D-day 알림'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['마감 체크리스트'] }],
        },
        state_signals: {
          urgent: [
            { type: 'output', indicator: '마감까지 24시간 이내' },
            { type: 'behavioral', indicator: '마감 관련 반복 확인' },
          ],
          managed: [
            { type: 'behavioral', indicator: '마감 전 여유있게 완료' },
            { type: 'output', indicator: '마감 대비 진도 80%+' },
          ],
        },
        relations: [{ type: 'triggers', target: 'L2_01_02', condition: '마감 임박시' }],
      },
      {
        id: 'L2_01_05', name: '계획 수정', name_en: 'plan_revision',
        description: '상황 변화에 따라 계획 조정',
        examples: ['진도 밀려서 계획 수정', '컨디션 고려해 일정 변경'],
        content: {
          consumes: [{ format: ['text'], function: 'referential', examples: ['기존 계획', '진도 현황'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['수정된 계획'] }],
        },
        state_signals: {
          adaptive: [
            { type: 'behavioral', indicator: '상황 변화 후 계획 업데이트' },
            { type: 'verbal', indicator: '"이건 내일로 미루고"' },
          ],
          avoidant: [
            { type: 'behavioral', indicator: '이유 없이 계속 미룸' },
            { type: 'output', indicator: '수정만 반복, 실행 없음' },
          ],
        },
        relations: [{ type: 'triggers', target: 'L2_01_03' }],
      },
    ],
  },
  {
    id: 'L1_02',
    name: '자원 확보',
    name_en: 'Resourcing',
    description: '학습에 필요한 자료, 도구, 환경을 탐색하고 준비하는 활동',
    categories: [
      {
        id: 'L2_02_01', name: '자료 탐색', name_en: 'resource_search',
        description: '학습 자료 찾기',
        examples: ['인강 검색', '문제집 찾기', '기출 구하기'],
        content: {
          consumes: [{ format: ['text', 'video', 'image'], function: ['expository', 'evaluative', 'exemplary'], examples: ['검색 결과', '추천 목록', '미리보기'] }],
          produces: null,
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '탐색 종료, 선택 단계로 이동' },
            { type: 'output', indicator: '후보 자료 2개 이상 확보' },
          ],
          in_progress: [{ type: 'behavioral', indicator: '검색/브라우징 지속' }],
          stuck: [
            { type: 'verbal', indicator: '"자료가 없네", "뭘 봐야 하지"' },
            { type: 'behavioral', indicator: '동일 검색어 반복' },
          ],
        },
        relations: [{ type: 'precedes', target: 'L2_02_02' }],
      },
      {
        id: 'L2_02_02', name: '자료 선택', name_en: 'resource_selection',
        description: '여러 자료 중 고르기',
        examples: ['난이도 맞는 교재 선택', '강사 선택'],
        content: {
          consumes: [{ format: ['text', 'video', 'image'], function: ['expository', 'evaluative', 'exemplary'], examples: ['자료 후보들', '리뷰', '난이도 정보'] }],
          produces: null,
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '특정 자료로 학습 시작' },
            { type: 'verbal', indicator: '"이걸로 하자"' },
          ],
          indecisive: [
            { type: 'behavioral', indicator: '자료 간 계속 왔다갔다' },
            { type: 'verbal', indicator: '"뭐가 좋을지 모르겠어"' },
          ],
        },
        relations: [
          { type: 'precedes', target: 'L2_02_03' },
          { type: 'enables', target: 'L2_03_02' },
        ],
      },
      {
        id: 'L2_02_03', name: '자료 정리/보관', name_en: 'resource_organization',
        description: '찾은 자료 관리',
        examples: ['폴더 정리', '북마크', '오답노트 모으기'],
        content: {
          consumes: [{ format: ['text', 'image', 'video'], function: ['expository', 'evaluative', 'referential'], examples: ['수집한 자료들'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['정리된 폴더', '북마크 목록', '자료 인덱스'] }],
        },
        state_signals: {
          complete: [{ type: 'output', indicator: '저장/북마크/폴더링 완료' }],
          incomplete: [{ type: 'behavioral', indicator: '자료 찾을 때 다시 검색' }],
        },
        relations: [],
      },
      {
        id: 'L2_02_04', name: '도구 세팅', name_en: 'tool_setup',
        description: '학습 도구 준비',
        examples: ['앱 설치', '타이머 설정', '필기구 준비'],
        content: {
          consumes: [{ format: ['interactive'], function: 'referential', examples: ['앱', '타이머', '학습도구'] }],
          produces: null,
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '도구 사용 시작' },
            { type: 'output', indicator: '앱 설치, 설정 완료' },
          ],
          incomplete: [{ type: 'behavioral', indicator: '도구 없이 학습 시작' }],
        },
        relations: [{ type: 'enables', target: 'L2_08_03' }],
      },
    ],
  },
  {
    id: 'L1_03',
    name: '개념 습득',
    name_en: 'Concept Acquisition',
    description: '새로운 지식과 개념을 이해하고 내재화하는 활동',
    categories: [
      {
        id: 'L2_03_01', name: '선행지식 활성화', name_en: 'prior_knowledge_activation',
        description: '새 개념 전에 관련 기존 지식 떠올리기',
        examples: ['이거 전에 배운 거랑 연결되네', '관련 단원 훑어보기'],
        content: {
          consumes: [{ format: ['text', 'image'], function: ['referential', 'expository'], examples: ['이전 노트', '선수단원 요약', '개념맵'] }],
          produces: null,
        },
        state_signals: {
          occurred: [
            { type: 'verbal', indicator: '"이거 전에 배웠는데", "그때 그거랑 비슷하네"' },
            { type: 'behavioral', indicator: '이전 노트/자료 참조' },
          ],
          not_occurred: [{ type: 'behavioral', indicator: '바로 새 내용으로 진입' }],
        },
        relations: [{ type: 'improves', target: 'L2_03_03' }],
      },
      {
        id: 'L2_03_02', name: '정보 수용', name_en: 'information_intake',
        description: '새 정보 받아들이기',
        examples: ['강의 듣기', '교과서 읽기', '설명 보기'],
        content: {
          consumes: [{ format: ['text', 'video', 'audio', 'image'], function: 'expository', examples: ['강의', '교과서', '개념설명', '도표'] }],
          produces: null,
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '강의/자료 끝까지 소비' },
            { type: 'output', indicator: '재생 완료, 페이지 완독' },
          ],
          in_progress: [{ type: 'behavioral', indicator: '시청/독서 중' }],
          abandoned: [
            { type: 'behavioral', indicator: '중간에 이탈, 스킵' },
            { type: 'output', indicator: '재생률 < 50%' },
          ],
        },
        relations: [{ type: 'precedes', target: 'L2_03_03' }],
      },
      {
        id: 'L2_03_03', name: '이해 시도', name_en: 'comprehension_attempt',
        description: '의미 파악하려 노력',
        examples: ['왜 그런지 생각', '예시와 연결'],
        content: {
          consumes: [{ format: ['text', 'video', 'image'], function: ['expository', 'exemplary'], examples: ['개념설명', '예시', '풀이시연', '다이어그램'] }],
          produces: null,
        },
        state_signals: {
          success: [
            { type: 'verbal', indicator: '"아 그렇구나", "이제 알겠어"' },
            { type: 'behavioral', indicator: '스스로 예시를 만들어냄' },
            { type: 'behavioral', indicator: '다른 말로 바꿔 설명함' },
            { type: 'output', indicator: '관련 문제 정답' },
          ],
          failure: [
            { type: 'verbal', indicator: '"뭔 소리야", "이해가 안 돼"' },
            { type: 'behavioral', indicator: '같은 부분 반복 재생/재독' },
            { type: 'behavioral', indicator: '질문 생성으로 전환' },
            { type: 'output', indicator: '관련 문제 오답' },
          ],
          in_progress: [
            { type: 'behavioral', indicator: '묵독/시청 중' },
            { type: 'behavioral', indicator: '밑줄/하이라이트 중' },
          ],
        },
        relations: [
          { type: 'triggers', target: 'L2_03_04', condition: '이해 실패시' },
          { type: 'enables', target: 'L2_04_01', condition: '이해 성공시' },
        ],
      },
      {
        id: 'L2_03_04', name: '질문 생성', name_en: 'question_generation',
        description: '모르는 것 인식 및 질문화',
        examples: ['이 부분 왜 이렇게 되지?', '의문점 메모'],
        content: {
          consumes: null,
          produces: [{ format: ['text'], function: 'referential', examples: ['질문 텍스트', '의문점 메모'] }],
        },
        state_signals: {
          specific: [
            { type: 'output', indicator: '명확한 질문 형태 존재' },
            { type: 'verbal', indicator: '"~는 왜 ~인가요?"' },
          ],
          vague: [
            { type: 'verbal', indicator: '"이거 뭔가 이상한데"' },
            { type: 'output', indicator: '질문 형태 불명확' },
          ],
        },
        relations: [
          { type: 'triggers', target: 'L2_03_05' },
          { type: 'triggers', target: 'L2_10_01', condition: '혼자 해결 불가시' },
        ],
      },
      {
        id: 'L2_03_05', name: '질문 해소', name_en: 'question_resolution',
        description: '질문에 대한 답 얻기',
        examples: ['검색', '질문하기', 'AI에게 묻기'],
        content: {
          consumes: [{ format: ['text', 'video', 'image'], function: ['expository', 'corrective'], examples: ['검색결과', 'AI답변', '선생님설명'] }],
          produces: null,
        },
        state_signals: {
          success: [
            { type: 'verbal', indicator: '"아 그거였구나"' },
            { type: 'behavioral', indicator: '질문 철회/종료' },
            { type: 'behavioral', indicator: '다음 학습으로 이동' },
          ],
          failure: [
            { type: 'verbal', indicator: '"아직도 모르겠어"' },
            { type: 'behavioral', indicator: '동일 질문 재질문' },
            { type: 'behavioral', indicator: '다른 소스로 재탐색' },
          ],
        },
        relations: [{ type: 'enables', target: 'L2_04_01' }],
      },
    ],
  },
  {
    id: 'L1_04',
    name: '연습/적용',
    name_en: 'Practice & Application',
    description: '습득한 개념을 실제로 사용하고 강화하는 활동',
    categories: [
      {
        id: 'L2_04_01', name: '문제 풀이', name_en: 'problem_solving',
        description: '문제를 직접 품',
        examples: ['연습문제', '기출', '모의고사'],
        content: {
          consumes: [{ format: ['text', 'image'], function: 'evaluative', examples: ['문제', '보기', '지문', '그래프'] }],
          produces: [{ format: ['text'], function: 'evaluative', examples: ['답안', '풀이과정'] }],
        },
        state_signals: {
          correct: [
            { type: 'output', indicator: '정답 일치' },
            { type: 'behavioral', indicator: '빠른 풀이 시간' },
            { type: 'verbal', indicator: '"쉽네", "이건 알겠다"' },
          ],
          incorrect: [
            { type: 'output', indicator: '정답 불일치' },
            { type: 'behavioral', indicator: '오래 걸림 + 포기' },
            { type: 'behavioral', indicator: '힌트/해설 바로 확인' },
          ],
          guessed: [
            { type: 'behavioral', indicator: '극단적으로 빠른 답안 제출' },
            { type: 'behavioral', indicator: '선지 패턴 의존' },
            { type: 'verbal', indicator: '"모르겠고 일단 찍자"' },
          ],
        },
        relations: [
          { type: 'triggers', target: 'L2_06_01', condition: '오답 발생시' },
          { type: 'triggers', target: 'L2_04_03', condition: '정답 + 여유시' },
        ],
      },
      {
        id: 'L2_04_02', name: '인출 연습', name_en: 'retrieval_practice',
        description: '보지 않고 떠올리기',
        examples: ['백지 복습', '암기 테스트'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'evaluative', examples: ['빈칸문제', '플래시카드', '백지'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['재현된 내용', '암기 결과'] }],
        },
        state_signals: {
          success: [
            { type: 'output', indicator: '안 보고 재현 가능' },
            { type: 'behavioral', indicator: '막힘 없이 술술' },
          ],
          failure: [
            { type: 'behavioral', indicator: '자꾸 들여다봄' },
            { type: 'verbal', indicator: '"뭐였지... 기억 안 나"' },
          ],
        },
        relations: [{ type: 'improves', target: 'L2_05_01' }],
      },
      {
        id: 'L2_04_03', name: '적용/응용', name_en: 'application',
        description: '다른 맥락에 써보기',
        examples: ['실생활 적용', '심화 문제'],
        content: {
          consumes: [{ format: ['text', 'image'], function: ['evaluative', 'exemplary'], examples: ['응용문제', '심화문제', '실생활사례'] }],
          produces: [{ format: ['text'], function: 'evaluative', examples: ['응용 답안'] }],
        },
        state_signals: {
          success: [
            { type: 'output', indicator: '새로운 맥락에서 정답' },
            { type: 'verbal', indicator: '"이것도 같은 원리네"' },
          ],
          failure: [
            { type: 'output', indicator: '응용 문제 오답' },
            { type: 'verbal', indicator: '"기본은 알겠는데 응용은 모르겠어"' },
          ],
        },
        relations: [],
      },
      {
        id: 'L2_04_04', name: '창작/생산', name_en: 'creation',
        description: '자기 산출물 만들기',
        examples: ['노트 정리', '요약', '문제 만들기', '마인드맵'],
        content: {
          consumes: [{ format: ['text', 'image', 'video'], function: ['expository', 'exemplary'], examples: ['학습한 내용', '참고자료'] }],
          produces: [{ format: ['text', 'image'], function: 'referential', examples: ['요약노트', '마인드맵', '오답노트', '자작문제'] }],
        },
        state_signals: {
          complete: [
            { type: 'output', indicator: '산출물 존재 (노트, 요약, 마인드맵)' },
            { type: 'behavioral', indicator: '정리 완료 후 다음 단계 이동' },
          ],
          in_progress: [{ type: 'behavioral', indicator: '작성/정리 중' }],
          low_quality: [{ type: 'output', indicator: '복붙 위주, 자기 언어 없음' }],
        },
        relations: [{ type: 'improves', target: 'L2_03_03' }],
      },
    ],
  },
  {
    id: 'L1_05',
    name: '평가/측정',
    name_en: 'Assessment',
    description: '학습 결과와 현재 수준을 확인하는 활동',
    categories: [
      {
        id: 'L2_05_01', name: '자가 테스트', name_en: 'self_test',
        description: '스스로 실력 확인',
        examples: ['퀴즈 풀기', '모의시험'],
        content: {
          consumes: [{ format: ['text', 'image', 'interactive'], function: 'evaluative', examples: ['퀴즈', '모의고사', '단원평가'] }],
          produces: [{ format: ['text'], function: 'evaluative', examples: ['답안지', '점수'] }],
        },
        state_signals: {
          complete: [{ type: 'output', indicator: '테스트 제출/완료' }],
          incomplete: [
            { type: 'behavioral', indicator: '중간 이탈' },
            { type: 'output', indicator: '제출 안 함' },
          ],
        },
        relations: [{ type: 'precedes', target: 'L2_05_04' }],
      },
      {
        id: 'L2_05_02', name: '공식 시험', name_en: 'formal_exam',
        description: '외부 평가 응시',
        examples: ['중간고사', '수능', '모의고사'],
        content: {
          consumes: [{ format: ['text', 'image'], function: 'evaluative', examples: ['시험지', '문제'] }],
          produces: [{ format: ['text'], function: 'evaluative', examples: ['답안지'] }],
        },
        state_signals: {
          attended: [{ type: 'output', indicator: '시험 제출 완료' }],
          absent: [{ type: 'behavioral', indicator: '결시, 포기' }],
        },
        relations: [{ type: 'precedes', target: 'L2_05_04' }],
      },
      {
        id: 'L2_05_03', name: '진도 체크', name_en: 'progress_check',
        description: '계획 대비 현황 확인',
        examples: ['몇 문제 풀었나', '몇 단원 끝났나'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'referential', examples: ['진도표', '학습현황', '대시보드'] }],
          produces: null,
        },
        state_signals: {
          on_track: [
            { type: 'output', indicator: '계획 대비 80%+ 달성' },
            { type: 'behavioral', indicator: '예정된 학습 완료' },
          ],
          behind: [
            { type: 'output', indicator: '계획 대비 50% 미만' },
            { type: 'behavioral', indicator: '마감 임박 + 미완료 다수' },
          ],
        },
        relations: [
          { type: 'triggers', target: 'L2_01_05', condition: '계획 대비 지연시' },
          { type: 'triggers', target: 'L2_08_01', condition: '진도 양호시' },
          { type: 'triggers', target: 'L2_08_05', condition: '과부하시' },
        ],
      },
      {
        id: 'L2_05_04', name: '결과 확인', name_en: 'result_review',
        description: '점수/등급 확인',
        examples: ['채점', '성적표 확인'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'corrective', examples: ['채점결과', '성적표', '오답률', '분석리포트'] }],
          produces: null,
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '점수/채점 결과 확인' },
            { type: 'verbal', indicator: '"몇 점이지", "어디 틀렸지"' },
          ],
          avoided: [
            { type: 'behavioral', indicator: '결과 안 봄, 미루기' },
            { type: 'verbal', indicator: '"보기 싫어"' },
          ],
        },
        relations: [
          { type: 'triggers', target: 'L2_06_01', condition: '오답 존재시' },
          { type: 'triggers', target: 'L2_07_03', condition: '점수 향상시' },
        ],
      },
    ],
  },
  {
    id: 'L1_06',
    name: '피드백/교정',
    name_en: 'Feedback & Correction',
    description: '학습 결과를 기반으로 오류를 수정하고 보완하는 활동',
    categories: [
      {
        id: 'L2_06_01', name: '오답 확인', name_en: 'error_identification',
        description: '틀린 것 인식',
        examples: ['오답 체크', '빨간펜 표시'],
        content: {
          consumes: [{ format: ['text'], function: 'corrective', examples: ['채점결과', '정답지'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['오답 리스트', '표시된 문제'] }],
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '오답 문항 체크/표시' },
            { type: 'output', indicator: '오답 리스트 생성' },
          ],
          skipped: [{ type: 'behavioral', indicator: '점수만 보고 넘어감' }],
        },
        relations: [{ type: 'precedes', target: 'L2_06_02' }],
      },
      {
        id: 'L2_06_02', name: '원인 분석', name_en: 'error_analysis',
        description: '왜 틀렸는지 파악',
        examples: ['개념 몰라서?', '실수?', '시간 부족?'],
        content: {
          consumes: [{ format: ['text', 'image'], function: 'corrective', examples: ['해설', '풀이과정', '오답분석'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['원인 메모', '취약점 태그'] }],
        },
        state_signals: {
          complete: [
            { type: 'verbal', indicator: '"아 이래서 틀렸구나"' },
            { type: 'behavioral', indicator: '구체적 원인 지목' },
            { type: 'behavioral', indicator: '교정 학습으로 이동' },
          ],
          incomplete: [
            { type: 'verbal', indicator: '"왜 틀린지 모르겠어"' },
            { type: 'behavioral', indicator: '해설만 보고 넘어감' },
            { type: 'behavioral', indicator: '원인 없이 바로 재시도' },
          ],
        },
        relations: [
          { type: 'triggers', target: 'L2_06_04', condition: '개념 부족시' },
          { type: 'triggers', target: 'L2_08_03', condition: '실수/부주의시' },
        ],
      },
      {
        id: 'L2_06_03', name: '외부 피드백 수용', name_en: 'external_feedback_reception',
        description: '교사/부모/AI/또래가 준 피드백 받아들이기',
        examples: ['선생님 첨삭 확인', 'AI 피드백 읽기', '친구 조언 듣기'],
        content: {
          consumes: [{ format: ['text', 'audio', 'video'], function: 'corrective', examples: ['첨삭', 'AI피드백', '선생님코멘트', '친구조언'] }],
          produces: null,
        },
        state_signals: {
          accepted: [
            { type: 'behavioral', indicator: '피드백 읽음/들음' },
            { type: 'verbal', indicator: '"아 그렇구나"' },
            { type: 'behavioral', indicator: '피드백 기반 행동 변화' },
          ],
          rejected: [
            { type: 'verbal', indicator: '"그게 아닌데", "난 맞게 했는데"' },
            { type: 'behavioral', indicator: '피드백 무시, 동일 행동 반복' },
          ],
        },
        relations: [{ type: 'enables', target: 'L2_06_02' }],
      },
      {
        id: 'L2_06_04', name: '교정 학습', name_en: 'corrective_learning',
        description: '틀린 부분 다시 학습',
        examples: ['해설 보기', '개념 재학습'],
        content: {
          consumes: [{ format: ['text', 'video', 'image'], function: ['corrective', 'expository'], examples: ['해설', '개념재설명', '관련강의'] }],
          produces: null,
        },
        state_signals: {
          effective: [
            { type: 'output', indicator: '재시도 시 정답' },
            { type: 'verbal', indicator: '"이젠 알겠다"' },
          ],
          ineffective: [
            { type: 'output', indicator: '재시도 시 동일 오류' },
            { type: 'behavioral', indicator: '같은 유형 반복 오답' },
          ],
        },
        relations: [{ type: 'precedes', target: 'L2_06_05' }],
      },
      {
        id: 'L2_06_05', name: '재시도', name_en: 'retry',
        description: '다시 풀어보기',
        examples: ['오답 재풀이', '유사 문제 풀기'],
        content: {
          consumes: [{ format: ['text', 'image'], function: 'evaluative', examples: ['동일문제', '유사문제'] }],
          produces: [{ format: ['text'], function: 'evaluative', examples: ['재시도 답안'] }],
        },
        state_signals: {
          success: [{ type: 'output', indicator: '재시도 시 정답' }],
          failure: [{ type: 'output', indicator: '재시도 시 오답 (동일/유사 오류)' }],
          superficial: [
            { type: 'behavioral', indicator: '답만 외워서 맞힘' },
            { type: 'output', indicator: '유사 문제는 여전히 오답' },
          ],
        },
        relations: [
          { type: 'triggers', target: 'L2_07_03', condition: '성공시' },
          { type: 'triggers', target: 'L2_08_02', condition: '재실패시' },
        ],
      },
    ],
  },
  {
    id: 'L1_07',
    name: '회고/메타인지',
    name_en: 'Reflection & Metacognition',
    description: '자신의 학습 과정과 방법을 돌아보고 개선하는 활동',
    categories: [
      {
        id: 'L2_07_01', name: '학습 방법 점검', name_en: 'method_evaluation',
        description: '내 방법이 효과적인지 확인',
        examples: ['이렇게 공부하는 게 맞나?', '효율성 의문'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'referential', examples: ['학습기록', '성적추이', '시간로그'] }],
          produces: null,
        },
        state_signals: {
          occurred: [
            { type: 'verbal', indicator: '"이 방법이 맞나?", "효율이 안 나오네"' },
            { type: 'behavioral', indicator: '자기 학습 패턴 분석' },
          ],
          not_occurred: [{ type: 'behavioral', indicator: '관성적으로 같은 방식 반복' }],
        },
        relations: [{ type: 'triggers', target: 'L2_07_02', condition: '비효율 인식시' }],
      },
      {
        id: 'L2_07_02', name: '전략 조정', name_en: 'strategy_adjustment',
        description: '방법 바꾸기',
        examples: ['인강→문제풀이 비중 조절', '새로운 암기법 시도'],
        content: {
          consumes: null,
          produces: [{ format: ['text'], function: 'referential', examples: ['새 전략 메모', '방법 변경 기록'] }],
        },
        state_signals: {
          executed: [
            { type: 'behavioral', indicator: '실제로 방법 변경' },
            { type: 'verbal', indicator: '"이번엔 다르게 해봐야지"' },
          ],
          not_executed: [{ type: 'behavioral', indicator: '"바꿔야지" 후 동일 행동' }],
        },
        relations: [{ type: 'triggers', target: 'L2_01_05' }],
      },
      {
        id: 'L2_07_03', name: '성장 인식', name_en: 'growth_recognition',
        description: '나아진 점 인식',
        examples: ['저번보다 잘 풀리네', '실력 향상 체감'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: ['referential', 'motivational'], examples: ['성적추이', '이전기록비교', '성장그래프'] }],
          produces: null,
        },
        state_signals: {
          occurred: [
            { type: 'verbal', indicator: '"저번보다 나아졌다", "실력이 느네"' },
            { type: 'behavioral', indicator: '자신감 있는 태도' },
          ],
          not_occurred: [{ type: 'verbal', indicator: '"늘 제자리", "나아지는 게 없어"' }],
        },
        relations: [{ type: 'improves', target: 'L2_08_01' }],
      },
      {
        id: 'L2_07_04', name: '학습 기록', name_en: 'learning_log',
        description: '학습 과정 기록',
        examples: ['일지', '회고록', '스터디 로그'],
        content: {
          consumes: null,
          produces: [{ format: ['text'], function: 'referential', examples: ['학습일지', '회고록', '스터디로그'] }],
        },
        state_signals: {
          complete: [{ type: 'output', indicator: '기록물 존재 (일지, 로그)' }],
          incomplete: [{ type: 'output', indicator: '기록 없음' }],
        },
        relations: [{ type: 'enables', target: 'L2_07_01' }],
      },
    ],
  },
  {
    id: 'L1_08',
    name: '자기 상태 관리',
    name_en: 'Self-State Management',
    description: '학습에 영향을 주는 내적 상태를 관리하는 활동',
    categories: [
      {
        id: 'L2_08_01', name: '동기 관리', name_en: 'motivation_management',
        description: '하고 싶은 마음 유지',
        examples: ['목표 상기', '보상 설정', '루틴화'],
        content: {
          consumes: [{ format: ['text', 'video', 'image'], function: 'motivational', examples: ['목표리마인더', '합격수기', '응원메시지', '명언'] }],
          produces: null,
        },
        state_signals: {
          high: [
            { type: 'verbal', indicator: '"오늘 열심히 해야지", "목표 달성하고 싶다"' },
            { type: 'behavioral', indicator: '자발적 학습 시작' },
            { type: 'behavioral', indicator: '추가 문제 요청' },
          ],
          low: [
            { type: 'verbal', indicator: '"하기 싫다", "왜 해야 돼"' },
            { type: 'behavioral', indicator: '시작 지연, 미루기' },
            { type: 'behavioral', indicator: '다른 활동으로 이탈' },
          ],
        },
        relations: [{ type: 'enables', target: 'L2_01_01' }],
      },
      {
        id: 'L2_08_02', name: '정서 관리', name_en: 'emotion_management',
        description: '감정 조절',
        examples: ['불안 완화', '좌절 극복', '스트레스 해소'],
        content: {
          consumes: [{ format: ['text', 'audio', 'video'], function: 'motivational', examples: ['위로메시지', '명상음원', '스트레스해소콘텐츠'] }],
          produces: null,
        },
        state_signals: {
          stable: [
            { type: 'verbal', indicator: '중립적/긍정적 표현' },
            { type: 'behavioral', indicator: '학습 흐름 유지' },
          ],
          unstable: [
            { type: 'verbal', indicator: '"망했다", "못 하겠어", "짜증나"' },
            { type: 'behavioral', indicator: '급격한 학습 중단' },
            { type: 'behavioral', indicator: '같은 문제에서 오래 멈춤' },
            { type: 'behavioral', indicator: '자책/비관적 발언' },
          ],
        },
        relations: [{ type: 'enables', target: 'L2_08_03' }],
      },
      {
        id: 'L2_08_03', name: '집중 관리', name_en: 'focus_management',
        description: '주의력 유지',
        examples: ['방해요소 제거', '뽀모도로', '집중 앱'],
        content: {
          consumes: [{ format: ['interactive', 'audio'], function: 'referential', examples: ['타이머', '집중앱', '백색소음', '뽀모도로'] }],
          produces: null,
        },
        state_signals: {
          high: [
            { type: 'behavioral', indicator: '연속 학습 시간 길음' },
            { type: 'behavioral', indicator: '외부 자극에 반응 안 함' },
            { type: 'output', indicator: '풀이 속도 일정' },
          ],
          low: [
            { type: 'behavioral', indicator: '잦은 중단/이탈' },
            { type: 'behavioral', indicator: '다른 앱/탭 전환' },
            { type: 'output', indicator: '풀이 속도 불규칙' },
            { type: 'verbal', indicator: '"집중이 안 돼"' },
          ],
        },
        relations: [
          { type: 'improves', target: 'L2_04_01' },
          { type: 'improves', target: 'L2_03_02' },
        ],
      },
      {
        id: 'L2_08_04', name: '컨디션 관리', name_en: 'condition_management',
        description: '신체 상태 관리',
        examples: ['수면', '휴식', '컨디션 체크'],
        content: { consumes: null, produces: null },
        state_signals: {
          good: [
            { type: 'behavioral', indicator: '적정 수면, 규칙적 휴식' },
            { type: 'verbal', indicator: '"컨디션 좋다"' },
          ],
          poor: [
            { type: 'verbal', indicator: '"피곤해", "졸려", "머리 아파"' },
            { type: 'behavioral', indicator: '잦은 하품, 눈 비빔' },
            { type: 'output', indicator: '학습 효율 급락' },
          ],
        },
        relations: [{ type: 'enables', target: 'L2_08_03' }],
      },
      {
        id: 'L2_08_05', name: '학습 중단/보류', name_en: 'learning_pause',
        description: '의도적 중단, 미루기, 포기',
        examples: ['오늘은 못하겠다', '내일로 미루기', '해당 과목 포기'],
        content: { consumes: null, produces: null },
        state_signals: {
          strategic: [
            { type: 'behavioral', indicator: '휴식 후 재개' },
            { type: 'verbal', indicator: '"쉬고 다시 하자"' },
          ],
          avoidant: [
            { type: 'behavioral', indicator: '중단 후 재개 안 함' },
            { type: 'verbal', indicator: '"내일 해야지" (반복)' },
          ],
          quit: [
            { type: 'verbal', indicator: '"안 할래", "못 하겠어"' },
            { type: 'behavioral', indicator: '장기간 미재개' },
          ],
        },
        relations: [
          { type: 'inhibits', target: 'L2_05_03' },
          { type: 'triggers', target: 'L2_08_01', condition: '재개 필요시' },
        ],
      },
    ],
  },
  {
    id: 'L1_09',
    name: '환경/맥락 관리',
    name_en: 'Context Management',
    description: '학습이 일어나는 물리적/디지털 환경을 조성하는 활동',
    categories: [
      {
        id: 'L2_09_01', name: '물리 환경 세팅', name_en: 'physical_environment_setup',
        description: '공부 공간 마련',
        examples: ['책상 정리', '독서실 가기', '조명 조절'],
        content: { consumes: null, produces: null },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '정리된 공간에서 학습 시작' },
            { type: 'output', indicator: '독서실/카페 도착' },
          ],
          incomplete: [{ type: 'behavioral', indicator: '침대에서 공부, 어수선한 환경' }],
        },
        relations: [{ type: 'enables', target: 'L2_08_03' }],
      },
      {
        id: 'L2_09_02', name: '디지털 환경 세팅', name_en: 'digital_environment_setup',
        description: '온라인 환경 정리',
        examples: ['알림 끄기', '앱 차단', '기기 분리'],
        content: {
          consumes: [{ format: ['interactive'], function: 'referential', examples: ['앱차단기', '알림설정', '집중모드'] }],
          produces: null,
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '알림 끔, 차단앱 활성화' },
            { type: 'output', indicator: '학습 중 앱 전환 없음' },
          ],
          incomplete: [{ type: 'behavioral', indicator: '알림에 반응, SNS 확인' }],
        },
        relations: [{ type: 'enables', target: 'L2_08_03' }],
      },
      {
        id: 'L2_09_03', name: '루틴 구축', name_en: 'routine_building',
        description: '반복 패턴 만들기',
        examples: ['등교 전 30분', '취침 전 복습'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'referential', examples: ['루틴템플릿', '스케줄앱'] }],
          produces: [{ format: ['text'], function: 'referential', examples: ['나만의 루틴', '습관기록'] }],
        },
        state_signals: {
          established: [
            { type: 'behavioral', indicator: '동일 시간/장소에서 반복 학습' },
            { type: 'output', indicator: '3일 이상 패턴 유지' },
          ],
          not_established: [
            { type: 'behavioral', indicator: '매번 다른 시간/장소' },
            { type: 'output', indicator: '학습 시작 시간 불규칙' },
          ],
        },
        relations: [
          { type: 'improves', target: 'L2_08_01' },
          { type: 'improves', target: 'L2_01_03' },
        ],
      },
    ],
  },
  {
    id: 'L1_10',
    name: '사회적 상호작용',
    name_en: 'Social Interaction',
    description: '타인과의 관계 속에서 학습을 촉진하거나 영향받는 활동',
    categories: [
      {
        id: 'L2_10_01', name: '도움 요청', name_en: 'help_seeking',
        description: '타인에게 질문/부탁',
        examples: ['선생님께 질문', '친구에게 물어보기'],
        content: {
          consumes: null,
          produces: [{ format: ['text'], function: 'referential', examples: ['질문메시지', '요청내용'] }],
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '질문 전송/발화' },
            { type: 'output', indicator: '답변 수신' },
          ],
          avoided: [
            { type: 'verbal', indicator: '"물어보기 창피해"' },
            { type: 'behavioral', indicator: '모르는 채로 넘어감' },
          ],
        },
        relations: [
          { type: 'enables', target: 'L2_03_05' },
          { type: 'enables', target: 'L2_06_03' },
        ],
      },
      {
        id: 'L2_10_02', name: '도움 제공', name_en: 'help_giving',
        description: '타인을 가르침',
        examples: ['친구 알려주기', '스터디 그룹 설명'],
        content: {
          consumes: null,
          produces: [{ format: ['text', 'audio'], function: 'expository', examples: ['설명', '가르침', '답변'] }],
        },
        state_signals: {
          complete: [
            { type: 'behavioral', indicator: '설명 완료' },
            { type: 'output', indicator: '상대방 이해 확인' },
          ],
          ineffective: [{ type: 'output', indicator: '상대방 여전히 이해 못함' }],
        },
        relations: [{ type: 'improves', target: 'L2_03_03' }],
      },
      {
        id: 'L2_10_03', name: '협력 학습', name_en: 'collaborative_learning',
        description: '함께 공부',
        examples: ['그룹 스터디', '토론', '과제 협업'],
        content: {
          consumes: [{ format: ['text', 'image', 'video'], function: ['expository', 'evaluative'], examples: ['공유자료', '토론주제', '협업과제'] }],
          produces: [{ format: ['text', 'image'], function: ['referential', 'expository'], examples: ['공동노트', '토론결과', '협업산출물'] }],
        },
        state_signals: {
          effective: [
            { type: 'behavioral', indicator: '역할 분담, 상호 피드백' },
            { type: 'output', indicator: '공동 산출물 생성' },
          ],
          ineffective: [
            { type: 'behavioral', indicator: '한 사람만 주도' },
            { type: 'behavioral', indicator: '잡담으로 이탈' },
          ],
        },
        relations: [{ type: 'improves', target: 'L2_08_01' }],
      },
      {
        id: 'L2_10_04', name: '경쟁/비교', name_en: 'competition',
        description: '타인과 비교',
        examples: ['등수 확인', '경쟁심 활용'],
        content: {
          consumes: [{ format: ['text', 'interactive'], function: 'referential', examples: ['랭킹', '등수', '비교데이터', '리더보드'] }],
          produces: null,
        },
        state_signals: {
          positive: [
            { type: 'verbal', indicator: '"나도 저렇게 해야지"' },
            { type: 'behavioral', indicator: '자극받아 학습량 증가' },
          ],
          negative: [
            { type: 'verbal', indicator: '"난 왜 이것밖에 못하지"' },
            { type: 'behavioral', indicator: '위축, 학습 회피' },
          ],
        },
        relations: [
          { type: 'improves', target: 'L2_08_01', condition: '긍정적 경쟁시' },
          { type: 'inhibits', target: 'L2_08_02', condition: '과도한 비교시' },
        ],
      },
      {
        id: 'L2_10_05', name: '정서적 지지', name_en: 'emotional_support',
        description: '격려 주고받기',
        examples: ['응원', '위로', '칭찬'],
        content: {
          consumes: [{ format: ['text', 'audio'], function: 'motivational', examples: ['응원메시지', '위로', '칭찬'] }],
          produces: [{ format: ['text', 'audio'], function: 'motivational', examples: ['격려메시지', '응원'] }],
        },
        state_signals: {
          received: [
            { type: 'verbal', indicator: '"응원 고마워", "힘 난다"' },
            { type: 'behavioral', indicator: '학습 재개/지속' },
          ],
          given: [{ type: 'behavioral', indicator: '격려 메시지 전송' }],
        },
        relations: [
          { type: 'improves', target: 'L2_08_02' },
          { type: 'improves', target: 'L2_08_01' },
        ],
      },
      {
        id: 'L2_10_06', name: '학습 공유', name_en: 'learning_sharing',
        description: '배운 것/과정 공유, 인증, 기록 전파',
        examples: ['SNS 인증', '스터디 로그 공유', '블로그 정리'],
        content: {
          consumes: null,
          produces: [{ format: ['text', 'image'], function: ['referential', 'motivational'], examples: ['인증샷', '공유포스트', '블로그글'] }],
        },
        state_signals: {
          complete: [
            { type: 'output', indicator: '공유 게시물/메시지 존재' },
            { type: 'behavioral', indicator: '타인 반응 확인' },
          ],
          superficial: [{ type: 'behavioral', indicator: '공유만 하고 실제 학습 적음' }],
        },
        relations: [
          { type: 'improves', target: 'L2_08_01' },
          { type: 'triggers', target: 'L2_10_05', condition: '반응 수신시' },
        ],
      },
    ],
  },
];

export const COMPOUND_RULES: CompoundRule[] = [
  {
    id: 'understanding_confirmed',
    name: '이해 확정 판단',
    description: '진짜 이해했는지 vs 이해한 것 같은지 구분',
    conditions: {
      type: 'AND',
      children: [
        { behavior: 'L2_03_03', state: 'success', detail: 'min_signals: 1' },
        { behavior: 'L2_04_01', state: 'correct' },
      ],
    },
    recommended_action: [],
    confidence: 'high',
  },
  {
    id: 'understanding_illusion',
    name: '이해 착각 판단',
    description: '이해한 줄 알았는데 아닌 경우',
    conditions: {
      type: 'AND',
      children: [
        { behavior: 'L2_03_03', state: 'success', detail: 'signal_type: verbal' },
        { behavior: 'L2_04_01', state: 'incorrect' },
      ],
    },
    recommended_action: ['L2_03_01', 'L2_03_02'],
  },
  {
    id: 'motivation_crisis',
    name: '동기 위기 판단',
    conditions: {
      type: 'OR',
      children: [
        { behavior: 'L2_08_01', state: 'low', detail: 'consecutive: 3' },
        { behavior: 'L2_08_05', detail: 'consecutive: 2' },
        {
          type: 'AND',
          children: [
            { behavior: 'L2_08_02', state: 'unstable' },
            { behavior: 'L2_08_01', state: 'low' },
          ],
        },
      ],
    },
    recommended_action: ['L2_10_05', 'L2_01_01', 'L2_07_03'],
  },
  {
    id: 'concept_gap_detected',
    name: '개념 구멍 탐지',
    conditions: {
      type: 'AND',
      children: [
        { behavior: 'L2_04_01', state: 'incorrect', detail: 'same_type_rate: 0.7+' },
        { behavior: 'L2_06_02', state: '개념 부족' },
      ],
    },
    recommended_action: ['L2_03_01', 'L2_03_02'],
  },
  {
    id: 'focus_breakdown',
    name: '집중 붕괴 판단',
    conditions: {
      type: 'AND',
      children: [
        { behavior: 'L2_08_03', state: 'low' },
        { detail: 'duration: 10분 이상' },
      ],
    },
    recommended_action: ['L2_08_04', 'L2_09_02'],
  },
  {
    id: 'positive_loop_detected',
    name: '선순환 루프 감지',
    description: '학습이 잘 돌아가는 상태',
    conditions: {
      type: 'SEQUENCE',
      children: [
        { behavior: 'L2_04_01', state: 'correct' },
        { behavior: 'L2_07_03' },
        { behavior: 'L2_08_01', state: 'high' },
      ],
    },
    recommended_action: ['maintain_current_strategy', 'L2_04_03'],
  },
  {
    id: 'negative_loop_detected',
    name: '악순환 루프 감지',
    description: '학습이 막힌 상태',
    conditions: {
      type: 'SEQUENCE',
      children: [
        { behavior: 'L2_04_01', state: 'incorrect', detail: 'consecutive: 3+' },
        { behavior: 'L2_08_02', state: 'unstable' },
        { behavior: 'L2_08_03', state: 'low' },
      ],
    },
    recommended_action: ['L2_08_05', 'L2_08_04', 'L2_01_05'],
  },
];

// Helper: get all categories flat
export function getAllCategories(): Category[] {
  return PHASES.flatMap(p => p.categories);
}

// Helper: get category by id
export function getCategoryById(id: string): Category | undefined {
  return getAllCategories().find(c => c.id === id);
}

// Helper: get phase for a category
export function getPhaseForCategory(categoryId: string): Phase | undefined {
  return PHASES.find(p => p.categories.some(c => c.id === categoryId));
}

// Helper: get all relations
export function getAllRelations(): { source: string; target: string; type: string; condition?: string }[] {
  const relations: { source: string; target: string; type: string; condition?: string }[] = [];
  for (const phase of PHASES) {
    for (const cat of phase.categories) {
      for (const rel of cat.relations) {
        relations.push({ source: cat.id, target: rel.target, type: rel.type, condition: rel.condition });
      }
    }
  }
  return relations;
}

// Helper: get incoming relations for a category
export function getIncomingRelations(categoryId: string) {
  return getAllRelations().filter(r => r.target === categoryId);
}
