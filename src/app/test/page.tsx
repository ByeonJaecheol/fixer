import { supabase } from "@/utils/supabase";
import SimpleBar from "../_components/echart/SimpleBar";

export default async function TestPage() {
  const {data,error} = await supabase.from('pc_assets').select('*').eq('serial_number','4CE104107V');
  console.log('pc_assets test ',data);
  // return <div><SimpleBar/></div>;
}
