import { useState } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { useForm } from '@inertiajs/react';

export default function AuthModal({ show, onClose, mode = 'login', onSwitchMode }) {
    const isLogin = mode === 'login';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        remember: false,
    });

    const [clientErrors, setClientErrors] = useState({});

    // Validación en tiempo real
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateName = (name) => {
        return name.trim().length >= 2;
    };

    const handleClose = () => {
        reset();
        clearErrors();
        setClientErrors({});
        onClose();
    };

    const handleInputChange = (field, value) => {
        setData(field, value);

        // Limpiar error cuando el usuario empieza a escribir
        if (clientErrors[field]) {
            setClientErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!isLogin) {
            if (!validateName(data.name)) {
                newErrors.name = 'El nombre debe tener al menos 2 caracteres';
            }
        }

        if (!data.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!validateEmail(data.email)) {
            newErrors.email = 'El formato del email no es válido';
        }

        if (!data.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (!validatePassword(data.password)) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!isLogin) {
            if (!data.password_confirmation) {
                newErrors.password_confirmation = 'Debes confirmar la contraseña';
            } else if (data.password !== data.password_confirmation) {
                newErrors.password_confirmation = 'Las contraseñas no coinciden';
            }
        }

        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const route_name = isLogin ? 'login' : 'register';

        post(route(route_name), {
            onSuccess: () => {
                handleClose();
            },
            onError: (errors) => {
                console.log('Server errors:', errors);
            },
            onFinish: () => {
                if (!isLogin) {
                    reset('password', 'password_confirmation');
                } else {
                    reset('password');
                }
            },
        });
    };

    const switchMode = () => {
        reset();
        clearErrors();
        setClientErrors({});
        onSwitchMode();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md" closeable={true}>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Nombre" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                autoComplete="name"
                                isFocused={!isLogin}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                            <InputError
                                message={clientErrors.name || errors.name}
                                className="mt-2"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={isLogin}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                        <InputError
                            message={clientErrors.email || errors.email}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="password" value="Contraseña" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                        <InputError
                            message={clientErrors.password || errors.password}
                            className="mt-2"
                        />
                    </div>

                    {!isLogin && (
                        <div className="mb-4">
                            <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                            />
                            <InputError
                                message={clientErrors.password_confirmation || errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>
                    )}

                    {isLogin && (
                        <div className="mb-4">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Recordarme
                                </span>
                            </label>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-6">
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-sm text-gray-600 underline hover:text-gray-900"
                        >
                            {isLogin
                                ? '¿No tienes cuenta? Regístrate'
                                : '¿Ya tienes cuenta? Inicia sesión'
                            }
                        </button>

                        <PrimaryButton disabled={processing}>
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
