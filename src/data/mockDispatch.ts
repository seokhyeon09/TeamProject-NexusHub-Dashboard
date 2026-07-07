export type ZoneFilter = '전체 구역' | '진접읍' | '오남읍' | '별내동' | '퇴계원읍';
export type StatusFilter = '전체' | '정상 운행' | '결원';
export type RowStatus = '정상 운행' | '결원' | '배송완료';

export interface ZoneRow {
  id: string;
  zoneName: string;
  zoneSub: string;
  zoneCategory: ZoneFilter;
  driver: string | null;
  vehicle: string;
  volume: number;
  progress: number;
  status: RowStatus;
}

export const initialRows: ZoneRow[] = [
  {
    id: '1',
    zoneName: '진접1구역',
    zoneSub: '장현리, 부평리',
    zoneCategory: '진접읍',
    driver: '김철수',
    vehicle: '12바 3301',
    volume: 118,
    progress: 90,
    status: '정상 운행',
  },
  {
    id: '2',
    zoneName: '오남2구역',
    zoneSub: '오남리, 양지리',
    zoneCategory: '오남읍',
    driver: '이영희',
    vehicle: '34다 1190',
    volume: 96,
    progress: 60,
    status: '정상 운행',
  },
  {
    id: '3',
    zoneName: '별내3구역',
    zoneSub: '별내동 아파트 단지',
    zoneCategory: '별내동',
    driver: '박지민',
    vehicle: '56가 7720',
    volume: 104,
    progress: 50,
    status: '정상 운행',
  },
  {
    id: '4',
    zoneName: '퇴계원1구역',
    zoneSub: '퇴계원읍 전역',
    zoneCategory: '퇴계원읍',
    driver: null,
    vehicle: '-',
    volume: 82,
    progress: 0,
    status: '결원',
  },
  {
    id: '5',
    zoneName: '진접2구역',
    zoneSub: '내각리, 연평리',
    zoneCategory: '진접읍',
    driver: '정수민',
    vehicle: '21마 4453',
    volume: 89,
    progress: 100,
    status: '배송완료',
  },
];

export const availableDrivers = ['최우진', '서지훈', '한소미', '배기범'];
