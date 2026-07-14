'use client';
import React, { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { trackEvent } from '@/services/analytics';
import { ShieldCheck } from 'lucide-react';


const GeneralBookingForm: React.FC = () => {
    const todayForModifiers = React.useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const [range, setRange] = useState<DateRange | undefined>();
    
    // Guest information states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneCountryCode, setPhoneCountryCode] = useState('+54');
    const [phone, setPhone] = useState('');
    const [adults, setAdults] = useState<number | ''>('');
    const [children, setChildren] = useState<number | ''>('');
    const [message, setMessage] = useState('');
    
    // UI states
    const [showDetails, setShowDetails] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        trackEvent('booking_form_open');
    }, []);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!range?.from || !range?.to) {
            newErrors.dates = 'Por favor selecciona el rango de fechas en el calendario.';
        }
        if (!firstName.trim()) {
            newErrors.firstName = 'El nombre es obligatorio.';
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'El apellido es obligatorio.';
        }
        if (!email.trim()) {
            newErrors.email = 'El email es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'El formato de email no es válido.';
        }
        if (!phone.trim()) {
            newErrors.phone = 'El teléfono es obligatorio.';
        }
        if (adults === '' || adults < 1) {
            newErrors.adults = 'Debe haber al menos 1 adulto.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Validar los campos. Si hay errores, no continuar.
        const isValid = validate();
        if (!isValid) {
            // Si hay errores y es móvil, forzar a mostrar los detalles del formulario para que vea los errores
            setShowDetails(true);
            return;
        }

        // 2. Enviar los datos mediante fetch POST a /api/inquiries
        setLoading(true);

        const checkIn = format(range!.from!, 'yyyy-MM-dd');
        const checkOut = format(range!.to!, 'yyyy-MM-dd');
        const adultsCount = Number(adults);
        const childrenCount = children === '' ? 0 : Number(children);

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone,
                    phoneCountryCode,
                    email,
                    checkIn,
                    checkOut,
                    adults: adultsCount,
                    children: childrenCount,
                    message,
                }),
            });

            if (!response.ok) {
                console.error('Error al guardar la consulta en la API');
            }
        } catch (error) {
            console.error('Error de red al enviar la consulta:', error);
        } finally {
            setLoading(false);
        }

        // 3. Abrir WhatsApp en una pestaña nueva
        const checkInWA = format(range!.from!, 'dd/MM/yyyy');
        const checkOutWA = format(range!.to!, 'dd/MM/yyyy');

        trackEvent('booking_inquiry', { 
            adults: adultsCount, 
            children: childrenCount, 
            checkIn: checkInWA, 
            checkOut: checkOutWA 
        });

        // Mensaje conversacional para WhatsApp
        const text = `¡Hola! Estuve viendo la página de Glak Apart. Mi nombre es ${firstName} ${lastName} y quería consultar disponibilidad para las fechas del ${checkInWA} al ${checkOutWA}.${message ? `\n\nMi consulta es: ${message}` : ''}`;

        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/5491169675050?text=${encodedText}`;

        window.open(whatsappUrl, '_blank');
    };

    const calendarStyles = `
        /* ===== REACT-DAY-PICKER v9 OVERRIDES ===== */

        /* Root - fixed dimensions to prevent resizing on month change */
        .rdp-root {
            --rdp-accent-color: #9dd1a6;
            --rdp-accent-background-color: rgba(157, 209, 166, 0.15);
            --rdp-selected-border: none;
            --rdp-outside-opacity: 0.3;
            --rdp-day-height: 44px;
            --rdp-day-width: 44px;
            --track-height: 36px; /* 36px track & button on mobile */
            margin: 0;
        }

        /* Responsive adjustments for very small mobiles (like iPhone SE) */
        @media (max-width: 350px) {
            .rdp-root {
                --rdp-day-height: 38px;
                --rdp-day-width: 38px;
                --track-height: 30px;
            }
            .rdp-month, .rdp-months {
                min-height: 290px !important;
            }
        }

        /* Fixed calendar height to prevent layout shift */
        .rdp-month, .rdp-months {
            min-height: 320px;
        }

        @media (min-width: 768px) {
            .rdp-root {
                --rdp-day-height: 46px;
                --rdp-day-width: 46px;
                --track-height: 38px; /* 38px track & button on desktop */
            }
            .rdp-month, .rdp-months {
                min-height: 360px !important;
            }
        }

        /* Caption / Month label */
        .rdp-caption_label,
        .rdp-month_caption {
            color: #ffffff !important;
            font-weight: 400;
            font-size: 1.25rem;
            text-transform: capitalize;
            margin-bottom: 12px !important;
        }

        /* Navigation arrows */
        .rdp-button_previous,
        .rdp-button_next,
        .rdp-nav button {
            color: #9dd1a6 !important;
            transition: all 0.2s ease;
        }
        .rdp-button_previous,
        .rdp-button_next {
            width: 32px !important;
            height: 32px !important;
        }
        .rdp-button_previous:hover,
        .rdp-button_next:hover {
            opacity: 0.8;
            transform: scale(1.1);
        }
        .rdp-button_previous svg,
        .rdp-button_next svg,
        .rdp-nav button svg {
            fill: #9dd1a6 !important;
            stroke: #9dd1a6 !important;
        }
        .rdp-chevron {
            fill: #9dd1a6 !important;
        }

        /* Weekday headers */
        .rdp-weekday {
            color: #9dd1a6 !important;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.8rem;
            opacity: 0.9;
            padding-bottom: 8px !important;
        }

        /* All day cells - table-cell display to prevent layout collapse */
        .rdp-day {
            color: #ffffff;
            font-size: 1.05rem;
            padding: 0 !important;
            position: relative;
            display: table-cell !important;
            text-align: center !important;
            vertical-align: middle !important;
            width: var(--rdp-day-width);
            height: var(--rdp-day-height);
        }

        /* Interactive Day Buttons */
        .rdp-day_button {
            color: #ffffff;
            width: var(--track-height) !important;
            height: var(--track-height) !important;
            border-radius: 50% !important;
            transition: all 0.2s ease;
            font-weight: 400;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative;
            z-index: 1;
            margin: auto !important;
            box-sizing: border-box !important;
        }

        /* Hover effect on standard day buttons */
        .rdp-day:not(.rdp-range_start):not(.rdp-range_end):not(.rdp-range_middle) .rdp-day_button:not(.rdp-selected):hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            border-radius: 50% !important;
        }

        /* Today's date (if not selected) */
        .rdp-today:not(.rdp-selected) .rdp-day_button {
            color: #9dd1a6 !important;
            font-weight: 700 !important;
            border: 1px solid rgba(157, 209, 166, 0.4) !important;
        }

        /* ----- RANGE SELECTION (PREMIUM PILL EFFECT) ----- */

        /* Base rule for track background */
        .rdp-range_middle::before,
        .rdp-range_start::before,
        .rdp-range_end::before {
            content: "";
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: var(--track-height);
            background-color: rgba(157, 209, 166, 0.15) !important;
            z-index: 0;
        }

        /* 1. Range Middle Cell Track */
        .rdp-range_middle {
            background-color: transparent !important;
        }
        .rdp-range_middle::before {
            left: 0;
            right: 0;
        }
        .rdp-range_middle .rdp-day_button {
            border-radius: 0 !important;
            background-color: transparent !important;
            color: #ffffff !important;
            font-weight: 500 !important;
        }

        /* Rounding edges of the track at row boundaries (Monday/Sunday) */
        .rdp-day:first-child.rdp-range_middle::before {
            left: 4px;
            border-top-left-radius: 9999px;
            border-bottom-left-radius: 9999px;
        }
        .rdp-day:last-child.rdp-range_middle::before {
            right: 4px;
            border-top-right-radius: 9999px;
            border-bottom-right-radius: 9999px;
        }

        /* 2. Range Start */
        .rdp-range_start {
            background: transparent !important;
        }
        .rdp-range_start::before {
            left: 50%;
            right: 0;
        }
        .rdp-range_start .rdp-day_button {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            font-weight: 800 !important;
            border-radius: 50% !important;
            box-shadow: none !important;
        }
        .rdp-range_start .rdp-day_button:hover {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            opacity: 1 !important;
            box-shadow: 0 4px 12px rgba(157, 209, 166, 0.5) !important;
        }
        /* Start day on row boundary (Sunday) */
        .rdp-day:last-child.rdp-range_start::before {
            right: 4px;
            border-top-right-radius: 9999px;
            border-bottom-right-radius: 9999px;
        }

        /* 3. Range End */
        .rdp-range_end {
            background: transparent !important;
        }
        .rdp-range_end::before {
            left: 0;
            right: 50%;
        }
        .rdp-range_end .rdp-day_button {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            font-weight: 800 !important;
            border-radius: 50% !important;
            box-shadow: none !important;
        }
        .rdp-range_end .rdp-day_button:hover {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            opacity: 1 !important;
            box-shadow: 0 4px 12px rgba(157, 209, 166, 0.5) !important;
        }
        /* End day on row boundary (Monday) */
        .rdp-day:first-child.rdp-range_end::before {
            left: 4px;
            border-top-left-radius: 9999px;
            border-bottom-left-radius: 9999px;
        }

        /* 4. Single Selection / Start matches End (cancel connection) */
        .rdp-range_start.rdp-range_end::before {
            display: none !important;
        }

        /* ----- DISABLED / PAST DAYS ----- */
        .rdp-disabled {
            opacity: 0.3 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }
        .rdp-disabled .rdp-day_button {
            color: rgba(255, 255, 255, 0.3) !important;
            cursor: not-allowed !important;
        }

        /* ----- CLEAN OUTLINES / FOCUS ----- */
        .rdp-day:focus,
        .rdp-day:focus-visible,
        .rdp-day_button:focus,
        .rdp-day_button:focus-visible,
        .rdp-button_previous:focus,
        .rdp-button_next:focus {
            outline: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
        }

        /* ----- ERROR ANIMATIONS & TRANSITIONS ----- */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
        }
    `;

    const renderFormContent = (isMobile: boolean) => {
        const inputClass = `w-full bg-white border border-gray-200 rounded-xl text-sm text-[#10595a] placeholder-gray-400 focus:border-[#10595a]/50 focus:ring-1 focus:ring-[#10595a]/30 transition-all ${
            isMobile ? 'px-3 py-2' : 'px-4 py-2'
        }`;
        
        const labelClass = `block text-[11px] font-bold tracking-[0.25em] text-gray-600 group-focus-within:text-[#10595a] transition-colors ${
            isMobile ? 'mb-1' : 'mb-1'
        }`;

        return (
            <div className={isMobile ? "space-y-3 pt-1 pb-1" : "space-y-3.5"}>
                {/* Fechas Error General */}
                {errors.dates && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-medium flex items-center gap-2 animate-fadeIn">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{errors.dates}</span>
                    </div>
                )}

                {/* NOMBRE Y APELLIDO */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className={labelClass}>NOMBRE</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                            }}
                            className={`${inputClass} ${errors.firstName ? 'ring-1 ring-red-400 bg-red-50/30' : ''}`}
                            placeholder="Nombre"
                        />
                        {errors.firstName && (
                            <span className="text-[10px] text-red-500 mt-1 block font-medium animate-fadeIn">{errors.firstName}</span>
                        )}
                    </div>
                    <div className="group">
                        <label className={labelClass}>APELLIDO</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                            }}
                            className={`${inputClass} ${errors.lastName ? 'ring-1 ring-red-400 bg-red-50/30' : ''}`}
                            placeholder="Apellido"
                        />
                        {errors.lastName && (
                            <span className="text-[10px] text-red-500 mt-1 block font-medium animate-fadeIn">{errors.lastName}</span>
                        )}
                    </div>
                </div>

                {/* EMAIL */}
                <div className="group">
                    <label className={labelClass}>EMAIL</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                        }}
                        className={`${inputClass} ${errors.email ? 'ring-1 ring-red-400 bg-red-50/30' : ''}`}
                        placeholder="ejemplo@correo.com"
                    />
                    {errors.email && (
                        <span className="text-[10px] text-red-500 mt-1 block font-medium animate-fadeIn">{errors.email}</span>
                    )}
                </div>

                {/* TELÉFONO */}
                <div className="group">
                    <label className={labelClass}>TELÉFONO</label>
                    <div className="flex gap-2">
                        <select
                            aria-label="Código de área telefónico de país"
                            value={phoneCountryCode}
                            onChange={(e) => setPhoneCountryCode(e.target.value)}
                            className={`bg-gray-50 border-none rounded-xl text-sm text-[#10595a] focus:ring-1 focus:ring-[#10595a] transition-all text-center font-medium cursor-pointer ${
                                isMobile ? 'px-1 py-2 w-24' : 'px-2 py-2 w-28'
                            }`}
                        >
                            <option value="+54">🇦🇷 +54</option>
                            <option value="+55">🇧🇷 +55</option>
                            <option value="+598">🇺🇾 +598</option>
                            <option value="+56">🇨🇱 +56</option>
                            <option value="+595">🇵🇾 +595</option>
                            <option value="+591">🇧🇴 +591</option>
                            <option value="+57">🇨🇴 +57</option>
                            <option value="+52">🇲🇽 +52</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+1">🇺🇸 +1</option>
                        </select>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value.replace(/\D/g, ''));
                                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                            }}
                            className={`flex-1 ${inputClass} ${errors.phone ? 'ring-1 ring-red-400 bg-red-50/30' : ''}`}
                            placeholder="Número (solo dígitos)"
                        />
                    </div>
                    {errors.phone && (
                        <span className="text-[10px] text-red-500 mt-1 block font-medium animate-fadeIn">{errors.phone}</span>
                    )}
                </div>

                {/* ADULTOS Y NIÑOS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className={labelClass}>ADULTOS</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Ej. 2"
                            value={adults}
                            onChange={(e) => {
                                const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                setAdults(val);
                                if (errors.adults) setErrors(prev => ({ ...prev, adults: '' }));
                            }}
                            className={`${inputClass} font-bold ${errors.adults ? 'ring-1 ring-red-400 bg-red-50/30' : ''}`}
                        />
                        {errors.adults && (
                            <span className="text-[10px] text-red-500 mt-1 block font-medium animate-fadeIn">{errors.adults}</span>
                        )}
                    </div>
                    <div className="group">
                        <label className={labelClass}>NIÑOS</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="Ej. 0"
                            value={children}
                            onChange={(e) => {
                                const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                setChildren(val);
                            }}
                            className={`${inputClass} font-bold`}
                        />
                    </div>
                </div>

                {/* MENSAJE (OPCIONAL) */}
                <div className="group">
                    <label className={labelClass}>MENSAJE (OPCIONAL)</label>
                    <textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`${inputClass} resize-none`}
                        placeholder="¿Alguna consulta especial?"
                    />
                </div>

                {/* BOTÓN CONSULTAR */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full bg-[#10595a] text-white rounded-xl shadow-[0_12px_28px_rgba(16,89,90,0.35)] hover:shadow-[0_18px_35px_rgba(16,89,90,0.5)] hover:bg-[#0d4a4b] hover:-translate-y-0.5 transition-all duration-300 will-change-transform group flex items-center justify-center gap-3 overflow-hidden relative ${
                        isMobile ? 'py-2.5 mt-1.5' : 'py-2.5 mt-2.5'
                    } ${loading ? 'opacity-85 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="relative z-10 text-[10px] font-bold tracking-[0.25em] uppercase">Enviando...</span>
                        </>
                    ) : (
                        <>
                            <span className="relative z-10 text-[10px] font-bold tracking-[0.25em] uppercase">Consultar</span>
                            <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="white" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </>
                    )}
                </button>

                {/* AVISO DE PRIVACIDAD INLINE */}
                <div className="p-2 px-3 bg-[#f3f9f5] border border-[#d6ebd9] rounded-xl text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10595a] shrink-0 mt-0.5" />
                    <span>Al enviar tu consulta, guardaremos tus datos para poder comunicarnos contigo. Si no envías el mensaje por WhatsApp, igualmente nos pondremos en contacto.</span>
                </div>

                <p className="text-[9px] text-gray-300 text-center tracking-wide mt-1">Redirige a WhatsApp</p>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-5xl mx-auto overflow-hidden flex flex-col md:flex-row border border-white/20">
            <style>{calendarStyles}</style>

            {/* Left Panel: Calendar (Green Experience) */}
            <div className="md:w-[55%] bg-[#10595a] px-4 py-8 md:p-10 flex flex-col items-center justify-center text-white relative">
                <div className="text-center mb-6 md:mb-8">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#9dd1a6] mb-2">Selecciona tus fechas</p>
                    <h3 className="font-script text-3xl md:text-5xl text-white">Consulta disponibilidad</h3>
                </div>

                <div className="booking-calendar-wrapper w-full flex justify-center booking-calendar-dark md:scale-95 origin-top">
                    <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={(newRange) => {
                            setRange(newRange);
                            if (newRange?.from || newRange?.to) {
                                setShowDetails(true);
                            }
                            if (newRange?.from && newRange?.to) {
                                setErrors(prev => ({ ...prev, dates: '' }));
                            }
                        }}
                        locale={es}
                        numberOfMonths={1}
                        disabled={[
                            { before: new Date() }
                        ]}
                        modifiers={{
                            past: { before: todayForModifiers }
                        }}
                        modifiersClassNames={{
                            past: 'day-past',
                            selected: 'rdp-selected',
                            range_start: 'rdp-range_start',
                            range_middle: 'rdp-range_middle',
                            range_end: 'rdp-range_end'
                        }}
                    />
                </div>
            </div>

            {/* Right Panel: Form (Clean White) */}
            <div className="md:w-[45%] bg-white p-5 md:p-6 md:px-8 flex flex-col justify-center relative overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10595a] to-[#2c7a7b] md:hidden"></div>

                {/* Mobile Toggle Button — solo visible en mobile */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="md:hidden flex items-center justify-between w-full font-ui text-[10px] font-bold tracking-[0.2em] text-[#10595a] uppercase mb-2 border-b border-[#10595a]/10 pb-3"
                >
                    <span>Detalles de Consulta</span>
                    <svg
                        style={{
                            transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                        className="w-4 h-4 text-[#10595a]"
                        fill="none"
                        stroke="#10595a"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>

                {/* Desktop Header — siempre visible */}
                <h3 className="hidden md:block font-ui text-xs font-bold tracking-[0.2em] text-[#10595a] uppercase mb-8 border-b border-[#10595a]/10 pb-4">
                    Detalles de Consulta
                </h3>

                {/* Desktop Form: render directo sin animación */}
                <div className="hidden md:block">
                    {renderFormContent(false)}
                </div>

                {/* Mobile Form: colapsable con overflow + max-height CSS */}
                <div
                    className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: showDetails ? '1200px' : '0px', opacity: showDetails ? 1 : 0 }}
                >
                    {renderFormContent(true)}
                </div>
            </div>
        </div>
    );
};

export default GeneralBookingForm;








