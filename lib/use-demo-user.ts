"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useIsDemoUser() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsDemo(!!data.user?.is_anonymous));
  }, []);

  return isDemo;
}