import React from 'react';

export default function Calendario({ mes, ano, horarios, onSelectDate, selectedDate }) {
    const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
    let firstDay = new Date(ano, mes - 1, 1).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;
    const totalDays = daysInMonth(mes, ano);

    const dias = [];
    for (let i = 0; i < firstDay; i++) {
        dias.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        dias.push(i);
    }

    const getClasesInfo = (day) => {
        const fecha = `${ano}-${String(mes).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const clases = horarios.filter(h => h.fecha.substring(0, 10) === fecha);
        const total = clases.length;
        const disponibles = clases.filter(c => !c.completa).length;
        const completas = clases.filter(c => c.completa).length;

        return { total, disponibles, completas };
    };

    const handleSelectDate = (day) => {
        if (day) {
            const fecha = `${ano}-${String(mes).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            onSelectDate(fecha);
        }
    };

    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
        <div className="w-full">
            <div className="grid grid-cols-7 gap-2 mb-4">
                {diasSemana.map((dia) => (
                    <div key={dia} className="text-center font-bold text-gray-600 py-2">
                        {dia}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {dias.map((day, idx) => {
                    const info = day ? getClasesInfo(day) : { total: 0, disponibles: 0, completas: 0 };
                    const fecha = day ? `${ano}-${String(mes).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const isSelected = fecha === selectedDate;

                    return (
                        <div
                            key={idx}
                            onClick={() => handleSelectDate(day)}
                            className={`p-5 rounded-lg border-2 cursor-pointer transition ${
                                !day
                                    ? 'bg-gray-100 border-gray-100'
                                    : isSelected
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                            }`}
                        >
                            <div className="font-bold text-gray-900">{day}</div>

                            {/* Mostrar resumen de disponibilidad */}
                            {info.total > 0 && (
                                <div className="mt-2 flex flex-col gap-1">
                                    {info.disponibles > 0 && (
                                        <div className="text-xs inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-center">
                                            {info.disponibles} libre{info.disponibles > 1 ? 's' : ''}
                                        </div>
                                    )}
                                    {info.completas > 0 && (
                                        <div className="text-xs inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-center">
                                            {info.completas} completa{info.completas > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
