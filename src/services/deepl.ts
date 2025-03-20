// Interface para resultados de tradução de texto
export interface DeepLTranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  documentId?: string;
  documentKey?: string;
}

// Interface para resultados de tradução de documentos
export interface DeepLDocumentResult {
  documentId: string;
  documentKey: string;
  filename?: string;
}

// Interface para status de documentos
export interface DeepLDocumentStatus {
  documentId: string;
  status: 'queued' | 'translating' | 'done' | 'error';
  secondsRemaining?: number;
  billedCharacters?: number;
  errorMessage?: string;
}

// Interface para opções de tradução
export interface DeepLTranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  text?: string;
  file?: File;
  filename?: string;
  formality?: 'default' | 'more' | 'less' | 'prefer_more' | 'prefer_less';
}

// Interface para parâmetros de tradução de texto
export interface TranslateTextParams {
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
}

// Interface para parâmetros de tradução de documento
export interface TranslateDocumentParams {
  sourceLanguage: string;
  targetLanguage: string;
  file: File;
  filename: string;
}

// Interface para status de tradução
export interface TranslationStatus {
  status: "translating" | "done" | "error";
  secondsRemaining?: number;
  errorMessage?: string;
}

// Serviço para integração com a API DeepL
export class DeepLService {
  // URL base do backend intermediário
  private static readonly BACKEND_URL = 'http://localhost:3031';

