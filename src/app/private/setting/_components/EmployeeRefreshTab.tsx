'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RingLoader } from 'react-spinners';
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import OkButton from '@/app/_components/common/input/button/OkButton';
import {
  EmployeeRow,
  fetchEmployeeCount,
  ImportProgress,
  parseEmployeeCsvFile,
  refreshEmployeeData,
  summarizeEmployees,
} from '@/utils/employeeImport';

const PREVIEW_COLUMNS: { key: keyof EmployeeRow; label: string }[] = [
  { key: '이름', label: '이름' },
  { key: '아이뒤', label: '아이디' },
  { key: '사번', label: '사번' },
  { key: '회사', label: '회사' },
  { key: '부서', label: '부서' },
  { key: '직위', label: '직위' },
  { key: '직책', label: '직책' },
  { key: '퇴사', label: '퇴사' },
];

export default function EmployeeRefreshTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentCount, setCurrentCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<EmployeeRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [skippedRows, setSkippedRows] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const count = await fetchEmployeeCount();
      setCurrentCount(count);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '사원 수 조회 중 오류가 발생했습니다.');
    } finally {
      setLoadingCount(false);
    }
  }, []);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  const resetMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('CSV 파일만 업로드할 수 있습니다.');
      return;
    }

    resetMessages();
    setParsing(true);
    setFileName(file.name);
    setParsedRows([]);
    setParseErrors([]);
    setSkippedRows(0);

    try {
      const result = await parseEmployeeCsvFile(file);
      setParsedRows(result.rows);
      setParseErrors(result.errors);
      setSkippedRows(result.skipped);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '파일 분석 중 오류가 발생했습니다.');
      setFileName(null);
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!parsedRows.length || parseErrors.length > 0) return;

    const confirmed = window.confirm(
      `기존 사원 ${currentCount?.toLocaleString() ?? '?'}명의 데이터를 삭제하고,\n` +
        `CSV 파일의 ${parsedRows.length.toLocaleString()}명으로 교체합니다.\n\n` +
        '계속하시겠습니까?'
    );
    if (!confirmed) return;

    resetMessages();
    setImporting(true);
    setImportProgress(null);

    try {
      const { inserted } = await refreshEmployeeData(parsedRows, setImportProgress);
      setSuccessMessage(`${inserted.toLocaleString()}명의 사원명단이 최신화되었습니다.`);
      setParsedRows([]);
      setFileName(null);
      await loadCount();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '사원명단 최신화 중 오류가 발생했습니다.');
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  };

  const summary = parsedRows.length > 0 ? summarizeEmployees(parsedRows) : null;
  const previewRows = parsedRows.slice(0, 10);
  const progressPercent =
    importProgress && importProgress.total > 0
      ? Math.round((importProgress.loaded / importProgress.total) * 100)
      : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">사원목록 최신화</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          MES에서 보낸 사원명단 CSV 파일을 업로드하여 사원 리스트를 최신화합니다.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg px-4 py-4 mb-6 flex flex-wrap items-center gap-6">
        <div>
          <span className="text-xs text-slate-500">현재 등록된 사원</span>
          <p className="text-lg font-semibold text-slate-900 tabular-nums">
            {loadingCount ? (
              <RingLoader size={16} color="#475569" />
            ) : (
              `${(currentCount ?? 0).toLocaleString()}명`
            )}
          </p>
        </div>
        <div className="text-sm text-slate-500">
          CSV 컬럼: 이름, 아이디, 사번, 회사, 부서, 직위, 직책, 성별, 퇴사
        </div>
      </div>

      <div
        className={`bg-white border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
          isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center text-center">
          <ArrowUpTrayIcon className="w-10 h-10 text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-700 mb-1">
            CSV 파일을 드래그하거나 클릭하여 선택하세요
          </p>
          <p className="text-xs text-slate-500 mb-4">MES 사원명단 CSV (UTF-8)</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing || importing}
            className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            파일 선택
          </button>
        </div>
      </div>

      {parsing && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 flex flex-col items-center mb-6">
          <RingLoader size={32} color="#475569" />
          <p className="text-sm text-slate-600 mt-4">CSV 파일을 분석하는 중...</p>
        </div>
      )}

      {fileName && !parsing && (
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-sm text-slate-700">
          <DocumentTextIcon className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="font-medium">{fileName}</span>
        </div>
      )}

      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          <p className="font-medium mb-1">파일 검증 오류</p>
          <ul className="list-disc list-inside space-y-0.5">
            {parseErrors.slice(0, 10).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {parseErrors.length > 10 && (
              <li>외 {parseErrors.length - 10}건의 오류...</li>
            )}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {errorMessage}
        </div>
      )}

      {summary && parseErrors.length === 0 && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 mb-4 flex flex-wrap items-center gap-6">
            <div>
              <span className="text-xs text-slate-500">업로드 예정</span>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">
                {summary.total.toLocaleString()}명
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">재직</span>
              <p className="text-lg font-semibold text-emerald-700 tabular-nums">
                {summary.active.toLocaleString()}명
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">퇴사</span>
              <p className="text-lg font-semibold text-slate-500 tabular-nums">
                {summary.retired.toLocaleString()}명
              </p>
            </div>
            {skippedRows > 0 && (
              <div>
                <span className="text-xs text-slate-500">건너뜀 (빈 행)</span>
                <p className="text-lg font-semibold text-slate-400 tabular-nums">
                  {skippedRows.toLocaleString()}건
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">미리보기 (상위 10건)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    {PREVIEW_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className="px-3 py-2.5 text-left text-xs font-semibold text-slate-700 whitespace-nowrap border-r border-slate-200 last:border-r-0"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr
                      key={`${row.아이뒤}-${index}`}
                      className="border-b border-slate-100 hover:bg-slate-50/80 even:bg-slate-50/40"
                    >
                      {PREVIEW_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className="px-3 py-2 text-slate-800 border-r border-slate-100 last:border-r-0 whitespace-nowrap text-xs"
                        >
                          {row[col.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {importing && importProgress && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 mb-4">
              <p className="text-sm text-slate-600 mb-3">
                {importProgress.phase === 'deleting'
                  ? '기존 사원 데이터를 삭제하는 중...'
                  : `사원 데이터를 저장하는 중... (${importProgress.loaded.toLocaleString()} / ${importProgress.total.toLocaleString()})`}
              </p>
              {progressPercent !== null && (
                <div className="w-full">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{importProgress.loaded.toLocaleString()}건</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="max-w-xs">
            <OkButton
              onClick={handleImport}
              isLoading={importing}
              buttonText="사원명단 최신화"
            />
          </div>
        </>
      )}
    </div>
  );
}
