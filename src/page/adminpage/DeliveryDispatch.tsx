import { useState, useMemo, useEffect } from 'react';
import './DeliveryDispatch.scss';
import Modal from '../../components/Modal';
import {
  type ZoneFilter,
  type StatusFilter,
  type ZoneRow,
  initialRows,
  availableDrivers
} from '../../data/mockDispatch';

function progressColorByValue(progress: number) {
  if (progress >= 100) return 'green';
  if (progress > 0) return 'blue';
  return 'grey';
}

export default function DeliveryDispatch() {
  const [rows, setRows] = useState<ZoneRow[]>(() => {
    const saved = sessionStorage.getItem('mock_dispatch_rows');
    return saved ? JSON.parse(saved) : initialRows;
  });
  
  useEffect(() => {
    sessionStorage.setItem('mock_dispatch_rows', JSON.stringify(rows));
  }, [rows]);

  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('전체 구역');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
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

  const stats = useMemo(() => {
    const totalZones = rows.length;
    const normalDrivers = rows.filter((r) => r.status !== '결원').length;
    const vacantZones = rows.filter((r) => r.status === '결원').length;
    const substituteAssigned = rows.filter((r) => r.status !== '결원' && r.driver && availableDrivers.includes(r.driver)).length;
    const avgProgress = Math.round(rows.reduce((sum, r) => sum + r.progress, 0) / (rows.length || 1));
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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const startIdx = (page - 1) * itemsPerPage;
  const currentRows = filteredRows.slice(startIdx, startIdx + itemsPerPage);

  const handleAssignSubstitute = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    let selectedDriver = availableDrivers[0];
    const isAdding = row.driver && !row.driver.includes('미배정') && row.status !== '결원';

    setModalContent({
      title: isAdding ? '추가 배차 (다중 기사)' : '대타/신규 배정',
      submitText: isAdding ? '추가 배차하기' : '배정하기',
      content: (
        <div className="form-group">
          <label>배정할 기사 선택</label>
          <select onChange={(e) => selectedDriver = e.target.value} defaultValue={selectedDriver}>
            {availableDrivers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      ),
      onSubmit: () => {
        const plateNumbers = ['77가 1234', '88나 5566', '99다 7788', '11라 9900'];
        const randomPlate = plateNumbers[Math.floor(Math.random() * plateNumbers.length)];
        const newDriverString = isAdding ? `${row.driver}, ${selectedDriver}` : selectedDriver;
        const newVehicleString = isAdding ? `${row.vehicle}, ${randomPlate}` : randomPlate;
        
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, driver: newDriverString, vehicle: newVehicleString, status: '정상 운행', progress: isAdding ? r.progress : 5 }
              : r
          )
        );
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleZoneChange = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    
    let newZone = row.zoneName;

    setModalContent({
      title: '담당 구역 변경',
      submitText: '변경하기',
      content: (
        <div className="form-group">
          <label>새 구역명 입력</label>
          <input type="text" defaultValue={newZone} onChange={(e) => newZone = e.target.value} />
        </div>
      ),
      onSubmit: () => {
        if (!newZone.trim()) return;
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, zoneName: newZone } : r)));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleDetail = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    
    setModalContent({
      title: '구역 상세 정보',
      noFooter: true,
      content: (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
          <li><strong>담당 구역:</strong> {row.zoneName} ({row.zoneSub})</li>
          <li><strong>배정 기사:</strong> {row.driver ?? '미배정'}</li>
          <li><strong>배차 차량:</strong> {row.vehicle}</li>
          <li><strong>배정 물량:</strong> {row.volume}건</li>
          <li><strong>진척률:</strong> {row.progress}%</li>
        </ul>
      )
    });
    setModalOpen(true);
  };

  const handleViewZoneMap = () => {
    setModalContent({
      title: '관할 구역 지도',
      noFooter: true,
      content: <p>지도 연동 모듈을 여기에 표시합니다. (구현 예정)</p>
    });
    setModalOpen(true);
  };

  const handleAssignSubstituteGlobal = () => {
    const vacantRow = rows.find((r) => r.status === '결원');
    if (!vacantRow) {
      setModalContent({
        title: '알림',
        noFooter: true,
        content: <p>현재 결원 구역이 없습니다.</p>
      });
      setModalOpen(true);
      return;
    }
    handleAssignSubstitute(vacantRow.id);
  };

  const handleAddZone = () => {
    let newZoneName = '';
    let newZoneSub = '';
    let newCategory: ZoneFilter = '진접읍';

    setModalContent({
      title: '신규 구역 추가',
      submitText: '추가하기',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>구역명</label>
            <input type="text" placeholder="예: 오남3구역" onChange={(e) => newZoneName = e.target.value} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>세부 지역</label>
            <input type="text" placeholder="예: 오남리 일대" onChange={(e) => newZoneSub = e.target.value} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>분류 구역</label>
            <select onChange={(e) => newCategory = e.target.value as ZoneFilter} defaultValue="진접읍">
              <option value="진접읍">진접읍</option>
              <option value="오남읍">오남읍</option>
              <option value="별내동">별내동</option>
              <option value="퇴계원읍">퇴계원읍</option>
            </select>
          </div>
        </div>
      ),
      onSubmit: () => {
        if (!newZoneName.trim() || !newZoneSub.trim()) return;
        const newRow: ZoneRow = {
          id: Date.now().toString(),
          zoneName: newZoneName,
          zoneSub: newZoneSub,
          zoneCategory: newCategory,
          driver: null,
          vehicle: '-',
          volume: 0,
          progress: 0,
          status: '결원'
        };
        setRows(prev => [...prev, newRow]);
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleDeleteZone = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    setModalContent({
      title: '구역 삭제',
      submitText: '삭제',
      content: <p><b>{row.zoneName}</b> 구역을 삭제하시겠습니까?</p>,
      onSubmit: () => {
        setRows(prev => prev.filter(r => r.id !== id));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
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
          <button className="btn-outline" onClick={handleAddZone}>구역 추가</button>
          <button className="btn-outline" onClick={handleViewZoneMap}>관할 구역 지도 보기</button>
          <button className="btn-primary" onClick={handleAssignSubstituteGlobal}>대타/신규 기사 전체 배정</button>
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
        <div className="filter-left">
          <div className="filter-group">
            <span className="filter-label">관할 구역</span>
            <div className="filter-buttons">
              {['전체 구역', '진접읍', '오남읍', '별내동', '퇴계원읍'].map((opt) => (
                <button
                  key={opt}
                  className={`filter-btn ${zoneFilter === opt ? 'active' : ''}`}
                  onClick={() => {
                    setZoneFilter(opt as ZoneFilter);
                    setPage(1);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">운행 상태</span>
            <div className="filter-buttons">
              {['전체', '정상 운행', '결원'].map((opt) => (
                <button
                  key={opt}
                  className={`filter-btn ${statusFilter === opt ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(opt as StatusFilter);
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
          <span className="search-label">기사 검색</span>
          <input
            type="text"
            placeholder="기사 이름으로 검색"
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
              <th>구역명</th>
              <th>세부 지역</th>
              <th>분류 구역</th>
              <th>담당 기사</th>
              <th>배차 차량</th>
              <th>배정 물량</th>
              <th>배송 진척률</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.id} className={row.status === '결원' ? 'row-vacant' : ''}>
                <td><strong>{row.zoneName}</strong></td>
                <td>{row.zoneSub}</td>
                <td>{row.zoneCategory}</td>
                <td>
                  <div className="driver-info">
                    <div className="driver-avatar"></div>
                    <span>{row.driver ?? '미배정'}</span>
                  </div>
                </td>
                <td>{row.vehicle}</td>
                <td>{row.volume}건</td>
                <td>
                  <div className="progress-cell">
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-fill ${progressColorByValue(row.progress)}`}
                        style={{ width: `${row.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{row.progress}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${row.status === '결원' ? 'red' : row.status === '배송완료' ? 'green' : 'blue'}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {row.status === '결원' ? (
                      <button className="btn-action primary-light" onClick={() => handleAssignSubstitute(row.id)}>
                        대타 배정
                      </button>
                    ) : (
                      <>
                        <button className="btn-action" onClick={() => handleZoneChange(row.id)}>구역 변경</button>
                        <button className="btn-action primary-light" onClick={() => handleAssignSubstitute(row.id)}>추가 배차</button>
                      </>
                    )}
                    <button className="btn-action" onClick={() => handleDetail(row.id)}>상세</button>
                    <button className="btn-action danger-light" onClick={() => handleDeleteZone(row.id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={9} className="empty-row">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination-container">
            <span className="pagination-info">
              전체 {filteredRows.length}건 중 {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredRows.length)}건 표시
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
            </div>
          </div>
        )}
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

      <div className="footer-note">
        관할 구역 내 배송 지연 및 결원 상황은 실시간으로 업데이트되며, 대타 배정 시 즉시 배송이 시작됩니다.
      </div>
    </div>
  );
}
