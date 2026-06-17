'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { RingLoader } from 'react-spinners';
import { IAsManagementLog } from '@/api/supabase/supabaseApi';
import { exportAsLogsToExcel } from '@/utils/excelUtils';
import {
  fetchAllAsManagementLogs,
  groupAsLogsByMonth,
  toReportRows,
  ReportLogRow,
} from '@/utils/asLogExport';

const TABLE_COLUMNS: { key: keyof ReportLogRow; label: string; minWidth: string }[] = [
  { key: 'no', label: '번호', minWidth: '48px' },
  { key: 'logId', label: 'ID', minWidth: '56px' },
  { key: 'author', label: '작성자', minWidth: '80px' },
  { key: 'workDate', label: '작업일', minWidth: '96px' },
  { key: 'workType', label: '작업유형', minWidth: '72px' },
  { key: 'category', label: '분류', minWidth: '80px' },
  { key: 'modelName', label: '모델명', minWidth: '100px' },
  { key: 'department', label: '부서', minWidth: '80px' },
  { key: 'employeeName', label: '사용자', minWidth: '72px' },
  { key: 'question', label: '문의내용', minWidth: '160px' },
  { key: 'detailDescription', label: '상세설명', minWidth: '160px' },
  { key: 'solutionDetail', label: '조치내용', minWidth: '160px' },
];

export default function ReportPage() {
  const [logs, setLogs] = useState<IAsManagementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [progress, setProgress] = useState({ loaded: 0, total: null as number | null });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress({ loaded: 0, total: null });
    try {
      const data = await fetchAllAsManagementLogs((loaded, total) => {
        setProgress({ loaded, total });
      });
      setLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const monthlyGroups = useMemo(() => groupAsLogsByMonth(logs), [logs]);

  useEffect(() => {
    if (monthlyGroups.length > 0 && !selectedMonth) {
      setSelectedMonth(monthlyGroups[0].monthKey);
    }
  }, [monthlyGroups, selectedMonth]);

  const selectedRows = useMemo(() => {
    const group = monthlyGroups.find((g) => g.monthKey === selectedMonth);
    return group ? toReportRows(group.logs) : [];
  }, [monthlyGroups, selectedMonth]);

  const handleExportExcel = () => {
    if (!logs.length) return;
    setExporting(true);
    try {
      const today = format(new Date(), 'yyyyMMdd');
      exportAsLogsToExcel(logs, `KET_정비일지_보고서_${today}`);
    } catch {
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const progressPercent =
    progress.total && progress.total > 0
      ? Math.round((progress.loaded / progress.total) * 100)
      : null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">작업이력 보고서</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            월별 작업 내역을 엑셀 형식으로 확인하고 다운로드할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={!logs.length || exporting || loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {exporting ? (
            <RingLoader size={14} color="#475569" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 00-.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          엑셀 다운로드 (월별 시트)
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 flex flex-col items-center">
          <RingLoader size={36} color="#475569" />
          <p className="text-sm text-slate-600 mt-4">작업이력을 불러오는 중...</p>
          {progressPercent !== null && (
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{progress.loaded.toLocaleString()}건</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button onClick={loadData} className="ml-3 underline hover:no-underline">
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 mb-4 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-xs text-slate-500">총 건수</span>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">{logs.length.toLocaleString()}건</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">월별 시트</span>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">{monthlyGroups.length}개월</p>
            </div>
          </div>

          {monthlyGroups.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-sm">
              표시할 작업이력이 없습니다.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {monthlyGroups.map((group) => (
                  <button
                    key={group.monthKey}
                    onClick={() => setSelectedMonth(group.monthKey)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      selectedMonth === group.monthKey
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {group.monthKey}
                    <span className="ml-1.5 text-xs opacity-80">({group.logs.length})</span>
                  </button>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">{selectedMonth}</h2>
                  <span className="text-xs text-slate-500">{selectedRows.length.toLocaleString()}건</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        {TABLE_COLUMNS.map((col) => (
                          <th
                            key={col.key}
                            className="px-3 py-2.5 text-left text-xs font-semibold text-slate-700 whitespace-nowrap border-r border-slate-200 last:border-r-0"
                            style={{ minWidth: col.minWidth }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRows.length === 0 ? (
                        <tr>
                          <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center text-slate-400">
                            해당 월의 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        selectedRows.map((row) => (
                          <tr
                            key={`${row.logId}-${row.no}`}
                            className="border-b border-slate-100 hover:bg-slate-50/80 even:bg-slate-50/40"
                          >
                            {TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                className="px-3 py-2 text-slate-800 border-r border-slate-100 last:border-r-0 align-top"
                                title={col.key === 'question' || col.key === 'detailDescription' || col.key === 'solutionDetail' ? row[col.key] : undefined}
                              >
                                <CellContent value={row[col.key]} wide={col.key === 'question' || col.key === 'detailDescription' || col.key === 'solutionDetail'} />
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function CellContent({ value, wide }: { value: string | number; wide?: boolean }) {
  const text = String(value);
  if (wide && text.length > 40) {
    return (
      <span className="block max-w-[200px] line-clamp-2 text-xs leading-relaxed" title={text}>
        {text}
      </span>
    );
  }
  return <span className="whitespace-nowrap text-xs">{text || '-'}</span>;
}
