import { useState } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { useForm } from '@inertiajs/react';
import { validarEmail, validarPassword, validarPasswordConfirmation, validarNombre, validarTelefono } from '@/Utils/validations';

export default function AuthModal({ show, onClose, mode = 'login', onSwitchMode }) {
    const isLogin = mode === 'login';

    const { data, setData, post, processing, reset, clearErrors } = useForm({
        name: '',
        email: '',
        telefono: '',
        password: '',
        password_confirmation: '',
        remember: false,
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        telefono: false,
        password: false,
        password_confirmation: false,
    });

    // Validaciones en tiempo real
    const nombreError = validarNombre(data.name);
    const emailError = validarEmail(data.email);
    const telefonoError = validarTelefono(data.telefono, true);
    const passwordError = validarPassword(data.password, 8);
    const passwordConfirmationError = validarPasswordConfirmation(data.password, data.password_confirmation);

    const handleClose = () => {
        reset();
        clearErrors();
        setTouched({
            name: false,
            email: false,
            telefono: false,
            password: false,
            password_confirmation: false,
        });
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todos los campos
        if (!isLogin && nombreError !== true) {
            setTouched(prev => ({ ...prev, name: true }));
            return;
        }

        if (emailError !== true) {
            setTouched(prev => ({ ...prev, email: true }));
            return;
        }

        if (!isLogin && telefonoError !== true) {
            setTouched(prev => ({ ...prev, telefono: true }));
            return;
        }

        if (passwordError !== true) {
            setTouched(prev => ({ ...prev, password: true }));
            return;
        }

        if (!isLogin && passwordConfirmationError !== true) {
            setTouched(prev => ({ ...prev, password_confirmation: true }));
            return;
        }

        const route_name = isLogin ? 'login' : 'register';

        post(route(route_name), {
            onSuccess: () => {
                handleClose();
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
        setTouched({
            name: false,
            email: false,
            telefono: false,
            password: false,
            password_confirmation: false,
        });
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
                                className={`mt-1 block w-full ${
                                    touched.name && nombreError !== true
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : ''
                                }`}
                                autoComplete="name"
                                isFocused={!isLogin}
                                onChange={(e) => setData('name', e.target.value)}
                                onBlur={() => setTouched({ ...touched, name: true })}
                            />
                            {touched.name && nombreError !== true && (
                                <p className="text-red-500 text-sm mt-1">{nombreError}</p>
                            )}
                        </div>
                    )}

                    <div className="mb-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className={`mt-1 block w-full ${
                                touched.email && emailError !== true
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : ''
                            }`}
                            autoComplete="username"
                            isFocused={isLogin}
                            onChange={(e) => setData('email', e.target.value)}
                            onBlur={() => setTouched({ ...touched, email: true })}
                        />
                        {touched.email && emailError !== true && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                    </div>

                    {!isLogin && (
                        <div className="mb-4">
                            <InputLabel htmlFor="telefono" value="Teléfono (opcional)" />
                            <TextInput
                                id="telefono"
                                type="tel"
                                name="telefono"
                                value={data.telefono}
                                className={`mt-1 block w-full ${
                                    touched.telefono && telefonoError !== true
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : ''
                                }`}
                                autoComplete="tel"
                                onChange={(e) => setData('telefono', e.target.value)}
                                onBlur={() => setTouched({ ...touched, telefono: true })}
                                placeholder="600123456"
                            />
                            {touched.telefono && telefonoError !== true && (
                                <p className="text-red-500 text-sm mt-1">{telefonoError}</p>
                            )}
                        </div>
                    )}

                    <div className="mb-4">
                        <InputLabel htmlFor="password" value="Contraseña" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className={`mt-1 block w-full ${
                                touched.password && passwordError !== true
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : ''
                            }`}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            onChange={(e) => setData('password', e.target.value)}
                            onBlur={() => setTouched({ ...touched, password: true })}
                        />
                        {touched.password && passwordError !== true && (
                            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                        )}
                    </div>

                    {!isLogin && (
                        <div className="mb-4">
                            <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className={`mt-1 block w-full ${
                                    touched.password_confirmation && passwordConfirmationError !== true
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : ''
                                }`}
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                onBlur={() => setTouched({ ...touched, password_confirmation: true })}
                            />
                            {touched.password_confirmation && passwordConfirmationError !== true && (
                                <p className="text-red-500 text-sm mt-1">{passwordConfirmationError}</p>
                            )}
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
