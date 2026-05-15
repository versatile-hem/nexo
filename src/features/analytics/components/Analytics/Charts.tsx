/**
 * Chart Components using Recharts
 * Create interactive analytics visualizations
 */

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TrendData, ProductMetrics, ChannelMetrics } from '../../types/analytics';

const COLORS = {
  primary: '#2c7a4b',
  secondary: '#3b82f6',
  tertiary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

/**
 * Revenue Trend Line Chart
 */
interface RevenueTrendChartProps {
  data: TrendData[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Revenue Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Profit Trend Area Chart
 */
interface ProfitTrendChartProps {
  data: TrendData[];
}

export function ProfitTrendChart({ data }: ProfitTrendChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Profit Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke={COLORS.success}
            fill="url(#colorProfit)"
            strokeWidth={2}
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Product Contribution Donut Chart
 */
interface ProductContributionChartProps {
  data: ProductMetrics[];
}

export function ProductContributionChart({ data }: ProductContributionChartProps) {
  const chartData = data.slice(0, 5).map((product) => ({
    name: product.productName,
    value: product.profit,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Top Products by Profit
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}K`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.keys(COLORS).length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => `₹${(value as number / 1000).toFixed(1)}K`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Marketplace Performance Stacked Bar Chart
 */
interface MarketplacePerformanceChartProps {
  data: ChannelMetrics[];
}

export function MarketplacePerformanceChart({ data }: MarketplacePerformanceChartProps) {
  const chartData = data.map((channel) => ({
    name: channel.marketplace,
    Revenue: channel.revenue,
    Profit: channel.profit,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Marketplace Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => `₹${(value as number / 1000).toFixed(1)}K`}
          />
          <Legend />
          <Bar dataKey="Revenue" fill={COLORS.primary} />
          <Bar dataKey="Profit" fill={COLORS.success} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Top Products Bar Chart
 */
interface TopProductsChartProps {
  data: ProductMetrics[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data
    .slice(0, 5)
    .sort((a, b) => b.profit - a.profit)
    .map((product) => ({
      name: product.productName.substring(0, 20),
      profit: product.profit,
      margin: product.margin,
    }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Top 5 Products
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => `₹${(value as number / 1000).toFixed(1)}K`}
          />
          <Bar dataKey="profit" fill={COLORS.success} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Margin Distribution Bar Chart
 */
interface MarginDistributionChartProps {
  data: ProductMetrics[];
}

export function MarginDistributionChart({ data }: MarginDistributionChartProps) {
  const chartData = data.slice(0, 8).map((product) => ({
    name: product.productName.substring(0, 15),
    margin: Math.round(product.margin * 100),
    revenue: product.revenue,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Margin % by Product
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#94a3b8" label={{ value: 'Margin %', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => `${value}%`}
          />
          <Bar dataKey="margin" fill={COLORS.tertiary} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
