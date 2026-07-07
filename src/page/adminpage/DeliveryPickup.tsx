import { useState, useMemo, useEffect } from 'react';
import './DeliveryPickup.scss';
import Modal from '../../components/Modal';
import {
  type PickupZone,
  type PickupStatusFilter,
  type PickupStatus,
  type PickupItem,
  initialItems,
  availableDrivers
} from '../../data/mockPickup';
function statusBadgeClass(status: PickupStatus) {
  switch (status) {
    case '배정대기':
      return 'status-badge red';
    case '배정완료':
      return 'status-badge yellow';
    case '수거완료':
      return 'status-badge green';
  }
}

export default function DeliveryPickup() {
  const [items, setItems] = useState<PickupItem[]>(() => {
    const saved = sessionStorage.getItem('mock_pickup_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  useEffect(() => {
    sessionStorage.setItem('mock_pickup_items', JSON.stringify(items));
  }, [items]);
  const [statusFilter, setStatusFilter] = useState<PickupStatusFilter>('전체');
  const [zoneFilter, setZoneFilter] = useState<PickupZone>('전체 구역');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [optimized, setOptimized] = useState(false);

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
    const total = items.length;
    const assigned = items.filter((i) => i.status !== '배정대기').length;
    const completed = items.filter((i) => i.status === '수거완료').length;
    const waiting = items.filter((i) => i.status === '배정대기').length;
    return { total, assigned, completed, waiting, smallBizRate: 76 };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === '배정 대기' && item.status !== '배정대기') return false;
      if (statusFilter === '배정 완료' && item.status !== '배정완료') return false;
      if (statusFilter === '수거 완료' && item.status !== '수거완료') return false;

      if (zoneFilter !== '전체 구역' && item.zone !== zoneFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matches =
          item.shopName.toLowerCase().includes(term) ||
          item.applicantName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      return true;
    });
  }, [items, statusFilter, zoneFilter, searchTerm]);

  const handleAssign = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    
    let selectedDriver = availableDrivers[0];

    setModalContent({
      title: '기사 배정',
      submitText: '배정하기',
      content: (
        <div className="form-group">
          <label>{item.shopName}에 배정할 기사를 선택하세요.</label>
          <select onChange={(e) => selectedDriver = e.target.value} defaultValue={selectedDriver}>
            {availableDrivers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      ),
      onSubmit: () => {
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, driver: selectedDriver, status: '배정완료' } : i));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleChangeDriver = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    let selectedDriver = item.driver ?? availableDrivers[0];

    setModalContent({
      title: '배정 기사 변경',
      submitText: '변경하기',
      content: (
        <div className="form-group">
          <label>{item.shopName}의 배정 기사를 변경합니다.</label>
          <select onChange={(e) => selectedDriver = e.target.value} defaultValue={selectedDriver}>
            {availableDrivers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      ),
      onSubmit: () => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, driver: selectedDriver } : i)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleComplete = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setModalContent({
      title: '수거 완료 처리',
      submitText: '완료 처리',
      content: <p><b>{item.shopName}</b> 건을 수거완료 처리하시겠습니까?</p>,
      onSubmit: () => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: '수거완료' } : i)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleDetail = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setModalContent({
      title: '픽업 상세 정보',
      noFooter: true,
      content: (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
          <li><strong>상호:</strong> {item.shopName}</li>
          <li><strong>신청자:</strong> {item.applicantName}</li>
          <li><strong>주소:</strong> {item.address}</li>
          <li><strong>희망 시간:</strong> {item.timeSlot}</li>
          <li><strong>배정 기사:</strong> {item.driver ?? '미배정'}</li>
          <li><strong>상태:</strong> {item.status}</li>
        </ul>
      )
    });
    setModalOpen(true);
  };

  const handleOptimizeRoute = () => {
    setOptimized(true);
    setModalContent({
      title: '경로 최적화 완료',
      noFooter: true,
      content: <p>수거 경로가 거리순으로 최적화되었습니다.</p>
    });
    setModalOpen(true);
  };

  const handleBulkAssign = () => {
    const waitingItems = items.filter((i) => i.status === '배정대기');
    if (waitingItems.length === 0) {
      setModalContent({
        title: '알림',
        noFooter: true,
        content: <p>현재 배정 대기 중인 건이 없습니다.</p>
      });
      setModalOpen(true);
      return;
    }

    setModalContent({
      title: '일괄 배정',
      submitText: '일괄 배정 진행',
      content: <p>배정 대기 중인 <b>{waitingItems.length}</b>건을 가용 기사에게 일괄 배정하시겠습니까?</p>,
      onSubmit: () => {
        setItems((prev) =>
          prev.map((i, idx) =>
            i.status === '배정대기'
              ? { ...i, driver: availableDrivers[idx % availableDrivers.length], status: '배정완료' }
              : i
          )
        );
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleAddPickupRegion = () => {
    let shopName = '';
    let applicantName = '';
    let address = '';
    let zone: PickupZone = '진접읍';

    setModalContent({
      title: '신규 집화(수거) 지역 추가',
      submitText: '추가',
      content: (
        <>
          <div className="form-group">
            <label>상호</label>
            <input type="text" placeholder="예: 우리집 과일" onChange={(e) => shopName = e.target.value} />
          </div>
          <div className="form-group">
            <label>신청자 이름</label>
            <input type="text" placeholder="예: 김상인" onChange={(e) => applicantName = e.target.value} />
          </div>
          <div className="form-group">
            <label>주소</label>
            <input type="text" placeholder="예: 진접읍 해밀리 123" onChange={(e) => address = e.target.value} />
          </div>
          <div className="form-group">
            <label>구역 분류</label>
            <select onChange={(e) => zone = e.target.value as PickupZone} defaultValue={zone}>
              <option value="진접읍">진접읍</option>
              <option value="오남읍">오남읍</option>
              <option value="별내동">별내동</option>
            </select>
          </div>
        </>
      ),
      onSubmit: () => {
        if (!shopName || !address) return;
        const newItem: PickupItem = {
          id: Date.now().toString(),
          shopName,
          applicantName,
          address,
          timeSlot: '미정',
          status: '배정대기',
          driver: null,
          zone
        };
        setItems((prev) => [newItem, ...prev]);
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  const statusOptions: PickupStatusFilter[] = ['전체', '배정 대기', '배정 완료', '수거 완료'];
  const zoneOptions: PickupZone[] = ['전체 구역', '진접읍', '오남읍', '별내동'];

  return (
    <div className="delivery-pickup-page">
      <div className="page-header">
        <div className="header-titles">
          <div className="title-row">
            <h2>지역 집화(수거) 현황 관리</h2>
            <span className="subtitle">Local Pickup Status</span>
          </div>
          <p className="description">
            홈페이지 픽업 신청 내역과 실시간 연동{optimized ? ' · 경로 최적화 적용됨' : ''}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleAddPickupRegion}>지역 추가</button>
          <button className="btn-outline" onClick={handleOptimizeRoute}>수거 경로 최적화</button>
          <button className="btn-primary" onClick={handleBulkAssign}>수거 기사 일괄 배정</button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-label">오늘 픽업 신청</span>
          <div className="stat-value"><strong>{stats.total}</strong>건</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">기사 배정 완료</span>
          <div className="stat-value text-blue"><strong>{stats.assigned}</strong>건</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">수거 완료</span>
          <div className="stat-value text-green"><strong>{stats.completed}</strong>건</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">배정 대기</span>
          <div className="stat-value text-red"><strong>{stats.waiting}</strong>건</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">소상공인 신청 비율</span>
          <div className="stat-value text-orange"><strong>{stats.smallBizRate}</strong>%</div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-left">
          <div className="filter-group">
            <span className="filter-label">상태</span>
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
          <div className="filter-group">
            <span className="filter-label">구역</span>
            <div className="filter-buttons">
              {zoneOptions.map((opt) => (
                <button
                  key={opt}
                  className={`filter-btn ${zoneFilter === opt ? 'active' : ''}`}
                  onClick={() => {
                    setZoneFilter(opt);
                    setPage(1);
                  }}
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
            placeholder="상호명 또는 신청자명으로 검색"
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
              <th>신청 상호 / 신청자</th>
              <th>수거 주소</th>
              <th>희망 수거 시간</th>
              <th>배정 기사</th>
              <th>상태</th>
              <th>관리 액션</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} className={item.status === '배정대기' ? 'row-alert' : undefined}>
                <td>
                  <strong>{item.shopName}</strong>
                  <span className="sub-text">신청자 {item.applicantName}</span>
                </td>
                <td>{item.address}</td>
                <td className="time-text">{item.timeSlot}</td>
                <td className={!item.driver ? 'text-red font-bold' : undefined}>
                  {item.driver ? <strong>{item.driver}</strong> : '미배정'}
                </td>
                <td>
                  <span className={statusBadgeClass(item.status)}>
                    <span className="dot"></span> {item.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {item.status === '배정대기' && (
                      <button className="btn-action primary-light" onClick={() => handleAssign(item.id)}>
                        기사 배정
                      </button>
                    )}
                    {item.status === '배정완료' && (
                      <>
                        <button className="btn-action primary-light" onClick={() => handleChangeDriver(item.id)}>
                          기사 변경
                        </button>
                        <button className="btn-action" onClick={() => handleComplete(item.id)}>
                          완료 처리
                        </button>
                      </>
                    )}
                    {item.status === '수거완료' && (
                      <button className="btn-action" onClick={() => handleDetail(item.id)}>
                        상세 보기
                      </button>
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
              전체 {filteredItems.length}건 중 {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredItems.length)}건 표시
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
        이 목록은 홈페이지에서 소상공인이 신청한 픽업 요청과 실시간으로 연동됩니다. [기사 배정] 클릭 시 수거 주소와 가까운 순서로 가용 기사가 추천됩니다.
      </div>
    </div>
  );
}
