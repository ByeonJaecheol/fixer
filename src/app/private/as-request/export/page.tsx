'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { RingLoader } from 'react-spinners';
import { IAsManagementLog } from '@/api/supabase/supabaseApi';
import {
  fetchAllAsManagementLogs,
  exportAsLogsToJson,
  exportAsLogsToCsv,
  exportAsLogsFullExcel,
  exportAsLogsMigrationJson,
  exportAsLogsMigrationSql,
  exportAsLogsMigrationCsv,
  getExportFilename,
} from '@/utils/asLogExport';

const EXPORT_FIELDS = [
  'log_id', 'work_type', 'work_date', 'category', 'detailed_category',
  'model_name', 'employee_department', 'employee_workspace', 'employee_name',
  'serial_number', 'security_code', 'new_security_code',
  'question', 'detail_description', 'solution_detail',
  'created_by', 'created_at',
];

export default function AsRequestExportPage() {
  const [logs, setLogs] = useState<IAsManagementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ loaded: 0, total: null as number | null });
  const [exporting, setExporting] = useState<
    'excel' | 'json' | 'csv' | 'migration-json' | 'migration-sql' | 'migration-csv' | null
  >(null);

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

  const workTypeStats = logs.reduce<Record<string, number>>((acc, log) => {
    const type = log.work_type || '미분류';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const dateRange = (() => {
    const dates = logs
      .map((l) => l.work_date)
      .filter(Boolean)
      .sort();
    if (!dates.length) return null;
    return { earliest: dates[0], latest: dates[dates.length - 1] };
  })();

  const handleExport = async (
    type: 'excel' | 'json' | 'csv' | 'migration-json' | 'migration-sql' | 'migration-csv'
  ) => {
    if (!logs.length) return;
    setExporting(type);
    try {
      const filename = getExportFilename();
      switch (type) {
        case 'excel':
          exportAsLogsFullExcel(logs, filename);
          break;
        case 'json':
          exportAsLogsToJson(logs, filename);
          break;
        case 'csv':
          exportAsLogsToCsv(logs, filename);
          break;
        case 'migration-json':
          exportAsLogsMigrationJson(logs, filename);
          break;
        case 'migration-sql':
          exportAsLogsMigrationSql(logs, filename);
          break;
        case 'migration-csv':
          exportAsLogsMigrationCsv(logs, filename);
          break;
      }
    } catch {
      alert('다운로드 중 오류가 발생했습니다.');
    } finally {
      setExporting(null);
    }
  };

  const progressPercent =
    progress.total && progress.total > 0
      ? Math.round((progress.loaded / progress.total) * 100)
      : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/private/as-request"
          className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center mb-3"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          작업이력 목록으로
        </Link>
        <h2 className="text-lg font-semibold text-slate-900">작업이력 전체 데이터보내기</h2>
        <p className="text-sm text-slate-500 mt-1">
          사이트 재설계 및 분석을 위해 작업이력 전체 데이터를 다운로드할 수 있습니다.
        </p>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 flex flex-col items-center">
          <RingLoader size={36} color="#475569" />
          <p className="text-sm text-slate-600 mt-4">데이터를 불러오는 중...</p>
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
          <button
            onClick={loadData}
            className="ml-3 underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {/* 요약 */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">데이터 요약</h3>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500">총 건수</p>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{logs.length.toLocaleString()}</p>
              </div>
              {dateRange && (
                <>
                  <div>
                    <p className="text-xs text-slate-500">최초 작업일</p>
                    <p className="text-sm font-medium text-slate-800">
                      {format(parseISO(dateRange.earliest), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">최근 작업일</p>
                    <p className="text-sm font-medium text-slate-800">
                      {format(parseISO(dateRange.latest), 'yyyy-MM-dd')}
                    </p>
                  </div>
                </>
              )}
            </div>
            {Object.keys(workTypeStats).length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-xs text-slate-500 mb-2">작업유형별</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(workTypeStats).map(([type, count]) => (
                    <span key={type} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {type} {count.toLocaleString()}건
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 다운로드 */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">일반 다운로드</h3>
            </div>
            <div className="p-4 space-y-3">
              <DownloadButton
                label="Excel (.xlsx)"
                description="월별 시트로 분류된 엑셀 파일"
                disabled={!logs.length || exporting !== null}
                loading={exporting === 'excel'}
                onClick={() => handleExport('excel')}
              />
              <DownloadButton
                label="JSON (.json)"
                description="원본 데이터 전체 (사이트 재설계·분석용)"
                disabled={!logs.length || exporting !== null}
                loading={exporting === 'json'}
                onClick={() => handleExport('json')}
              />
              <DownloadButton
                label="CSV (.csv)"
                description="스프레드시트 호환 텍스트 형식"
                disabled={!logs.length || exporting !== null}
                loading={exporting === 'csv'}
                onClick={() => handleExport('csv')}
              />
            </div>
          </div>

          {/* Supabase 마이그레이션 */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">Supabase 테이블 이관용</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                새 Supabase 프로젝트에 테이블 생성·데이터 삽입이 편한 형식입니다.
              </p>
            </div>
            <div className="p-4 space-y-3">
              <DownloadButton
                label="마이그레이션 JSON"
                description="CREATE TABLE SQL + INSERT용 rows 배열 (supabase.insert() 바로 사용 가능)"
                disabled={!logs.length || exporting !== null}
                loading={exporting === 'migration-json'}
                onClick={() => handleExport('migration-json')}
              />
              <DownloadButton
                label="마이그레이션 SQL"
                description="CREATE TABLE + INSERT 문 + log_id 시퀀스 재설정"
                disabled={!logs.length || exporting !== null}
                loading={exporting === 'migration-sql'}
                onClick={() => handleExport('migration-sql')}
              />
              <DownloadButton
                label="마이그레이션 CSV"
                description="Supabase Table Editor → Import data via CSV 용"
                disabled={!logs.length || exporting !== null}
                loading={exporting === 'migration-csv'}
                onClick={() => handleExport('migration-csv')}
              />
            </div>
            <div className="px-4 pb-4">
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                <p className="font-medium text-slate-600">이관 순서</p>
                <p>1. SQL 파일로 테이블 생성 또는 JSON의 create_table_sql 실행</p>
                <p>2. SQL INSERT 실행 또는 JSON의 rows로 supabase.from(&apos;테이블명&apos;).insert(rows)</p>
                <p>3. 컬럼명이 다르면 rows 키를 새 스키마에 맞게 매핑</p>
              </div>
            </div>
          </div>

          {/* 포함 필드 */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">포함 필드</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-1.5">
              {EXPORT_FIELDS.map((field) => (
                <code key={field} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {field}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadButton({
  label,
  description,
  disabled,
  loading,
  onClick,
}: {
  label: string;
  description: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-md border text-left transition-colors ${
        disabled
          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      {loading ? (
        <RingLoader size={16} color="#475569" />
      ) : (
        <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
    </button>
  );
}
