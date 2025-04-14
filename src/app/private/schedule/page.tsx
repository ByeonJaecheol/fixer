'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, parseISO, isWithinInterval, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

// 우선순위 타입 정의
type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

interface Priority {
  id: PriorityLevel;
  label: string;
  color: string;
  description: string;
}

// 우선순위 목록 정의
const PRIORITIES: Priority[] = [
  { 
    id: 'low', 
    label: '여유', 
    color: '#10B981', // 초록색
    description: '여유있게 처리할 수 있는 일정'
  },
  { 
    id: 'medium', 
    label: '보통', 
    color: '#3B82F6', // 파란색
    description: '일반적인 중요도의 일정'
  },
  { 
    id: 'high', 
    label: '중요', 
    color: '#F59E0B', // 주황색
    description: '중요하고 신경써야 하는 일정'
  },
  { 
    id: 'urgent', 
    label: '급함', 
    color: '#EF4444', // 빨간색
    description: '긴급하게 처리해야 하는 일정'
  }
];

interface Todo {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: PriorityLevel;
  color: string;
  created_by: string;
}

export default function TodoCalendarPage() {
  const { user } = useUser();
  const createdBy = user?.email;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateRange, setSelectedDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as PriorityLevel // 기본값은 '보통'
  });
  const [loading, setLoading] = useState(false);
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const router = useRouter();

  // 할 일 데이터 불러오기
  useEffect(() => {
    fetchTodos();
  }, [currentMonth]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      // 현재 달의 시작일과 끝일
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .or(`start_date.gte.${format(monthStart, 'yyyy-MM-dd')},end_date.gte.${format(monthStart, 'yyyy-MM-dd')}`)
        .or(`start_date.lte.${format(monthEnd, 'yyyy-MM-dd')},end_date.lte.${format(monthEnd, 'yyyy-MM-dd')}`);
      
      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('할 일을 불러오는 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // 할 일 저장
  const saveTodo = async () => {
    if (!selectedDateRange.start) return;
    if (!newTodo.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const endDate = selectedDateRange.end || selectedDateRange.start;
      const selectedPriority = PRIORITIES.find(p => p.id === newTodo.priority) || PRIORITIES[1];
      
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          title: newTodo.title,
          description: newTodo.description,
          start_date: format(selectedDateRange.start, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          priority: newTodo.priority,
          color: selectedPriority.color,
          created_by: createdBy
        }])
        .select();
      
      if (error) throw error;
      
      setTodos([...todos, ...(data || [])]);
      setNewTodo({ title: '', description: '', priority: 'medium' });
      setSelectedDateRange({ start: null, end: null });
      setShowForm(false);
    } catch (error) {
      console.error('할 일 저장 중 오류 발생:', error);
      alert('할 일을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 전월, 다음월 이동
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // 날짜 선택 핸들러
  const handleDateClick = (day: Date) => {
    if (!selectedDateRange.start) {
      setSelectedDateRange({ start: day, end: null });
    } else if (!selectedDateRange.end) {
      // 시작일 이후 날짜인지 확인
      if (day < selectedDateRange.start) {
        setSelectedDateRange({ start: day, end: selectedDateRange.start });
      } else {
        setSelectedDateRange({ ...selectedDateRange, end: day });
      }
      setShowForm(true);
    } else {
      // 둘 다 선택된 상태에서 다시 클릭하면 초기화
      setSelectedDateRange({ start: day, end: null });
      setShowForm(false);
    }
  };

  // 선택된 날짜에 스타일 적용
  const isSelected = (day: Date) => {
    if (selectedDateRange.start && selectedDateRange.end) {
      return isWithinInterval(day, { 
        start: selectedDateRange.start, 
        end: selectedDateRange.end 
      });
    }
    return selectedDateRange.start && isSameDay(day, selectedDateRange.start);
  };

  // 작성자 목록 계산
  const creators = [...new Set(todos.map(todo => todo.created_by))];

  // 필터링된 할 일 목록 계산
  const filteredTodos = creatorFilter
    ? todos.filter(todo => todo.created_by === creatorFilter)
    : todos;

  // 날짜에 해당하는 할 일 찾기
  const getTodosForDate = (day: Date) => {
    return filteredTodos.filter(todo => {
      const startDate = parseISO(todo.start_date);
      const endDate = parseISO(todo.end_date);
      return isWithinInterval(day, { start: startDate, end: endDate });
    });
  };

  // 달력 날짜 생성
  const calendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // 요일 헤더 (일~토)
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* 요일 헤더 */}
        {weekdays.map((day, index) => (
          <div 
            key={`weekday-${index}`} 
            className={`text-center py-2 font-medium text-sm ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'}`}
          >
            {day}
          </div>
        ))}
        
        {/* 빈 셀 채우기 (월 시작일 전) */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 bg-gray-50 rounded"></div>
        ))}
        
        {/* 날짜 셀 */}
        {days.map(day => {
          const todosForDay = getTodosForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          // 선택 범위 관련 스타일링 개선
          const isRangeStart = selectedDateRange.start && isSameDay(selectedDateRange.start, day);
          const isRangeEnd = selectedDateRange.end && isSameDay(selectedDateRange.end, day);
          const isInRange = selectedDateRange.start && selectedDateRange.end && 
            isWithinInterval(day, { start: selectedDateRange.start, end: selectedDateRange.end });
          
          return (
            <div 
              key={day.toString()} 
              className={`h-24 p-1 border rounded cursor-pointer relative transition-colors
                ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'}
                ${isToday ? 'border-blue-500' : 'border-gray-200'}
                ${isInRange ? 'bg-blue-50' : ''}
                ${isRangeStart ? 'border-l-4 border-l-blue-500' : ''}
                ${isRangeEnd ? 'border-r-4 border-r-blue-500' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-right text-sm mb-1 
                ${day.getDay() === 0 ? 'text-red-500' : day.getDay() === 6 ? 'text-blue-500' : ''}
                ${isRangeStart || isRangeEnd ? 'font-bold' : ''}
              `}>
                {format(day, 'd')}
                {(isRangeStart || isRangeEnd) && (
                  <span className="ml-1 px-1 text-xs text-white bg-blue-500 rounded-full">
                    {isRangeStart ? '시작' : '종료'}
                  </span>
                )}
              </div>
              
              <div className="overflow-y-auto max-h-16 space-y-1">
                {todosForDay.map((todo, idx) => {
                  const isStart = isSameDay(parseISO(todo.start_date), day);
                  const isEnd = isSameDay(parseISO(todo.end_date), day);
                  
                  // 작성자 이니셜 생성 (이메일에서 @ 앞 첫 2글자)
                  const creatorInitial = todo.created_by 
                    ? todo.created_by.split('@')[0].substring(0, 2).toUpperCase() 
                    : '??';
                  
                  return (
                    <div 
                      key={`${todo.id}-${idx}`}
                      className={`text-xs p-1 rounded-sm text-white truncate flex items-center
                        ${isStart && isEnd ? 'rounded' : isStart ? 'rounded-l' : isEnd ? 'rounded-r' : ''}
                        hover:opacity-75 cursor-pointer
                      `}
                      style={{ 
                        backgroundColor: todo.color,
                        marginLeft: !isStart ? '-4px' : '0',
                        marginRight: !isEnd ? '-4px' : '0',
                        paddingLeft: isStart ? '4px' : '8px',
                        paddingRight: isEnd ? '4px' : '8px'
                      }}
                      title={`${todo.title} (${todo.start_date} ~ ${todo.end_date}, 작성자: ${todo.created_by})`}
                      onClick={(e) => handleTodoClick(todo, e)}
                    >
                      {isStart && (
                        <>
                          <span className="inline-flex items-center justify-center w-5 h-5 mr-1 bg-white bg-opacity-30 rounded-full text-[9px] font-bold">
                            {creatorInitial}
                          </span>
                          <span className="truncate">{todo.title}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* 빈 셀 채우기 (월 종료일 후) */}
        {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-24 bg-gray-50 rounded"></div>
        ))}
      </div>
    );
  };

  // 날짜 포맷팅 헬퍼
  const formatDateRange = () => {
    if (!selectedDateRange.start) return '';
    
    const startStr = format(selectedDateRange.start, 'yyyy년 MM월 dd일', { locale: ko });
    
    if (!selectedDateRange.end || isSameDay(selectedDateRange.start, selectedDateRange.end)) {
      return startStr;
    }
    
    const endStr = format(selectedDateRange.end, 'yyyy년 MM월 dd일', { locale: ko });
    return `${startStr} ~ ${endStr}`;
  };

  // 일정 클릭 핸들러
  const handleTodoClick = (todo: Todo, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTodo(todo);
    setModalMode('view');
    setNewTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority
    });
    
    // 날짜 정보도 설정
    if (todo.start_date && todo.end_date) {
      setSelectedDateRange({
        start: parseISO(todo.start_date),
        end: parseISO(todo.end_date)
      });
    }
    
    setShowForm(true);
  };

  // 수정 버튼 핸들러
  const handleEditClick = () => {
    if (!selectedTodo) return;
    setModalMode('edit');
    setNewTodo({
      title: selectedTodo.title,
      description: selectedTodo.description,
      priority: selectedTodo.priority
    });
    
    // 날짜 정보도 설정
    if (selectedTodo.start_date && selectedTodo.end_date) {
      setSelectedDateRange({
        start: parseISO(selectedTodo.start_date),
        end: parseISO(selectedTodo.end_date)
      });
    }
  };

  // 수정 저장 함수
  const updateTodo = async () => {
    if (!selectedTodo) return;
    if (!newTodo.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!selectedDateRange.start) {
      alert('시작 날짜를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const endDate = selectedDateRange.end || selectedDateRange.start;
      const selectedPriority = PRIORITIES.find(p => p.id === newTodo.priority) || PRIORITIES[1];
      
      const { error } = await supabase
        .from('todos')
        .update({
          title: newTodo.title,
          description: newTodo.description,
          priority: newTodo.priority,
          color: selectedPriority.color,
          // 날짜 정보 업데이트
          start_date: format(selectedDateRange.start, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd')
        })
        .eq('id', selectedTodo.id);
      
      if (error) throw error;
      
      setTodos(todos.map(todo => 
        todo.id === selectedTodo.id 
          ? { 
              ...todo, 
              title: newTodo.title, 
              description: newTodo.description, 
              priority: newTodo.priority,
              color: selectedPriority.color,
              // 날짜 정보 업데이트
              start_date: selectedDateRange.start ? format(selectedDateRange.start, 'yyyy-MM-dd') : '',
              end_date: selectedDateRange.end ? format(selectedDateRange.end, 'yyyy-MM-dd') : ''
            } 
          : todo
      ));
      setShowForm(false);
      setSelectedTodo(null);
      setSelectedDateRange({ start: null, end: null });
      
      alert('일정이 수정되었습니다.');
    } catch (error) {
      console.error('일정 수정 중 오류 발생:', error);
      alert('일정을 수정하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 삭제 함수
  const deleteTodo = async () => {
    if (!selectedTodo) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', selectedTodo.id);
      
      if (error) throw error;
      
      // 성공적으로 삭제된 경우 로컬 상태 업데이트
      setTodos(todos.filter(todo => todo.id !== selectedTodo.id));
      setShowForm(false);
      setSelectedTodo(null);
      setShowDeleteConfirm(false);
      
      // 성공 알림
      alert('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('일정 삭제 중 오류 발생:', error);
      alert('일정을 삭제하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 작성자 이니셜을 추출하는 함수 추가
  const getInitials = (email: string): string => {
    // 이메일 형식인 경우 @ 앞 부분의 첫 두 글자 사용
    if (email.includes('@')) {
      const name = email.split('@')[0];
      return name.length > 1 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
    }
    
    // 공백이 있는 이름인 경우 각 단어의 첫 글자 사용
    if (email.includes(' ')) {
      return email.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    // 그 외 경우 첫 두 글자 사용
    return email.length > 1 ? email.substring(0, 2).toUpperCase() : email.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-y-4">
        <h1 className="text-2xl font-bold text-gray-800">월간 스케줄</h1>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* 작성자 필터 드롭다운 */}
          <div className="relative">
            <select
              value={creatorFilter || ''}
              onChange={(e) => setCreatorFilter(e.target.value || null)}
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 작성자</option>
              {creators.map(creator => (
                <option key={creator} value={creator}>
                  {creator.split('@')[0]}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* 기존 달력 컨트롤 */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-lg font-semibold">
              {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
            </span>
            
            <button 
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              오늘
            </button>
          </div>
        </div>
      </div>
      
      {calendarDays()}
      
      {/* 할 일 입력 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? '새 할 일 추가' : 
                 modalMode === 'edit' ? '할 일 수정' : '할 일 상세 정보'}
              </h2>
              {/* 본인이 작성한 일정만 수정/삭제 가능 */}
              {modalMode === 'view' && selectedTodo && selectedTodo.created_by === createdBy && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* 날짜 범위 정보 */}
            {modalMode === 'create' ? (
              <p className="text-sm text-gray-600 mb-4">{formatDateRange()}</p>
            ) : selectedTodo && (
              <p className="text-sm text-gray-600 mb-4">
                {format(parseISO(selectedTodo.start_date), 'yyyy년 MM월 dd일', { locale: ko })}
                {" ~ "}
                {format(parseISO(selectedTodo.end_date), 'yyyy년 MM월 dd일', { locale: ko })}
              </p>
            )}
            
            {/* 작성자 정보 (수정/조회 모드) */}
            {modalMode !== 'create' && selectedTodo && (
              <p className="text-sm text-gray-600 mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-5 h-5 mr-1 bg-gray-200 rounded-full text-xs font-bold">
                  {getInitials(selectedTodo.created_by)}
                </span>
                작성자: {selectedTodo.created_by}
              </p>
            )}
            
            {/* 모달에서 우선순위 정보 표시 */}
            {modalMode !== 'create' && selectedTodo && (
              <div className="flex items-center mb-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-1" 
                  style={{ backgroundColor: selectedTodo.color }}
                ></div>
                <span className="font-medium">
                  우선순위: {PRIORITIES.find(p => p.id === selectedTodo.priority)?.label || '보통'}
                </span>
              </div>
            )}
            
            {/* 수정 모달에 날짜 선택 UI 추가 */}
            {modalMode !== 'view' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">일정 날짜</label>
                <div className="text-sm">
                  {selectedDateRange.start && (
                    <span>
                      {format(selectedDateRange.start, 'yyyy년 MM월 dd일')}
                      {selectedDateRange.end && selectedDateRange.end !== selectedDateRange.start && (
                        <> ~ {format(selectedDateRange.end, 'yyyy년 MM월 dd일')}</>
                      )}
                    </span>
                  )}
                  {!selectedDateRange.start && <span className="text-gray-500">날짜를 선택해주세요</span>}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {modalMode === 'edit' ? '날짜를 변경하려면 모달을 닫고 달력에서 다시 날짜를 선택하세요.' : 
                    '달력에서 날짜를 선택한 후 일정을 등록하세요.'}
                </p>
              </div>
            )}
            
            {/* 모달에서 날짜 재선택을 위한 버튼 추가 */}
            {modalMode === 'edit' && (
              <div className="mb-4">
                <button
                  type="button"
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedDateRange({ start: null, end: null });
                  }}
                >
                  달력에서 새 날짜 선택하기
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="할 일 제목"
                  readOnly={modalMode === 'view'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택사항)</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="상세 설명"
                  readOnly={modalMode === 'view'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITIES.map(priority => (
                    <div
                      key={priority.id}
                      onClick={() => modalMode !== 'view' && setNewTodo({ ...newTodo, priority: priority.id })}
                      className={`
                        flex items-center p-2 border rounded cursor-pointer transition-colors
                        ${newTodo.priority === priority.id ? 'ring-2 ring-offset-2 ring-gray-400' : 'hover:bg-gray-50'}
                        ${modalMode === 'view' ? 'pointer-events-none' : ''}
                      `}
                    >
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: priority.color }}></div>
                      <div>
                        <div className="font-medium text-sm">{priority.label}</div>
                        <div className="text-xs text-gray-500">{priority.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedTodo(null);
                  if (modalMode === 'create') {
                    setSelectedDateRange({ start: null, end: null });
                  }
                  setModalMode('create');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                {modalMode === 'view' ? '닫기' : '취소'}
              </button>
              
              {modalMode !== 'view' && (
                <button
                  type="button"
                  onClick={modalMode === 'create' ? saveTodo : updateTodo}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '저장'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">일정 삭제 확인</h2>
            <p className="text-gray-700 mb-6">
              정말로 이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={deleteTodo}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
