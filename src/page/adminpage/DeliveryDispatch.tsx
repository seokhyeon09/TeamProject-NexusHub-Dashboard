import { useState, useMemo } from 'react';
import './DeliveryDispatch.scss';

type ZoneFilter = '전체 구역' | '진접읍' | '오남읍' | '별내동' | '퇴계원읍';
type StatusFilter = '전체' | '정상 운행' | '결원';
type RowStatus = '정상 운행' | '결원' | '배송완료';

interface ZoneRow {
  id: string;
  zoneName: string;
  zoneSub: string;
  zoneCategory: ZoneFilter;
  driver: string | null;
  vehicle: string;
  volume: number;
  progress: number;
  status: RowStatus;
}

const initialRows: ZoneRow[] = [
  {
    id: '1',
    zoneName: '진접1구역',
    zoneSub: '장현리, 부평리',
    zoneCategory: '진접읍',
    driver: '김철수',
    vehicle: '12바 3301',
    volume: 118,
    progress: 90,
    status: '정상 운행',
  },
  {
    id: '2',
    zoneName: '오남2구역',
    zoneSub: '오남리, 양지리',
    zoneCategory: '오남읍',
    driver: '이영희',
    vehicle: '34다 1190',
    volume: 96,
    progress: 60,
    status: '정상 운행',
  },
  {
    id: '3',
    zoneName: '별내3구역',
    zoneSub: '별내동 아파트 단지',
    zoneCategory: '별내동',
    driver: '박지민',
    vehicle: '56가 7720',
    volume: 104,
    progress: 50,
    status: '정상 운행',
  },
  {
    id: '4',
    zoneName: '퇴계원1구역',
    zoneSub: '퇴계원읍 전역',
    zoneCategory: '퇴계원읍',
    driver: null,
    vehicle: '-',
    volume: 82,
    progress: 0,
    status: '결원',
  },
  {
    id: '5',
    zoneName: '진접2구역',
    zoneSub: '내각리, 연평리',
    zoneCategory: '진접읍',
    driver: '정수민',
    vehicle: '21마 4453',
    volume: 89,
    progress: 100,
    status: '배송완료',
  },
];

const availableDrivers = ['최우진', '서지훈', '한소미', '배기범'];

function progressColorByValue(progress: number) {
  if (progress >= 100) return 'green';
  if (progress > 0) return 'blue';
  return 'grey';
}

