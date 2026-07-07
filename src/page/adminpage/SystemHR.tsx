import { useState, useMemo } from 'react';
import './SystemHR.scss';

type TeamFilter = '전체 인력' | '하차반' | '분류반' | '상차반';
type StatusFilter = '전체' | '근무중' | '결근' | '지각' | '퇴근';
type WorkStatus = '근무중' | '결근' | '지각' | '퇴근';
type Team = '하차반' | '분류반' | '상차반';

interface StaffItem {
  id: string;
  name: string;
  team: Team;
  workHours: string;
  clockIn: string;
  clockOut: string;
  status: WorkStatus;
}

const initialStaff: StaffItem[] = [
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

const availableSubstitutes = ['남기훈', '오하린', '정예준', '류지아'];

function statusBadgeClass(status: WorkStatus) {
  switch (status) {
    case '근무중':
      return 'status-badge green';
    case '지각':
      return 'status-badge yellow';
    case '결근':
      return 'status-badge red';
    case '퇴근':
      return 'status-badge grey';
  }
}

export default function SystemHR() {
  const [staff, setStaff] = useState<StaffItem[]>(initialStaff);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('전체 인력');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [scheduleViewOpen, setScheduleViewOpen] = useState(false);

  const stats = useMemo(() => {
    const total = staff.length + 35;
    const present = staff.filter((s) => s.status === '근무중' || s.status === '지각').length + 34;
    const absent = staff.filter((s) => s.status === '결근').length;
    const late = staff.filter((s) => s.status === '지각').length;
    const working = staff.filter((s) => s.status === '근무중').length + 34;
    return { total, present, absent, late, working };
  }, [staff]);

  const teamCounts = useMemo(() => {
    return {
      '전체 인력': staff.length + 35,
      '하차반': staff.filter((s) => s.team === '하차반').length,
      '분류반': staff.filter((s) => s.team === '분류반').length,
      '상차반': staff.filter((s) => s.team === '상차반').length,
    };
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      if (teamFilter !== '전체 인력' && s.team !== teamFilter) return false;
      if (statusFilter !== '전체' && s.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        if (!s.name.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [staff, teamFilter, statusFilter, searchTerm]);

  const handleScheduleChange = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;
    const newHours = window.prompt(
      `${person.name}의 근무 시간을 변경합니다.`,
      person.workHours
    );
    if (!newHours) return;
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, workHours: newHours } : s))
    );
    alert(`${person.name}의 근무 시간이 변경되었습니다.`);
  };

  const handleMarkAbsent = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;
    if (!window.confirm(`${person.name}을(를) 결근 처리하시겠습니까?`)) return;
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: '결근', clockIn: '미출근' } : s))
    );
  };

  const handleAssignSubstitute = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;
    const substituteName = window.prompt(
      `${person.team}에 대타 인력을 배정합니다.
(예: ${availableSubstitutes.join(', ')})`,
      availableSubstitutes[0]
    );
    if (!substituteName) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, name: substituteName, status: '근무중', clockIn: timeStr, clockOut: '-' }
          : s
      )
    );
    alert(`${person.team}에 ${substituteName}(이)가 대타로 배정되었습니다.`);
  };

  const handleViewWorkLog = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;
    alert(
      `[근무 기록]
이름: ${person.name}
소속 반: ${person.team}
근무 시간: ${person.workHours}
출근: ${person.clockIn}
퇴근: ${person.clockOut}
상태: ${person.status}`
    );
  };

  const handleWeeklySchedule = () => {
    setScheduleViewOpen(true);
    alert('주간 스케줄을 표시합니다.');
  };

  const handleRegisterStaff = () => {
    alert('신규 인력 등록 창을 엽니다.');
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIdx, startIdx + itemsPerPage);

  const teamOptions: TeamFilter[] = ['전체 인력', '하차반', '분류반', '상차반'];
  const statusOptions: StatusFilter[] = ['전체', '근무중', '결근', '지각', '퇴근'];

  return (
    <div className="system-hr-page">
      <div className="page-header">
        <div className="header-titles">
          <div className="title-row">
            <h2>현장 인력 관리</h2>
            <span className="subtitle">On-site Staff Management</span>
          </div>
          <p className="description">
            일일 상하차 작업자(아르바이트 등) 출퇴근 및 스케줄{scheduleViewOpen ? ' · 주간 스케줄 표시 중' : ''}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleWeeklySchedule}>주간 스케줄 보기</button>
          <button className="btn-primary" onClick={handleRegisterStaff}>신규 인력 등록</button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-label">금일 배정 인원</span>
          <div className="stat-value"><strong>{stats.total}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">출근 완료</span>
          <div className="stat-value text-green"><strong>{stats.present}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">결근</span>
          <div className="stat-value text-red"><strong>{stats.absent}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">지각</span>
          <div className="stat-value text-orange"><strong>{stats.late}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">근무 중</span>
          <div className="stat-value text-blue"><strong>{stats.working}</strong>명</div>
        </div>
      </div>

      <div className="tabs-section">
        {teamOptions.map((opt) => (
          <button
            key={opt}
            className={`tab-item ${teamFilter === opt ? 'active' : ''}`}
            onClick={() => {
              setTeamFilter(opt);
              setPage(1);
            }}
          >
            {opt === '전체 인력' ? `전체 인력 (${teamCounts[opt]})` : opt}
          </button>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <span className="filter-label">근무 상태</span>
          <div className="filter-buttons">
            {statusOptions.map((opt) => (
              <button
                key={opt}
                className={`filter-btn ${statusFilter === opt ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(opt);
                  setPage(1);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="search-box">
          <span className="search-label">검색</span>
          <input
            type="text"
            placeholder="이름으로 검색"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>소속 반</th>
              <th>근무 시간</th>
              <th>출근 시각</th>
              <th>퇴근 시각</th>
              <th>근무 상태</th>
              <th>관리 액션</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaff.map((person) => (
              <tr key={person.id} className={person.status === '결근' ? 'row-alert' : undefined}>
                <td><strong>{person.name}</strong></td>
                <td>{person.team}</td>
                <td>{person.workHours}</td>
                <td className={person.clockIn === '미출근' ? 'text-red' : undefined}>{person.clockIn}</td>
                <td>{person.clockOut}</td>
                <td>
                  <span className={statusBadgeClass(person.status)}>
                    <span className="dot"></span> {person.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {person.status === '결근' ? (
                      <button className="btn-action primary-light" onClick={() => handleAssignSubstitute(person.id)}>
                        대타 인력 배정
                      </button>
                    ) : person.status === '퇴근' ? (
                      <button className="btn-action" onClick={() => handleViewWorkLog(person.id)}>
                        근무 기록 보기
                      </button>
                    ) : (
                      <>
                        <button className="btn-action" onClick={() => handleScheduleChange(person.id)}>
                          스케줄 변경
                        </button>
                        <button className="btn-action danger-light" onClick={() => handleMarkAbsent(person.id)}>
                          결근 처리
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-container">
          <span className="pagination-info">
            전체 {filteredStaff.length}명 중 {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredStaff.length)}명 표시
          </span>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button className="page-btn next" onClick={() => setPage(page + 1)}>›</button>
            )}
          </div>
        </div>
      </div>

      <div className="footer-note">
        결근으로 처리된 인력은 [대타 인력 배정] 버튼을 통해 대체 인력 풀에서 즉시 배정할 수 있습니다.
      </div>
    </div>
  );
}
