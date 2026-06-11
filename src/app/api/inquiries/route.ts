import { NextResponse } from 'next/server';
import { createInquiry } from '@/services/inquiries';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            firstName,
            lastName,
            phone,
            phoneCountryCode = '',
            email,
            checkIn,
            checkOut,
            adults,
            children = 0,
            message = ''
        } = body;

        // Validation
        if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
            return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });
        }
        if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
            return NextResponse.json({ error: 'El apellido es requerido.' }, { status: 400 });
        }
        if (!phone || typeof phone !== 'string' || !phone.trim()) {
            return NextResponse.json({ error: 'El teléfono es requerido.' }, { status: 400 });
        }
        if (!email || typeof email !== 'string' || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'El correo electrónico no es válido.' }, { status: 400 });
        }
        if (!checkIn || typeof checkIn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn)) {
            return NextResponse.json({ error: 'La fecha de check-in es requerida y debe tener formato YYYY-MM-DD.' }, { status: 400 });
        }
        if (!checkOut || typeof checkOut !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
            return NextResponse.json({ error: 'La fecha de check-out es requerida y debe tener formato YYYY-MM-DD.' }, { status: 400 });
        }
        if (typeof adults !== 'number' || adults < 1) {
            return NextResponse.json({ error: 'La cantidad de adultos debe ser al menos 1.' }, { status: 400 });
        }

        // Call the inquiry backend service
        const inquiryId = await createInquiry({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            phoneCountryCode: phoneCountryCode.trim(),
            email: email.trim(),
            checkIn,
            checkOut,
            adults,
            children: Number(children) || 0,
            message: message ? message.trim() : ''
        });

        // Dispatch a call to the email notification route
        const origin = new URL(req.url).origin;
        const notifyUrl = `${origin}/api/notify-inquiry`;
        
        // We trigger the notify fetch asynchronously so we don't block the client response
        fetch(notifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inquiryId,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim(),
                phoneCountryCode: phoneCountryCode.trim(),
                email: email.trim(),
                checkIn,
                checkOut,
                adults,
                children,
                message: message ? message.trim() : ''
            })
        }).catch(err => {
            console.error('Error triggering notify-inquiry route:', err);
        });

        return NextResponse.json({ success: true, inquiryId }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/inquiries:', error);
        return NextResponse.json({ error: 'Error interno del servidor.', details: error?.message || 'Unknown error' }, { status: 500 });
    }
}
