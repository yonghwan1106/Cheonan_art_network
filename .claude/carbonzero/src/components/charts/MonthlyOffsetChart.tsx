import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyOffsetChartProps {
  title?: string;
}

const MonthlyOffsetChart: React.FC<MonthlyOffsetChartProps> = ({ 
  title = '월별 탄소상쇄량' 
}) => {
  // Mock 데이터 생성
  const months = ['1월', '2월', '3월', '4월', '5월', '6월'];
  const offsetData = [1200, 1850, 2400, 1900, 2100, 2800];
  const targetData = [2000, 2000, 2000, 2000, 2000, 2000];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: '실제 상쇄량 (tCO2)',
        data: offsetData,
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
      },
      {
        label: '목표 상쇄량 (tCO2)',
        data: targetData,
        backgroundColor: 'rgba(158, 158, 158, 0.5)',
        borderColor: 'rgba(158, 158, 158, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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
          afterLabel: (context: any) => {
            const total = offsetData.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `전체의 ${percentage}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '탄소상쇄량 (tCO2)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        title: {
          display: true,
          text: '월'
        },
        grid: {
          display: false,
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export default MonthlyOffsetChart;