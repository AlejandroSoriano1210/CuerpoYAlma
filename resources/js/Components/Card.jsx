export default function Card({
    children,
    title,
    icon,
    className = '',
    containerClassName = 'bg-white rounded-lg shadow p-6',
    headerClassName = 'mb-6',
    titleClassName = 'text-2xl font-bold text-gray-900',
    headerAction,
}) {
    return (
        <div className={containerClassName}>
            {(title || icon || headerAction) && (
                <div className={`flex items-center justify-between ${headerClassName}`}>
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-4xl">{icon}</div>}
                        {title && <h2 className={titleClassName}>{title}</h2>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className={className}>{children}</div>
        </div>
    );
}