  /**
   * Traduz texto usando a API DeepL
   */
  static async translateText({
    sourceLanguage,
    targetLanguage,
    text,
  }: TranslateTextParams): Promise<DeepLTranslationResult> {
    try {
      console.log("Enviando solicitação de tradução de texto para o proxy:", this.BACKEND_URL);
      const response = await fetch(`${this.BACKEND_URL}/translate-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguage,
          text,
        }),
      });

      if (!response.ok) {
        console.error("Resposta do proxy não ok:", response.status, response.statusText);
        const errorText = await response.text();
        throw new Error(`Erro ao traduzir texto: ${errorText}`);
      }

      const data = await response.json();
      return {
        translatedText: data.translatedText,
        detectedSourceLanguage: data.detectedSourceLanguage
      };
    } catch (error) {
      console.error("Erro na tradução de texto:", error);
      throw new Error(error instanceof Error ? error.message : "Erro desconhecido na tradução de texto");
    }
  }

  /**
   * Inicia o processo de tradução de um documento
   * Etapa 1: Upload do documento para a API DeepL
   */
  static async uploadDocumentForTranslation(options: DeepLTranslationOptions): Promise<DeepLDocumentResult> {
    try {
      if (!options.file) {
        throw new Error('Arquivo para tradução não fornecido');
      }

      const formData = new FormData();
      formData.append('file', options.file, options.filename || options.file.name);
      formData.append('targetLanguage', options.targetLanguage.toUpperCase());
      
      if (options.sourceLanguage) {
        formData.append('sourceLanguage', options.sourceLanguage.toUpperCase());
      }
      
      if (options.formality) {
        formData.append('formality', options.formality);
      }

      console.log(`Enviando documento para tradução: ${options.filename || options.file.name}`);
      
      const response = await fetch(`${this.BACKEND_URL}/document`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Erro no upload do documento: ${response.status} - ${JSON.stringify(errorData || response.statusText)}`);
      }

      const data = await response.json();
      console.log("Resposta do upload do documento:", data);
      
      return {
        documentId: data.document_id,
        documentKey: data.document_key,
        filename: options.filename || options.file.name
      };
    } catch (error) {
      console.error('Erro ao enviar documento para tradução:', error);
      throw error;
    }
  }

  /**
   * Verificar status da tradução de documento
   */
  public static async checkDocumentStatus(
    documentId: string,
    documentKey: string
  ): Promise<TranslationStatus> {
    try {
      console.log(`Verificando status do documento ${documentId}`);
      
      // Verificar status com o proxy
      const response = await fetch(`${this.BACKEND_URL}/document-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          documentKey
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao verificar status do documento: ${errorText}`);
      }

      const data = await response.json();
      console.log("Resposta de status:", data);
      
      return {
        status: data.status,
        secondsRemaining: data.secondsRemaining,
        errorMessage: data.errorMessage
      };
    } catch (error) {
      console.error('Erro ao verificar status do documento:', error);
      throw error;
    }
  }

  /**
   * Baixar documento traduzido
   */
  public static async downloadTranslatedDocument(
    documentId: string,
    documentKey: string
  ): Promise<Blob> {
    try {
      console.log(`Baixando documento traduzido ${documentId}`);
      
      const response = await fetch(`${this.BACKEND_URL}/document-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          documentKey
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao baixar documento traduzido: ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao baixar documento traduzido:', error);
      throw error;
    }
  }

  /**
   * Processo completo de tradução de documento
   * Gerencia as 3 etapas: upload, verificação de status e download
   * Retorna o documento traduzido como um Blob
   * 
   * @param options Opções de tradução
   * @param statusCallback Callback opcional para receber atualizações de status
   */
  public static async translateDocument(
    {
      sourceLanguage,
      targetLanguage,
      file,
      filename,
    }: TranslateDocumentParams,
    statusCallback?: (status: TranslationStatus) => void
  ): Promise<Blob> {
    try {
      console.log("Preparando tradução de documento via proxy:", this.BACKEND_URL);
      
      // Criar FormData para envio do arquivo
      const formData = new FormData();
      formData.append("sourceLanguage", sourceLanguage);
      formData.append("targetLanguage", targetLanguage);
      formData.append("file", file);
      
      // Importante: não use filename como segundo parâmetro aqui - isso estava causando o erro
      console.log(`Enviando arquivo para tradução: ${file.name}, tipo: ${file.type}, tamanho: ${file.size} bytes`);
      
      // Usando o endpoint document do proxy DeepL
      const response = await fetch(`${this.BACKEND_URL}/document`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        console.error("Resposta do proxy não ok:", response.status, response.statusText);
        const errorText = await response.text();
        throw new Error(`Erro ao iniciar tradução do documento: ${errorText}`);
      }

      const data = await response.json();
      console.log("Resposta do upload:", data);
      
      if (!data.documentId || !data.documentKey) {
        throw new Error("Resposta incompleta do servidor: faltam documentId ou documentKey");
      }
      
      const documentId = data.documentId;
      const documentKey = data.documentKey;
      
      console.log(`Documento enviado com sucesso. ID: ${documentId}, Key disponível: ${!!documentKey}`);

      // Verificar status da tradução em intervalos regulares
      if (statusCallback) {
        statusCallback({ status: "translating" });
      }

      let isDone = false;
      let status: TranslationStatus = { status: "translating" };
      
      while (!isDone) {
        try {
          console.log("Verificando status da tradução...");
          
          // Chamar método específico para verificar status
          status = await this.checkDocumentStatus(documentId, documentKey);
          console.log("Status atual:", status);
          
          if (status.status === 'done' || status.status === 'error') {
            isDone = true;
            console.log("Tradução concluída ou com erro:", status);
          } else {
            if (statusCallback) {
              statusCallback(status);
            }
            // Esperar antes da próxima verificação
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error("Erro ao verificar status:", error);
          throw new Error(`Falha ao verificar status da tradução: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
      
      if (status.status === 'error' || status.errorMessage) {
        throw new Error(`Erro na tradução: ${status.errorMessage || 'Erro desconhecido'}`);
      }

      try {
        // Baixar o documento traduzido
        console.log("Buscando documento traduzido...");
        return await this.downloadTranslatedDocument(documentId, documentKey);
      } catch (error) {
        console.error("Erro ao baixar documento traduzido:", error);
        throw new Error(`Falha ao baixar documento traduzido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro detalhado na tradução do documento:", error);
      if (statusCallback) {
        statusCallback({
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
      throw error;
    }
  }
}

export default DeepLService;
