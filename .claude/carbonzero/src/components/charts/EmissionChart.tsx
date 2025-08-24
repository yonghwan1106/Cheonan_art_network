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
import { PowerPlant } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EmissionChartProps {
  powerPlants: PowerPlant[];
  title?: string;
}

const EmissionChart: React.FC<EmissionChartProps> = ({ 
  powerPlants, 
  title = '발전소별 현재 배출량' 
}) => {
  const chartData = {
    labels: powerPlants.map(plant => plant.name),
    datasets: [
      {
        label: '현재 출력 (MW)',
        data: powerPlants.map(plant => plant.currentOutput),
        backgroundColor: powerPlants.map(plant => {
          switch (plant.type) {
            case 'renewable': return 'rgba(76, 175, 80, 0.8)';
            case 'lng': return 'rgba(33, 150, 243, 0.8)';
            case 'coal': return 'rgba(158, 158, 158, 0.8)';
            case 'nuclear': return 'rgba(156, 39, 176, 0.8)';
            default: return 'rgba(96, 125, 139, 0.8)';
          }
        }),
        borderColor: powerPlants.map(plant => {
          switch (plant.type) {
            case 'renewable': return 'rgba(76, 175, 80, 1)';
            case 'lng': return 'rgba(33, 150, 243, 1)';
            case 'coal': return 'rgba(158, 158, 158, 1)';
            case 'nuclear': return 'rgba(156, 39, 176, 1)';
            default: return 'rgba(96, 125, 139, 1)';
          }
        }),
        borderWidth: 2,
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
            const plant = powerPlants[index];
            return [
              `용량: ${plant.capacity} MW`,
              `효율: ${plant.efficiency}%`,
              `배출계수: ${plant.emissionFactor}`,
              `위치: ${plant.location}`,
              `상태: ${plant.status === 'operating' ? '운영중' : plant.status === 'maintenance' ? '정비중' : '정지'}`
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
          text: '출력 (MW)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        title: {
          display: true,
          text: '발전소'
        },
        grid: {
          display: false,
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export default EmissionChart;