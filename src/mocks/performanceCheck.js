function today () {
  var d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function yesterday () {
  var d = new Date()
  d.setDate(d.getDate() - 1)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export var facilities = [
  {
    id: 1,
    name: '15R Localizer',
    items: [
      {
        id: 101,
        period: '월간',
        title: 'RF Power Levels Check',
        status: '점검 대기중...',
        progress: '0/2',
        isImportant: true,
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 102,
        period: '분기',
        title: 'Localizer Monitor Alarm Points Check (1)',
        status: '점검 대기중...',
        progress: '0/7',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 103,
        period: '분기',
        title: 'Monitor Alarm Points Check (2)',
        status: '점검 대기중...',
        progress: '0/6',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 104,
        period: '분기',
        title: 'Remote Monitor Receiver Alarm Check',
        status: '점검 대기중...',
        progress: '0/6',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 105,
        period: '분기',
        title: 'Equipment Cleaning',
        status: '점검 대기중...',
        progress: '0/6',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 106,
        period: '일일',
        title: '일일 점검 일지',
        status: '점검 대기중...',
        progress: '0/6',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 107,
        period: '월간',
        title: 'Antenna VSWR Measurement',
        status: '진행중...',
        progress: '3/5',
        checkType: 'performance-check',
        statusCategory: 'inProgress',
        date: today()
      }
    ]
  },
  {
    id: 2,
    name: '15R Glide Path',
    items: [
      {
        id: 201,
        period: '월간',
        title: 'GP RF Power Levels Check',
        status: '점검 대기중...',
        progress: '0/4',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 202,
        period: '분기',
        title: 'GP Monitor Alarm Points Check',
        status: '점검 대기중...',
        progress: '0/5',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 203,
        period: '월간',
        title: 'GP Antenna Inspection',
        status: '진행중...',
        progress: '2/4',
        checkType: 'performance-check',
        statusCategory: 'inProgress',
        date: today()
      }
    ]
  },
  {
    id: 3,
    name: '15R Marker Beacon',
    items: [
      {
        id: 301,
        period: '월간',
        title: 'Marker RF Power Check',
        status: '점검 대기중...',
        progress: '0/3',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 302,
        period: '분기',
        title: 'Marker Antenna Check',
        status: '점검 대기중...',
        progress: '0/2',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: today()
      },
      {
        id: 303,
        period: '일일',
        title: 'Beacon Signal Level Test',
        status: '진행중...',
        progress: '1/3',
        checkType: 'performance-check',
        statusCategory: 'inProgress',
        date: today()
      }
    ]
  },
  {
    id: 4,
    name: '33L VOR/DME',
    items: [
      {
        id: 401,
        period: '월간',
        title: 'VOR Radial Accuracy Check',
        status: '점검 완료',
        progress: '4/4',
        checkType: 'performance-check',
        statusCategory: 'scheduled',
        date: yesterday()
      },
      {
        id: 402,
        period: '분기',
        title: 'DME Range Accuracy Test',
        status: '점검 완료',
        progress: '6/6',
        checkType: 'performance-check',
        statusCategory: 'completed',
        date: yesterday()
      }
    ]
  }
]

export var equipmentCatalog = {
  'Power Sensor': {
    team: '계기착륙팀',
    referenceDate: '2025-11-12',
    items: [
      {
        id: 'ps-1',
        registry: '계기록표소',
        name: 'Power Sensor(E9301B)',
        manufacturer: 'AGILENT',
        serialNumber: 'US40010321',
        calibrationDate: '2025-11-10',
        status: '양호'
      },
      {
        id: 'ps-2',
        registry: '계기록표소',
        name: 'Power Sensor(E9326A)',
        manufacturer: 'KEYSIGHT',
        serialNumber: 'MY544800001',
        calibrationDate: '2025-11-10',
        status: '양호'
      },
      {
        id: 'ps-3',
        registry: '계기록표소',
        name: 'Power Sensor(E9326A)',
        manufacturer: 'KEYSIGHT',
        serialNumber: 'MY56120004',
        calibrationDate: '2025-11-10',
        status: '양호'
      },
      {
        id: 'ps-4',
        registry: '계기록표소',
        name: 'Power Sensor(NRP-Z81)',
        manufacturer: 'R&S',
        serialNumber: '102206',
        calibrationDate: '2025-11-10',
        status: '양호'
      }
    ]
  },
  'RF Power Meter': {
    team: '계기착륙팀',
    referenceDate: '2025-11-12',
    items: [
      {
        id: 'rpm-1',
        registry: '계기록표소',
        name: 'RF Power Meter(E4418B)',
        manufacturer: 'AGILENT',
        serialNumber: 'MY41200015',
        calibrationDate: '2025-11-10',
        status: '양호'
      },
      {
        id: 'rpm-2',
        registry: '계기록표소',
        name: 'RF Power Meter(NRP2)',
        manufacturer: 'R&S',
        serialNumber: '103411',
        calibrationDate: '2025-11-10',
        status: '양호'
      }
    ]
  }
}
