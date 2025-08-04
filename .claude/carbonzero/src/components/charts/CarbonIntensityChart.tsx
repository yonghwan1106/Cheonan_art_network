import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HourlyPrediction } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CarbonIntensityChartProps {
  data: HourlyPrediction[];
  title?: string;
}

const CarbonIntensityChart: React.FC<CarbonIntensityChartProps> = ({ 
  data, 
  title = '24시간 탄소집약도 예측' 
}) => {
  const chartData = {
    labels: data.map(d => `${String(d.hour).padStart(2, '0')}:00`),
    datasets: [
      {
        label: '탄소집약도 (gCO2/kWh)',
        data: data.map(d => d.carbonIntensity),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return null;
          }
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(75, 192, 192, 0.1)');
          gradient.addColorStop(1, 'rgba(75, 192, 192, 0.3)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: data.map(d => d.isCleanPeriod ? '#4CAF50' : '#FF9800'),
        pointBorderColor: data.map(d => d.isCleanPeriod ? '#2E7D32' : '#F57C00'),
        pointRadius: 4,
        pointHoverRadius: 6,
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
            const index = context.dataIndex;
            const prediction = data[index];
            return [
              `신뢰도: ${(prediction.confidence * 100).toFixed(1)}%`,
              `배출량: ${prediction.emission.toFixed(1)} tCO2/h`,
              prediction.isCleanPeriod ? '🟢 청정전력 시간대' : '🟡 일반 시간대'
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'gCO2/kWh'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        title: {
          display: true,
          text: '시간'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 8,
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default CarbonIntensityChart;