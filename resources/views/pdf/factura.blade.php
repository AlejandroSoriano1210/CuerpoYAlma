<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura - {{ $cliente->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 30px;
            border-bottom: 3px solid #10b981;
            padding-bottom: 15px;
        }
        .header-left h1 {
            color: #059669;
            font-size: 32px;
            margin: 0 0 5px 0;
        }
        .header-left .company {
            color: #6b7280;
            font-size: 18px;
            font-weight: bold;
        }
        .header-right {
            text-align: right;
        }
        .invoice-number {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .badge-paid {
            background-color: #d1fae5;
            color: #065f46;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            display: inline-block;
        }
        .info-section {
            display: table;
            width: 100%;
            margin: 30px 0;
        }
        .info-block {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 15px;
        }
        .info-block h3 {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 10px 0;
            font-weight: 600;
        }
        .info-block .client-name {
            color: #111827;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .info-block .detail {
            color: #4b5563;
            font-size: 14px;
            margin: 4px 0;
        }
        .info-block .detail strong {
            color: #111827;
        }
        .info-right {
            text-align: right;
        }
        .table-container {
            margin: 30px 0;
            border: 1px solid #e5e7eb;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        thead {
            background-color: #f9fafb;
        }
        th {
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        th.text-right {
            text-align: right;
        }
        td {
            padding: 15px 12px;
            font-size: 14px;
            color: #111827;
            border-bottom: 1px solid #f3f4f6;
        }
        td.text-right {
            text-align: right;
        }
        .total-section {
            margin: 30px 0;
            text-align: right;
        }
        .total-box {
            display: inline-block;
            min-width: 300px;
            border-top: 2px solid #d1d5db;
            padding-top: 15px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .total-row.final {
            border-top: 1px solid #d1d5db;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
        }
        .total-row.final .amount {
            color: #059669;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        .thank-you {
            color: #059669;
            font-weight: 600;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <h1>FACTURA</h1>
            <div class="company">Cuerpo & Alma</div>
        </div>
        <div class="header-right">
            <div class="invoice-number">Factura #{{ str_pad($pago->id, 6, '0', STR_PAD_LEFT) }}</div>
            <div class="badge-paid">PAGADO</div>
        </div>
    </div>

    <div class="info-section">
        <div class="info-block">
            <h3>Facturado a:</h3>
            <div class="client-name">{{ $cliente->name }}</div>
            <div class="detail"><strong>Email:</strong> {{ $cliente->email }}</div>
            <div class="detail"><strong>Teléfono:</strong> {{ $cliente->telefono ?? 'No especificado' }}</div>
            <div class="detail"><strong>DNI:</strong> {{ $cliente->dni }}</div>
            <div class="detail"><strong>Dirección:</strong> {{ $cliente->direccion }}</div>
        </div>
        <div class="info-block info-right">
            <h3>Detalles del Pago:</h3>
            <div class="client-name">{{ $mesNombre }} {{ $pago->ano }}</div>
            <div class="detail"><strong>Fecha de pago:</strong></div>
            <div class="detail">{{ \Carbon\Carbon::parse($pago->created_at)->format('d/m/Y') }}</div>
        </div>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th class="text-right">Cantidad</th>
                    <th class="text-right">Precio</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Membresía Mensual - {{ $mesNombre }} {{ $pago->ano }}</td>
                    <td class="text-right">1</td>
                    <td class="text-right">&euro;{{ number_format($pago->monto ?? 10, 2) }}</td>
                    <td class="text-right"><strong>&euro;{{ number_format($pago->monto ?? 10, 2) }}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    @php
        $subtotal = $pago->monto ?? 10;
        $ivaRate = 0.21;
        $ivaAmount = $subtotal * $ivaRate;
        $total = $subtotal + $ivaAmount;
    @endphp

    <div class="total-section">
        <div class="total-box">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>&euro;{{ number_format($subtotal, 2) }}</span>
            </div>
            <div class="total-row">
                <span>IVA (21%):</span>
                <span>&euro;{{ number_format($ivaAmount, 2) }}</span>
            </div>
            <div class="total-row final">
                <span>Total:</span>
                <span class="amount">&euro;{{ number_format($total, 2) }}</span>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="thank-you">Gracias por tu confianza en Cuerpo & Alma</div>
        <div>Gimnasio Cuerpo & Alma - Tu bienestar es nuestra prioridad</div>
    </div>
</body>
</html>
