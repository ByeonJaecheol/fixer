'use client';

import ReactECharts, { EChartsOption } from "echarts-for-react";
import { useEffect, useRef, useState } from "react";

export interface InventoryItem {
  name : string;
  count : number;
}
// 재사용 가능하게 매개변수 받아서 사용
export default function SimpleBar({title,yName,seriesName,inventoryData}: {title: string,yName: string,seriesName: string,inventoryData: InventoryItem[]}) {
  //   const [options, setOptions] = useState<EChartsOption>({
	// 	xAxis: {
	//     type: 'category',
	//     data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	//   },
	//   yAxis: {
	//     type: 'value'
	//   },
	//   series: [
	//     {
	//       data: [150, 230, 224, 218, 135, 147, 260],
	//       type: 'bar'
	//     }
	//   ]
	// });	


  // 차트 옵션 설정
  const option :EChartsOption = {
    title: {
      text: title,
      left: 'center',
      top: 'top',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }

    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      name : '모델명',
      nameLocation: 'middle',
      nameGap: 30,
      data: inventoryData.map(item => item.name),
      axisLabel: {
        interval: 0, // 모든 라벨 표시하기 위한 핵심 설정
        // rotate: 45,  // 라벨 회전 (겹침 방지)
        margin: 15, // 라벨과 축 사이 여백 늘리기
        formatter: function(value: string) {
          // 라벨이 너무 길면 줄바꿈 처리 (선택 사항)
          if (value.length > 10) {
            return value.substring(0, 10) + '...';
          }
          return value;
        }
      }
    },
    yAxis: {
      type: 'value',
      name: yName,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: seriesName,
        type: 'bar',
        barWidth: '10%',
        data: inventoryData.map(item => item.count),
        itemStyle: {
          color: function(params: any) {
            // 색상 배열
            const colorList = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#14B8A6', '#6366F1', '#EC4899', '#0EA5E9', '#818CF8'];
            return colorList[params.dataIndex % colorList.length];
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow-lg p-4">
    <ReactECharts
      option={option as EChartsOption}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'svg' }}
      className="w-full h-full"
    />
  </div>
  );
}
