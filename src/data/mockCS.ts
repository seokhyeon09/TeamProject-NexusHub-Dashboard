export type ExceptionType = '파손' | '분실';
export type ReceivedPath = '홈페이지 연동' | '현장 직접 등록';
export type CsStatus = '확인중' | '창고 보관중' | '위치 추적중' | '보상완료' | '반려';
export type TabFilter = '전체' | '파손' | '분실' | '처리완료';
export type PathFilter = '전체' | '홈페이지 자동연동' | '현장 직접 등록';

export interface CsItem {
  id: string;
  trackingNo: string;
  type: ExceptionType;
  path: ReceivedPath;
  pathDetail: string;
  customerName: string;
  customerPhone: string;
  receivedTime: string;
  status: CsStatus;
}

export const initialItems: CsItem[] = [
  {
    id: '1',
    trackingNo: '5839-1029-003',
    type: '파손',
    path: '홈페이지 연동',
    pathDetail: '파손/분실 보상 접수',
    customerName: '최은서',
    customerPhone: '010-22**-99**',
    receivedTime: '08:02:14',
    status: '확인중',
  },
  {
    id: '2',
    trackingNo: '5839-0988-117',
    type: '파손',
    path: '현장 직접 등록',
    pathDetail: '레일 상 파손 발생',
    customerName: '한지우',
    customerPhone: '010-33**-21**',
    receivedTime: '07:48:02',
    status: '창고 보관중',
  },
  {
    id: '3',
    trackingNo: '5839-0975-042',
    type: '분실',
    path: '홈페이지 연동',
    pathDetail: '파손/분실 보상 접수',
    customerName: '오태양',
    customerPhone: '010-45**-88**',
    receivedTime: '07:30:55',
    status: '위치 추적중',
  },
  {
    id: '4',
    trackingNo: '5839-0961-209',
    type: '파손',
    path: '현장 직접 등록',
    pathDetail: '상하차 중 박스 파손',
    customerName: '서윤아',
    customerPhone: '010-19**-44**',
    receivedTime: '06:55:30',
    status: '보상완료',
  },
  {
    id: '5',
    trackingNo: '5839-0942-330',
    type: '분실',
    path: '홈페이지 연동',
    pathDetail: '파손/분실 보상 접수',
    customerName: '강도윤',
    customerPhone: '010-77**-12**',
    receivedTime: '06:40:11',
    status: '보상완료',
  },
];
