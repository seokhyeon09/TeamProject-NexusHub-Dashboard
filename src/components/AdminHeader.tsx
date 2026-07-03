import { LogOut, User, Menu } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const handleLogout = () => {
    window.location.href = import.meta.env.VITE_PUBLIC_URL;
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="btn-mobile-menu" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h1 className="logo">
          <span className="brand">NexusHub</span> <span className="divider">|</span> <span className="logo-text">직원 인트라넷</span>
        </h1>
      </div>

      <div className="header-right">
        <div className="terminal-name">남양주 터미널</div>
        <div className="current-time">2026-06-24 (수) 09:42</div>
        <div className="user-info">
          <div className="user-badge">
            <User size={14} />
            <span>김판수 반장 (통합센터)</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          로그아웃 <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
