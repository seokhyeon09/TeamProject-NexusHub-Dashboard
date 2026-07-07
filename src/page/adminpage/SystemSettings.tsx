import { useState, useMemo, useEffect } from 'react';
import './SystemSettings.scss';
import Modal from '../../components/Modal';
import {
  type PermissionFilter,
  type Permission,
  type TabFilter,
  type AccountItem,
  initialAccounts,
  permissionOptions
} from '../../data/mockSettings';

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
  const [accounts, setAccounts] = useState<AccountItem[]>(() => {
    const saved = sessionStorage.getItem('mock_settings_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  useEffect(() => {
    sessionStorage.setItem('mock_settings_accounts', JSON.stringify(accounts));
  }, [accounts]);
  const [activeTab, setActiveTab] = useState<TabFilter>('계정 관리');
  const [permissionFilter, setPermissionFilter] = useState<PermissionFilter>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

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
    const total = accounts.length;
    const centerHead = accounts.filter((a) => a.permission === '센터장').length;
    const teamLead = accounts.filter((a) => a.permission === '반장').length;
    const csStaff = accounts.filter((a) => a.permission === 'CS담당').length;
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
    
    let newPermission = acc.permission;

    setModalContent({
      title: '권한 변경',
      submitText: '변경하기',
      content: (
        <div className="form-group">
          <label>{acc.name} ({acc.loginId})의 권한 등급을 선택하세요</label>
          <select onChange={(e) => newPermission = e.target.value as Permission} defaultValue={newPermission}>
            {permissionOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      ),
      onSubmit: () => {
        setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, permission: newPermission } : a)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleLockAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    
    setModalContent({
      title: '계정 잠금 처리',
      submitText: '계정 잠금',
      content: <p><b>{acc.name}({acc.loginId})</b> 계정을 잠그시겠습니까?</p>,
      onSubmit: () => {
        setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: '잠금' } : a)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleUnlockAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    
    setModalContent({
      title: '계정 잠금 해제',
      submitText: '잠금 해제',
      content: <p><b>{acc.name}({acc.loginId})</b> 계정의 잠금을 해제하시겠습니까?</p>,
      onSubmit: () => {
        setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: '활성' } : a)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleViewPermissionHistory = () => {
    setModalContent({
      title: '권한 변경 이력',
      noFooter: true,
      content: (
        <div style={{ textAlign: 'center' }}>
          <p>최근 7일간 권한 변경 내역</p>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>[2026-06-24] 김정수(CS담당) → (반장) 승급</li>
            <li>[2026-06-23] 박지훈(신규가입) → (현장직원) 배정</li>
            <li>[2026-06-21] 최영민(현장직원) → 계정 잠금 처리</li>
          </ul>
        </div>
      )
    });
    setModalOpen(true);
  };

  const handleCreateAccount = () => {
    let name = '';
    let loginId = '';
    let permission: Permission = '현장직원';

    setModalContent({
      title: '신규 계정 생성',
      submitText: '생성',
      content: (
        <>
          <div className="form-group">
            <label>이름</label>
            <input type="text" placeholder="예: 박지훈" onChange={e => name = e.target.value} />
          </div>
          <div className="form-group">
            <label>로그인 ID</label>
            <input type="text" placeholder="예: nexus_park" onChange={e => loginId = e.target.value} />
          </div>
          <div className="form-group">
            <label>초기 권한</label>
            <select onChange={e => permission = e.target.value as Permission} defaultValue={permission}>
              <option value="현장직원">현장직원</option>
              <option value="CS담당">CS담당</option>
              <option value="반장">반장</option>
              <option value="센터장">센터장</option>
            </select>
          </div>
        </>
      ),
      onSubmit: () => {
        if (!name.trim() || !loginId.trim()) return;
        const newAccount: AccountItem = {
          id: Date.now().toString(),
          name,
          loginId,
          permission,
          role: permission,
          lastAccess: '접속 이력 없음',
          status: '활성'
        };
        setAccounts(prev => [newAccount, ...prev]);
        setModalOpen(false);
      }
    });
    setModalOpen(true);
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
            )}
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
