import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Trash2, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { formatTimeDisplay } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/LanguageContext';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: number;
    text: string;
    completed?: boolean;
    notes?: string;
    startTime?: number;
    endTime?: number;
    type: 'brain-dump' | 'todo-list' | 'time-block';
  } | null;
  onSave: (updatedItem: any) => void;
  isMobile?: boolean;
  timeBlocks?: any[];
  onDelete?: (id: number) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
  isMobile = false,
  timeBlocks = []
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [editedNotes, setEditedNotes] = useState('');

  // 시간 관련 상태
  const [startMinutes, setStartMinutes] = useState(0);
  const [endMinutes, setEndMinutes] = useState(0);

  useEffect(() => {
    if (item) {
      setEditedText(item.text);
      setEditedNotes(item.notes || '');
      setStartMinutes(item.startTime || 0);
      setEndMinutes(item.endTime || 0);
      setIsEditing(false);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    if (item.type === 'time-block' && endMinutes <= startMinutes) {
      alert(t('planner.timeError'));
      return;
    }

    onSave({
      ...item,
      text: editedText,
      notes: editedNotes,
      startTime: item.type === 'time-block' ? startMinutes : item.startTime,
      endTime: item.type === 'time-block' ? endMinutes : item.endTime
    });
    setIsEditing(false);
  };

  const getTitle = () => {
    switch (item.type) {
      case 'brain-dump': return t('planner.brainDump');
      case 'todo-list': return t('sidebar.planner');
      case 'time-block': return t('sidebar.planner');
      default: return t('common.details');
    }
  };

  const formatDuration = (start: number, end: number) => {
    const diff = end - start;
    if (diff <= 0) return '시간 오류';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // 시간 편집 섹션 컴포넌트 (비율 축소)
  const TimeEditor = ({
    label,
    totalMinutes,
    onChange
  }: {
    label: string,
    totalMinutes: number,
    onChange: (m: number) => void
  }) => {
    const h24 = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;

    const handleHChange = (newH12: number) => {
      let finalH24 = newH12;
      if (period === 'PM' && newH12 !== 12) finalH24 += 12;
      if (period === 'AM' && newH12 === 12) finalH24 = 0;
      onChange(finalH24 * 60 + m);
    };

    const handleMChange = (newM: number) => {
      onChange(h24 * 60 + newM);
    };

    const handlePeriodToggle = () => {
      let finalH24 = h24;
      if (period === 'AM') finalH24 += 12;
      else finalH24 -= 12;
      onChange(finalH24 * 60 + m);
    };

    return (
      <div className={`flex flex-col items-center gap-1.5 bg-muted/40 ${isMobile ? 'p-2 rounded-2xl' : 'p-3 rounded-[1.5rem]'} border border-border/40 flex-1 w-full min-w-0`}>
        <span className={`${isMobile ? 'text-[8px]' : 'text-[9px]'} font-black text-muted-foreground uppercase tracking-widest`}>{label}</span>

        <div className={`flex items-center justify-center ${isMobile ? 'gap-1' : 'gap-2'} w-full`}>
          {/* AM/PM */}
          <button
            onClick={handlePeriodToggle}
            className={`${isMobile ? 'px-3 py-2 text-[10px]' : 'text-[10px] px-2 py-0.5'} flex items-center justify-center font-black text-primary bg-primary/10 rounded-full uppercase transition-all active:scale-90 shrink-0`}
          >
            {period}
          </button>

          <div className={`flex items-center ${isMobile ? 'gap-0.5' : 'gap-1.5'} justify-center`}>
            {/* Hour */}
            <div className={`flex flex-col items-center bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden shrink-0`}>
              <button
                onClick={() => handleHChange(h12 >= 12 ? 1 : h12 + 1)}
                className={` ${isMobile ? 'py-3 w-10' : 'py-1 w-8'} flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground`}
              >
                <ChevronUp size={isMobile ? 12 : 14} />
              </button>
              <div className={`w-8 py-0.5 ${isMobile ? 'text-xs' : 'text-sm'} flex justify-center font-black tabular-nums`}>{h12}</div>
              <button
                onClick={() => handleHChange(h12 <= 1 ? 12 : h12 - 1)}
                className={`${isMobile ? 'py-3 w-10' : 'py-1 w-8'} flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground`}
              >
                <ChevronDown size={isMobile ? 12 : 14} />
              </button>
            </div>

            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-muted-foreground/30`}>:</span>

            {/* Minute (10min interval) */}
            <div className={`flex flex-col items-center bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden shrink-0`}>
              <button
                onClick={() => handleMChange(m >= 50 ? 0 : m + 10)}
                className={`${isMobile ? 'py-3 w-10' : 'py-1 w-8'} flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground`}
              >
                <ChevronUp size={isMobile ? 12 : 14} />
              </button>
              <div className={`w-8 py-0.5 ${isMobile ? 'text-xs' : 'text-sm'} flex justify-center font-black tabular-nums`}>{m.toString().padStart(2, '0')}</div>
              <button
                onClick={() => handleMChange(m <= 0 ? 50 : m - 10)}
                className={`${isMobile ? 'py-3 w-10' : 'py-1 w-8'} flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground`}
              >
                <ChevronDown size={isMobile ? 12 : 14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-card w-full max-w-[420px] mx-auto rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[9px] font-black rounded-full uppercase tracking-widest leading-none">
              {getTitle()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 flex justify-center items-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 (스크롤 가능하도록) */}
        <div className={`${isMobile ? 'p-5' : 'p-8'} pt-2 space-y-6 overflow-y-auto custom-scrollbar`}>
          {/* 제목 섹션 */}
          <div className="space-y-2">
            {isEditing ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-transparent text-xl font-black text-foreground placeholder-muted-foreground/20 outline-none border-b-2 border-primary/30 focus:border-primary transition-all pb-2"
                placeholder={t('planner.addGoalPlaceholder')}
                autoFocus
              />
            ) : (
              <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight break-words">
                {item.text}
              </h1>
            )}
          </div>

          {/* 시간 섹션 (타임블록인 경우) */}
          {item.type === 'time-block' ? (
            <div className="space-y-4">
              <div className="flex flex-row gap-2 items-stretch">
                {isEditing ? (
                  <>
                    <TimeEditor label="시작" totalMinutes={startMinutes} onChange={setStartMinutes} />
                    <TimeEditor label="종료" totalMinutes={endMinutes} onChange={setEndMinutes} />
                  </>
                ) : (
                  <div className="p-4 rounded-[1.8rem] bg-muted/30 border border-border/40 w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-0.5">Time Range</p>
                        <p className={`${isMobile ? 'text-sm' : 'text-lg'} font-black text-foreground tabular-nums`}>
                          {formatTimeDisplay(item.startTime!)} — {formatTimeDisplay(item.endTime!)}
                        </p>
                      </div>
                    </div>
                    <div className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} px-3 py-1 rounded-full bg-primary/10 text-primary font-black tracking-wider`}>
                      {formatDuration(item.startTime!, item.endTime!)}
                    </div>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex justify-center">
                  <div className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest">
                    TOTAL: {formatDuration(startMinutes, endMinutes)}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 메모 섹션 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <label className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Detailed Memo</label>
            </div>
            {isEditing ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={4}
                className="w-full p-5 rounded-[1.8rem] bg-muted/40 text-foreground placeholder-muted-foreground/30 outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-base md:text-sm leading-relaxed border-2 border-transparent focus:border-primary/10"
                placeholder={t('planner.addGoalPlaceholder')}
              />
            ) : (
              <div className="p-5 rounded-[1.8rem] bg-muted/20 text-foreground text-sm leading-relaxed min-h-[100px] border border-border/20 shadow-inner">
                {item.notes ? (
                  item.notes
                ) : (
                  <span className="text-muted-foreground/30 italic font-medium">No details recorded.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-8 pt-4 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 rounded-[1.5rem] text-xs font-black text-muted-foreground/60 hover:bg-muted transition-all active:scale-95"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-4 rounded-[1.5rem] bg-primary text-primary-foreground text-xs font-black shadow-xl shadow-primary/20 hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {t('common.save')}
              </button>
            </>
          ) : (
            <>
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm(t('common.deleteConfirm'))) {
                      onDelete(item.id);
                      onClose();
                    }
                  }}
                  className="p-4 rounded-[1.5rem] text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all active:scale-95"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-4 rounded-[1.5rem] bg-primary text-background text-xs font-black shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Edit2 size={16} />
                {t('common.edit')}
              </button>
            </>
          )}
        </div>
      </div>
    </div >
  );
};
