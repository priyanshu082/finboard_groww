export const chartSamples = {
  simpleSeries: Array.from({ length: 12 }).map((_, i) => ({
    label: `T${i + 1}`,
    value: Math.round(50 + Math.sin(i / 2) * 25 + Math.random() * 10),
  })),
  monthPnL: [
    { label: 'Jan', value: 1200 },
    { label: 'Feb', value: 900 },
    { label: 'Mar', value: 1600 },
    { label: 'Apr', value: 800 },
    { label: 'May', value: 1700 },
    { label: 'Jun', value: 1400 },
    { label: 'Jul', value: 1800 },
    { label: 'Aug', value: 1550 },
    { label: 'Sep', value: 1620 },
    { label: 'Oct', value: 1750 },
    { label: 'Nov', value: 1680 },
    { label: 'Dec', value: 1900 },
  ],
  intraday: Array.from({ length: 24 }).map((_, i) => ({
    label: `${String(i).padStart(2, '0')}:00`,
    value: Math.round(100 + Math.cos(i / 3) * 30 + Math.random() * 15),
  })),
};
