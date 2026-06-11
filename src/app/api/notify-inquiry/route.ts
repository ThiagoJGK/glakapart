import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            inquiryId,
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

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("Missing RESEND_API_KEY environment variable");
            return NextResponse.json({ error: "Missing RESEND_API_KEY environment variable" }, { status: 500 });
        }

        // Fetch notification emails from Firestore settings
        let notificationEmails: any = [];
        try {
            const docRef = doc(db, "content", "main");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                notificationEmails = data?.settings?.notificationEmails || [];
            }
        } catch (dbErr) {
            console.warn("Failed to fetch notification emails from Firestore settings, using defaults.", dbErr);
        }

        // Parse notification emails (handle both array and string representation)
        let emailsList: string[] = [];
        if (Array.isArray(notificationEmails)) {
            emailsList = notificationEmails.map((e: any) => String(e).trim()).filter(Boolean);
        } else if (typeof notificationEmails === 'string') {
            emailsList = notificationEmails.split(',').map((e: string) => e.trim()).filter(Boolean);
        }

        // Fallback default emails if not configured in Firestore
        if (emailsList.length === 0) {
            emailsList = ['thiagojgk@gmail.com', 'adrigglak@gmail.com', 'apartglak@gmail.com'];
        }

        // Construct Admin Panel URL
        const origin = new URL(req.url).origin;
        const adminUrl = `${origin}/admin/inquiries`;

        // Premium HTML email template with Glak Apart brand guidelines (#10595a color)
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Consulta de Reserva</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f7f9fa;
      color: #333333;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f9fa;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #10595a;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 300;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      color: #10595a;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #777777;
      margin-top: 30px;
      margin-bottom: 10px;
      border-bottom: 1px solid #eeeeee;
      padding-bottom: 5px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .details-table td {
      padding: 10px 0;
      vertical-align: top;
    }
    .details-table td.label {
      width: 35%;
      color: #777777;
      font-size: 14px;
      font-weight: 500;
    }
    .details-table td.value {
      width: 65%;
      color: #333333;
      font-size: 14px;
      font-weight: bold;
    }
    .message-box {
      background-color: #f4f7f7;
      border-left: 4px solid #10595a;
      padding: 15px;
      font-style: italic;
      color: #555555;
      font-size: 14px;
      margin-top: 10px;
      line-height: 1.5;
      border-radius: 0 4px 4px 0;
    }
    .button-container {
      text-align: center;
      margin-top: 40px;
    }
    .button {
      background-color: #10595a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      display: inline-block;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 5px rgba(16, 89, 90, 0.2);
    }
    .footer {
      background-color: #f4f7f7;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #777777;
      border-top: 1px solid #eef2f2;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Glak Apart</h1>
      </div>
      <div class="content">
        <h2 class="greeting">Nueva Consulta de Reserva</h2>
        <p style="font-size: 14px; color: #555555; line-height: 1.5;">Se ha recibido una nueva consulta desde el sitio web público. A continuación se detallan los datos del huésped y la reserva solicitada:</p>
        
        <h3 class="section-title">Datos del Huésped</h3>
        <table class="details-table">
          <tr>
            <td class="label">Nombre completo:</td>
            <td class="value">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td class="label">Email:</td>
            <td class="value"><a href="mailto:${email}" style="color: #10595a; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td class="label">Teléfono:</td>
            <td class="value"><a href="tel:${phoneCountryCode}${phone}" style="color: #10595a; text-decoration: none;">+${phoneCountryCode} ${phone}</a></td>
          </tr>
        </table>
        
        <h3 class="section-title">Detalles de la Estadía</h3>
        <table class="details-table">
          <tr>
            <td class="label">Check-in:</td>
            <td class="value">${checkIn}</td>
          </tr>
          <tr>
            <td class="label">Check-out:</td>
            <td class="value">${checkOut}</td>
          </tr>
          <tr>
            <td class="label">Huéspedes:</td>
            <td class="value">${adults} ${adults === 1 ? 'Adulto' : 'Adultos'}${Number(children) > 0 ? `, ${children} ${Number(children) === 1 ? 'Niño/Menor' : 'Niños/Menores'}` : ''}</td>
          </tr>
        </table>
        
        ${message ? `
          <h3 class="section-title">Mensaje Adicional</h3>
          <div class="message-box">
            "${message.replace(/\n/g, '<br>')}"
          </div>
        ` : ''}
        
        <div class="button-container">
          <a href="${adminUrl}" class="button" style="color: #ffffff;">Ver consulta en Panel Admin</a>
        </div>
      </div>
      <div class="footer">
        <p>Este es un correo automático del sistema de reservas de <strong>Glak Apart</strong>.</p>
        <p>&copy; ${new Date().getFullYear()} Glak Apart. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'Glak Apart <onboarding@resend.dev>';

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromEmail,
                to: emailsList,
                subject: `Nueva Consulta de Reserva - ${firstName} ${lastName}`,
                html: htmlContent
            })
        });

        const resData = await response.json();

        if (!response.ok) {
            console.error("Resend API error response:", resData);
            return NextResponse.json({ error: "Resend API error", details: resData }, { status: response.status });
        }

        return NextResponse.json({ success: true, messageId: resData.id });
    } catch (error: any) {
        console.error('Error in POST /api/notify-inquiry:', error);
        return NextResponse.json({ error: 'Error interno al enviar la notificación.', details: error?.message || 'Unknown error' }, { status: 500 });
    }
}
