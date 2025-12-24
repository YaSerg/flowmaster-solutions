import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadNotificationRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  attachment_url?: string;
  attachment_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: LeadNotificationRequest = await req.json();
    console.log("Received lead notification request:", data);

    const { name, email, phone, company, subject, message, attachment_url, attachment_name } = data;

    // Build email content
    let emailHtml = `
      <h2>Новая заявка с сайта ООО ТДИ</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Имя:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
    `;

    if (phone) {
      emailHtml += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Телефон:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${phone}">${phone}</a></td>
        </tr>
      `;
    }

    if (company) {
      emailHtml += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Компания:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${company}</td>
        </tr>
      `;
    }

    if (subject) {
      emailHtml += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Тема:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${subject}</td>
        </tr>
      `;
    }

    emailHtml += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Сообщение:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${message.replace(/\n/g, '<br>')}</td>
        </tr>
    `;

    if (attachment_url && attachment_name) {
      emailHtml += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Прикрепленный файл:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="${attachment_url}" target="_blank">${attachment_name}</a></td>
        </tr>
      `;
    }

    emailHtml += `
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Это автоматическое уведомление с сайта oootdi.ru
      </p>
    `;

    const emailSubject = subject 
      ? `Новая заявка: ${subject}`
      : `Новая заявка от ${name}`;

    console.log("Sending email to info@oootdi.ru...");

    const emailResponse = await resend.emails.send({
      from: "ООО ТДИ <onboarding@resend.dev>",
      to: ["info@oootdi.ru"],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-lead-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
