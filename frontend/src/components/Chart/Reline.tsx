import Skeleton from 'components/Skeleton';
import moment from 'moment';
import * as React from 'react';
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

interface IProps {
  x: string;
  y: string;
  lines?: any[];
  loading: boolean;
}

const gradientArea = (data: any, y: string, id?: string, fade?: boolean) => {
  const dataMax = Math.max(...data.map((i: any) => i[y]));
  const dataMin = Math.min(...data.map((i: any) => i[y]));
  const average =
    100 - (Math.abs(dataMin) * 100) / (Math.abs(dataMax) + Math.abs(dataMin));

  if (dataMin > 0) {
    return [
      <stop
        key={id ? `${id}-1` : '1'}
        offset="0%"
        stopColor="#5DBE42"
        stopOpacity="1"
      />,
      <stop
        key={id ? `${id}-2` : '2'}
        offset="100%"
        stopColor="#5DBE42"
        stopOpacity={fade ? '0' : '1'}
      />,
    ];
  }
  if (dataMax <= 0) {
    return [
      <stop
        key={id ? `${id}-2` : '2'}
        offset="0%"
        stopColor="#FF5F5F"
        stopOpacity={fade ? '0' : '1'}
      />,
      <stop
        key={id ? `${id}-1` : '1'}
        offset="100%"
        stopColor="#FF5F5F"
        stopOpacity="1"
      />,
    ];
  }
  return [
    <stop
      key={id ? `${id}-1` : '1'}
      offset="0%"
      stopColor="#5DBE42"
      stopOpacity="1"
    />,
    <stop
      key={id ? `${id}-2` : '2'}
      offset={`${average}%`}
      stopColor="#5DBE42"
      stopOpacity={fade ? '0' : '1'}
    />,
    <stop
      key={id ? `${id}-3` : '3'}
      offset={`${average}%`}
      stopColor="#FF5F5F"
      stopOpacity={fade ? '0' : '1'}
    />,
    <stop
      key={id ? `${id}-4` : '4'}
      offset="100%"
      stopColor="#FF5F5F"
      stopOpacity="1"
    />,
  ];
};

const Reline: React.FunctionComponent<IProps> = ({ lines, loading, x, y }) => {
  const dateFormatter = (tick: any) => {
    return moment(tick).format('DD/MM/YYYY');
  };

  return (
    <Skeleton.Bloc useSpace loading={loading} className="chart-wrapper">
      {lines && lines.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lines}>
              <XAxis
                type="category"
                tickLine={false}
                tickFormatter={dateFormatter}
                axisLine={false}
                stroke="#ECECEC"
                dataKey={x}
              />
              <YAxis stroke="#ECECEC" dataKey={y} />
              <defs>
                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                  {lines && gradientArea(lines, y, 'area-chart', true)}
                </linearGradient>
              </defs>
              <ReferenceLine
                y="0"
                stroke="#ECECEC"
                label=""
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey={y}
                stroke={0}
                fill="url(#areaColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute-line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lines}>
                <XAxis stroke="transparent" dataKey={x} />
                <YAxis stroke="transparent" dataKey={y} />
                <defs>
                  <linearGradient id="strokeColor" x1="0" y1="0" x2="0" y2="1">
                    {lines && gradientArea(lines, y, 'line-chart', false)}
                  </linearGradient>
                </defs>
                <Line
                  dot={false}
                  type="monotone"
                  dataKey={y}
                  stroke="url(#strokeColor)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Skeleton.Bloc>
  );
};

export default Reline;
