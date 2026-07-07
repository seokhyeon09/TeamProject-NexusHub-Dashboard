export type DockStatus = 'blue' | 'green' | 'red' | 'gray';

export interface IncomingDock {
  id: string;
  status: DockStatus;
  statusText: string;
  vehicleNo?: string;
  detailLine: string;
}

export interface OutgoingDock {
  id: string;
  driver: string;
  zone: string;
  dockTime: string;
  progress: number;
  progressColor: 'green' | 'blue' | 'gray';
  statusPill: 'green' | 'yellow' | 'red';
  statusText: string;
  actionLabel: string;
}

export const initialIncoming: IncomingDock[] = [
  { id: 'A-01', status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 78아 1234', detailLine: '하차율 64% · 예상완료 09:55' },
  { id: 'A-02', status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 80나 5521', detailLine: '하차율 88% · 예상완료 09:40' },
  { id: 'A-03', status: 'green', statusText: '하차 완료', vehicleNo: '경기 12다 9087', detailLine: '완료 09:12 · 출차 대기' },
  { id: 'A-04', status: 'red', statusText: '점검 중', detailLine: '컨베이어 연동 점검 · 예상 복구 10:30' },
  { id: 'A-05', status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 33라 4410', detailLine: '하차율 30% · 예상완료 10:20' },
  { id: 'A-06', status: 'gray', statusText: '공석', detailLine: '다음 접안 차량 대기 중 · 예상 접안 10:05' },
];

export const initialOutgoing: OutgoingDock[] = [
  { id: 'B-01', driver: '김철수', zone: '진접1구역', dockTime: '08:40', progress: 100, progressColor: 'green', statusPill: 'green', statusText: '상차완료', actionLabel: '출차 처리' },
  { id: 'B-02', driver: '이영희', zone: '오남2구역', dockTime: '08:45', progress: 60, progressColor: 'blue', statusPill: 'yellow', statusText: '상차중', actionLabel: '상세 보기' },
  { id: 'B-03', driver: '박지민', zone: '별내3구역', dockTime: '08:50', progress: 30, progressColor: 'blue', statusPill: 'yellow', statusText: '상차중', actionLabel: '상세 보기' },
  { id: 'B-04', driver: '미배정 (결원)', zone: '퇴계원읍', dockTime: '-', progress: 0, progressColor: 'gray', statusPill: 'red', statusText: '대기', actionLabel: '기사 배정' },
  { id: 'B-05', driver: '정수민', zone: '진접2구역', dockTime: '07:05', progress: 100, progressColor: 'green', statusPill: 'green', statusText: '출차완료', actionLabel: '기록 보기' },
];

export const availableDrivers = ['최민호', '강서연', '조현우', '임하늘'];
