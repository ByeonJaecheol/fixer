"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import WorkHistoryForm from "./WorkHistoryForm";
import WorkHistoryList from "./components/WorkHistoryList";

export default function InputPage() {
  const [workHistoryData, setWorkHistoryData] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const fetchWorkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("work-history")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setWorkHistoryData(data || []);
    } catch (error) {
      console.error("작업 내역을 불러오는 중 오류 발생:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkHistory();
  }, []);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditingData(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <WorkHistoryForm
        editingId={editingId}
        initialData={editingData}
        onCancel={handleCancel}
        onSuccess={fetchWorkHistory}
      />

      <div className="mt-8">
        <WorkHistoryList data={workHistoryData} onEdit={handleEdit} />
      </div>
    </div>
  );
}
