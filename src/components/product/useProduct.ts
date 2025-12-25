"use client";

import React from "react";

export type ApiProduct = {
  title: string;
  subtitle: string | null;
  description: string;
  heroImageUrl: string | null;
  gallery: string[];
};

export function useProduct() {
  const [data, setData] = React.useState<ApiProduct | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProduct = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/product", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiProduct;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load product");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { data, loading, error, refetch: fetchProduct };
}
