export type TeamFilter = '전체 인력' | '하차반' | '분류반' | '상차반';
export type StatusFilter = '전체' | '근무중' | '결근' | '지각' | '퇴근';
export type WorkStatus = '근무중' | '결근' | '지각' | '퇴근';
export type Team = '하차반' | '분류반' | '상차반';

export interface StaffItem {
  id: string;
  name: string;
  team: Team;
  workHours: string;
  clockIn: string;
  clockOut: string;
  status: WorkStatus;
}

export const initialStaff: StaffItem[] = [
  {
    id: '1',
    name: '윤도현',
    team: '하차반',
    workHours: '06:00 - 14:00',
    clockIn: '05:58',
    clockOut: '-',
    status: '근무중',
  },
  {
    id: '2',
    name: '서지안',
    team: '분류반',
    workHours: '06:00 - 14:00',
    clockIn: '06:21',
    clockOut: '-',
    status: '지각',
  },
  {
    id: '3',
    name: '한승우',
    team: '상차반',
    workHours: '06:00 - 14:00',
    clockIn: '미출근',
    clockOut: '-',
    status: '결근',
  },
  {
    id: '4',
    name: '백서윤',
    team: '분류반',
    workHours: '06:00 - 14:00',
    clockIn: '05:55',
    clockOut: '-',
    status: '근무중',
  },
  {
    id: '5',
    name: '조은우',
    team: '하차반',
    workHours: '22:00 - 06:00',
    clockIn: '21:59',
    clockOut: '06:02',
    status: '퇴근',
  },
];

export const availableSubstitutes = ['남기훈', '오하린', '정예준', '류지아'];
