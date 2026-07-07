import { useState, useMemo } from 'react';
import './LogisticsControl.scss';

type StatusFilter = '전체' | '하차완료' | '분류중' | '상차완료' | '미출고';
type ZoneFilter = '전체 구역' | '진접읍' | '오남읍' | '별내동' | '퇴계원읍';
type ItemStatus = '하차완료' | '분류중' | '상차완료' | '미출고';

interface ControlItem {
  id: string;
  trackingNo: string;
  destMain: string;
  destSub: string;
  driver: string;
  driverZone: string;
  scanTime: string;
  status: ItemStatus;
  zone: ZoneFilter;
}

const initialItems: ControlItem[] = [
  { id: '1', trackingNo: '5839-1029-001', destMain: '진접읍 장현리', destSub: '간선11톤 A-03 도크 하차분', driver: '김철수', driverZone: '진접1구역', scanTime: '06:15:30', status: '상차완료', zone: '진접읍' },
  { id: '2', trackingNo: '5839-1029-002', destMain: '오남읍 오남리', destSub: '간선11톤 A-03 도크 하차분', driver: '이영희', driverZone: '오남2구역', scanTime: '06:20:12', status: '분류중', zone: '오남읍' },
  { id: '3', trackingNo: '5839-1029-003', destMain: '별내동 (아파트)', destSub: '간선11톤 A-04 도크 하차분', driver: '박지민', driverZone: '별내3구역', scanTime: '06:25:00', status: '하차완료', zone: '별내동' },
  { id: '4', trackingNo: '5839-1029-004', destMain: '퇴계원읍', destSub: '간선11톤 A-04 도크 하차분', driver: '미배정 (결원)', driverZone: '', scanTime: '06:30:45', status: '미출고', zone: '퇴계원읍' },
  { id: '5', trackingNo: '5839-1029-005', destMain: '진접읍 부평리', destSub: '간선11톤 A-05 도크 하차분', driver: '김철수', driverZone: '진접1구역', scanTime: '06:33:18', status: '분류중', zone: '진접읍' },
  { id: '6', trackingNo: '5839-1029-006', destMain: '오남읍 양지리', destSub: '간선11톤 A-05 도크 하차분', driver: '이영희', driverZone: '오남2구역', scanTime: '06:35:51', status: '상차완료', zone: '오남읍' },
];

const availableDrivers = ['최민호', '강䄜연', '조현우', '임하늘'];

const statusPillClass: Record<ItemStatus, string> = {
  '상차완료': 'green',
  '분류중': 'yellow',
  '하차완료': 'blue',
  '미출고': 'red',
};

export default function LogisticsControl() {
  const [items, setItems] = useState<ControlItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('전체 구역');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesStatus = statusFilter === '전체' || item.status === statusFilter;
      const matchesZone = zoneFilter === '전체 구역' || item.zone === zoneFilter;
      const matchesSearch = searchTerm.trim() === '' || item.trackingNo.includes(searchTerm.trim());
      return matchesStatus && matchesZone && matchesSearch;
    });
  }, [items, statusFilter, zoneFilter, searchTerm]);

  const handleReassign = (id: string) => {
    const newDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    setItems(prev => prev.map(item => item.id === id
      ? { ...item, driver: newDriver, driverZone: item.zone === '전체 구역' ? '' : `${item.zone.replace('읍', '').replace('동', '')}구역`, status: item.status === '미출고' ? '분류중' : item.status }
      : item));
    alert(`기사가 ${newDriver}(으)로 재배정되었습니다.`);
  };

  const handleHold = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: '미출고' as ItemStatus } : item));
    alert('해당 화물이 파손/보류 처리되었습니다. 예외 화물 및 CS 처리반 목록으로 이동됩니다.');
  };

  const statusOptions: StatusFilter[] = ['전체', '하차완료', '분류중', '상차완료', '미출고'];
  const zoneOptions: ZoneFilter[] = ['전체 구역', '진접읍', '오남읍', '별내동', '퇴계원읍'];

  const summary = {
    total: items.length,
    unloaded: items.filter(i => i.status === '하차완료').length,
    sorting: items.filter(i => i.status === '분류중').length,
    loaded: items.filter(i => i.status === '상차완료').length,
    pending: items.filter(i => i.status === '미출고').length,
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
          <button className="btn-outline-red" onClick={() => alert(`미출고 화물 ${summary.pending}건이 일괄 보고되었습니다.`)}>잔류 화물(미출고) 일괄 보고</button>
          <button className="btn-primary" onClick={() => alert('미인식 화물 수동 등록 창을 엽니다.')}>미인식 화물 수동 등록</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="control-summary-cards">
        <div className="summary-card">
          <div className="card-title">오늘 전체 화물</div>
          <div className="card-value">1,284<span>건</span></div>
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
            {filteredItems.map(item => (
              <tr key={item.id}>
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
                    <button className="btn-light-blue" onClick={() => handleReassign(item.id)}>기사 재배정/구역 변경</button>
                    <button className="btn-light-red" onClick={() => handleHold(item.id)}>파손/보류 처리</button>
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

      {/* Pagination */}
      <div className="pagination-wrap">
        <div className="page-info">전체 1,284건 중 1-{filteredItems.length}건 표시</div>
        <div className="page-numbers">
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button className="dots">...</button>
          <button>214</button>
          <button>&gt;</button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="footer-info">
        [파손/보류 처리] 클릭 시 상태가 즉시 '보류'로 변경되며 좌측 메뉴 예외 화물 및 CS 처리반 리스트로 자동 이동합니다. [기사 재배정/구역 변경] 클릭 시 변경할 택배 기사 선택 팝업이 열립니다.
      </div>
    </div>
  );
}
