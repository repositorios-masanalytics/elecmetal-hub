// DIAGNOSTIC — remove after debugging
/* eslint-disable @typescript-eslint/no-explicit-any */
try {
  const w: any = typeof window !== 'undefined' ? window : null;
  const ts = w && w.__themeState__;
  console.log('[wp:2] AMD factory called; externals loaded; pre-SCSS', {
    hasThemeState: !!ts,
    hasRunState:   !!(ts && ts.runState),
    hasPerf:       !!(ts && ts.perf),
    hasBuffer:     !!(ts && ts.runState && ts.runState.buffer),
  });
} catch (e) {
  console.error('[wp:2] diag error', e);
}
export {};
