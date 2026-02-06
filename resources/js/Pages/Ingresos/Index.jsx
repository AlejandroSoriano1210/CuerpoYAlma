import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageHeader } from '@/Components';
import { Wallet, Wrench, TrendingUp, Receipt, BadgeEuro } from 'lucide-react';

export default function IngresosIndex({ mes, ano, anos, ivaRate, resumen, pagos, reportes = [] }) {
    const [tablaActiva, setTablaActiva] = useState('ingresos');
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const handleChange = (field, value) => {
        router.get(route('ingresos.index'), {
            mes: field === 'mes' ? value : mes,
            ano: field === 'ano' ? value : ano,
        }, { preserveState: true, preserveScroll: true });
    };

    const formatMoney = (value) => `EUR ${Number(value).toFixed(2)}`;
    const ivaPercent = Math.round(ivaRate * 100);
    const totalRegistros = useMemo(() => {
        return tablaActiva === 'ingresos' ? pagos.length : reportes.length;
    }, [tablaActiva, pagos.length, reportes.length]);

    return (
        <AuthenticatedLayout>
            <Head title="Ingresos del Mes" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PageHeader
                        title="Ingresos"
                        description="Resumen mensual con IVA y costes de reparaciones"
                        icon={<TrendingUp size={36} />}
                    />

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Mes seleccionado</p>
                            <p className="text-gray-600">
                                {meses[mes - 1]} {ano}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <select
                                className="border-gray-300 rounded-md text-sm"
                                value={mes}
                                onChange={(e) => handleChange('mes', Number(e.target.value))}
                            >
                                {meses.map((nombre, index) => (
                                    <option key={nombre} value={index + 1}>{nombre}</option>
                                ))}
                            </select>
                            <select
                                className="border-gray-300 rounded-md text-sm"
                                value={ano}
                                onChange={(e) => handleChange('ano', Number(e.target.value))}
                            >
                                {anos.map((valor) => (
                                    <option key={valor} value={valor}>{valor}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center gap-3 mb-3 text-gray-500">
                                <Wallet size={18} />
                                <span className="text-xs uppercase tracking-wide">Subtotal</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatMoney(resumen.subtotal)}</p>
                            <p className="text-xs text-gray-500 mt-1">Sin IVA</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center gap-3 mb-3 text-gray-500">
                                <BadgeEuro size={18} />
                                <span className="text-xs uppercase tracking-wide">IVA</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatMoney(resumen.iva)}</p>
                            <p className="text-xs text-gray-500 mt-1">{ivaPercent}% aplicado</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setTablaActiva('ingresos')}
                            className={`text-left rounded-xl shadow-sm border p-5 transition ${
                                tablaActiva === 'ingresos'
                                    ? 'bg-green-50 border-green-500 ring-2 ring-green-400'
                                    : 'bg-white border-gray-100 hover:border-green-500'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-3 text-green-700">
                                <Receipt size={18} />
                                <span className="text-xs uppercase tracking-wide">Ingresos</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">{formatMoney(resumen.totalConIva)}</p>
                            <p className="text-xs text-green-700 mt-1">Con IVA incluido</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTablaActiva('reparaciones')}
                            className={`text-left rounded-xl shadow-sm border p-5 transition ${
                                tablaActiva === 'reparaciones'
                                    ? 'bg-red-50 border-red-500 ring-2 ring-red-400'
                                    : 'bg-white border-gray-100 hover:border-red-500'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-3 text-red-700">
                                <Wrench size={18} />
                                <span className="text-xs uppercase tracking-wide">Reparaciones</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">{formatMoney(resumen.reparaciones)}</p>
                            <p className="text-xs text-red-700 mt-1">Costes del mes</p>
                        </button>
                        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-5">
                            <div className="flex items-center gap-3 mb-3 text-blue-700">
                                <TrendingUp size={18} />
                                <span className="text-xs uppercase tracking-wide">Neto</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{formatMoney(resumen.neto)}</p>
                            <p className="text-xs text-blue-700 mt-1">Ingresos menos costes</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                {tablaActiva === 'ingresos' ? 'Pagos del mes' : 'Reparaciones del mes'}
                            </h2>
                            <span className="text-sm text-gray-500">
                                {totalRegistros} registro{totalRegistros === 1 ? '' : 's'}
                            </span>
                        </div>
                        {tablaActiva === 'ingresos' && pagos.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Base</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Con IVA</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {pagos.map((pago) => (
                                            <tr key={pago.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{pago.cliente}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{pago.email}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(pago.created_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                    {formatMoney(pago.monto)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                    {formatMoney(pago.monto * (1 + ivaRate))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {tablaActiva === 'reparaciones' && reportes.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Maquina</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tecnico</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tiempo</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Coste</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportes.map((reporte) => (
                                            <tr key={reporte.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{reporte.maquina}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{reporte.tecnico}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(reporte.created_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {reporte.tiempo_reparacion} {reporte.unidad_tiempo}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                    {formatMoney(reporte.coste_reparacion)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {(tablaActiva === 'ingresos' && pagos.length === 0) ||
                        (tablaActiva === 'reparaciones' && reportes.length === 0) ? (
                            <div className="p-6 text-center bg-gray-50 rounded-lg text-gray-500">
                                {tablaActiva === 'ingresos'
                                    ? 'No hay pagos registrados para este mes.'
                                    : 'No hay reportes de reparaciones para este mes.'}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
