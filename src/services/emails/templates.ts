// Templates de email personalizados para o sistema BPO

export const EmailTemplates = {
  // Template: Confirmação de alteração de senha
  passwordChanged: (userName: string) => {
    return {
      subject: "Sua senha foi alterada com sucesso!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://bpo-languagesolutions.com/logo.png" alt="BPO Language Solutions" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #1E5D88; margin-bottom: 20px;">Alteração de Senha</h2>
          
          <p style="color: #333333; line-height: 1.6;">
            Olá, ${userName},
          </p>
          
          <p style="color: #333333; line-height: 1.6;">
            Confirmamos que sua senha foi alterada com sucesso. Se você não reconhece essa alteração, 
            entre em contato imediatamente com nosso suporte.
          </p>
          
          <div style="margin: 30px 0px; text-align: center;">
            <a href="https://bpo-languagesolutions.com/login" style="background-color: #23B0DE; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Acessar minha Conta
            </a>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Se precisar de ajuda, estamos aqui para você.
          </p>
          
          <p style="color: #333333; line-height: 1.6; margin-top: 30px;">
            Atenciosamente,<br>
            Equipe BPO Language Solutions
          </p>
          
          <hr style="border: 1px solid #eeeeee; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #999999; text-align: center;">
            <p>BPO Language Solutions | Traduções Profissionais</p>
          </div>
        </div>
      `
    };
  },

  // Template: Pedido Realizado
  orderPlaced: (userName: string, orderId: string, sourceLanguage: string, targetLanguage: string, estimatedDelivery: string) => {
    return {
      subject: "Seu pedido foi recebido! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://bpo-languagesolutions.com/logo.png" alt="BPO Language Solutions" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #1E5D88; margin-bottom: 20px;">Pedido Recebido</h2>
          
          <p style="color: #333333; line-height: 1.6;">
            Olá, ${userName},
          </p>
          
          <p style="color: #333333; line-height: 1.6;">
            Recebemos seu pedido de tradução! Nossa equipe está revisando os detalhes e 
            em breve um tradutor será designado para o seu projeto.
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #333333;">
              <strong>📄 Número do pedido:</strong> ${orderId}
            </p>
            <p style="margin: 5px 0; color: #333333;">
              <strong>📌 Idioma:</strong> ${sourceLanguage} → ${targetLanguage}
            </p>
            <p style="margin: 5px 0; color: #333333;">
              <strong>⏳ Prazo estimado:</strong> ${estimatedDelivery}
            </p>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Você pode acompanhar o status do seu pedido na sua conta:
          </p>
          
          <div style="margin: 30px 0px; text-align: center;">
            <a href="https://bpo-languagesolutions.com/client/my-orders" style="background-color: #23B0DE; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Acompanhar Pedido
            </a>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Se tiver dúvidas, fale com nosso suporte.
          </p>
          
          <p style="color: #333333; line-height: 1.6; margin-top: 30px;">
            Atenciosamente,<br>
            Equipe BPO Language Solutions
          </p>
          
          <hr style="border: 1px solid #eeeeee; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #999999; text-align: center;">
            <p>BPO Language Solutions | Traduções Profissionais</p>
            <p>
              <a href="https://bpo-languagesolutions.com/suporte" style="color: #23B0DE; text-decoration: none;">Centro de Suporte</a> |
              <a href="mailto:contato@bpo-languagesolutions.com" style="color: #23B0DE; text-decoration: none;">contato@bpo-languagesolutions.com</a>
            </p>
          </div>
        </div>
      `
    };
  },

  // Template: Pedido Aceito (Cliente)
  orderAccepted: (userName: string, orderId: string, estimatedDelivery: string) => {
    return {
      subject: "Seu pedido foi aceito!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://bpo-languagesolutions.com/logo.png" alt="BPO Language Solutions" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #1E5D88; margin-bottom: 20px;">Pedido Aceito</h2>
          
          <p style="color: #333333; line-height: 1.6;">
            Olá, ${userName},
          </p>
          
          <p style="color: #333333; line-height: 1.6;">
            Seu pedido foi aceito e um tradutor já está trabalhando nele. 
            Você pode acompanhar o andamento pelo seu painel.
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #333333;">
              <strong>📄 Número do pedido:</strong> ${orderId}
            </p>
            <p style="margin: 5px 0; color: #333333;">
              <strong>⏳ Prazo estimado:</strong> ${estimatedDelivery}
            </p>
          </div>
          
          <div style="margin: 30px 0px; text-align: center;">
            <a href="https://bpo-languagesolutions.com/client/my-orders" style="background-color: #23B0DE; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Acompanhar Pedido
            </a>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Obrigado por confiar na BPO Language Solutions!
          </p>
          
          <p style="color: #333333; line-height: 1.6; margin-top: 30px;">
            Atenciosamente,<br>
            Equipe BPO Language Solutions
          </p>
          
          <hr style="border: 1px solid #eeeeee; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #999999; text-align: center;">
            <p>BPO Language Solutions | Traduções Profissionais</p>
          </div>
        </div>
      `
    };
  },

  // Template: Tradução Entregue (Cliente)
  translationDelivered: (userName: string, orderId: string, downloadLink: string) => {
    return {
      subject: "Sua tradução está pronta!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://bpo-languagesolutions.com/logo.png" alt="BPO Language Solutions" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #1E5D88; margin-bottom: 20px;">Tradução Concluída</h2>
          
          <p style="color: #333333; line-height: 1.6;">
            Olá, ${userName},
          </p>
          
          <p style="color: #333333; line-height: 1.6;">
            Sua tradução foi concluída e está disponível para download.
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #333333;">
              <strong>📄 Número do pedido:</strong> ${orderId}
            </p>
          </div>
          
          <div style="margin: 30px 0px; text-align: center;">
            <a href="${downloadLink}" style="background-color: #23B0DE; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Baixar Tradução
            </a>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Se precisar de ajustes ou tiver dúvidas, estamos à disposição.
          </p>
          
          <p style="color: #333333; line-height: 1.6; margin-top: 30px;">
            Atenciosamente,<br>
            Equipe BPO Language Solutions
          </p>
          
          <hr style="border: 1px solid #eeeeee; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #999999; text-align: center;">
            <p>BPO Language Solutions | Traduções Profissionais</p>
          </div>
        </div>
      `
    };
  },

  // Template: Lembrete de Prazo (Tradutor)
  deadlineReminder: (translatorName: string, orderId: string, deadline: string) => {
    return {
      subject: "Lembrete: prazo de entrega se aproxima",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://bpo-languagesolutions.com/logo.png" alt="BPO Language Solutions" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #1E5D88; margin-bottom: 20px;">Lembrete de Prazo</h2>
          
          <p style="color: #333333; line-height: 1.6;">
            Olá, ${translatorName},
          </p>
          
          <p style="color: #333333; line-height: 1.6;">
            Este é um lembrete de que a entrega da tradução está próxima!
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #333333;">
              <strong>📄 Número do pedido:</strong> ${orderId}
            </p>
            <p style="margin: 5px 0; color: #333333;">
              <strong>⏳ Prazo final:</strong> ${deadline}
            </p>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Certifique-se de finalizar e enviar a tradução a tempo para garantir a melhor experiência ao cliente.
          </p>
          
          <div style="margin: 30px 0px; text-align: center;">
            <a href="https://bpo-languagesolutions.com/translator/my-translations" style="background-color: #23B0DE; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver Traduções Pendentes
            </a>
          </div>
          
          <p style="color: #333333; line-height: 1.6; margin-top: 30px;">
            Atenciosamente,<br>
            Equipe BPO Language Solutions
          </p>
          
          <hr style="border: 1px solid #eeeeee; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #999999; text-align: center;">
            <p>BPO Language Solutions | Traduções Profissionais</p>
          </div>
        </div>
      `
    };
  },

  // Template: Pagamento Recebido (Tradutor)
  paymentReceived: (translatorName: string, amount: string, paymentDate: string) => {
    return {
      subject: "Pagamento recebido com sucesso!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://bpo-languagesolutions.com/logo.png" alt="BPO Language Solutions" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #1E5D88; margin-bottom: 20px;">Pagamento Recebido</h2>
          
          <p style="color: #333333; line-height: 1.6;">
            Olá, ${translatorName},
          </p>
          
          <p style="color: #333333; line-height: 1.6;">
            Seu pagamento referente aos trabalhos realizados foi processado com sucesso.
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #333333;">
              <strong>💰 Valor recebido:</strong> ${amount}
            </p>
            <p style="margin: 5px 0; color: #333333;">
              <strong>📆 Data do pagamento:</strong> ${paymentDate}
            </p>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Caso tenha alguma dúvida, entre em contato com nosso suporte.
          </p>
          
          <p style="color: #333333; line-height: 1.6; margin-top: 30px;">
            Atenciosamente,<br>
            Equipe BPO Language Solutions
          </p>
          
          <hr style="border: 1px solid #eeeeee; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #999999; text-align: center;">
            <p>BPO Language Solutions | Traduções Profissionais</p>
          </div>
        </div>
      `
    };
  },

  // Template: Suporte (Fale Conosco)
  supportInfo: (userName: string) => {
    return {
      subject: "Como podemos ajudar você?",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://bpo-languagesolutions.com/logo.png" alt="BPO Language Solutions" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #1E5D88; margin-bottom: 20px;">Suporte BPO Language Solutions</h2>
          
          <p style="color: #333333; line-height: 1.6;">
            Olá, ${userName},
          </p>
          
          <p style="color: #333333; line-height: 1.6;">
            Se precisar de suporte, estamos aqui para ajudar!
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #333333;">
              <strong>📞 Atendimento por telefone:</strong> (11) 1234-5678
            </p>
            <p style="margin: 5px 0; color: #333333;">
              <strong>📧 E-mail de suporte:</strong> suporte@bpo-languagesolutions.com
            </p>
            <p style="margin: 5px 0; color: #333333;">
              <strong>💬 Chat online:</strong> Acesse sua conta e fale conosco pelo chat em tempo real.
            </p>
          </div>
          
          <div style="margin: 30px 0px; text-align: center;">
            <a href="https://bpo-languagesolutions.com/suporte" style="background-color: #23B0DE; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Enviar Solicitação de Suporte
            </a>
          </div>
          
          <p style="color: #333333; line-height: 1.6;">
            Nosso time responderá o mais rápido possível!
          </p>
          
          <p style="color: #333333; line-height: 1.6; margin-top: 30px;">
            Atenciosamente,<br>
            Equipe BPO Language Solutions
          </p>
          
          <hr style="border: 1px solid #eeeeee; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #999999; text-align: center;">
            <p>BPO Language Solutions | Traduções Profissionais</p>
          </div>
        </div>
      `
    };
  }
};
