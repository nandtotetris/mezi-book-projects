import { Row } from 'antd';
import Skeleton from 'components/Skeleton';
import moment from 'moment';
import * as React from 'react';
import { compose } from 'react-apollo';
import CountUp from 'react-countup';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
const { useState } = React;

const processLines = (rows: any): any => {
  let total: number = 0;

  const today: moment.Moment = moment(new Date());
  const data = [
    {
      color: '#CB3043',
      id: 'dashboard.chart.pie_legend_5',
      name: '1-5',
      solde: 0,
      value: 0,
    },
    {
      color: '#F66073',
      id: 'dashboard.chart.pie_legend_20',
      name: '5-20',
      solde: 0,
      value: 0,
    },
    {
      color: '#FF7960',
      id: 'dashboard.chart.pie_legend_45',
      name: '20-45',
      solde: 0,
      value: 0,
    },
    {
      color: '#0074F9',
      id: 'dashboard.chart.pie_legend_more',
      name: '+45',
      solde: 0,
      value: 0,
    },
  ];

  rows &&
    rows.map((row: any, i: number) => {
      const dueDate: moment.Moment = moment(row.dueDate);
      const days: number = dueDate.diff(today, 'days');

      if (days < 5) {
        data[0].value += 1;
        data[0].solde += row.total;
      } else if (days < 20) {
        data[1].value += 1;
        data[1].solde += row.total;
      } else if (days < 45) {
        data[2].value += 1;
        data[2].solde += row.total;
      } else {
        data[3].value += 1;
        data[3].solde += row.total;
      }
      total += row.total;
    });

  return {
    data,
    total,
  };
};
interface IProps extends InjectedIntlProps {
  rows?: any[];
  loading: boolean;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (intl: any, props: any) => {
  const {
    cx,
    cy,
    color,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    payload,
    index,
  } = props;

  const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g fill="red">
      {payload.solde > 0 && (
        <>
          <text
            x={x}
            y={y}
            fill={color}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
          >
            {intl.formatMessage({
              id: payload.id,
            })}
          </text>
          <text
            x={x}
            y={y}
            dy={20}
            fill={'black'}
            style={{
              fontSize: '14px',
              fontWeight: 400,
            }}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
          >
            {intl.formatMessage(
              { id: 'dashboard.chart.pie_legend_solde' },
              { solde: Math.round(payload.solde * 100) / 100 },
            )}
          </text>
        </>
      )}
    </g>
  );
};

const Repie: React.FunctionComponent<IProps> = ({ rows, loading, intl }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // const onPieEnter = (data: any, index: number) => {
  //   setActiveIndex(index);
  // };

  // const onPieLeave = (data: any, index: number) => {
  //   setActiveIndex(0);
  // };

  const { data, total } = processLines(rows);

  return (
    <div className="chart-wrapper">
      <Row
        style={{
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
        }}
        type="flex"
      >
        <Skeleton.Bloc
          style={{
            height: '100%',
            position: 'relative',
            width: '100%',
          }}
          useSpace
          loading={loading}
        >
          <span className="pie-total">
            <div className="pie-total-info">
              <FormattedMessage id="dashboard.chart.total_info" />
            </div>
            <CountUp end={total} />
            <FormattedMessage
              id="dashboard.chart.total"
              values={{ solde: total }}
            />
          </span>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                // activeShape={renderActiveShape}
                labelLine={false}
                label={renderCustomizedLabel.bind(null, intl)}
                // activeIndex={activeIndex === 0 ? undefined : activeIndex}
                // onMouseEnter={onPieEnter}
                // onMouseLeave={onPieLeave}
                data={data}
                innerRadius={75}
                outerRadius={100}
                paddingAngle={0.1}
                dataKey="value"
              >
                {data &&
                  data.map((entry: any, i: number) => {
                    return <Cell key={`cell-${i}`} fill={entry.color} />;
                  })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Skeleton.Bloc>
      </Row>
    </div>
  );
};

export default compose(injectIntl)(Repie);
