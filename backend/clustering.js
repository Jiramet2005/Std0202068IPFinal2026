// Adapted from enrichWithKMeans in the original GPU app: salaries only,
// computed on the server, with convergence and empty-cluster handling.
function salaryClusters(salaries) {
  const unique = [...new Set(salaries)].sort((a, b) => a - b);
  const k = Math.min(3, unique.length);
  if (!k) return emptyTiers();
  let centroids = k === 3
    ? [unique[0], unique[Math.floor(unique.length / 2)], unique.at(-1)] : unique;
  let groups = [];
  for (let iteration = 0; iteration < 100; iteration++) {
    groups = Array.from({ length: k }, () => []);
    for (const salary of salaries) {
      let nearest = 0;
      for (let i = 1; i < k; i++) {
        if (Math.abs(salary - centroids[i]) < Math.abs(salary - centroids[nearest])) nearest = i;
      }
      groups[nearest].push(salary);
    }
    const next = groups.map((values, i) => values.length
      ? values.reduce((sum, value) => sum + value / values.length, 0) : centroids[i]);
    const converged = next.every((value, i) => Math.abs(value - centroids[i]) < 1e-7);
    centroids = next;
    if (converged) break;
  }
  const result = groups.map((values, i) => ({
    centroid: values.length ? Number(centroids[i].toFixed(2)) : null,
    count: values.length,
  })).sort((a, b) => (a.centroid ?? Infinity) - (b.centroid ?? Infinity));
  while (result.length < 3) result.push({ centroid: null, count: 0 });
  return result.map((cluster, i) => ({ group: `Tier ${i + 1}`, ...cluster }));
}
function emptyTiers() {
  return Array.from({ length: 3 }, (_, i) => ({ group: `Tier ${i + 1}`, centroid: null, count: 0 }));
}
module.exports = { salaryClusters };
