export interface BenchmarkResult {
  name: string;
  initialRender: number;
  scroll: number;
  memory: number;
}

export const benchmark = async (
  name: string,
  testFn: (options: any) => Promise<any>,
  options: any,
): Promise<BenchmarkResult> => {
  const performanceResults = await testFn(options);

  // Use a type assertion for performance.memory
  const memory = (performance as any).memory;
  const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;

  return {
    name,
    initialRender: performanceResults.initialRender,
    scroll: performanceResults.scroll,
    memory: memoryUsage,
  };
};
