export var filterTabs = [
  { id: 'all', label: 'ALL' },
  { id: 'ils', label: '계기착륙시설(ILS)' },
  { id: 'vor', label: '전방향표지시설(VOR)' },
  { id: 'dme', label: '거리측정시설(DME)' },
  { id: 'tacan', label: 'TACAN' }
]

export var inspectors = [
  { id: 1, name: '유재석', department: '기계팀/본청' },
  { id: 2, name: '박명수', department: '팀이름/업무부서' },
  { id: 3, name: '정준하', department: '팀이름/업무부서' },
  { id: 4, name: '하하', department: '팀이름/업무부서' }
]

export var facilities = [
  {
    id: 1,
    name: '15R LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제1활주',
    type: 'ils',
    statusCategory: 'scheduled',
    checked: false,
    status: '',
    expanded: false,
    subItems: [
      { name: '장비동작 상태', checked: false },
      { name: '장비과열 및 전기접속 상태', checked: false },
      { name: '누수여부(녹,곰팡이 유무 등)', checked: false },
      { name: '기계적인 노후, 손상,파손 유무', checked: false },
      { name: '예비전원 상태', checked: false },
      { name: '실내 온도 상태', checked: false },
      { name: '장애음 상태', checked: false },
      { name: '이상음 발생 상태', checked: false },
      { name: '주변장애물 상태', checked: false },
      { name: '예비품, 측정장비 등의 정품, 청결상태', checked: false }
    ]
  },
  {
    id: 2,
    name: '33L LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제1활주',
    type: 'ils',
    statusCategory: 'scheduled',
    checked: false,
    status: '',
    expanded: false,
    subItems: [
      { name: '장비동작 상태', checked: false },
      { name: '장비과열 및 전기접속 상태', checked: false },
      { name: '누수여부(녹,곰팡이 유무 등)', checked: false },
      { name: '기계적인 노후, 손상,파손 유무', checked: false },
      { name: '예비전원 상태', checked: false },
      { name: '실내 온도 상태', checked: false },
      { name: '장애음 상태', checked: false },
      { name: '이상음 발생 상태', checked: false },
      { name: '주변장애물 상태', checked: false },
      { name: '예비품, 측정장비 등의 정품, 청결상태', checked: false }
    ]
  },
  {
    id: 3,
    name: '16R LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제2활주',
    type: 'ils',
    statusCategory: 'scheduled',
    checked: false,
    status: '',
    expanded: false,
    subItems: [
      { name: '장비동작 상태', checked: false },
      { name: '장비과열 및 전기접속 상태', checked: false },
      { name: '누수여부(녹,곰팡이 유무 등)', checked: false },
      { name: '기계적인 노후, 손상,파손 유무', checked: false },
      { name: '예비전원 상태', checked: false },
      { name: '실내 온도 상태', checked: false },
      { name: '장애음 상태', checked: false },
      { name: '이상음 발생 상태', checked: false },
      { name: '주변장애물 상태', checked: false },
      { name: '예비품, 측정장비 등의 정품, 청결상태', checked: false }
    ]
  },
  {
    id: 4,
    name: '밀릭스',
    category: '밀릭스 > 밀릭스 > 밀릭스',
    type: 'vor',
    statusCategory: 'scheduled',
    checked: false,
    status: '',
    expanded: false,
    subItems: [
      { name: 'Bearing Accuracy', checked: false, status: '' },
      { name: 'Signal Strength', checked: false, status: '' }
    ]
  },
  {
    id: 5,
    name: 'ICN VOR',
    category: '전방향표지시설(VOR)',
    type: 'vor',
    statusCategory: 'scheduled',
    checked: false,
    status: '',
    expanded: false,
    subItems: [
      { name: 'Range Accuracy', checked: false, status: '' },
      { name: 'Reply Efficiency', checked: false, status: '' }
    ]
  },
  {
    id: 101,
    name: '15R LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제1활주로',
    type: 'ils',
    statusCategory: 'completed',
    completedInfo: '유재석, 박명수, 정준하, 하하(2025.10.21 14:00 ~ 15:00)',
    checked: false,
    status: '',
    expanded: false,
    subItems: []
  },
  {
    id: 102,
    name: '33L LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제1활주로',
    type: 'ils',
    statusCategory: 'completed',
    completedInfo: '유재석, 박명수, 정준하, 하하(2025.10.21 14:00 ~ 15:00)',
    checked: false,
    status: '',
    expanded: false,
    subItems: []
  },
  {
    id: 103,
    name: '15L LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제2활주로',
    type: 'ils',
    statusCategory: 'completed',
    completedInfo: '유재석, 박명수, 정준하, 하하(2025.10.21 14:00 ~ 15:00)',
    checked: false,
    status: '',
    expanded: false,
    subItems: []
  },
  {
    id: 104,
    name: '33R LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제2활주로',
    type: 'ils',
    statusCategory: 'completed',
    completedInfo: '유재석, 박명수, 정준하, 하하(2025.10.21 14:00 ~ 15:00)',
    checked: false,
    status: '',
    expanded: false,
    subItems: []
  },
  {
    id: 105,
    name: '16L LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제3활주로',
    type: 'ils',
    statusCategory: 'completed',
    completedInfo: '유재석, 박명수, 정준하, 하하(2025.10.21 14:00 ~ 15:00)',
    checked: false,
    status: '',
    expanded: false,
    subItems: []
  },
  {
    id: 106,
    name: '34R LOC',
    category: '계기착륙시설(ILS) > 방위각제공시설(Localizer) > 제3활주로',
    type: 'ils',
    statusCategory: 'completed',
    completedInfo: '유재석, 박명수, 정준하, 하하(2025.10.21 14:00 ~ 15:00)',
    checked: false,
    status: '',
    expanded: false,
    subItems: []
  }
]

export var statusCounts = {
  scheduled: 12,
  inProgress: 3,
  completed: 6
}
