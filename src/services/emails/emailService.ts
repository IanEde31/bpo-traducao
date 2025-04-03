
import { supabase } from "@/lib/supabase";
import { EmailTemplates } from "./templates";

export class EmailService {
  /**
   * Envia um email através da Edge Function do Supabase
   */
  private static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to,
          subject,
          html,
        },
      });

      if (error) {
        console.error("Erro ao enviar email:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exceção ao enviar email:", error);
      return false;
    }
  }

  /**
   * Envia um email de confirmação de alteração de senha
   */
  static async sendPasswordChangedEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = EmailTemplates.passwordChanged(userName);
    return await this.sendEmail(userEmail, template.subject, template.html);
  }

  /**
   * Envia um email de confirmação de pedido
   */
  static async sendOrderPlacedEmail(
    userEmail: string,
    userName: string,
    orderId: string,
    sourceLanguage: string,
    targetLanguage: string,
    estimatedDelivery: string
  ): Promise<boolean> {
    const template = EmailTemplates.orderPlaced(
      userName,
      orderId,
      sourceLanguage,
      targetLanguage,
      estimatedDelivery
    );
    return await this.sendEmail(userEmail, template.subject, template.html);
  }

  /**
   * Envia um email de pedido aceito para o cliente
   */
  static async sendOrderAcceptedEmail(
    userEmail: string,
    userName: string,
    orderId: string,
    estimatedDelivery: string
  ): Promise<boolean> {
    const template = EmailTemplates.orderAccepted(userName, orderId, estimatedDelivery);
    return await this.sendEmail(userEmail, template.subject, template.html);
  }

  /**
   * Envia um email de tradução concluída para o cliente
   */
  static async sendTranslationDeliveredEmail(
    userEmail: string,
    userName: string,
    orderId: string,
    downloadLink: string
  ): Promise<boolean> {
    const template = EmailTemplates.translationDelivered(userName, orderId, downloadLink);
    return await this.sendEmail(userEmail, template.subject, template.html);
  }

  /**
   * Envia um lembrete de prazo para o tradutor
   */
  static async sendDeadlineReminderEmail(
    translatorEmail: string,
    translatorName: string,
    orderId: string,
    deadline: string
  ): Promise<boolean> {
    const template = EmailTemplates.deadlineReminder(translatorName, orderId, deadline);
    return await this.sendEmail(translatorEmail, template.subject, template.html);
  }

  /**
   * Envia um email de confirmação de pagamento para o tradutor
   */
  static async sendPaymentReceivedEmail(
    translatorEmail: string,
    translatorName: string,
    amount: string,
    paymentDate: string
  ): Promise<boolean> {
    const template = EmailTemplates.paymentReceived(translatorName, amount, paymentDate);
    return await this.sendEmail(translatorEmail, template.subject, template.html);
  }

  /**
   * Envia um email com informações de suporte
   */
  static async sendSupportInfoEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = EmailTemplates.supportInfo(userName);
    return await this.sendEmail(userEmail, template.subject, template.html);
  }
}
