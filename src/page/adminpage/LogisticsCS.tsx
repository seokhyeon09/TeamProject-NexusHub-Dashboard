import { useState, useMemo, useEffect } from 'react';
import './LogisticsCS.scss';
import Modal from '../../components/Modal';
import {
  type ExceptionType,
  type CsStatus,
  type TabFilter,
  type PathFilter,
  type CsItem,
  initialItems
} from '../../data/mockCS';
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

export default function LogisticsCS() {
  const [items, setItems] = useState<CsItem[]>(() => {
    const saved = sessionStorage.getItem('mock_cs_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  useEffect(() => {
    sessionStorage.setItem('mock_cs_items', JSON.stringify(items));
  }, [items]);
  const [activeTab, setActiveTab] = useState<TabFilter>('전체');
  const [pathFilter, setPathFilter] = useState<PathFilter>('전체');
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

    setModalContent({
      title: '보상 승인',
      submitText: '승인하기',
      content: <p>운송장 <b>{target.trackingNo}</b> 건의 보상을 승인하시겠습니까?</p>,
      onSubmit: () => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: '보상완료' } : i)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleCustomerReply = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    let replyMsg = '';
    setModalContent({
      title: '고객 회신 전송',
      submitText: '전송',
      content: (
        <>
          <div style={{ marginBottom: '16px' }}>
            수신자: <b>{target.customerName}</b> 고객 ({target.customerPhone})
          </div>
          <div className="form-group">
            <label>회신 메시지 입력</label>
            <textarea rows={4} placeholder="고객에게 안내할 내용을 입력하세요." onChange={e => replyMsg = e.target.value}></textarea>
          </div>
        </>
      ),
      onSubmit: () => {
        if (!replyMsg.trim()) return;
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: '확인중' } : i))); // 상태 임의 변경
        setModalContent({ title: '전송 완료', content: <p>회신 알림이 전송되었습니다.</p>, noFooter: true });
        setTimeout(() => setModalOpen(false), 2000);
      }
    });
    setModalOpen(true);
  };

  const handleReject = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    setModalContent({
      title: '반려 처리',
      submitText: '반려',
      content: <p>운송장 <b>{target.trackingNo}</b> 건을 반려 처리하시겠습니까?</p>,
      onSubmit: () => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: '반려' } : i)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleDetail = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    setModalContent({
      title: '예외/CS 상세 정보',
      noFooter: true,
      content: (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
          <li><strong>운송장 번호:</strong> {target.trackingNo}</li>
          <li><strong>유형:</strong> {target.type}</li>
          <li><strong>고객:</strong> {target.customerName} ({target.customerPhone})</li>
          <li><strong>접수 시간:</strong> {target.receivedTime}</li>
          <li><strong>처리 상태:</strong> {target.status}</li>
        </ul>
      )
    });
    setModalOpen(true);
  };

  const handleDownloadHistory = () => {
    setModalContent({
      title: '다운로드 준비 중',
      noFooter: true,
      content: <p>처리 이력을 CSV 파일로 다운로드 중입니다...</p>
    });
    setModalOpen(true);
    setTimeout(() => {
      setModalOpen(false);
    }, 1500);
  };

  const handleRegisterException = () => {
    let trackingNo = '';
    let type: ExceptionType = '파손';
    let customerName = '';

    setModalContent({
      title: '예외 화물 수동 접수',
      submitText: '접수',
      content: (
        <>
          <div className="form-group">
            <label>운송장 번호</label>
            <input type="text" placeholder="예: 5839-xxxx-xxxx" onChange={e => trackingNo = e.target.value} />
          </div>
          <div className="form-group">
            <label>유형</label>
            <select onChange={e => type = e.target.value as ExceptionType} defaultValue={type}>
              <option value="파손">파손</option>
              <option value="분실">분실</option>
            </select>
          </div>
          <div className="form-group">
            <label>고객명</label>
            <input type="text" placeholder="예: 홍길동" onChange={e => customerName = e.target.value} />
          </div>
        </>
      ),
      onSubmit: () => {
        if (!trackingNo || !customerName) return;
        const newItem: CsItem = {
          id: Date.now().toString(),
          trackingNo,
          type,
          customerName,
          customerPhone: '010-0000-0000',
          path: '현장 직접 등록',
          pathDetail: '수동 등록',
          receivedTime: new Date().toTimeString().slice(0,8),
          status: '확인중'
        };
        setItems(prev => [newItem, ...prev]);
        setModalOpen(false);
      }
    });
    setModalOpen(true);
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

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}

      {/* Footer Info */}
      <div className="footer-info">
        이 목록은 홈페이지의 [파손/분실 보상 접수] 게시판과 실시간으로 연동됩니다. [분류 및 상하차 통제] 화면에서 [파손/보류 처리]된 화물은 자동으로 이 목록에 추가됩니다.
      </div>
    </div>
  );
}
