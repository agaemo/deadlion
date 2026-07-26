"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";

const DEBOUNCE_MS = 300;

/**
 * タスク一覧の検索バー。
 * 入力を300msデバウンスしてから onSearch を呼び出すことで、
 * 1文字ごとの検索実行（URL遷移）を避ける。
 */
export function SearchBar({
  defaultValue,
  onSearch,
}: {
  defaultValue: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(next: string) {
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(next), DEBOUNCE_MS);
  }

  return (
    <div className="max-w-sm">
      <Input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="タイトル・ラベル・説明文・コメントを検索"
        aria-label="タスクを検索"
      />
    </div>
  );
}
