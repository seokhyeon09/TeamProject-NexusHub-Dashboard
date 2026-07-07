import { useState } from 'react';
import './LogisticsDock.scss';

type DockStatus = 'blue' | 'green' | 'red' | 'gray';

interface IncomingDock {
  id: string;
  status: DockStatus;
  statusText: string;
  vehicleNo?: string;
  detailLine: string;
}

interface OutgoingDock {
  id: string;
  driver: string;
  zone: string;
  dockTime: string;
  progress: number;
  progressColor: 'green' | 'blue' | 'gray';
  statusPill: 'green' | 'yellow' | 'red';
  statusText: string;
  actionLabel: string;
}

const initialIncoming: IncomingDock[] = [
  { id: 'A-01', status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 78아 1234', detailLine: '하차율 64% · 예상완료 09:55' },
  { id: 'A-02', status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 80나 5521', detailLine: '하차율 88% · 예상완료 09:40' },
  { id: 'A-03', status: 'green', statusText: '하차 완료', vehicleNo: '경기 12다 9087', detailLine: '완료 09:12 · 출차 대기' },
  { id: 'A-04', status: 'red', statusText: '점검 중', detailLine: '컨베이어 연동 점검 · 예상 복구 10:30' },
  { id: 'A-05', status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 33라 4410', detailLine: '하차율 30% · 예상완료 10:20' },
  { id: 'A-06', status: 'gray', statusText: '공석', detailLine: '다음 접안 차량 대기 중 · 예상 접안 10:05' },
];

const initialOutgoing: OutgoingDock[] = [
  { id: 'B-01', driver: '김철수', zone: '진접1구역', dockTime: '08:40', progress: 100, progressColor: 'green', statusPill: 'green', statusText: '상차완료', actionLabel: '출차 처리' },
  { id: 'B-02', driver: '이영희', zone: '오남2구역', dockTime: '08:45', progress: 60, progressColor: 'blue', statusPill: 'yellow', statusText: '상차중', actionLabel: '상세 보기' },
  { id: 'B-03', driver: '박지민', zone: '별내3구역', dockTime: '08:50', progress: 30, progressColor: 'blue', statusPill: 'yellow', statusText: '상차중', actionLabel: '상세 보기' },
  { id: 'B-04', driver: '미배정 (결원)', zone: '퇴계원읍', dockTime: '-', progress: 0, progressColor: 'gray', statusPill: 'red', statusText: '대기', actionLabel: '기사 배정' },
  { id: 'B-05', driver: '정수민', zone: '진접2구역', dockTime: '07:05', progress: 100, progressColor: 'green', statusPill: 'green', statusText: '출차완료', actionLabel: '기록 보기' },
];

const availableDrivers = ['최민호', '강서연', '조현우', '임하늘'];

export default function LogisticsDock() {
  const [incoming, setIncoming] = useState<IncomingDock[]>(initialIncoming);
  const [outgoing, setOutgoing] = useState<OutgoingDock[]>(initialOutgoing);
  const [layoutViewOpen, setLayoutViewOpen] = useState(false);
  const [scheduleRegistered, setScheduleRegistered] = useState(false);

  const handleDockLayoutView = () => {
    setLayoutViewOpen(true);
    alert('도크 배치도를 표시합니다. (A동 입고 6면 / B동 출고 10면)');
  };

  const handleScheduleRegister = () => {
    setScheduleRegistered(true);
    alert('신규 접안 일정이 등록되었습니다.');
  };

  const handleOutgoingAction = (dock: OutgoingDock) => {
    if (dock.actionLabel === '출차 처리') {
      setOutgoing(prev => prev.map(d => d.id === dock.id ? { ...d, statusText: '출차완료', statusPill: 'green', actionLabel: '기록 보기' } : d));
    } else if (dock.actionLabel === '기사 배정') {
      const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
      setOutgoing(prev => prev.map(d => d.id === dock.id ? { ...d, driver, dockTime: new Date().toTimeString().slice(0, 5), progress: 10, progressColor: 'blue', statusPill: 'yellow', statusText: '상차중', actionLabel: '상세 보기' } : d));
      alert(`${dock.zone}에 ${driver} 기사가 배정되었습니다.`);
    } else if (dock.actionLabel === '상세 보기') {
      alert(`${dock.id} 도크 상세 정보\n담당 기사: ${dock.driver}\n배송 구역: ${dock.zone}\n상차 진행률: ${dock.progress}%`);
    } else if (dock.actionLabel === '기록 보기') {
      alert(`${dock.id} 도크 출차 기록\n담당 기사: ${dock.driver}\n접안 시간: ${dock.dockTime}\n상태: ${dock.statusText}`);
    }
  };

  const handleIncomingCardClick = (dock: IncomingDock) => {
    if (dock.status === 'gray') {
      setIncoming(prev => prev.map(d => d.id === dock.id ? { ...d, status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 90마 7788', detailLine: '하차율 5% · 예상완료 10:40' } : d));
    } else if (dock.status === 'red') {
      alert(`${dock.id} 도크는 현재 점검 중입니다.\n${dock.detailLine}`);
    } else {
      alert(`${dock.id} 도크 상세\n${dock.statusText}\n${dock.detailLine}`);
    }
  };

  return (
    <div className="dock-page admin-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="title-wrap">
            <h2>입/출고 도크 현황</h2>
            <span className="subtitle">Dock Status Monitor</span>
          </div>
          <p className="update-time">2026년 6월 24일 (수) 기준 · 실시간 갱신</p>
        </div>
        <div className="header-right">
          <button className="btn-outline" onClick={handleDockLayoutView}>도크 배치도 보기</button>
          <button className="btn-primary" onClick={handleScheduleRegister}>접안 일정 등록</button>
        </div>
      </div>

      {layoutViewOpen && (
        <div className="footer-info" style={{ marginBottom: '16px' }}>
          도크 배치도가 표시되었습니다. A동(입고 6면) · B동(출고 10면) 구성입니다.
        </div>
      )}
      {scheduleRegistered && (
        <div className="footer-info" style={{ marginBottom: '16px' }}>
          신규 접안 일정이 등록되었습니다.
        </div>
      )}

      {/* Summary Cards */}
      <div className="dock-summary-cards">
        <div className="summary-card">
          <div className="card-title">입고 도크 가동</div>
          <div className="card-value text-blue">{incoming.filter(d => d.status === 'blue' || d.status === 'green').length}<span>/ {incoming.length}면</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">출고 도크 가동</div>
          <div className="card-value text-green">{outgoing.filter(d => d.statusText === '상차중' || d.statusText === '상차완료' || d.statusText === '출차완료').length}<span>/ 10면</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">대기 중인 간선 트럭</div>
          <div className="card-value text-yellow">2<span>대</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">대기 중인 1톤 택배차</div>
          <div className="card-value text-yellow">{outgoing.filter(d => d.statusText === '대기').length}<span>대</span></div>
        </div>
        <div className="summary-card">
          <div className="card-title">점검/이상 도크</div>
          <div className="card-value text-red">{incoming.filter(d => d.status === 'red').length}<span>면</span></div>
        </div>
      </div>

      {/* Incoming Dock Grid */}
      <div className="section-title">입고 도크 ㅡ 간선 11톤 트럭 (하차)</div>
      <div className="incoming-dock-grid">
        {incoming.map(dock => (
          <div
            className={`dock-card status-${dock.status}`}
            key={dock.id}
            onClick={() => handleIncomingCardClick(dock)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{dock.id} 도크</h3>
            <div className="status-text">{dock.statusText}</div>
            <div className="details">
              {dock.vehicleNo && <>차량번호 {dock.vehicleNo}<br /></>}
              {dock.detailLine}
            </div>
          </div>
        ))}
      </div>

      {/* Outgoing Dock Table */}
      <div className="section-title">출고 도크 ㅡ 1톤 택배차 (상차)</div>
      <div className="outgoing-dock-table">
        <table>
          <thead>
            <tr>
              <th>도크 번호</th>
              <th>담당 기사</th>
              <th>배송 구역</th>
              <th>접안 시간</th>
              <th>상차 진행률</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {outgoing.map(dock => (
              <tr key={dock.id}>
                <td>{dock.id}</td>
                <td className={dock.driver.includes('미배정') ? 'text-red' : undefined}>{dock.driver}</td>
                <td>{dock.zone}</td>
                <td>{dock.dockTime}</td>
                <td>
                  <div className="progress-bar-bg">
                    {dock.progress > 0 && <div className={`progress-bar-fill ${dock.progressColor}`} style={{ width: `${dock.progress}%` }}></div>}
                  </div>
                </td>
                <td><span className={`pill ${dock.statusPill}`}>{dock.statusText}</span></td>
                <td>
                  <button
                    className={`action-btn ${dock.actionLabel === '기사 배정' ? 'btn-blue' : ''}`}
                    onClick={() => handleOutgoingAction(dock)}
                  >
                    {dock.actionLabel}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="footer-info">
        도크 카드의 색상은 접안 상태를 의미합니다. 파란 배경은 작업 진행 중, 빨간 배경은 점검/이상 상태, 회색 배경은 공석입니다.
      </div>
    </div>
  );
}
