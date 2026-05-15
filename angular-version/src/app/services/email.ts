import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { AppointmentBooking } from '../models/booking';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly SERVICE_ID = 'service_7yw9ewg';
  // ⚠️ PON AQUÍ EL ID DE TU ÚNICA PLANTILLA MAESTRA DE EMAILJS
  private readonly MASTER_TEMPLATE_ID = 'template_221xq9q';
  private readonly PUBLIC_KEY = 'bJT5CXKuQhyFWRDBJ';

  constructor() {
    emailjs.init(this.PUBLIC_KEY);
  }

  // 1. Método genérico privado que hace la llamada a EmailJS
  private async sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
    const templateParams = {
      to_email: to,
      asunto: subject,
      mensaje_html: htmlBody,
    };

    try {
      await emailjs.send(this.SERVICE_ID, this.MASTER_TEMPLATE_ID, templateParams);
      console.log('Correo enviado con éxito a:', to);
    } catch (error) {
      console.error('Error al enviar el correo con EmailJS:', error);
    }
  }

  // Formateador de fechas para que se vean bonitas en los correos
  private formatBookingDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // 2. Correo de Bienvenida
  async sendWelcomeEmail(name: string, email: string): Promise<void> {
    const subject = '¡Bienvenido a AdoptMe! 🐾';
    const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5c9; padding: 40px 20px; text-align: center;">
      <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h1 style="color: #a8c084; font-size: 28px; margin-bottom: 20px;">¡Bienvenido a AdoptMe, ${name}! 🐾</h1>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          Estamos muy felices de tenerte con nosotros. En <strong>AdoptMe</strong>, trabajamos con el corazón para conectar peluditos que necesitan un hogar con familias llenas de amor como la tuya.
        </p>
        <div style="background-color: #fffdf0; border-left: 4px solid #c8d87a; padding: 15px; margin: 25px 0; text-align: left;">
          <p style="font-size: 16px; color: #4a4a4a; margin: 0 0 10px 0;"><strong>A partir de ahora, podrás:</strong></p>
          <ul style="font-size: 16px; color: #4a4a4a; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Ver el perfil detallado de cada animal.</li>
            <li>Agendar citas para conocerlos en persona.</li>
            <li>Formar parte de nuestra gran familia.</li>
          </ul>
        </div>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 30px;">
          ¿Listo para conocer a tu nuevo mejor amigo?
        </p>
        <a href="http://localhost:4200/login" style="background-color: #a8c084; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Ir a mi cuenta
        </a>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0 20px 0;">
        <p style="font-size: 13px; color: #999999; margin: 0;">
          Si tienes alguna duda, contáctanos en nuestra web.<br><br>
          ¡Guau, miau y gracias!<br><strong>El equipo de AdoptMe</strong>
        </p>
      </div>
    </div>
    `;
    await this.sendEmail(email, subject, htmlBody);
  }

  // 3. Correo de Verificación
  async sendVerificationEmail(name: string, email: string): Promise<void> {
    const subject = 'Verifica tu cuenta en AdoptMe 🐾';
    const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5c9; padding: 40px 20px; text-align: center;">
      <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h1 style="color: #a8c084; font-size: 28px; margin-bottom: 20px;">¡Casi estamos, ${name}! 🐾</h1>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          Por favor, verifica tu cuenta para empezar a usar AdoptMe y conocer a nuestros peluditos.
        </p>
        <a href="http://localhost:4200/login" style="background-color: #a8c084; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Ir a mi cuenta
        </a>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0 20px 0;">
        <p style="font-size: 13px; color: #999999; margin: 0;">
          ¡Guau, miau y gracias!<br><strong>El equipo de AdoptMe</strong>
        </p>
      </div>
    </div>
    `;
    await this.sendEmail(email, subject, htmlBody);
  }

  // 4. Correo de Confirmación de Cita
  async sendAppointmentConfirmation(
    booking: AppointmentBooking,
    animalName: string,
  ): Promise<void> {
    const dateFormatted = this.formatBookingDate(booking.date);
    const subject = `¡Cita confirmada en AdoptMe! 🎉 - ${dateFormatted}`;

    const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5c9; padding: 40px 20px; text-align: center;">
      <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h1 style="color: #a8c084; font-size: 28px; margin-bottom: 20px;">¡Cita confirmada, ${booking.contactName}! 🎉</h1>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          Qué ilusión. Tu cita para venir a <strong>AdoptMe</strong> ha sido confirmada. Ya está todo listo para que vengas a conocernos.
        </p>
        <div style="background-color: #fffdf0; border-left: 4px solid #c8d87a; padding: 15px; margin: 25px 0; text-align: left;">
          <p style="font-size: 16px; color: #4a4a4a; margin: 0 0 10px 0;"><strong>Detalles de tu visita:</strong></p>
          <ul style="font-size: 16px; color: #4a4a4a; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Fecha:</strong> ${dateFormatted}</li>
            <li><strong>Hora:</strong> ${booking.slot}h</li>
            <li><strong>Mascota/s:</strong> ${animalName}</li>
          </ul>
        </div>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 30px;">
          Recuerda ser puntual. ¡Nuestros peluditos tienen muchas ganas de verte!
        </p>
        <a href="http://localhost:4200/login" style="background-color: #a8c084; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Ver mis citas
        </a>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0 20px 0;">
        <p style="font-size: 13px; color: #999999; margin: 0;">
          Si no puedes asistir, por favor cancela la cita desde tu perfil para dejar el hueco libre.<br><br>
          ¡Guau, miau y gracias!<br><strong>El equipo de AdoptMe</strong>
        </p>
      </div>
    </div>
    `;
    await this.sendEmail(booking.email, subject, htmlBody);
  }

  // 5. Correo de Rechazo de Cita
  async sendAppointmentRejection(booking: AppointmentBooking, animalName: string): Promise<void> {
    const dateFormatted = this.formatBookingDate(booking.date);
    const subject = `Actualización sobre tu cita en AdoptMe 🐾 - ${dateFormatted}`;

    const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5c9; padding: 40px 20px; text-align: center;">
      <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h1 style="color: #a8c084; font-size: 28px; margin-bottom: 20px;">Actualización de cita 🐾</h1>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          Hola, ${booking.contactName}. Lamentablemente, no hemos podido confirmar la cita que solicitaste en <strong>AdoptMe</strong>.
        </p>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          A veces los horarios se solapan con los de otras familias o la disponibilidad de nuestros peluditos cambia. Esta era la cita solicitada:
        </p>
        <div style="background-color: #fffdf0; border-left: 4px solid #c8d87a; padding: 15px; margin: 25px 0; text-align: left;">
          <ul style="font-size: 16px; color: #4a4a4a; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Fecha:</strong> ${dateFormatted}</li>
            <li><strong>Hora:</strong> ${booking.slot}h</li>
            <li><strong>Mascota/s:</strong> ${animalName}</li>
          </ul>
        </div>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 30px;">
          ¡Pero no te desanimes! Nos encantaría que nos visitaras en otro momento.
        </p>
        <a href="http://localhost:4200/login" style="background-color: #a8c084; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Solicitar nueva cita
        </a>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0 20px 0;">
        <p style="font-size: 13px; color: #999999; margin: 0;">
          Si tienes alguna duda, contáctanos en nuestra web.<br><br>
          ¡Guau, miau y gracias!<br><strong>El equipo de AdoptMe</strong>
        </p>
      </div>
    </div>
    `;
    await this.sendEmail(booking.email, subject, htmlBody);
  }
}
