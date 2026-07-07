import { useState, useEffect } from 'react';
import './LogisticsDock.scss';
import Modal from '../../components/Modal';
import {
  type IncomingDock,
  type OutgoingDock,
  initialIncoming,
  initialOutgoing,
  availableDrivers
} from '../../data/mockDock';

export default function LogisticsDock() {
  const [incoming, setIncoming] = useState<IncomingDock[]>(() => {
    const saved = sessionStorage.getItem('mock_dock_incoming');
    return saved ? JSON.parse(saved) : initialIncoming;
  });
  
  const [outgoing, setOutgoing] = useState<OutgoingDock[]>(() => {
    const saved = sessionStorage.getItem('mock_dock_outgoing');
    return saved ? JSON.parse(saved) : initialOutgoing;
  });

  useEffect(() => {
    sessionStorage.setItem('mock_dock_incoming', JSON.stringify(incoming));
  }, [incoming]);

  useEffect(() => {
    sessionStorage.setItem('mock_dock_outgoing', JSON.stringify(outgoing));
  }, [outgoing]);
  const [layoutViewOpen, setLayoutViewOpen] = useState(false);
  const [scheduleRegistered, setScheduleRegistered] = useState(false);

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

  const handleDockLayoutView = () => {
    setLayoutViewOpen(true);
    setModalContent({
      title: '도크 배치도',
      noFooter: true,
      content: (
        <div style={{ textAlign: 'center' }}>
          <p><b>A동 (간선 11톤 입고)</b> - 총 6면</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ width: '40px', height: '60px', background: '#e2e8f0', border: '2px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A{i}</div>)}
          </div>
          <p><b>B동 (1톤 택배 출고)</b> - 총 10면</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} style={{ width: '40px', height: '60px', background: '#e2e8f0', border: '2px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B{i}</div>)}
          </div>
        </div>
      )
    });
    setModalOpen(true);
  };

  const handleScheduleRegister = () => {
    let vehicleNo = '';
    let expectedTime = '';

    setModalContent({
      title: '접안 일정 등록',
      submitText: '등록',
      content: (
        <>
          <div className="form-group">
            <label>차량 번호</label>
            <input type="text" placeholder="예: 경기 88가 1234" onChange={e => vehicleNo = e.target.value} />
          </div>
          <div className="form-group">
            <label>도착 예정 시간</label>
            <input type="time" onChange={e => expectedTime = e.target.value} />
          </div>
        </>
      ),
      onSubmit: () => {
        if (!vehicleNo || !expectedTime) return;
        setScheduleRegistered(true);
        // Find first empty dock
        const emptyIndex = incoming.findIndex(d => d.status === 'gray');
        if (emptyIndex !== -1) {
          setIncoming(prev => {
            const next = [...prev];
            next[emptyIndex] = { ...next[emptyIndex], status: 'blue', statusText: `입고 예정 (${expectedTime})`, vehicleNo, detailLine: '대기중' };
            return next;
          });
        }
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleAddIncomingDock = () => {
    if (incoming.length >= 6) {
      setModalContent({ title: '알림', content: <p>입고 도크는 최대 6개까지만 생성할 수 있습니다.</p>, noFooter: true });
      setModalOpen(true);
      return;
    }
    const newId = `A-${String(incoming.length + 1).padStart(2, '0')}`;
    const newDock: IncomingDock = { id: newId, status: 'gray', statusText: '공석', detailLine: '대기중', vehicleNo: '' };
    setIncoming(prev => [...prev, newDock]);
  };

  const handleAddOutgoingDock = () => {
    if (outgoing.length >= 10) {
      setModalContent({ title: '알림', content: <p>출고 도크는 최대 10개까지만 생성할 수 있습니다.</p>, noFooter: true });
      setModalOpen(true);
      return;
    }
    const newId = `B-${String(outgoing.length + 1).padStart(2, '0')}`;
    const newDock: OutgoingDock = { id: newId, driver: '미배정', zone: '-', dockTime: '-', progress: 0, progressColor: 'gray', statusText: '대기', statusPill: 'yellow', actionLabel: '기사 배정' };
    setOutgoing(prev => [...prev, newDock]);
  };

  const handleDeleteIncoming = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalContent({
      title: '도크 삭제',
      submitText: '삭제',
      content: <p><b>{id}</b> 도크를 삭제(비우기)하시겠습니까?</p>,
      onSubmit: () => {
        setIncoming(prev => prev.filter(d => d.id !== id));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleDeleteOutgoing = (id: string) => {
    setModalContent({
      title: '도크 삭제',
      submitText: '삭제',
      content: <p><b>{id}</b> 도크를 삭제(비우기)하시겠습니까?</p>,
      onSubmit: () => {
        setOutgoing(prev => prev.filter(d => d.id !== id));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handleOutgoingAction = (dock: OutgoingDock) => {
    if (dock.actionLabel === '출차 처리') {
      setModalContent({
        title: '출차 처리',
        submitText: '출차 완료',
        content: <p><b>{dock.driver}</b> 기사님의 차량을 출차 완료 처리하시겠습니까?</p>,
        onSubmit: () => {
          setOutgoing(prev => prev.map(d => d.id === dock.id ? { ...d, statusText: '출차완료', statusPill: 'green', actionLabel: '기록 보기' } : d));
          setModalOpen(false);
        }
      });
      setModalOpen(true);
    } else if (dock.actionLabel === '기사 배정') {
      let selectedDriver = availableDrivers[0];
      setModalContent({
        title: '기사 배정',
        submitText: '배정',
        content: (
          <div className="form-group">
            <label>{dock.zone} 담당 기사 배정</label>
            <select onChange={e => selectedDriver = e.target.value} defaultValue={selectedDriver}>
              {availableDrivers.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        ),
        onSubmit: () => {
          setOutgoing(prev => prev.map(d => d.id === dock.id ? { ...d, driver: selectedDriver, dockTime: new Date().toTimeString().slice(0, 5), progress: 10, progressColor: 'blue', statusPill: 'yellow', statusText: '상차중', actionLabel: '상세 보기' } : d));
          setModalOpen(false);
        }
      });
      setModalOpen(true);
    } else if (dock.actionLabel === '상세 보기') {
      setModalContent({
        title: '출고 도크 상세',
        noFooter: true,
        content: (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
            <li><strong>도크:</strong> {dock.id}</li>
            <li><strong>담당 기사:</strong> {dock.driver}</li>
            <li><strong>배송 구역:</strong> {dock.zone}</li>
            <li><strong>상차 진행률:</strong> {dock.progress}%</li>
          </ul>
        )
      });
      setModalOpen(true);
    } else if (dock.actionLabel === '기록 보기') {
      setModalContent({
        title: '도크 출차 기록',
        noFooter: true,
        content: (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
            <li><strong>도크:</strong> {dock.id}</li>
            <li><strong>담당 기사:</strong> {dock.driver}</li>
            <li><strong>접안 시간:</strong> {dock.dockTime}</li>
            <li><strong>상태:</strong> {dock.statusText}</li>
          </ul>
        )
      });
      setModalOpen(true);
    }
  };

  const handleIncomingCardClick = (dock: IncomingDock) => {
    if (dock.status === 'gray') {
      setModalContent({
        title: '하차 시작',
        submitText: '시작',
        content: <p>도크 {dock.id}에서 하차 작업을 시작하시겠습니까?</p>,
        onSubmit: () => {
          setIncoming(prev => prev.map(d => d.id === dock.id ? { ...d, status: 'blue', statusText: '접안 중 · 하차 진행', vehicleNo: '경기 90마 7788', detailLine: '하차율 5% · 예상완료 10:40' } : d));
          setModalOpen(false);
        }
      });
      setModalOpen(true);
    } else if (dock.status === 'red') {
      setModalContent({
        title: '도크 점검 안내',
        noFooter: true,
        content: <p><b>{dock.id}</b> 도크는 현재 점검 중입니다.<br/>사유: {dock.detailLine}</p>
      });
      setModalOpen(true);
    } else {
      setModalContent({
        title: '입고 도크 상세',
        noFooter: true,
        content: (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
            <li><strong>도크:</strong> {dock.id}</li>
            <li><strong>상태:</strong> {dock.statusText}</li>
            <li><strong>차량번호:</strong> {dock.vehicleNo}</li>
            <li><strong>상세 내역:</strong> {dock.detailLine}</li>
          </ul>
        )
      });
      setModalOpen(true);
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
      <div className="section-title">
        입고 도크 ㅡ 간선 11톤 트럭 (하차)
        <button className="btn-outline" style={{ float: 'right', marginTop: '-4px' }} onClick={handleAddIncomingDock}>입고 도크 추가</button>
      </div>
      <div className="incoming-dock-grid">
        {incoming.map(dock => (
          <div
            className={`dock-card status-${dock.status}`}
            key={dock.id}
            onClick={() => handleIncomingCardClick(dock)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <button 
              style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', fontSize: '12px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              onClick={(e) => handleDeleteIncoming(dock.id, e)}
            >
              삭제
            </button>
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
      <div className="section-title">
        출고 도크 ㅡ 1톤 택배차 (상차)
        <button className="btn-outline" style={{ float: 'right', marginTop: '-4px' }} onClick={handleAddOutgoingDock}>출고 도크 추가</button>
      </div>
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
                  <div className="action-btns" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`action-btn ${dock.actionLabel === '기사 배정' ? 'btn-blue' : ''}`}
                      onClick={() => handleOutgoingAction(dock)}
                    >
                      {dock.actionLabel}
                    </button>
                    <button className="action-btn" style={{ background: '#fef2f2', color: '#ef4444' }} onClick={() => handleDeleteOutgoing(dock.id)}>
                      삭제
                    </button>
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

      <div className="footer-info">
        도크 카드의 색상은 접안 상태를 의미합니다. 파란 배경은 작업 진행 중, 빨간 배경은 점검/이상 상태, 회색 배경은 공석입니다.
      </div>
    </div>
  );
}
