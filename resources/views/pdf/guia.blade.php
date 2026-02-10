<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $guia->titulo }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
        }
        h1 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 5px;
        }
        .nivel {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .contenido {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9fafb;
            border-left: 4px solid #2563eb;
        }
        .ejercicios-section {
            margin-top: 30px;
        }
        .ejercicios-section h2 {
            color: #1e40af;
            font-size: 22px;
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .ejercicio {
            background-color: #f3f4f6;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            border: 1px solid #d1d5db;
            page-break-inside: avoid;
        }
        .ejercicio h3 {
            color: #374151;
            font-size: 18px;
            margin: 0 0 8px 0;
        }
        .ejercicio-info {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .instrucciones {
            color: #4b5563;
            font-size: 14px;
            margin-top: 8px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $guia->titulo }}</h1>
        <div class="nivel">Nivel: {{ ucfirst($guia->nivel) }}</div>
    </div>

    @if($guia->contenido)
        <div class="contenido">
            <p>{{ $guia->contenido }}</p>
        </div>
    @endif

    @if($guia->guiaEjercicio && $guia->guiaEjercicio->count() > 0)
        <div class="ejercicios-section">
            <h2>Ejercicios</h2>

            @foreach($guia->guiaEjercicio as $guiaEjercicio)
                <div class="ejercicio">
                    <h3>{{ $guiaEjercicio->ejercicio->nombre }}</h3>
                    <div class="ejercicio-info">
                        <strong>{{ $guiaEjercicio->series ?? '-' }}</strong> series ×
                        <strong>{{ $guiaEjercicio->repeticiones ?? '-' }}</strong> repeticiones
                    </div>
                    @if($guiaEjercicio->instrucciones)
                        <div class="instrucciones">
                            <strong>Instrucciones:</strong> {{ $guiaEjercicio->instrucciones }}
                        </div>
                    @endif
                </div>
            @endforeach
        </div>
    @endif

    <div class="footer">
        Generado el {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
