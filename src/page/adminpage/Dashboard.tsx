import { useState } from 'react';
import './Dashboard.scss';
import Modal from '../../components/Modal';

import { initialItems as controlInitial } from '../../data/mockControl';
import { initialRows as dispatchInitial } from '../../data/mockDispatch';
import { initialIncoming, initialOutgoing } from '../../data/mockDock';
import { initialItems as csInitial } from '../../data/mockCS';
import { initialStaff as hrInitial } from '../../data/mockHR';

export default function Dashboard() {
  const [period, setPeriod] = useState<'오늘' | '이번 주' | '이번 달'>('오늘');
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // Load integrated real-time data from sessionStorage
  const [controlItems] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('mock_control_items');
    return saved ? JSON.parse(saved) : controlInitial;
  });
  const [dispatchItems] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('mock_dispatch_rows');
    return saved ? JSON.parse(saved) : dispatchInitial;
  });
  const [incomingDocks] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('mock_dock_incoming');
    return saved ? JSON.parse(saved) : initialIncoming;
  });
  const [outgoingDocks] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('mock_dock_outgoing');
    return saved ? JSON.parse(saved) : initialOutgoing;
  });
  const [csItems] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('mock_cs_items');
    return saved ? JSON.parse(saved) : csInitial;
  });
  const [hrItems] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('mock_hr_rows');
    return saved ? JSON.parse(saved) : hrInitial;
  });

  // Calculate dynamic KPIs
  const totalIn = controlItems.length;
  const totalOut = dispatchItems.length;
  
  const activeIncoming = incomingDocks.filter((d: any) => d.status === 'blue' || d.status === 'green').length;
  const activeOutgoing = outgoingDocks.filter((d: any) => d.statusText === '상차중' || d.statusText === '상차완료' || d.statusText === '출차완료').length;
  const totalIncomingCapacity = incomingDocks.length;
  const totalOutgoingCapacity = 10; // Fixed max capability
  const dockUsage = Math.round(((activeIncoming + activeOutgoing) / (totalIncomingCapacity + totalOutgoingCapacity)) * 100);
  
  const pendingControl = controlItems.filter((i: any) => i.status === '미출고' || i.status === '보류').length;
  const csCount = csItems.length;

  // Baseline data for 'Yesterday' comparisons
  const yesterdayIn = 9;
  const inDiff = yesterdayIn > 0 ? (((totalIn - yesterdayIn) / yesterdayIn) * 100).toFixed(1) : '0.0';
  
  const yesterdayOut = 4;
  const outDiff = yesterdayOut > 0 ? (((totalOut - yesterdayOut) / yesterdayOut) * 100).toFixed(1) : '0.0';

  const yesterdayDockUsage = 50;
  const dockDiff = (dockUsage - yesterdayDockUsage).toFixed(1);

  const yesterdayPending = 2;
  const pendingDiff = pendingControl - yesterdayPending;

  const yesterdayCs = 2;
  const csDiff = csCount - yesterdayCs;

  const hrPresent = hrItems.filter((h: any) => h.status === '근무 중').length;
  const hrAbsent = hrItems.filter((h: any) => h.status === '결근' || h.status === '휴가').length;
  const dispatchAssigned = dispatchItems.filter((d: any) => d.driver && !d.driver.includes('미배정')).length;
  const dispatchUnassigned = dispatchItems.filter((d: any) => !d.driver || d.driver.includes('미배정')).length;

  // Calculate zone stats dynamically
  const zoneStats = ['진접읍', '오남읍', '별내동', '퇴계원읍'].map(zone => {
    const zItems = dispatchItems.filter((d: any) => d.zoneCategory === zone);
    const avgProgress = zItems.length ? Math.round(zItems.reduce((acc: number, cur: any) => acc + cur.progress, 0) / zItems.length) : 0;
    return { zone, progress: avgProgress };
  });

  // Chart Data Mock (기존 기간 변경 UI/UX는 그대로 유지)
  const chartDataByPeriod: Record<string, { time: string; in: number; out: number }[]> = {
    '오늘': [
      { time: '06시', in: 40, out: 40 },
      { time: '08시', in: 65, out: 65 },
      { time: '10시', in: 85, out: 85 },
      { time: '12시', in: 75, out: 75 },
      { time: '14시', in: 55, out: 55 },
      { time: '16시', in: 45, out: 45 },
      { time: '18시', in: 30, out: 30 },
    ],
    '이번 주': [
      { time: '월', in: 58, out: 60 },
      { time: '화', in: 62, out: 64 },
      { time: '수', in: 82, out: 78 },
      { time: '목', in: 70, out: 72 },
      { time: '금', in: 88, out: 85 },
      { time: '토', in: 40, out: 38 },
      { time: '일', in: 20, out: 22 },
    ],
    '이번 달': [
      { time: '1주', in: 62, out: 60 },
      { time: '2주', in: 70, out: 68 },
      { time: '3주', in: 75, out: 74 },
      { time: '4주', in: 80, out: 82 },
      { time: '5주', in: 66, out: 65 },
      { time: '6주', in: 58, out: 60 },
      { time: '7주', in: 72, out: 70 },
    ],
  };

  const chartData = chartDataByPeriod[period];
  const periodOptions: Array<'오늘' | '이번 주' | '이번 달'> = ['오늘', '이번 주', '이번 달'];

  const handlePeriodChange = () => {
    const currentIndex = periodOptions.indexOf(period);
    const nextPeriod = periodOptions[(currentIndex + 1) % periodOptions.length];
    setPeriod(nextPeriod);
  };

  const handleReportDownload = () => {
    setReportDownloaded(true);
    setModalContent({
      title: '리포트 다운로드 완료',
      content: <p>{`${period} 기준 리포트가 성공적으로 다운로드되었습니다.`}<br/><b>(mock_report_${period}.pdf)</b></p>
    });
    setModalOpen(true);
  };

  const handleDetailView = () => {
    setModalContent({
      title: '상세 물동량 리포트',
      content: (
        <div>
          <p>상세 물동량 분석 페이지로 연결됩니다. (추후 구현)</p>
          <ul>
            <li>시간대별 정확한 수치 데이터</li>
            <li>과거 동기 대비 증감률 분석</li>
            <li>구역별 상세 병목 현황 리포트</li>
          </ul>
        </div>
      )
    });
    setModalOpen(true);
  };

  return (
    <div className="dashboard-page admin-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="title-wrap">
            <h2>통합 운영 대시보드</h2>
            <span className="subtitle">Operations Dashboard</span>
          </div>
          <p className="update-time">실시간 연동 가동 중 · {period} 차트 표시 중</p>
        </div>
        <div className="header-right">
          <button className="btn-outline" onClick={handlePeriodChange}>차트 기간 ({period})</button>
          <button className="btn-primary" onClick={handleReportDownload}>리포트 다운로드</button>
        </div>
      </div>

      {reportDownloaded && (
        <div className="footer-info" style={{ marginBottom: '16px' }}>
          리포트가 다운로드되었습니다.
        </div>
      )}

      {/* KPI Cards */}
      <div className="dashboard-kpi-cards">
        <div className="kpi-card">
          <div className="kpi-title">오늘 입고 물량</div>
          <div className="kpi-value">{totalIn}<span>건</span></div>
          <div className={`kpi-diff ${Number(inDiff) > 0 ? 'positive' : Number(inDiff) < 0 ? 'negative' : ''}`}>
            전일 대비 {Number(inDiff) > 0 ? '+' : ''}{inDiff}%
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">오늘 출고 배차 물량</div>
          <div className="kpi-value">{totalOut}<span>건</span></div>
          <div className={`kpi-diff ${Number(outDiff) > 0 ? 'positive' : Number(outDiff) < 0 ? 'negative' : ''}`}>
            전일 대비 {Number(outDiff) > 0 ? '+' : ''}{outDiff}%
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">터미널 도크 가동률</div>
          <div className="kpi-value">{dockUsage || 0}<span>%</span></div>
          <div className={`kpi-diff ${Number(dockDiff) > 0 ? 'positive' : Number(dockDiff) < 0 ? 'negative' : ''}`}>
            전일 대비 {Number(dockDiff) > 0 ? '+' : ''}{dockDiff}%p
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">미출고/잔류 화물</div>
          <div className="kpi-value">{pendingControl}<span>건</span></div>
          <div className={`kpi-diff ${pendingDiff > 0 ? 'negative' : 'positive'}`}>
            전일 대비 {pendingDiff > 0 ? '+' : ''}{pendingDiff}건
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">예외(파손/CS) 접수</div>
          <div className="kpi-value">{csCount}<span>건</span></div>
          <div className={`kpi-diff ${csDiff > 0 ? 'negative' : 'positive'}`}>
            전일 대비 {csDiff > 0 ? '+' : ''}{csDiff}건
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="dashboard-middle-row">
        {/* Chart */}
        <div className="dash-card chart-card">
          <div className="card-title">
            기간별 입고/출고 흐름 추이
            <span className="link-text" onClick={handleDetailView} style={{ cursor: 'pointer' }}>상세 보기</span>
          </div>
          <div className="chart-container">
            {chartData.map((d, i) => (
              <div className="bar-group" key={i}>
                <div className="bar incoming" style={{ height: `${d.in}%` }}></div>
                <div className="bar outgoing" style={{ height: `${d.out}%` }}></div>
                <div className="x-label">{d.time}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item"><div className="box incoming"></div>입고 흐름</div>
            <div className="legend-item"><div className="box outgoing"></div>출고 흐름</div>
          </div>
        </div>

        {/* Dock Status */}
        <div className="dash-card progress-card">
          <div className="card-title">터미널 도크 실시간 현황</div>
          <div className="progress-list">
            <div className="progress-item">
              <div className="p-header">
                <div>
                  <h4>입고 도크 (A동 간선)</h4>
                  <span>전체 {totalIncomingCapacity}면 중 {activeIncoming}면 가동</span>
                </div>
              </div>
              <div className="p-bar-bg"><div className="p-bar-fill blue" style={{ width: `${totalIncomingCapacity ? (activeIncoming/totalIncomingCapacity)*100 : 0}%` }}></div></div>
            </div>
            <div className="progress-item">
              <div className="p-header">
                <div>
                  <h4>출고 도크 (B동 택배)</h4>
                  <span>전체 {totalOutgoingCapacity}면 중 {activeOutgoing}면 가동</span>
                </div>
              </div>
              <div className="p-bar-bg"><div className="p-bar-fill green" style={{ width: `${(activeOutgoing/totalOutgoingCapacity)*100}%` }}></div></div>
            </div>
            <div className="progress-item">
              <div className="p-header">
                <div>
                  <h4>분류 컨베이어(소터)</h4>
                  <span>정상 가동 중</span>
                </div>
              </div>
              <div className="p-bar-bg"><div className="p-bar-fill yellow" style={{ width: '100%' }}></div></div>
            </div>
            <div className="progress-item">
              <div className="p-header">
                <div>
                  <h4>사고 화물 임시 창고</h4>
                  <span>{csCount}건 보관 중</span>
                </div>
              </div>
              <div className="p-bar-bg"><div className="p-bar-fill red" style={{ width: `${Math.min(100, csCount * 10)}%` }}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-row">
        {/* Delivery Progress */}
        <div className="dash-card list-card">
          <div className="card-title">구역별 배차 및 진행률</div>
          <div className="data-list">
            {zoneStats.map((z) => (
              <div className="list-item" key={z.zone}>
                <div className="item-left"><h4>{z.zone}</h4></div>
                <div className="item-right">
                  <span className={`pill ${z.progress > 80 ? 'green' : z.progress > 40 ? 'yellow' : 'red'}`}>
                    ● {z.progress}% 완료
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="dash-card list-card">
          <div className="card-title">금일 통합 주요 알림</div>
          <div className="data-list">
            {dispatchUnassigned > 0 && (
              <div className="list-item">
                <div className="item-left">
                  <h4>미배정된 배송 구역 존재</h4>
                  <p className="text-red">현재 {dispatchUnassigned}건 대타 배정 필요</p>
                </div>
              </div>
            )}
            {csCount > 0 && (
              <div className="list-item">
                <div className="item-left">
                  <h4>CS/파손 화물 인입 알림</h4>
                  <p>총 {csCount}건 누적 · 처리 요망</p>
                </div>
              </div>
            )}
            <div className="list-item">
              <div className="item-left">
                <h4>A-04 도크 컨베이어 점검 완료</h4>
                <p>08:45 · 정상 작동 확인</p>
              </div>
            </div>
            {hrAbsent > 0 && (
              <div className="list-item">
                <div className="item-left">
                  <h4>인력 근태 이슈 (결근/지각)</h4>
                  <p>현재 {hrAbsent}명 발생</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manpower */}
        <div className="dash-card list-card">
          <div className="card-title">현장 인력 및 기사 현황</div>
          <div className="data-list">
            <div className="list-item">
              <div className="item-left"><h4>출근 확인 (분류반)</h4></div>
              <div className="item-right">{hrPresent}명</div>
            </div>
            <div className="list-item">
              <div className="item-left"><h4>결근/지각/휴가</h4></div>
              <div className={`item-right ${hrAbsent > 0 ? 'text-red' : ''}`}>{hrAbsent}명</div>
            </div>
            <div className="list-item">
              <div className="item-left"><h4>금일 배정 택배기사</h4></div>
              <div className="item-right">{dispatchAssigned}명</div>
            </div>
            <div className="list-item">
              <div className="item-left"><h4>대타 배정 대기</h4></div>
              <div className={`item-right ${dispatchUnassigned > 0 ? 'text-red' : ''}`}>{dispatchUnassigned}건</div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent?.title || ''}
        noFooter
      >
        {modalContent?.content}
      </Modal>
    </div>
  );
}
