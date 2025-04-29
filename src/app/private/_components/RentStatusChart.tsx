'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface RentStatusProps {
  data: {
    type: string;
    total: number;
    rented: number;
  }[];
}

export default function RentStatusChart({ data }: RentStatusProps) {
  // 새로운 색상 팔레트 정의
  const colors = {
    대여가능: {
      main: '#E2E8F0', // 부드러운 회색
      hover: '#002d64'
    },
    대여중: {
      main: '#7C3AED', // 세련된 보라색
      hover: '#6D28D9'
    }
  };

  // 데이터 포맷팅: 대여 가능한 수(미대여) 계산
  const formattedData = data.map(item => ({
    type: item.type,
    대여가능: item.total - item.rented,
    대여중: item.rented,
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          stackOffset="none"
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E2E8F0" // 더 부드러운 그리드 라인
          />
          <XAxis 
            dataKey="type" 
            tick={{ fill: '#64748B' }} // 더 부드러운 텍스트 색상
            axisLine={{ stroke: '#CBD5E1' }} // 축 라인 색상
          />
          <YAxis 
            tick={{ fill: '#64748B' }}
            axisLine={{ stroke: '#CBD5E1' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '8px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '12px'
            }}
            formatter={(value: number) => [`${value}대`]}
            cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} // 호버 효과
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px'
            }}
            formatter={(value) => (
              <span style={{ color: '#64748B', fontSize: '12px' }}>{value}</span>
            )}
          />
          <Bar 
            dataKey="대여가능" 
            stackId="a" 
            fill={colors.대여가능.main}
            radius={[4, 4, 0, 0]}
            // 호버 효과 추가
            onMouseOver={(data, index) => {
              document.querySelector(`#bar-대여가능-${index}`)?.setAttribute('fill', colors.대여가능.hover);
            }}
            onMouseOut={(data, index) => {
              document.querySelector(`#bar-대여가능-${index}`)?.setAttribute('fill', colors.대여가능.main);
            }}
          />
          <Bar 
            dataKey="대여중" 
            stackId="a" 
            fill={colors.대여중.main}
            radius={[4, 4, 0, 0]}
            // 호버 효과 추가
            onMouseOver={(data, index) => {
              document.querySelector(`#bar-대여중-${index}`)?.setAttribute('fill', colors.대여중.hover);
            }}
            onMouseOut={(data, index) => {
              document.querySelector(`#bar-대여중-${index}`)?.setAttribute('fill', colors.대여중.main);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 