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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const defaultLabels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function MonthlyBarChart({ data = [], labels = defaultLabels, title = 'Clases por mes', className = '' }) {
    const dataset = {
        labels,
        datasets: [
            {
                label: 'Clases',
                data: Array.isArray(data) ? data : [],
                backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !!title,
                text: title,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return (
        <div className={className}>
            <Bar data={dataset} options={options} />
        </div>
    );
}
