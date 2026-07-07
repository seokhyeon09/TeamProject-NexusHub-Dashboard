import { useState, useMemo } from 'react';
import './SystemSettings.scss';

type PermissionFilter = '전체' | '센터장' | '반장' | 'CS담당' | '현장직원';
type Permission = '센터장' | '반장' | 'CS담당' | '현장직원';
type AccountStatus = '활성' | '잠금';
type TabFilter = '계정 관리' | '권한 그룹 설정' | '접속 로그';

interface AccountItem {
  id: string;
  name: string;
  loginId: string;
  permission: Permission;
  role: string;
  lastAccess: string;
  status: AccountStatus;
}

const initialAccounts: AccountItem[] = [
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

const permissionOptions: Permission[] = ['센터장', '반장', 'CS담당', '현장직원'];

function permissionBadgeClass(permission: Permission) {
  switch (permission) {
    case '센터장':
      return 'status-badge purple';
    case '반장':
      return 'status-badge blue';
    case 'CS담당':
      return 'status-badge orange';
    case '현장직원':
      return 'status-badge grey';
  }
}

export default function SystemSettings() {
  const [accounts, setAccounts] = useState<AccountItem[]>(initialAccounts);
  const [activeTab, setActiveTab] = useState<TabFilter>('계정 관리');
  const [permissionFilter, setPermissionFilter] = useState<PermissionFilter>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const total = accounts.length + 13;
    const centerHead = accounts.filter((a) => a.permission === '센터장').length;
    const teamLead = accounts.filter((a) => a.permission === '반장').length + 2;
    const csStaff = accounts.filter((a) => a.permission === 'CS담당').length + 2;
    const locked = accounts.filter((a) => a.status === '잠금').length;
    return { total, centerHead, teamLead, csStaff, locked };
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (permissionFilter !== '전체' && acc.permission !== permissionFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matches =
          acc.name.toLowerCase().includes(term) || acc.loginId.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [accounts, permissionFilter, searchTerm]);

  const handleEditPermission = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    const newPermission = window.prompt(
      `${acc.name}의 권한 등급을 변경합니다.
(예: ${permissionOptions.join(', ')})`,
      acc.permission
    ) as Permission | null;
    if (!newPermission) return;
    if (!permissionOptions.includes(newPermission)) {
      alert('올바른 권한 등급을 입력해주세요.');
      return;
    }
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, permission: newPermission } : a))
    );
    alert(`${acc.name}의 권한이 ${newPermission}(으)로 변경되었습니다.`);
  };

  const handleLockAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    if (!window.confirm(`${acc.name}(${acc.loginId}) 계정을 잠그시겠습니까?`)) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: '잠금' } : a))
    );
  };

  const handleUnlockAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    if (!window.confirm(`${acc.name}(${acc.loginId}) 계정의 잠금을 해제하시겠습니까?`)) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: '활성' } : a))
    );
  };

  const handleViewPermissionHistory = () => {
    alert('권한 변경 이력을 표시합니다.');
  };

  const handleCreateAccount = () => {
    alert('신규 계정 생성 창을 엽니다.');
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIdx, startIdx + itemsPerPage);

  const permissionFilterOptions: PermissionFilter[] = ['전체', '센터장', '반장', 'CS담당', '현장직원'];
  const tabOptions: TabFilter[] = ['계정 관리', '권한 그룹 설정', '접속 로그'];

  return (
    <div className="system-settings-page">
      <div className="page-header">
        <div className="header-titles">
          <div className="title-row">
            <h2>시스템 설정 및 권한 관리</h2>
            <span className="subtitle">System &amp; Permission Settings</span>
          </div>
          <p className="description">터미널 직원 계정 생성 및 권한 설정</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleViewPermissionHistory}>권한 변경 이력</button>
          <button className="btn-primary" onClick={handleCreateAccount}>신규 계정 생성</button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-label">전체 계정</span>
          <div className="stat-value"><strong>{stats.total}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">센터장</span>
          <div className="stat-value text-blue"><strong>{stats.centerHead}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">반장</span>
          <div className="stat-value text-green"><strong>{stats.teamLead}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">CS 담당</span>
          <div className="stat-value text-orange"><strong>{stats.csStaff}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">계정 잠금/대기</span>
          <div className="stat-value text-red"><strong>{stats.locked}</strong>건</div>
        </div>
      </div>

      <div className="tabs-section">
        {tabOptions.map((opt) => (
          <button
            key={opt}
            className={`tab-item ${activeTab === opt ? 'active' : ''}`}
            onClick={() => setActiveTab(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {activeTab === '계정 관리' && (
        <>
          <div className="filter-section">
            <div className="filter-group">
              <span className="filter-label">권한</span>
              <div className="filter-buttons">
                {permissionFilterOptions.map((opt) => (
                  <button
                    key={opt}
                    className={`filter-btn ${permissionFilter === opt ? 'active' : ''}`}
                    onClick={() => {
                      setPermissionFilter(opt);
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
                placeholder="이름 또는 아이디로 검색"
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
                  <th>아이디</th>
                  <th>권한 등급</th>
                  <th>소속 / 직책</th>
                  <th>최근 접속</th>
                  <th>계정 상태</th>
                  <th>관리 액션</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map((acc) => (
                  <tr key={acc.id} className={acc.status === '잠금' ? 'row-alert' : undefined}>
                    <td><strong>{acc.name}</strong></td>
                    <td className="text-gray">{acc.loginId}</td>
                    <td>
                      <span className={permissionBadgeClass(acc.permission)}>
                        <span className="dot"></span> {acc.permission}
                      </span>
                    </td>
                    <td>{acc.role}</td>
                    <td className="text-gray">{acc.lastAccess}</td>
                    <td>
                      <span className={acc.status === '활성' ? 'status-badge green' : 'status-badge red'}>
                        <span className="dot"></span> {acc.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {acc.status === '잠금' ? (
                          <>
                            <button className="btn-action success-light" onClick={() => handleUnlockAccount(acc.id)}>
                              잠금 해제
                            </button>
                            <button className="btn-action" onClick={() => handleEditPermission(acc.id)}>
                              권한 수정
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-action" onClick={() => handleEditPermission(acc.id)}>
                              권한 수정
                            </button>
                            <button className="btn-action danger-light" onClick={() => handleLockAccount(acc.id)}>
                              계정 잠금
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
                전체 {filteredAccounts.length}명 중 {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredAccounts.length)}명 표시
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
        </>
      )}

      {activeTab === '권한 그룹 설정' && (
        <div className="data-table-container">
          <p style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
            권한 그룹별 메뉴 접근 범위 설정 화면입니다. (센터장 / 반장 / CS담당 / 현장직원)
          </p>
        </div>
      )}

      {activeTab === '접속 로그' && (
        <div className="data-table-container">
          <p style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
            최근 계정 접속 이력이 표시되는 화면입니다.
          </p>
        </div>
      )}

      <div className="footer-note">
        권한 등급은 센터장, 반장, CS담당, 현장직원으로 구분되며 각 등급별로 접근 가능한 메뉴가 다르게 설정됩니다. [권한 수정]에서 등급별 메뉴 접근 범위를 세부 조정할 수 있습니다.
      </div>
    </div>
  );
}
