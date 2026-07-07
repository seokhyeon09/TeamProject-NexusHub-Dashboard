import { useState, useMemo, useEffect } from 'react';
import './LogisticsControl.scss';
import Modal from '../../components/Modal';
import {
  type StatusFilter,
  type ZoneFilter,
  type ItemStatus,
  type ControlItem,
  initialItems,
  availableDrivers
} from '../../data/mockControl';

const statusPillClass: Record<ItemStatus, string> = {
  '상차완료': 'green',
  '분류중': 'yellow',
  '하차완료': 'blue',
  '미출고': 'red',
  '보류': 'red',
};

export default function LogisticsControl() {
  const [items, setItems] = useState<ControlItem[]>(() => {
    const saved = sessionStorage.getItem('mock_control_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  useEffect(() => {
    sessionStorage.setItem('mock_control_items', JSON.stringify(items));
  }, [items]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('전체 구역');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesStatus = statusFilter === '전체' || item.status === statusFilter;
      const matchesZone = zoneFilter === '전체 구역' || item.zone === zoneFilter;
      const matchesSearch = searchTerm.trim() === '' || item.trackingNo.includes(searchTerm.trim());
      return matchesStatus && matchesZone && matchesSearch;
    });
  }, [items, statusFilter, zoneFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const startIdx = (page - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  const handleReassign = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    let selectedDriver = availableDrivers[0];

    setModalContent({
      title: '기사 재배정',
      submitText: '재배정',
      content: (
        <div className="form-group">
          <label>새로 배정할 기사를 선택하세요</label>
          <select onChange={(e) => selectedDriver = e.target.value} defaultValue={selectedDriver}>
            {availableDrivers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      ),
      onSubmit: () => {
        setItems(prev => prev.map(item => item.id === id
          ? { ...item, driver: selectedDriver, driverZone: item.zone === '전체 구역' ? '' : `${item.zone.replace('읍', '').replace('동', '')}구역`, status: item.status === '미출고' ? '분류중' : item.status }
          : item));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleHold = (id: string) => {
    setModalContent({
      title: '파손/보류 처리',
      submitText: '처리하기',
      content: <p>해당 화물을 파손/보류(미출고) 상태로 변경하시겠습니까?</p>,
      onSubmit: () => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status: '미출고' as ItemStatus } : item));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleBulkReport = () => {
    setModalContent({
      title: '잔류 화물 일괄 보고',
      submitText: '보고 전송',
      content: <p>미출고 화물 <b>{summary.pending}건</b>에 대해 관할 터미널장에게 일괄 보고를 전송하시겠습니까?</p>,
      onSubmit: () => {
        setModalContent({ title: '전송 완료', content: <p>보고서 전송이 완료되었습니다.</p>, noFooter: true });
        // After 2 seconds, auto-close
        setTimeout(() => setModalOpen(false), 2000);
      }
    });
    setModalOpen(true);
  };

  const handleCompleteLoading = (id: string) => {
    setModalContent({
      title: '상차 완료',
      submitText: '상차 완료',
      content: <p>이 화물을 상차 완료 처리하시겠습니까?</p>,
      onSubmit: () => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: '상차완료' } : i)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleRegisterUnknown = () => {
    let trackingNo = '';
    let destMain = '';

    setModalContent({
      title: '미인식 화물 수동 등록',
      submitText: '등록',
      content: (
        <>
          <div className="form-group">
            <label>운송장 번호</label>
            <input type="text" placeholder="예: 5839-xxxx-xxxx" onChange={(e) => trackingNo = e.target.value} />
          </div>
          <div className="form-group">
            <label>목적지</label>
            <input type="text" placeholder="예: 남양주시 진접읍" onChange={(e) => destMain = e.target.value} />
          </div>
        </>
      ),
      onSubmit: () => {
        if (!trackingNo || !destMain) return;
        const newItem: ControlItem = {
          id: Date.now().toString(),
          trackingNo,
          destMain,
          destSub: '수동 등록 건',
          driver: '미배정',
          driverZone: '',
          scanTime: new Date().toTimeString().slice(0, 8),
          status: '분류중',
          zone: '전체 구역'
        };
        setItems(prev => [newItem, ...prev]);
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const statusOptions: StatusFilter[] = ['전체', '하차완료', '분류중', '상차완료', '미출고', '보류'];
  const zoneOptions: ZoneFilter[] = ['전체 구역', '진접읍', '오남읍', '별내동', '퇴계원읍'];

  const summary = {
    total: items.length,
    unloaded: items.filter(i => i.status === '하차완료').length,
    sorting: items.filter(i => i.status === '분류중').length,
    loaded: items.filter(i => i.status === '상차완료').length,
    pending: items.filter(i => i.status === '미출고' || i.status === '보류').length,
  };

  return (
    <div className="control-page admin-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="title-wrap">
            <h2>분류 및 상하차 통제</h2>
            <span className="subtitle">Sorting & Loading Control</span>
          </div>
          <p className="update-time">2026년 6월 24일 (수) 기준 · 실시간 갱신</p>
        </div>
        <div className="header-right">
          <button className="btn-outline-red" onClick={handleBulkReport}>잔류 화물(미출고) 일괄 보고</button>
          <button className="btn-primary" onClick={handleRegisterUnknown}>미인식 화물 수동 등록</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="control-summary-cards">
        <div className="summary-card">
          <div className="card-title">오늘 전체 화물</div>
          <div className="card-value">{summary.total}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">하차완료</div>
          <div className="card-value text-blue">{summary.unloaded}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">분류중</div>
          <div className="card-value text-yellow">{summary.sorting}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">상차완료</div>
          <div className="card-value text-green">{summary.loaded}<span>건</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">미출고</div>
          <div className="card-value text-red">{summary.pending}<span>건</span></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-groups">
          <div className="filter-group">
            <span className="group-label">상태</span>
            <div className="filter-buttons">
              {statusOptions.map(opt => (
                <button
                  key={opt}
                  className={`filter-btn ${statusFilter === opt ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="group-label">구역</span>
            <div className="filter-buttons">
              {zoneOptions.map(opt => (
                <button
                  key={opt}
                  className={`filter-btn ${zoneFilter === opt ? 'active' : ''}`}
                  onClick={() => setZoneFilter(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="search-box">
          <span className="search-label">검색</span>
          <input
            type="text"
            placeholder="운송장 번호로 검색 (예: 5839-1029-0)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="control-table">
        <table>
          <thead>
            <tr>
              <th>운송장 번호</th>
              <th>배송 목적지</th>
              <th>배정된 택배기사</th>
              <th>스캔 시간</th>
              <th>상하차 상태</th>
              <th>관리 액션</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className={item.status === '보류' ? 'row-alert' : ''}>
                <td><a href="#" className="tracking-num" onClick={(e) => e.preventDefault()}>{item.trackingNo}</a></td>
                <td>
                  <span className="main-text">{item.destMain}</span>
                  <span className="sub-text">{item.destSub}</span>
                </td>
                <td className={item.driver.includes('미배정') ? 'text-red' : undefined}>
                  <span className="main-text">{item.driver}</span>
                  {item.driverZone && <span className="sub-text">{item.driverZone}</span>}
                </td>
                <td>{item.scanTime}</td>
                <td><span className={`pill ${statusPillClass[item.status]}`}>{item.status}</span></td>
                <td>
                  <div className="action-btns">
                    {item.status !== '상차완료' && (
                      <button className="btn-light-green" onClick={() => handleCompleteLoading(item.id)}>상차완료</button>
                    )}
                    <button className="btn-light-blue" onClick={() => handleReassign(item.id)}>기사 재배정</button>
                    <button className="btn-light-red" onClick={() => handleHold(item.id)}>파손/보류</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>조건에 맞는 화물이 없습니다.</td>
              </tr>
            )}
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
          <div className="page-info">전체 {filteredItems.length}건 중 {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredItems.length)}건 표시</div>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
            ))}
            {page < totalPages && <button onClick={() => setPage(page + 1)}>&gt;</button>}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="footer-info">
        [파손/보류 처리] 클릭 시 상태가 즉시 '보류'로 변경되며 좌측 메뉴 예외 화물 및 CS 처리반 리스트로 자동 이동합니다. [기사 재배정/구역 변경] 클릭 시 변경할 택배 기사 선택 팝업이 열립니다.
      </div>
    </div>
  );
}
