import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CostSavingsChartProps {
  title?: string;
}

const CostSavingsChart: React.FC<CostSavingsChartProps> = ({ 
  title = '비용 절감 효과' 
}) => {
  // Mock 데이터
  const totalSaved = 45000000; // 4천5백만원
  const marketPrice = 95000000; // 9천5백만원
  const platformPrice = 50000000; // 5천만원

  const chartData = {
    labels: ['플랫폼 거래비용', '절약된 비용'],
    datasets: [
      {
        data: [platformPrice, totalSaved],
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',
          'rgba(76, 175, 80, 0.8)',
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = platformPrice + totalSaved;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()}원 (${percentage}%)`;
          },
          footer: () => {
            return `시장 기준가격: ${marketPrice.toLocaleString()}원`;
          }
        }
      }
    },
    cutout: '60%',
  };

  return (
    <div style={{ position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
          {((totalSaved / marketPrice) * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          절약률
        </div>
      </div>
    </div>
  );
};

export default CostSavingsChart;