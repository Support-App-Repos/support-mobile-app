import { useCallback, useEffect, useMemo, useState } from 'react';
import { profileService } from '../services';

function toIdSet(wishlistData: any[]): Set<string> {
  const ids = new Set<string>();
  for (const item of wishlistData) {
    const id = item?.id || item?._id || item?.listingId;
    if (id) ids.add(String(id));
  }
  return ids;
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileService.getWishlist();
      if (!response?.success) return;
      const wishlistData = (response.data as any)?.data || response.data || [];
      setWishlistIds(toIdSet(Array.isArray(wishlistData) ? wishlistData : []));
    } catch {
      // likely not logged in; ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = useCallback(
    (listingId: string) => wishlistIds.has(String(listingId)),
    [wishlistIds],
  );

  const toggle = useCallback(
    async (listingId: string) => {
      const id = String(listingId);
      const had = wishlistIds.has(id);

      // optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (had) next.delete(id);
        else next.add(id);
        return next;
      });

      try {
        const res = had
          ? await profileService.removeFromWishlist(id)
          : await profileService.addToWishlist(id);
        if (!res?.success) {
          // rollback on failure
          setWishlistIds((prev) => {
            const next = new Set(prev);
            if (had) next.add(id);
            else next.delete(id);
            return next;
          });
        }
      } catch {
        // rollback on error
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (had) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    },
    [wishlistIds],
  );

  return useMemo(
    () => ({
      wishlistIds,
      loading,
      refresh,
      isWishlisted,
      toggleWishlist: toggle,
    }),
    [wishlistIds, loading, refresh, isWishlisted, toggle],
  );
}

