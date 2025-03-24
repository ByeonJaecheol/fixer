import SupabaseService from "@/api/supabase/supabaseApi";
import { supabase } from "@/utils/supabase";
import SimpleBar, { InventoryItem } from "../_components/echart/SimpleBar";
export interface ModelCount {
  name: string;
  total: number;
}
export default async function PrivatePage() {
  // const supabase = await createClient()

  // const { data, error } = await supabase.auth.getUser()
  // if (error || !data?.user) {
  //   console.log('error', error)
  //   return <LoginErrorModal/>
  //   // redirect('/login')
  // }

  //pc_assets 테이블에서 모델명, 수량 조회하는 방법
  // 방법 1: 모델명 그룹화
  const fetchPcAssetsCountTest = async () => {
    const { data: mCount, error: mCountError } = await supabase
    .from('pc_assets')
    .select('model_name, count(*)')

  if (mCountError) console.error(mCountError);  
  else {
    console.log("★★★★★★★★★mCount 테스트",mCount);
    console.log("★★★★★★★★★mCount 테스트",mCount.length);
    return mCount;
  }
  }

  const result = await fetchPcAssetsCountTest();
  console.log("★★★★★★★★★result",result);

  const fetchPcAssetsCount = async () => {
    const supabaseService = SupabaseService.getInstance();
    const { data, error } = await supabaseService.select({table: 'model_count'});
    if (error) console.error(error);
    else {
      // 
      const chartData : InventoryItem[] = data.map((item: any) => ({
        name : item.model_name,
        count : item.total
      }));
      return chartData;
    };
  }
  const modelCount : InventoryItem[]|undefined = await fetchPcAssetsCount();
   // 방법 2: 여러 필드 선택과 함께 그룹화
// const { data: detailedStats, error } = await supabase
// .from('pc_assets')
// .select(`
//   model_name,
//   count(*),
//   manufacturer,
//   sum(case when status = 'active' then 1 else 0 end) as active_count
// `)
// .group('model_name, manufacturer');
if (modelCount === undefined || modelCount.length === 0) {
  return <div>데이터가 없습니다.</div>
}
return (
  <div className="w-full h-full flex flex-row">
      {/* {modelCount.map((item: any) => (
        <div key={item.model_name}>
          {item.name}
          {item.count}
        </div>
      ))} */}
       {/* <ResponsiveContainer width="100%" height="100%"> */}
        {/* <BarChart width={150} height={40} data={modelCount}> */}
          {/* <Bar dataKey="count" fill="#8884d8" /> */}
        {/* </BarChart> */}
      {/* </ResponsiveContainer> */}
      {/* recharts 차트 예시 */}

      {/* <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={40} data={modelCount}>
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer> */}
      {/* <div className="w-1/2         h-full ">
        <SimpleBar title="모델별 재고 현황" yName="수량" seriesName="재고 수량" inventoryData={modelCount}/>
      </div> */}
    </div>
  )
}