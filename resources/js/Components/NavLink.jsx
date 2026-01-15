import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-indigo-500 text-gray-300'
                    : 'border-transparent text-green-500 hover:text-green-300 focus:text-green-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