export default function DeliveryDispatch() {
  const [rows, setRows] = useState<ZoneRow[]>(initialRows);
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('전체 구역');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const totalZones = rows.length + 7; // 표시된 5개 + 나머지 7개(총 12개 구역 유지)
    const normalDrivers = rows.filter((r) => r.status !== '결원').length + 17; // 전체 22명 기준 유지
    const vacantZones = rows.filter((r) => r.status === '결원').length;
    const substituteAssigned = rows.filter((r) => r.status !== '결원' && r.driver && availableDrivers.includes(r.driver)).length;
    const avgProgress = Math.round(rows.reduce((sum, r) => sum + r.progress, 0) / rows.length);
    return { totalZones, normalDrivers, vacantZones, substituteAssigned, avgProgress };
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (zoneFilter !== '전체 구역' && row.zoneCategory !== zoneFilter) return false;
      if (statusFilter === '정상 운행' && row.status === '결원') return false;
      if (statusFilter === '결원' && row.status !== '결원') return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        if (!row.driver || !row.driver.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [rows, zoneFilter, statusFilter, searchTerm]);

  const handleAssignSubstitute = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const driverName = window.prompt(
      `${row.zoneName}에 배정할 대타 기사를 선택하세요.\n(예: ${availableDrivers.join(', ')})`,
      availableDrivers[0]
    );
    if (!driverName) return;
    const plateNumbers = ['77가 1234', '88나 5566', '99다 7788', '11라 9900'];
    const randomPlate = plateNumbers[Math.floor(Math.random() * plateNumbers.length)];
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, driver: driverName, vehicle: randomPlate, status: '정상 운행', progress: 5 }
          : r
      )
    );
    alert(`${row.zoneName}에 ${driverName} 기사가 배정되었습니다.`);
  };

  const handleZoneChange = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const newZone = window.prompt(`${row.driver} 기사의 담당 구역을 변경합니다. 새 구역명을 입력하세요.`, row.zoneName);
    if (!newZone) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, zoneName: newZone } : r)));
  };

  const handleDetail = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    alert(
      `[구역 상세]\n담당 구역: ${row.zoneName} (${row.zoneSub})\n배정 기사: ${row.driver ?? '미배정'}\n배차 차량: ${row.vehicle}\n배정 물량: ${row.volume}건\n진척률: ${row.progress}%`
    );
  };

  const handleViewZoneMap = () => {
    alert('구역 지도를 표시합니다.');
  };

  const handleAssignSubstituteGlobal = () => {
    const vacantRow = rows.find((r) => r.status === '결원');
    if (!vacantRow) {
      alert('현재 결원 구역이 없습니다.');
      return;
    }
    handleAssignSubstitute(vacantRow.id);
  };

  return (
    <div className="delivery-dispatch-page">
      <div className="page-header">
        <div className="header-titles">
          <div className="title-row">
            <h2>택배기사 배차 및 배송 구역 관리</h2>
            <span className="subtitle">Driver Assignment & Zone Management</span>
          </div>
          <p className="description">남양주 관할 구역 (진접, 오남, 별내, 퇴계원 등) 기준</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleViewZoneMap}>구역 지도 보기</button>
          <button className="btn-primary" onClick={handleAssignSubstituteGlobal}>대타 기사 배정</button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-label">전체 배정 구역</span>
          <div className="stat-value"><strong>{stats.totalZones}</strong>개</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">정상 운행 기사</span>
          <div className="stat-value text-green"><strong>{stats.normalDrivers}</strong>명</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">결원 발생 구역</span>
          <div className="stat-value text-red"><strong>{stats.vacantZones}</strong>개</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">대타 배정 완료</span>
          <div className="stat-value text-blue"><strong>{stats.substituteAssigned}</strong>건</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">평균 배송 진척률</span>
          <div className="stat-value text-orange"><strong>{stats.avgProgress}</strong>%</div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <span className="filter-label">구역</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${zoneFilter === '전체 구역' ? 'active' : ''}`}
              onClick={() => setZoneFilter('전체 구역')}
            >
              전체 구역
            </button>
            <button
              className={`filter-btn ${zoneFilter === '진접읍' ? 'active' : ''}`}
              onClick={() => setZoneFilter('진접읍')}
            >
              진접읍
            </button>
            <button
              className={`filter-btn ${zoneFilter === '오남읍' ? 'active' : ''}`}
              onClick={() => setZoneFilter('오남읍')}
            >
              오남읍
            </button>
            <button
              className={`filter-btn ${zoneFilter === '별내동' ? 'active' : ''}`}
              onClick={() => setZoneFilter('별내동')}
            >
              별내동
            </button>
            <button
              className={`filter-btn ${zoneFilter === '퇴계원읍' ? 'active' : ''}`}
              onClick={() => setZoneFilter('퇴계원읍')}
            >
              퇴계원읍
            </button>
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">상태</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${statusFilter === '전체' ? 'active' : ''}`}
              onClick={() => setStatusFilter('전체')}
            >
              전체
            </button>
            <button
              className={`filter-btn ${statusFilter === '정상 운행' ? 'active' : ''}`}
              onClick={() => setStatusFilter('정상 운행')}
            >
              정상 운행
            </button>
            <button
              className={`filter-btn ${statusFilter === '결원' ? 'active' : ''}`}
              onClick={() => setStatusFilter('결원')}
            >
              결원
            </button>
          </div>
        </div>
        <div className="search-box">
          <span className="search-label">검색</span>
          <input
            type="text"
            placeholder="기사명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>담당 구역</th>
              <th>배정 기사</th>
              <th>배차 차량</th>
              <th>배정 물량</th>
              <th>배송 진척률</th>
              <th>상태</th>
              <th>관리 액션</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  조건에 맞는 구역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className={row.status === '결원' ? 'row-alert' : ''}>
                  <td>
                    <strong>{row.zoneName}</strong>
                    <span className="sub-text">{row.zoneSub}</span>
                  </td>
                  <td className={row.status === '결원' ? 'text-red font-bold' : ''}>
                    {row.driver ?? '미배정 (결원)'}
                  </td>
                  <td>{row.vehicle}</td>
                  <td>{row.volume}건</td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${row.status === '결원' ? 'grey' : progressColorByValue(row.progress)}`}
                        style={{ width: `${row.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${row.status === '결원' ? 'red' : row.status === '배송완료' ? 'green' : row.progress >= 90 ? 'green' : 'yellow'}`}>
                      <span className="dot"></span> {row.status}
                    </span>
                  </td>
                  <td>
                    {row.status === '결원' ? (
                      <div className="action-buttons">
                        <button className="btn-action primary-light" onClick={() => handleAssignSubstitute(row.id)}>대타 기사 배정</button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn-action" onClick={() => handleZoneChange(row.id)}>구역 변경</button>
                        <button className="btn-action" onClick={() => handleDetail(row.id)}>상세 보기</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="pagination-container">
          <span className="pagination-info">전체 {stats.totalZones}구역 중 {filteredRows.length}건 표시</span>
          <div className="pagination">
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn next">›</button>
          </div>
        </div>
      </div>

      <div className="footer-note">
        [대타 기사 배정] 클릭 시 가용 기사 목록 팝업이 열리며, 인근 구역 기사 중 여유 물량이 있는 기사를 우선 추천합니다.
      </div>
    </div>
  );
}
