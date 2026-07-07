export type StatusFilter = '전체' | '하차완료' | '분류중' | '상차완료' | '미출고' | '보류';
export type ZoneFilter = '전체 구역' | '진접읍' | '오남읍' | '별내동' | '퇴계원읍';
export type ItemStatus = '하차완료' | '분류중' | '상차완료' | '미출고' | '보류';

export interface ControlItem {
  id: string;
  trackingNo: string;
  destMain: string;
  destSub: string;
  driver: string;
  driverZone: string;
  scanTime: string;
  status: ItemStatus;
  zone: ZoneFilter;
}

export const initialItems: ControlItem[] = [
  { id: '1', trackingNo: '5839-1029-001', destMain: '진접읍 장현리', destSub: '간선11톤 A-03 도크 하차분', driver: '김철수', driverZone: '진접1구역', scanTime: '06:15:30', status: '상차완료', zone: '진접읍' },
  { id: '2', trackingNo: '5839-1029-002', destMain: '오남읍 오남리', destSub: '간선11톤 A-03 도크 하차분', driver: '이영희', driverZone: '오남2구역', scanTime: '06:20:12', status: '분류중', zone: '오남읍' },
  { id: '3', trackingNo: '5839-1029-003', destMain: '별내동 (아파트)', destSub: '간선11톤 A-04 도크 하차분', driver: '박지민', driverZone: '별내3구역', scanTime: '06:25:00', status: '하차완료', zone: '별내동' },
  { id: '4', trackingNo: '5839-1029-004', destMain: '퇴계원읍', destSub: '간선11톤 A-04 도크 하차분', driver: '미배정 (결원)', driverZone: '', scanTime: '06:30:45', status: '미출고', zone: '퇴계원읍' },
  { id: '5', trackingNo: '5839-1029-005', destMain: '진접읍 부평리', destSub: '간선11톤 A-05 도크 하차분', driver: '김철수', driverZone: '진접1구역', scanTime: '06:33:18', status: '분류중', zone: '진접읍' },
  { id: '6', trackingNo: '5839-1029-006', destMain: '오남읍 양지리', destSub: '간선11톤 A-05 도크 하차분', driver: '이영희', driverZone: '오남2구역', scanTime: '06:35:51', status: '상차완료', zone: '오남읍' },
  { id: '7', trackingNo: '5839-1029-007', destMain: '별내동', destSub: '간선11톤 A-06 도크 하차분', driver: '최민호', driverZone: '별내1구역', scanTime: '06:40:22', status: '하차완료', zone: '별내동' },
  { id: '8', trackingNo: '5839-1029-008', destMain: '진접읍 금곡리', destSub: '간선11톤 A-06 도크 하차분', driver: '강태연', driverZone: '진접2구역', scanTime: '06:42:10', status: '분류중', zone: '진접읍' },
  { id: '9', trackingNo: '5839-1029-009', destMain: '퇴계원읍 퇴계원리', destSub: '간선11톤 A-02 도크 하차분', driver: '미배정 (결원)', driverZone: '', scanTime: '06:45:00', status: '미출고', zone: '퇴계원읍' },
  { id: '10', trackingNo: '5839-1029-010', destMain: '오남읍 팔현리', destSub: '간선11톤 A-01 도크 하차분', driver: '조현우', driverZone: '오남1구역', scanTime: '06:50:33', status: '보류', zone: '오남읍' },
];

export const availableDrivers = ['최민호', '강태연', '조현우', '임하늘'];
