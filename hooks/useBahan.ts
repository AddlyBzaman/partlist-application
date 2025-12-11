import { useState, useEffect } from "react";
import { bahanService } from "@/lib/services/bahanService";
import { getSession } from "@/lib/services/authService";
import { Bahan } from "@/types/bahan";

export function useBahan() {
  const [dataList, setDataList] = useState<Bahan[]>([]);
  const [form, setForm] = useState<Partial<Bahan>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await bahanService.getAll();
    setDataList(data);
  }

  function updateForm(name: string, value: any) {
    setForm((prev: Partial<Bahan>) => ({ ...prev, [name]: value }));
  }

  async function save() {
    setLoading(true);
    const session = getSession();

    await bahanService.create(form as Bahan, session.username || "unknown");

    await loadData();
    setForm({});
    setLoading(false);
  }

  return {
    form,
    updateForm,
    dataList,
    save,
    loading,
  };
}
