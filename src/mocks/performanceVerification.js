/**
 * 성능확인점검 Mock 데이터
 */

// 성능확인점검 시설 목록 데이터 (아코디언 형식)
export var performanceVerificationFacilities = [
  {
    id: 1,
    name: '16R ILS',
    items: [
      {
        id: 1,
        period: '분기',
        title: '16R Localizer',
        progress: '0/9',
        status: 'scheduled'
      },
      {
        id: 2,
        period: '분기',
        title: '16R GLIDE PATH',
        progress: '0/9',
        status: 'scheduled'
      },
      {
        id: 3,
        period: '분기',
        title: '16R MARKER(Inner Maker)',
        progress: '0/6',
        status: 'scheduled'
      },
      {
        id: 4,
        period: '분기',
        title: '16R MARKER(Middle Maker)',
        progress: '0/6',
        status: 'scheduled'
      },
      {
        id: 5,
        period: '분기',
        title: '16R DME',
        progress: '0/8',
        status: 'scheduled'
      },
      {
        id: 6,
        period: '분기',
        title: '항행안전시설 실시결과',
        progress: '0/6',
        status: 'scheduled'
      }
    ]
  },
  {
    id: 2,
    name: 'NCN 전방향표지시설(VOR&DME)',
    items: [
      {
        id: 7,
        period: '분기',
        title: 'NCN VOR',
        progress: '0/5',
        status: 'scheduled'
      },
      {
        id: 8,
        period: '분기',
        title: 'NCN DME',
        progress: '0/5',
        status: 'scheduled'
      }
    ]
  },
  {
    id: 3,
    name: '15R Marker Beacon',
    items: [
      {
        id: 9,
        period: '분기',
        title: '15R Outer Marker',
        progress: '0/4',
        status: 'scheduled'
      },
      {
        id: 10,
        period: '분기',
        title: '15R Middle Marker',
        progress: '0/4',
        status: 'scheduled'
      }
    ]
  }
]

// 성능확인점검 상세 데이터
export var performanceVerificationDetails = {
  1: {
    id: 1,
    period: '분기',
    title: '16R Localizer',
    location: '인천국제공항',
    frequency: '108.55 MHz',
    formSections: [
      { id: 'rfPowerLevels' },
      { id: 'courseAlignment' },
      { id: 'courseDsdWidth' },
      { id: 'frequencyCheck' },
      { id: 'modulationLevel' }
    ]
  },
  2: {
    id: 2,
    period: '분기',
    title: '16R GLIDE PATH',
    location: '인천국제공항',
    frequency: '330.35 MHz',
    formSections: [
      { id: 'rfPowerLevels' },
      { id: 'courseAlignment' }
    ]
  }
}

export var performanceVerificationSectionRegistry = {
  rfPowerLevels: {
    id: 'rfPowerLevels',
    title: 'RF POWER LEVELS',
    description: '허용치: 기준치의 ±10%',
    showRecordButton: true,
    columns: 2,
    showComparison: true,
    groups: {
      tx1: [
        { key: 'courseCSB', label: 'Course CSB', unit: 'W', comparisonValue: '0.06 W' },
        { key: 'courseSBO', label: 'Course SBO', unit: 'W', comparisonValue: '0.07 W' },
        {
          key: 'clearanceCSB',
          label: 'Clearance CSB',
          unit: 'W',
          comparisonValue: '19.19 W'
        },
        { key: 'clearanceSBO', label: 'Clearance SBO', unit: 'W', comparisonValue: '0.52 W' }
      ],
      tx2: [
        { key: 'courseCSB', label: 'Course CSB', unit: 'W', comparisonValue: '20.06 W' },
        { key: 'courseSBO', label: 'Course SBO', unit: 'W', comparisonValue: '0.07 W' },
        {
          key: 'clearanceCSB',
          label: 'Clearance CSB',
          unit: 'W',
          comparisonValue: '19.19 W'
        },
        { key: 'clearanceSBO', label: 'Clearance SBO', unit: 'W', comparisonValue: '19.19 W' }
      ]
    }
  },
  courseAlignment: {
    id: 'courseAlignment',
    title: 'COURSE ALIGNMENT',
    description: '표준치: 기준치 대비',
    groups: {
      tx1: [{ key: 'course', label: 'Course', unit: 'uA' }],
      tx2: [{ key: 'course', label: 'Course', unit: 'uA' }]
    }
  },
  courseDsdWidth: {
    id: 'courseDsdWidth',
    title: 'COURSE DSD (WIDTH)',
    description: '허용치: 기준치 대비',
    groups: {
      tx1: [
        { key: 'course90', label: '90 Hz', unit: 'uA', reference: '147.2uA' },
        { key: 'course150', label: '150 Hz', unit: 'uA', reference: '154.7uA' }
      ],
      tx2: [
        { key: 'course90', label: '90 Hz', unit: 'uA', reference: '148.9uA' },
        { key: 'course150', label: '150 Hz', unit: 'uA', reference: '156.5uA' }
      ]
    }
  },
  frequencyCheck: {
    id: 'frequencyCheck',
    title: 'FREQUENCY CHECK',
    description: '표준치: 기준치 대비',
    groups: {
      tx1: [
        { key: 'course', label: 'Course', unit: 'MHz', reference: '108.5550 MHz' },
        { key: 'clearance', label: 'Clearance', unit: 'MHz', reference: '108.5548 MHz' }
      ],
      tx2: [
        { key: 'course', label: 'Course', unit: 'MHz', reference: '108.5550 MHz' },
        { key: 'clearance', label: 'Clearance', unit: 'MHz', reference: '108.5548 MHz' }
      ]
    }
  },
  modulationLevel: {
    id: 'modulationLevel',
    title: 'MODULATION LEVEL - ID MODULATION (1020 Hz)',
    description: '허용치: 5~15%',
    groups: {
      tx1: [{ key: 'level', label: 'Modulation', unit: '%' }],
      tx2: [{ key: 'level', label: 'Modulation', unit: '%' }]
    }
  }
}
