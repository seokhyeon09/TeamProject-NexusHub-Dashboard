import { useState, useMemo } from 'react';
import './DeliveryPickup.scss';

type PickupZone = '전체 구역' | '진접읍' | '오남읍' | '별내동';
type PickupStatusFilter = '전체' | '배정 대기' | '배정 완료' | '수거 완료';
type PickupStatus = '배정대기' | '배정완료' | '수거완료';

interface PickupItem {
  id: string;
  shopName: string;
  applicantName: string;
  address: string;
  zone: PickupZone;
  timeSlot: string;
  driver: string | null;
  status: PickupStatus;
}

const initialItems: PickupItem[] = [
  {
    id: '1',
    shopName: '진접 분식당',
    applicantName: '윤서연',
    address: '진접읍 장현리 123-4',
    zone: '진접읍',
    timeSlot: '10:00~11:00',
    driver: '김철수',
    status: '배정완료',
  },
  {
    id: '2',
    shopName: '오남 수제청 공방',
    applicantName: '박하늘',
    address: '오남읍 오남리 56-2',
    zone: '오남읍',
    timeSlot: '11:00~12:00',
    driver: '이영희',
    status: '수거완료',
  },
  {
    id: '3',
    shopName: '별내 핸드메이드샵',
    applicantName: '안도현',
    address: '별내동 805-1 아파트',
    zone: '별내동',
    timeSlot: '13:00~14:00',
    driver: null,
    status: '배정대기',
  },
  {
    id: '4',
    shopName: '퇴계원 인쇄소',
    applicantName: '신유진',
    address: '퇴계원읍 119-7',
    zone: '전체 구역',
    timeSlot: '14:00~15:00',
    driver: null,
    status: '배정대기',
  },
  {
    id: '5',
    shopName: '진접 꽃집 라일락',
    applicantName: '임소율',
    address: '진접읍 부평리 12',
    zone: '진접읍',
    timeSlot: '09:00~10:00',
    driver: '정수민',
    status: '수거완료',
  },
];

const availableDrivers = ['최우진', '서지훈', '한소미', '배기범'];

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
  const [items, setItems] = useState<PickupItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState<PickupStatusFilter>('전체');
  const [zoneFilter, setZoneFilter] = useState<PickupZone>('전체 구역');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [optimized, setOptimized] = useState(false);

  const stats = useMemo(() => {
    const total = items.length + 29;
    const assigned = items.filter((i) => i.status !== '배정대기').length + 16;
    const completed = items.filter((i) => i.status === '수거완료').length + 13;
    const waiting = items.filter((i) => i.status === '배정대기').length + 11;
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

  const handleAssignDriver = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const driverName = window.prompt(
      `${item.shopName}에 배정할 기사를 선택하세요.
(예: ${availableDrivers.join(', ')})`,
      availableDrivers[0]
    );
    if (!driverName) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, driver: driverName, status: '배정완료' } : i
      )
    );
    alert(`${item.shopName}에 ${driverName} 기사가 배정되었습니다.`);
  };

  const handleChangeDriver = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const driverName = window.prompt(
      `${item.shopName}의 배정 기사를 변경합니다.
(예: ${availableDrivers.join(', ')})`,
      item.driver ?? availableDrivers[0]
    );
    if (!driverName) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, driver: driverName } : i))
    );
    alert(`${item.shopName}의 기사가 ${driverName}(으)로 변경되었습니다.`);
  };

  const handleComplete = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!window.confirm(`${item.shopName} 건을 수거완료 처리하시겠습니까?`)) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: '수거완료' } : i))
    );
  };

  const handleDetail = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    alert(
      `[픽업 상세]
상호: ${item.shopName}
신청자: ${item.applicantName}
주소: ${item.address}
희망 시간: ${item.timeSlot}
배정 기사: ${item.driver ?? '미배정'}
상태: ${item.status}`
    );
  };

  const handleOptimizeRoute = () => {
    setOptimized(true);
    alert('수거 경로가 거리순으로 최적화되었습니다.');
  };

  const handleBulkAssign = () => {
    const waitingItems = items.filter((i) => i.status === '배정대기');
    if (waitingItems.length === 0) {
      alert('현재 배정 대기 중인 건이 없습니다.');
      return;
    }
    if (!window.confirm(`배정 대기 중인 ${waitingItems.length}건을 가용 기사에게 일괄 배정하시겠습니까?`)) return;
    setItems((prev) =>
      prev.map((i, idx) =>
        i.status === '배정대기'
          ? { ...i, driver: availableDrivers[idx % availableDrivers.length], status: '배정완료' }
          : i
      )
    );
    alert(`${waitingItems.length}건이 일괄 배정되었습니다.`);
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
                      <button className="btn-action primary-light" onClick={() => handleAssignDriver(item.id)}>
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
      </div>

      <div className="footer-note">
        이 목록은 홈페이지에서 소상공인이 신청한 픽업 요청과 실시간으로 연동됩니다. [기사 배정] 클릭 시 수거 주소와 가까운 순서로 가용 기사가 추천됩니다.
      </div>
    </div>
  );
}
