import { useState, useMemo } from 'react';
import './LogisticsCS.scss';

type ExceptionType = '파손' | '분실';
type ReceivedPath = '홈페이지 연동' | '현장 직접 등록';
type CsStatus = '확인중' | '창고 보관중' | '위치 추적중' | '보상완료' | '반려';

interface CsItem {
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

const initialItems: CsItem[] = [
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

function statusPillClass(status: CsStatus) {
  switch (status) {
    case '확인중':
      return 'pill yellow';
    case '창고 보관중':
      return 'pill blue';
    case '위치 추적중':
      return 'pill yellow';
    case '보상완료':
      return 'pill green';
    case '반려':
      return 'pill gray';
  }
}

function typePillClass(type: ExceptionType) {
  return type === '파손' ? 'pill red' : 'pill purple';
}

type TabFilter = '전체' | '파손' | '분실' | '처리완료';
type PathFilter = '전체' | '홈페이지 자동연동' | '현장 직접 등록';

export default function LogisticsCS() {
  const [items, setItems] = useState<CsItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<TabFilter>('전체');
  const [pathFilter, setPathFilter] = useState<PathFilter>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const total = items.length;
    const damaged = items.filter((i) => i.type === '파손').length;
    const lost = items.filter((i) => i.type === '분실').length;
    const compensated = items.filter((i) => i.status === '보상완료').length;
    const waitingCustomer = items.filter(
      (i) => i.status === '확인중' || i.status === '위치 추적중' || i.status === '창고 보관중'
    ).length;
    return { total, damaged, lost, compensated, waitingCustomer };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === '파손' && item.type !== '파손') return false;
      if (activeTab === '분실' && item.type !== '분실') return false;
      if (activeTab === '처리완료' && item.status !== '보상완료') return false;

      if (pathFilter === '홈페이지 자동연동' && item.path !== '홈페이지 연동') return false;
      if (pathFilter === '현장 직접 등록' && item.path !== '현장 직접 등록') return false;

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matches =
          item.trackingNo.toLowerCase().includes(term) ||
          item.customerName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      return true;
    });
  }, [items, activeTab, pathFilter, searchTerm]);

  const handleApprove = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    if (!window.confirm(`운송장 ${target.trackingNo} 건의 보상을 승인하시겠습니까?`)) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: '보상완료' } : i))
    );
  };

  const handleCustomerReply = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    alert(`${target.customerName} 고객(${target.customerPhone})에게 회신 알림을 전송했습니다.`);
  };

  const handleReject = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    if (!window.confirm(`운송장 ${target.trackingNo} 건을 반려 처리하시겠습니까?`)) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: '반려' } : i))
    );
  };

  const handleDetail = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    alert(
      `[상세 정보]
운송장 번호: ${target.trackingNo}
유형: ${target.type}
고객: ${target.customerName} (${target.customerPhone})
접수 시간: ${target.receivedTime}
처리 상태: ${target.status}`
    );
  };

  const handleDownloadHistory = () => {
    alert('처리 이력을 다운로드합니다. (CSV 파일로 저장됩니다)');
  };

  const handleRegisterException = () => {
    alert('예외 화물 직접 등록 창을 엽니다.');
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="cs-page admin-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="title-wrap">
            <h2>예외 화물 및 CS 처리반</h2>
            <span className="subtitle">Exception &amp; CS Handling</span>
          </div>
          <p className="update-time">2026년 6월 24일 (수) 기준 · 홈페이지 보상접수와 실시간 연동</p>
        </div>
        <div className="header-right">
          <button className="btn-outline-gray" onClick={handleDownloadHistory}>처리 이력 다운로드</button>
          <button className="btn-primary" onClick={handleRegisterException}>예외 화물 직접 등록</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="cs-summary-cards">
        <div className="summary-card">
          <div className="card-title">전체 예외 화물</div>
          <div className="card-value">{counts.total}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">파손 접수</div>
          <div className="card-value text-red">{counts.damaged}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">분실 접수</div>
          <div className="card-value text-yellow">{counts.lost}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">보상 처리 완료</div>
          <div className="card-value text-green">{counts.compensated}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">고객 응답 대기</div>
          <div className="card-value text-blue">{counts.waitingCustomer}<span>건</span></div>
        </div>
      </div>

      {/* Text Tabs */}
      <div className="text-tabs">
        <div
          className={`tab-item ${activeTab === '전체' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('전체');
            setPage(1);
          }}
        >
          전체 ({counts.total})
        </div>
        <div
          className={`tab-item ${activeTab === '파손' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('파손');
            setPage(1);
          }}
        >
          파손 ({counts.damaged})
        </div>
        <div
          className={`tab-item ${activeTab === '분실' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('분실');
            setPage(1);
          }}
        >
          분실 ({counts.lost})
        </div>
        <div
          className={`tab-item ${activeTab === '처리완료' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('처리완료');
            setPage(1);
          }}
        >
          처리완료 ({counts.compensated})
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-groups">
          <div className="filter-group">
            <span className="group-label">접수 경로</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${pathFilter === '전체' ? 'active' : ''}`}
                onClick={() => {
                  setPathFilter('전체');
                  setPage(1);
                }}
              >
                전체
              </button>
              <button
                className={`filter-btn ${pathFilter === '홈페이지 자동연동' ? 'active' : ''}`}
                onClick={() => {
                  setPathFilter('홈페이지 자동연동');
                  setPage(1);
                }}
              >
                홈페이지 자동연동
              </button>
              <button
                className={`filter-btn ${pathFilter === '현장 직접 등록' ? 'active' : ''}`}
                onClick={() => {
                  setPathFilter('현장 직접 등록');
                  setPage(1);
                }}
              >
                현장 직접 등록
              </button>
            </div>
          </div>
        </div>
        <div className="search-box">
          <span className="search-label">검색</span>
          <input
            type="text"
            placeholder="운송장 번호 또는 고객명으로 검색"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="cs-table">
        <table>
          <thead>
            <tr>
              <th>운송장 번호</th>
              <th>예외 유형</th>
              <th>접수 경로</th>
              <th>고객명 / 연락처</th>
              <th>접수 시간</th>
              <th>처리 상태</th>
              <th>관리 액션</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <a href="#" className="tracking-num">
                    {item.trackingNo}
                  </a>
                </td>
                <td>
                  <span className={typePillClass(item.type)}>{item.type}</span>
                </td>
                <td>
                  <span className="main-text">{item.path}</span>
                  <span className="sub-text">{item.pathDetail}</span>
                </td>
                <td>
                  <span className="main-text">{item.customerName}</span>
                  <span className="sub-text">{item.customerPhone}</span>
                </td>
                <td>{item.receivedTime}</td>
                <td>
                  <span className={statusPillClass(item.status)}>{item.status}</span>
                </td>
                <td>
                  <div className="action-btns">
                    {item.status === '보상완료' || item.status === '반려' ? (
                      <button
                        className="btn-outline-gray"
                        onClick={() => handleDetail(item.id)}
                      >
                        상세 보기
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn-outline-green"
                          onClick={() => handleApprove(item.id)}
                        >
                          보상 승인
                        </button>
                        <button
                          className="btn-outline-gray"
                          onClick={() => handleCustomerReply(item.id)}
                        >
                          고객 회신
                        </button>
                        <button
                          className="btn-outline-red"
                          onClick={() => handleReject(item.id)}
                        >
                          반려
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-wrap">
        <div className="page-info">
          전체 {filteredItems.length}건 중 {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredItems.length)}건 표시
        </div>
        <div className="page-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === page ? 'active' : ''}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          {page < totalPages && (
            <button onClick={() => setPage(page + 1)}>&gt;</button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="footer-info">
        이 목록은 홈페이지의 [파손/분실 보상 접수] 게시판과 실시간으로 연동됩니다. [분류 및 상하차 통제] 화면에서 [파손/보류 처리]된 화물은 자동으로 이 목록에 추가됩니다.
      </div>
    </div>
  );
}
