import type { ReactNode } from 'react';
import './Modal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  noFooter?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = '확인',
  cancelText = '취소',
  noFooter = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {!noFooter && (
          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
            {onSubmit && (
              <button className="btn-submit" onClick={onSubmit}>
                {submitText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
