export type PermissionFilter = '전체' | '센터장' | '반장' | 'CS담당' | '현장직원';
export type Permission = '센터장' | '반장' | 'CS담당' | '현장직원';
export type AccountStatus = '활성' | '잠금';
export type TabFilter = '계정 관리' | '권한 그룹 설정' | '접속 로그';

export interface AccountItem {
  id: string;
  name: string;
  loginId: string;
  permission: Permission;
  role: string;
  lastAccess: string;
  status: AccountStatus;
}

export const initialAccounts: AccountItem[] = [
  {
    id: '1',
    name: '오현석',
    loginId: 'hsoh',
    permission: '센터장',
    role: '남양주 터미널장',
    lastAccess: '오늘 08:10',
    status: '활성',
  },
  {
    id: '2',
    name: '김민준',
    loginId: 'mjkim',
    permission: '반장',
    role: '분류반 반장',
    lastAccess: '오늘 09:42',
    status: '활성',
  },
  {
    id: '3',
    name: '류하경',
    loginId: 'hkryu',
    permission: 'CS담당',
    role: '예외 화물 처리반',
    lastAccess: '오늘 09:15',
    status: '활성',
  },
  {
    id: '4',
    name: '신동훈',
    loginId: 'dhshin',
    permission: '현장직원',
    role: '상차반',
    lastAccess: '3일 전',
    status: '잠금',
  },
  {
    id: '5',
    name: '백나윤',
    loginId: 'nybaek',
    permission: '반장',
    role: '하차반 반장',
    lastAccess: '오늘 07:50',
    status: '활성',
  },
];

export const permissionOptions: Permission[] = ['센터장', '반장', 'CS담당', '현장직원'];
