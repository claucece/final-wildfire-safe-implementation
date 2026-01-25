import { useEffect } from "react";
import { usePathname } from "expo-router";
import { useBadges } from "@/components/badges/BadgeSystem";

export default function DismissBadgeToastOnRouteChange() {
  const pathname = usePathname();
  const { dismissToast } = useBadges();

  useEffect(() => {
    dismissToast();
  }, [pathname, dismissToast]);

  return null;
}
