import { useState, useMemo, useEffect } from 'react';
import './SystemHR.scss';
import Modal from '../../components/Modal';
import {
  type TeamFilter,
  type StatusFilter,
  type WorkStatus,
  type Team,
  type StaffItem,
  initialStaff,
  availableSubstitutes
} from '../../data/mockHR';

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
  const [staff, setStaff] = useState<StaffItem[]>(() => {
    const saved = sessionStorage.getItem('mock_hr_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  useEffect(() => {
    sessionStorage.setItem('mock_hr_staff', JSON.stringify(staff));
  }, [staff]);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('전체 인력');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [scheduleViewOpen, setScheduleViewOpen] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: React.ReactNode;
    submitText?: string;
    cancelText?: string;
    onSubmit?: () => void;
    noFooter?: boolean;
  } | null>(null);

  const stats = useMemo(() => {
    const total = staff.length;
    const present = staff.filter((s) => s.status === '근무중' || s.status === '지각').length;
    const absent = staff.filter((s) => s.status === '결근').length;
    const late = staff.filter((s) => s.status === '지각').length;
    const working = staff.filter((s) => s.status === '근무중').length;
    return { total, present, absent, late, working };
  }, [staff]);

  const teamCounts = useMemo(() => {
    return {
      '전체 인력': staff.length,
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
    
    let newHours = person.workHours;

    setModalContent({
      title: '근무 시간 변경',
      submitText: '변경하기',
      content: (
        <div className="form-group">
          <label>{person.name}의 근무 시간 입력</label>
          <input type="text" defaultValue={newHours} onChange={(e) => newHours = e.target.value} />
        </div>
      ),
      onSubmit: () => {
        if (!newHours.trim()) return;
        setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, workHours: newHours } : s)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleMarkAbsent = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;

    setModalContent({
      title: '결근 처리',
      submitText: '결근 처리',
      content: <p><b>{person.name}</b>을(를) 결근 처리하시겠습니까?</p>,
      onSubmit: () => {
        setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status: '결근', clockIn: '미출근' } : s)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleMarkPresent = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;

    setModalContent({
      title: '출근 처리',
      submitText: '출근 처리',
      content: <p><b>{person.name}</b>을(를) 출근 처리하시겠습니까?</p>,
      onSubmit: () => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status: '근무중', clockIn: timeStr } : s)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleAssignSubstitute = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;

    let substituteName = availableSubstitutes[0];

    setModalContent({
      title: '대타 배정',
      submitText: '배정',
      content: (
        <div className="form-group">
          <label>{person.team}에 배정할 대타 인력 선택</label>
          <select onChange={(e) => substituteName = e.target.value} defaultValue={substituteName}>
            {availableSubstitutes.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      ),
      onSubmit: () => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setStaff((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, name: substituteName, status: '근무중', clockIn: timeStr, clockOut: '-' }
              : s
          )
        );
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleViewWorkLog = (id: string) => {
    const person = staff.find((s) => s.id === id);
    if (!person) return;

    setModalContent({
      title: '근무 기록 상세',
      noFooter: true,
      content: (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
          <li><strong>이름:</strong> {person.name}</li>
          <li><strong>소속 반:</strong> {person.team}</li>
          <li><strong>근무 시간:</strong> {person.workHours}</li>
          <li><strong>출근:</strong> {person.clockIn}</li>
          <li><strong>퇴근:</strong> {person.clockOut}</li>
          <li><strong>상태:</strong> {person.status}</li>
        </ul>
      )
    });
    setModalOpen(true);
  };

  const handleWeeklySchedule = () => {
    setScheduleViewOpen(true);
    setModalContent({
      title: '주간 스케줄 표',
      noFooter: true,
      content: (
        <div style={{ textAlign: 'center' }}>
          <p>이번 주 A조/B조/상하차반 스케줄 요약</p>
          <div style={{ overflowX: 'auto', marginTop: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th>조</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th><th>일</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>A조</td><td>주간</td><td>주간</td><td>주간</td><td>야간</td><td>야간</td><td>휴무</td><td>휴무</td></tr>
                <tr><td>B조</td><td>휴무</td><td>휴무</td><td>야간</td><td>주간</td><td>주간</td><td>주간</td><td>야간</td></tr>
                <tr><td>상하차</td><td>야간</td><td>야간</td><td>휴무</td><td>휴무</td><td>주간</td><td>주간</td><td>주간</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    });
    setModalOpen(true);
  };

  const handleRegisterStaff = () => {
    let name = '';
    let team: Team = '분류반';
    let workHours = '09:00 - 18:00';

    setModalContent({
      title: '신규 인력 등록',
      submitText: '등록',
      content: (
        <>
          <div className="form-group">
            <label>직원 이름</label>
            <input type="text" placeholder="예: 김철수" onChange={e => name = e.target.value} />
          </div>
          <div className="form-group">
            <label>소속 반</label>
            <select onChange={e => team = e.target.value as Team} defaultValue={team}>
              <option value="분류반">분류반</option>
              <option value="하차반">하차반</option>
              <option value="상차반">상차반</option>
            </select>
          </div>
          <div className="form-group">
            <label>근무 시간 (스케줄)</label>
            <input type="text" defaultValue={workHours} onChange={e => workHours = e.target.value} />
          </div>
        </>
      ),
      onSubmit: () => {
        if (!name.trim()) return;
        const newPerson: StaffItem = {
          id: Date.now().toString(),
          name,
          team,
          workHours,
          clockIn: '-',
          clockOut: '-',
          status: '결근'
        };
        setStaff(prev => [newPerson, ...prev]);
        setModalOpen(false);
      }
    });
    setModalOpen(true);
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
                      <>
                        <button className="btn-action primary-light" onClick={() => handleAssignSubstitute(person.id)}>
                          대타 인력 배정
                        </button>
                        <button className="btn-action success-light" onClick={() => handleMarkPresent(person.id)}>
                          출근 처리
                        </button>
                      </>
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

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalContent?.title || ''}
          onSubmit={modalContent?.onSubmit}
          submitText={modalContent?.submitText}
          cancelText={modalContent?.cancelText}
          noFooter={modalContent?.noFooter}
        >
          {modalContent?.content}
        </Modal>

        {totalPages > 1 && (
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
        )}
      </div>

      <div className="footer-note">
        결근으로 처리된 인력은 [대타 인력 배정] 버튼을 통해 대체 인력 풀에서 즉시 배정할 수 있습니다.
      </div>
    </div>
  );
}
