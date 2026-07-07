export type PickupZone = '전체 구역' | '진접읍' | '오남읍' | '별내동';
export type PickupStatusFilter = '전체' | '배정 대기' | '배정 완료' | '수거 완료';
export type PickupStatus = '배정대기' | '배정완료' | '수거완료';

export interface PickupItem {
  id: string;
  shopName: string;
  applicantName: string;
  address: string;
  zone: PickupZone;
  timeSlot: string;
  driver: string | null;
  status: PickupStatus;
}

export const initialItems: PickupItem[] = [
  {
    id: '1',
    shopName: '진접 분식당',
    applicantName: '윤서연',
    address: '진접읍 장현리 123-4',
    zone: '진접읍',
    timeSlot: '10:00~11:00',
    driver: '김철수',
    status: '배정완료',
  },
  {
    id: '2',
    shopName: '오남 수제청 공방',
    applicantName: '박하늘',
    address: '오남읍 오남리 56-2',
    zone: '오남읍',
    timeSlot: '11:00~12:00',
    driver: '이영희',
    status: '수거완료',
  },
  {
    id: '3',
    shopName: '별내 핸드메이드샵',
    applicantName: '안도현',
    address: '별내동 805-1 아파트',
    zone: '별내동',
    timeSlot: '13:00~14:00',
    driver: null,
    status: '배정대기',
  },
  {
    id: '4',
    shopName: '퇴계원 인쇄소',
    applicantName: '신유진',
    address: '퇴계원읍 119-7',
    zone: '전체 구역',
    timeSlot: '14:00~15:00',
    driver: null,
    status: '배정대기',
  },
  {
    id: '5',
    shopName: '진접 꽃집 라일락',
    applicantName: '임소율',
    address: '진접읍 부평리 12',
    zone: '진접읍',
    timeSlot: '09:00~10:00',
    driver: '정수민',
    status: '수거완료',
  },
  {
    id: '6',
    shopName: '진접 철물점',
    applicantName: '김동현',
    address: '진접읍 금곡리 45',
    zone: '진접읍',
    timeSlot: '15:00~16:00',
    driver: '최우진',
    status: '수거완료',
  },
  {
    id: '7',
    shopName: '오남 베이커리',
    applicantName: '이지은',
    address: '오남읍 양지리 77',
    zone: '오남읍',
    timeSlot: '16:00~17:00',
    driver: null,
    status: '배정대기',
  },
  {
    id: '8',
    shopName: '별내 카페거리 커피숍',
    applicantName: '박지성',
    address: '별내동 100-2',
    zone: '별내동',
    timeSlot: '10:00~11:00',
    driver: '서지훈',
    status: '배정완료',
  },
  {
    id: '9',
    shopName: '퇴계원 마트',
    applicantName: '최민수',
    address: '퇴계원읍 220-5',
    zone: '전체 구역',
    timeSlot: '11:00~12:00',
    driver: '한소미',
    status: '수거완료',
  },
  {
    id: '10',
    shopName: '진접 과일가게',
    applicantName: '정우성',
    address: '진접읍 장현리 15-2',
    zone: '진접읍',
    timeSlot: '14:00~15:00',
    driver: null,
    status: '배정대기',
  },
];

export const availableDrivers = ['최우진', '서지훈', '한소미', '배기범'];
