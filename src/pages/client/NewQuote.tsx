import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { format, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CalendarIcon, Eye, Loader2, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
// Removida importação problemática de pptxjs
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";

// Configuração do worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Tipos
interface FileInfo {
  file: File;
  wordCount: number;
  isProcessing: boolean;
}

interface FilesInfo {
  files: FileInfo[];
  totalWordCount: number;
}

interface QuoteDetails {
  wordCount: number;
  pricePerWord: number;
  totalPrice: number;
  deliveryDate: Date;
  serviceType: string;
}

// Constantes
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
};

// Tamanho máximo de arquivo (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Tamanho máximo total de todos os arquivos (200MB)
const MAX_TOTAL_SIZE = 200 * 1024 * 1024;

const LANGUAGES = [
  'Português',
  'Inglês',
  'Espanhol',
];

const PRICING = {
  2: { pricePerWord: 0.18 }, // Até 2 dias úteis
  3: { pricePerWord: 0.16 }, // 3 dias úteis
  5: { pricePerWord: 0.15 }, // 5 dias úteis
};

const TRANSLATION_SUBTYPES = [
  'Certificada - ATIO (Ontario, Canada)',
  'Certificada - ATA (Americana)',
  'Certificada - NAATI (Austrália)'
];

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Schema de validação
const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
  translationType: z.enum(['técnica', 'juramentada', 'certificada'], {
    required_error: 'Tipo de tradução é obrigatório'
  }),
  translationSubtype: z.string().optional(),
  sourceLanguage: z.string().min(1, 'Idioma de origem é obrigatório'),
  targetLanguage: z.string().min(1, 'Idioma de destino é obrigatório'),
  deliveryDate: z.date().min(addBusinessDays(new Date(), 1), 'Data deve ser pelo menos 1 dia útil no futuro'),
}).refine(data => data.sourceLanguage !== data.targetLanguage, {
  message: "O idioma de origem deve ser diferente do idioma de destino",
  path: ["targetLanguage"],
}).refine(
  (data) => {
    if (data.translationType === 'certificada') {
      return !!data.translationSubtype;
    }
    return true;
  },
  {
    message: "Subtipo de tradução é obrigatório para traduções certificadas",
    path: ["translationSubtype"],
  }
);

interface OrderData {
  fileCount: number;
  wordCount: number;
  totalSize: number;
  totalPrice: number;
  requestId: string;
}

const NewQuote: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [filesInfo, setFilesInfo] = useState<FilesInfo>({
    files: [],
    totalWordCount: 0
  });
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [processingStatus, setProcessingStatus] = useState<{
    total: number;
    processed: number;
    isProcessing: boolean;
  }>({
    total: 0,
    processed: 0,
    isProcessing: false
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [submittedOrderData, setSubmittedOrderData] = useState<OrderData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Carregar dados do usuário
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Usuário autenticado:", user.id);
          
          // Tentar obter o email do usuário da autenticação
          if (user.email) {
            form.setValue('email', user.email);
          }
          
          // Buscar detalhes do perfil do usuário do Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*') // Selecionar todas as colunas para verificar as disponíveis
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.log("Erro ao buscar perfil:", error);
            // Se não conseguir buscar o perfil, pelo menos preencher com os dados básicos do auth
            return;
          }
            
          console.log("Dados do perfil:", data);
          
          if (data) {
            // Verificar cada campo e preencher de acordo com o que estiver disponível
            // Nome pode estar em diferentes campos dependendo da estrutura
            const nameField = data.full_name || data.name || data.username || '';
            if (nameField) form.setValue('name', nameField);
            
            // Email pode estar em diferentes campos
            const emailField = data.email || user.email || '';
            if (emailField) form.setValue('email', emailField);
            
            // Telefone pode estar em diferentes campos
            const phoneField = data.phone || data.phone_number || '';
            if (phoneField) {
              // Formatar o número de telefone se necessário
              const formattedPhone = formatPhoneNumber(phoneField);
              form.setValue('phone', formattedPhone);
            }
          }
        } else {
          console.log("Usuário não autenticado");
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
    
    loadUserData();
  }, [form]);

  // Função para formatar número de telefone
  function formatPhoneNumber(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }

  // Função para formatar tamanho de arquivo
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Função para processar o upload do arquivo
  async function handleFileDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;

    // Verificar o tamanho total dos arquivos
    const totalFileSize = acceptedFiles.reduce((size, file) => size + file.size, 0);
    const currentTotalSize = filesInfo.files.reduce((size, info) => size + info.file.size, 0);
    
    if (totalFileSize + currentTotalSize > MAX_TOTAL_SIZE) {
      toast({
        variant: "destructive",
        title: "Tamanho total excedido",
        description: `O tamanho total dos arquivos (${formatFileSize(totalFileSize + currentTotalSize)}) excede o limite de ${formatFileSize(MAX_TOTAL_SIZE)}.`,
      });
      return;
    }

    // Criar entradas temporárias para os novos arquivos
    const newFiles = acceptedFiles.map(file => ({
      file,
      wordCount: 0,
      isProcessing: true,
    }));

    // Iniciar status de processamento
    setProcessingStatus({
      total: acceptedFiles.length,
      processed: 0,
      isProcessing: true
    });

    // Adicionar aos arquivos existentes
    setFilesInfo(prev => ({
      files: [...prev.files, ...newFiles],
      totalWordCount: prev.totalWordCount
    }));

    try {
      // Processar cada arquivo em paralelo
      const processedFilesPromises = acceptedFiles.map(async (file, index) => {
        const wordCount = await calculateWordCount(file);
        
        // Atualizar contador de processamento
        setProcessingStatus(prev => ({
          ...prev,
          processed: prev.processed + 1
        }));
        
        return {
          file,
          wordCount,
          isProcessing: false
        };
      });

      const processedFiles = await Promise.all(processedFilesPromises);

      // Atualizar estado com os arquivos processados
      setFilesInfo(prev => {
        // Substituir os arquivos temporários pelos processados
        const updatedFiles = [
          ...prev.files.filter(f => !newFiles.some(nf => nf.file.name === f.file.name)),
          ...processedFiles
        ];
        
        // Calcular total de palavras
        const totalWordCount = updatedFiles.reduce((sum, file) => sum + file.wordCount, 0);
        
        // Atualizar cotação
        calculateQuote(totalWordCount);
        
        return {
          files: updatedFiles,
          totalWordCount
        };
      });
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      
      // Remover arquivos com erro
      setFilesInfo(prev => {
        const updatedFiles = prev.files.filter(f => 
          !newFiles.some(nf => nf.file.name === f.file.name)
        );
        
        const totalWordCount = updatedFiles.reduce((sum, file) => sum + file.wordCount, 0);
        
        return {
          files: updatedFiles,
          totalWordCount
        };
      });
      
      toast({
        variant: "destructive",
        title: "Erro ao processar arquivos",
        description: error instanceof Error ? error.message : "Não foi possível processar os arquivos. Tente novamente.",
      });
    } finally {
      // Finalizar status de processamento
      setProcessingStatus({
        total: 0,
        processed: 0,
        isProcessing: false
      });
    }
  }

  // Função para calcular a cotação
  function calculateQuote(wordCount: number) {
    const formData = form.getValues();
    const deliveryDate = formData.deliveryDate;
    
    if (!deliveryDate) return;

    const today = new Date();
    let businessDays = 0;
    let currentDate = today;
    
    while (currentDate <= deliveryDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        businessDays++;
      }
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    let pricePerWord = PRICING[5].pricePerWord;
    if (businessDays <= 2) {
      pricePerWord = PRICING[2].pricePerWord;
    } else if (businessDays <= 3) {
      pricePerWord = PRICING[3].pricePerWord;
    }

    // Atualizar também o estado de totalWordCount
    setFilesInfo(prev => ({
      ...prev,
      totalWordCount: wordCount
    }));

    setQuoteDetails({
      wordCount,
      pricePerWord,
      totalPrice: wordCount * pricePerWord,
      deliveryDate,
      serviceType: formData.translationType,
    });
  }

  // Função para enviar o formulário
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      if (!filesInfo.files.length) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar cotação",
          description: "Por favor, carregue um arquivo e preencha todos os campos obrigatórios.",
        });
        return;
      }

      setIsSubmitting(true);
      setUploadProgress({}); // Resetar progresso de upload

      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Criar um ID de solicitação único para todos os arquivos
      const requestId = uuidv4();

      // Upload de todos os arquivos
      const uploadedFiles = await Promise.all(
        filesInfo.files.map(async (fileInfo) => {
          const originalFileName = fileInfo.file.name;
          const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
          const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
          const fileExt = originalFileName.substring(originalFileName.lastIndexOf('.'));
          const safeFileName = `${fileNameWithoutExt}_${timestamp}${fileExt}`.replace(/[^a-zA-Z0-9.-_]/g, '_');

          // Create a custom upload function to track progress
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('arquivos_carregados')
            .upload(safeFileName, fileInfo.file, {
              cacheControl: '3600',
<<<<<<< HEAD
              upsert: false
            });

          // Atualizar o progresso manualmente após o upload
          setUploadProgress(prev => ({ ...prev, [safeFileName]: 100 }));
=======
              upsert: false,
            });

          // Update progress manually after upload completes
          setUploadProgress(prev => ({ ...prev, [safeFileName]: 100 }));

>>>>>>> fc1cd9554ab071cb4a1fff8033477a29ac6ca9d1
          if (uploadError) {
            throw new Error(`Erro ao fazer upload do arquivo ${originalFileName}`);
          }

          console.log(`Upload de ${originalFileName} concluído com sucesso`);

          // Retornar objeto no formato padronizado para o campo JSONB 'files'
          return {
            originalName: originalFileName,
            storagePath: safeFileName,
            fileType: fileInfo.file.type,
            wordCount: fileInfo.wordCount
          };
        })
      );
      
      // Validar se o número de arquivos e a contagem total de palavras estão corretos
      if (uploadedFiles.length !== filesInfo.files.length) {
        throw new Error('Erro na validação: o número de arquivos processados não corresponde ao número de arquivos enviados');
      }
      
      // Verificar se a soma das contagens de palavras corresponde ao total
      const totalWordCountFromFiles = uploadedFiles.reduce((sum, file) => sum + file.wordCount, 0);
      if (totalWordCountFromFiles !== filesInfo.totalWordCount) {
        console.warn('Aviso: A soma da contagem de palavras dos arquivos não corresponde ao total calculado anteriormente');
        // Atualizar o total para garantir consistência
        setFilesInfo(prev => ({
          ...prev,
          totalWordCount: totalWordCountFromFiles
        }));
      }

      // Criar solicitação no banco de dados usando o campo JSONB para armazenar múltiplos arquivos
      console.log("Arquivos para upload:", uploadedFiles);
      
      // Criar o objeto base com as informações principais
      const translationRequest: Record<string, any> = {
        request_id: requestId,
        user_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        currency: 'BRL',
        valid_until: addBusinessDays(new Date(), 7).toISOString(),
        // Armazenar diretamente o array de objetos no campo JSONB 'files'
        // O Supabase vai converter automaticamente para JSONB
        files: uploadedFiles,
        file_count: filesInfo.files.length,
        // Informações de cliente
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        // Campos de tradução
        source_language: formData.sourceLanguage,
        target_language: formData.targetLanguage,
        translation_type: formData.translationType,
        service_type: formData.translationType,
        translation_subtype: formData.translationType === 'certificada' ? formData.translationSubtype : null,
        delivery_date: formData.deliveryDate.toISOString(),
        // Campos de preço
        // Não usar mais o campo word_count individual, apenas o total_word_count
        total_word_count: filesInfo.totalWordCount,
        price_per_word: quoteDetails?.pricePerWord || 0,
        total_price: quoteDetails?.totalPrice || 0
        // Removidos os campos individuais para compatibilidade com versões anteriores
        // pois agora usaremos exclusivamente o campo 'files' para armazenar informações dos arquivos
      };

      console.log("Enviando para o banco:", translationRequest);

      // Usar upsert em vez de insert para ser mais flexível com as colunas
      const { error: requestError } = await supabase
        .from('translationrequests')
        .upsert(translationRequest, { 
          onConflict: 'request_id',
          ignoreDuplicates: false 
        });

      if (requestError) {
        console.error("Erro no banco:", requestError);
        throw requestError;
      }

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
      setSubmittedRequestId(requestId);

      // Salvar os dados do pedido para exibição no modal (não serão zerados)
      setSubmittedOrderData({
        fileCount: filesInfo.files.length,
        wordCount: filesInfo.totalWordCount,
        totalSize: filesInfo.files.reduce((size, info) => size + info.file.size, 0),
        totalPrice: quoteDetails?.totalPrice || 0,
        requestId: requestId
      });

      toast({
        title: "Cotação enviada com sucesso!",
        description: "Seu pedido foi registrado com sucesso. Em breve entraremos em contato.",
      });

    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      
      // Exibir mensagem de erro mais detalhada para ajudar no diagnóstico
      let errorMessage = "Ocorreu um erro ao processar sua solicitação.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Adicionar informações adicionais para erros de banco de dados
        if (typeof error === 'object' && error !== null) {
          const supabaseError = error as any;
          if (supabaseError.code || supabaseError.details || supabaseError.hint) {
            errorMessage = `${errorMessage}\n\nDetalhes: ${JSON.stringify({
              code: supabaseError.code,
              details: supabaseError.details,
              hint: supabaseError.hint
            }, null, 2)}`;
            
            console.log("Detalhes do erro:", {
              code: supabaseError.code,
              details: supabaseError.details,
              hint: supabaseError.hint,
              message: supabaseError.message
            });
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao enviar cotação",
        description: (
          <div className="whitespace-pre-wrap max-h-40 overflow-y-auto">
            {errorMessage}
          </div>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset quando os arquivos mudam
  useEffect(() => {
    if (filesInfo.files.length === 0) {
      setUploadProgress({});
    }
  }, [filesInfo.files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 10, // Aumentar para permitir múltiplos arquivos
    maxSize: MAX_FILE_SIZE,
    onDrop: handleFileDrop,
    onDropRejected: (fileRejections) => {
      const errorMessages = {
        'file-too-large': `O arquivo excede o limite de tamanho (${formatFileSize(MAX_FILE_SIZE)})`,
        'file-invalid-type': 'Tipo de arquivo não suportado',
        'too-many-files': 'Número máximo de arquivos excedido (máximo: 10)',
      };
      
      const errors = fileRejections.map(rejection => {
        const file = rejection.file;
        const errorCodes = rejection.errors.map(e => e.code);
        const errorMessages = rejection.errors.map(e => {
          // Personalizar mensagens de erro comuns
          if (e.code === 'file-too-large') {
            return `O arquivo excede o limite de tamanho (${formatFileSize(MAX_FILE_SIZE)})`;
          } else if (e.code === 'file-invalid-type') {
            return 'Tipo de arquivo não suportado (use PDF, DOC, DOCX, PPTX ou TXT)';
          }
          return e.message;
        }).join(', ');
        
        return `${file.name} (${formatFileSize(file.size)}): ${errorMessages}`;
      }).join('\n');
      
      toast({
        variant: "destructive",
        title: "Arquivo(s) rejeitado(s)",
        description: errors,
      });
    }
  });

  async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }
    
    return fullText;
  }

  async function extractTextFromWord(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  async function extractTextFromPPTX(file: File): Promise<string> {
    try {
      // Importar JSZip dinamicamente para extrair o conteúdo do arquivo PPTX
      const JSZip = (await import('jszip')).default;
      
      // Ler o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Carregar o arquivo PPTX como um arquivo ZIP
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Coletar todo o texto dos slides
      let allText = '';
      
      // PPTX armazena o conteúdo dos slides em ppt/slides/slide*.xml
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );
      
      // Processar cada slide
      for (const slideFile of slideFiles) {
        // Obter o conteúdo XML do slide
        const slideXml = await zip.files[slideFile].async('text');
        
        // Extrair texto de todas as tags <a:t> que contêm o texto dos slides
        const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
        
        // Adicionar o texto extraído ao texto total
        for (const match of textMatches) {
          // Extrair o texto entre as tags <a:t> e </a:t>
          const text = match.replace(/<a:t>([^<]*)<\/a:t>/, '$1');
          allText += text + ' ';
        }
        
        // Também extrair texto de tags <a:t> com atributos (como estilos)
        const textWithAttrsMatches = slideXml.match(/<a:t [^>]*>([^<]*)<\/a:t>/g) || [];
        
        for (const match of textWithAttrsMatches) {
          // Extrair o texto entre as tags <a:t ...> e </a:t>
          const text = match.replace(/<a:t [^>]*>([^<]*)<\/a:t>/, '$1');
          allText += text + ' ';
        }
      }
      
      // Também verificar as notas dos slides, que podem conter texto adicional
      const noteFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/notesSlides/notesSlide') && name.endsWith('.xml')
      );
      
      for (const noteFile of noteFiles) {
        const noteXml = await zip.files[noteFile].async('text');
        const textMatches = noteXml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
        
        for (const match of textMatches) {
          const text = match.replace(/<a:t>([^<]*)<\/a:t>/, '$1');
          allText += text + ' ';
        }
        
        const textWithAttrsMatches = noteXml.match(/<a:t [^>]*>([^<]*)<\/a:t>/g) || [];
        
        for (const match of textWithAttrsMatches) {
          const text = match.replace(/<a:t [^>]*>([^<]*)<\/a:t>/, '$1');
          allText += text + ' ';
        }
      }
      
      return allText;
    } catch (error) {
      console.error('Erro ao processar arquivo PPTX:', error);
      throw new Error('Não foi possível processar o arquivo PPTX. Por favor, tente outro formato.');
    }
  }

  async function calculateWordCount(file: File): Promise<number> {
    try {
      const fileType = file.type;
      let text = '';

      if (fileType === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (
        fileType === 'application/msword' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        text = await extractTextFromWord(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        text = await extractTextFromPPTX(file);
      } else if (fileType === 'text/plain') {
        text = await file.text();
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      // Remove espaços extras e quebras de linha
      text = text.replace(/\s+/g, ' ').trim();
      
      // Conta palavras (incluindo palavras com hífen)
      const words = text.split(/\s+/);
      const wordCount = words.filter(word => word.length > 0).length;

      if (wordCount === 0) {
        throw new Error('Nenhuma palavra encontrada no arquivo');
      }

      return wordCount;
    } catch (error) {
      console.error('Erro ao calcular palavras:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Não foi possível contar as palavras do arquivo. Tente novamente.",
      });
      throw error;
    }
  }

  // Função para gerar preview do arquivo
  useEffect(() => {
    if (showPreview && filesInfo.files.length > 0) {
      // Mostrar apenas o primeiro arquivo para preview por simplicidade
      const url = URL.createObjectURL(filesInfo.files[0].file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [filesInfo.files, showPreview]);

  // Função para abrir preview
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (filesInfo.files.length > 0) {
      setShowPreview(true);
    }
  };

  // Função para remover um arquivo específico
  const removeFile = (index: number) => {
    setFilesInfo(prev => {
      const updatedFiles = prev.files.filter((_, i) => i !== index);
      const totalCount = updatedFiles.reduce((sum, file) => sum + file.wordCount, 0);
      
      // Recalcular cotação se houver arquivos
      if (updatedFiles.length > 0) {
        calculateQuote(totalCount);
      } else {
        setQuoteDetails(null);
      }
      
      return {
        files: updatedFiles,
        totalWordCount: totalCount
      };
    });
  };

  // Função para limpar todos os arquivos
  const clearAllFiles = () => {
    setFilesInfo({ files: [], totalWordCount: 0 });
    setQuoteDetails(null);
  };

  return (
    <>
      <div className="container max-w-3xl mx-auto py-4 px-4 sm:py-8 sm:px-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-2 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold">Orçamento Instantâneo</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Solicite sua tradução com apenas alguns cliques
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 space-y-4 sm:space-y-0 mb-6 sm:mb-8">
              <div className="flex items-center justify-center sm:justify-start">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors",
                  activeStep === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  1
                </div>
                <span className="ml-3 text-sm sm:text-base font-medium">Informação</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors",
                  activeStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  2
                </div>
                <span className="ml-3 text-sm sm:text-base font-medium">Documentos</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors",
                  activeStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  3
                </div>
                <span className="ml-3 text-sm sm:text-base font-medium">Orçamento</span>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-6">
                {activeStep === 0 && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="E-mail" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Telefone" 
                                {...field} 
                                onChange={(e) => {
                                  const formatted = formatPhoneNumber(e.target.value);
                                  field.onChange(formatted);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sourceLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Idioma de origem" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LANGUAGES.map((lang) => (
                                  <SelectItem key={lang} value={lang}>
                                    {lang}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Traduzir para" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LANGUAGES.map((lang) => (
                                  <SelectItem key={lang} value={lang}>
                                    {lang}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="translationType"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de tradução" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="técnica">Técnica</SelectItem>
                              <SelectItem value="juramentada">Juramentada</SelectItem>
                              <SelectItem value="certificada">Certificada</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('translationType') === 'certificada' && (
                      <FormField
                        control={form.control}
                        name="translationSubtype"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o subtipo de tradução" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRANSLATION_SUBTYPES.map((subtype) => (
                                  <SelectItem key={subtype} value={subtype}>
                                    {subtype}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data de entrega</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < addBusinessDays(new Date(), 1)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {activeStep === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div {...getRootProps()} className={cn(
                      "border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-colors",
                      isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                    )}>
                      <input {...getInputProps()} />
                      {filesInfo.files.length ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <p className="text-base sm:text-lg font-medium">
                              {filesInfo.files.length} {filesInfo.files.length === 1 ? 'arquivo' : 'arquivos'}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm sm:text-base text-muted-foreground">
                                Total: {filesInfo.totalWordCount.toLocaleString('pt-BR')} palavras
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearAllFiles();
                                }}
                                title="Limpar todos os arquivos"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filesInfo.files.map((fileInfo, index) => (
                              <div key={fileInfo.file.name + index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                <div className="flex items-center space-x-2 overflow-hidden flex-grow">
                                  <p className="text-sm font-medium truncate">{fileInfo.file.name}</p>
                                  {fileInfo.isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  ) : (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      ({fileInfo.wordCount.toLocaleString('pt-BR')} palavras - {formatFileSize(fileInfo.file.size)})
                                    </span>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <p className="text-sm sm:text-base">Arraste e solte seus arquivos aqui, ou clique para selecionar</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Formatos aceitos: PDF, DOC, DOCX, TXT
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Limite de {formatFileSize(MAX_FILE_SIZE)} por arquivo | Total: {formatFileSize(MAX_TOTAL_SIZE)}
                          </p>
                        </div>
                      ) : isDragActive ? (
                        <p className="text-sm sm:text-base text-primary">Solte os arquivos aqui...</p>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-muted-foreground" />
                          <p className="text-sm sm:text-base">Arraste e solte seus arquivos aqui, ou clique para selecionar</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Formatos aceitos: PDF, DOC, DOCX, TXT
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Limite de {formatFileSize(MAX_FILE_SIZE)} por arquivo | Total: {formatFileSize(MAX_TOTAL_SIZE)}
                          </p>
                        </div>
                      )}
                    </div>

                    {filesInfo.files.length > 0 && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm sm:text-base font-medium mb-2">Resumo:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Total de arquivos:</span>
                            <span>{filesInfo.files.length}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Total de palavras:</span>
                            <span>{filesInfo.totalWordCount.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Tamanho total:</span>
                            <span>{formatFileSize(filesInfo.files.reduce((size, info) => size + info.file.size, 0))}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Limite:</span>
                            <span>{formatFileSize(MAX_TOTAL_SIZE)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mostrar status de processamento de arquivos */}
                    {processingStatus.isProcessing && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">Processando arquivos</span>
                          <span>{processingStatus.processed}/{processingStatus.total}</span>
                        </div>
                        <Progress 
                          value={(processingStatus.processed / processingStatus.total) * 100} 
                          className="h-2" 
                        />
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p>Calculando número de palavras... Por favor, aguarde.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeStep === 2 && quoteDetails && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Coluna da esquerda */}
                      <div className="space-y-4 sm:space-y-6">
                        <div className="rounded-lg border bg-card p-3 sm:p-4">
                          <h3 className="text-sm font-medium mb-2 sm:mb-3">Detalhes do serviço</h3>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Idiomas:</span>
                              <span>{form.getValues().sourceLanguage} para {form.getValues().targetLanguage}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Tipo de tradução:</span>
                              <span>{quoteDetails.serviceType}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Entrega digital:</span>
                              <span>{format(quoteDetails.deliveryDate, "dd/MM/yyyy")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-card p-3 sm:p-4">
                          <h3 className="text-sm font-medium mb-2 sm:mb-3">Documentos</h3>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Documentos:</span>
                              <span>{filesInfo.files.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Páginas:</span>
                              <span>-</span>
                            </div>
                            {filesInfo.files.length && (
                              <div className="mt-2 bg-accent/50 rounded p-2 flex items-center justify-between">
                                <span className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs sm:text-sm truncate">{filesInfo.files[0].file.name}</span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {Math.round(filesInfo.files[0].file.size / 1024)} KB
                                  </span>
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={handlePreviewClick}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Coluna da direita */}
                      <div className="space-y-4 sm:space-y-6">
                        <div className="rounded-lg border bg-card p-3 sm:p-4">
                          <h3 className="text-sm font-medium mb-2 sm:mb-3">Informações do cliente</h3>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div>
                              <span>{form.getValues().name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{form.getValues().email}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{form.getValues().phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-card p-3 sm:p-4">
                          <h3 className="text-sm font-medium mb-2 sm:mb-3">Preço</h3>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between mb-1 text-sm">
                              <span className="text-muted-foreground">Quantidade:</span>
                              <span>{filesInfo.files.length} {filesInfo.files.length === 1 ? 'arquivo' : 'arquivos'}</span>
                            </div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span className="text-muted-foreground">Palavras:</span>
                              <span>{filesInfo.totalWordCount.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span className="text-muted-foreground">Valor por palavra:</span>
                              <span>R$ {quoteDetails?.pricePerWord.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center font-medium">
                              <span>Total:</span>
                              <span className="text-primary">
                                R$ {quoteDetails.totalPrice.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <Button 
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando
                          </>
                        ) : (
                          'Contratar Agora'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                  >
                    Voltar
                  </Button>

                  {activeStep < 2 && (
                    <Button
                      type="button"
                      onClick={() => {
                        if (activeStep === 0) {
                          const isValid = form.trigger();
                          if (isValid) {
                            setActiveStep(1);
                          }
                        } else if (activeStep === 1 && filesInfo.files.length > 0 && !filesInfo.files.some(f => f.isProcessing)) {
                          setActiveStep(2);
                        }
                      }}
                      disabled={activeStep === 1 && (filesInfo.files.length === 0 || filesInfo.files.some(f => f.isProcessing))}
                    >
                      Próximo
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-[90%] max-w-md">
            <CardHeader>
              <h3 className="text-lg font-medium">Enviando sua solicitação</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Por favor, aguarde enquanto processamos seus arquivos. 
                Não feche esta janela durante o processo.
              </p>
              
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Progresso total:</span>
                    <span>
                      {Math.floor(
                        Object.values(uploadProgress).reduce((sum, p) => sum + p, 0) / 
                        Math.max(Object.keys(uploadProgress).length, 1)
                      )}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={
                      Object.values(uploadProgress).reduce((sum, p) => sum + p, 0) / 
                      Math.max(Object.keys(uploadProgress).length, 1)
                    } 
                    className="h-2" 
                  />
                  
                  <div className="border rounded divide-y max-h-48 overflow-y-auto">
                    {filesInfo.files.map((fileInfo, index) => {
                      const fileName = fileInfo.file.name;
                      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
                      const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
                      const fileExt = fileName.substring(fileName.lastIndexOf('.'));
                      const safeFileName = `${fileNameWithoutExt}_${timestamp}${fileExt}`.replace(/[^a-zA-Z0-9.-_]/g, '_');
                      const progress = uploadProgress[safeFileName] || 0;
                      
                      return (
                        <div key={fileName + index} className="p-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="truncate max-w-[200px] font-medium">{fileName}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatFileSize(fileInfo.file.size)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              {progress < 100 ? 'Enviando...' : 'Concluído'}
                            </span>
                            <span>{Math.floor(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-3 sm:p-4 pb-2">
            <DialogTitle className="text-base sm:text-lg">Preview do Documento</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex-1 w-full h-[calc(90vh-4rem)]">
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="Document Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setFilesInfo({ files: [], totalWordCount: 0 });
          setQuoteDetails(null);
          setActiveStep(0);
        }
        setShowSuccessModal(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitação Enviada com Sucesso!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            
            <p className="text-center text-sm">
              Sua solicitação de tradução foi registrada com sucesso. 
              Nossa equipe analisará os arquivos enviados e confirmará o orçamento.
            </p>
            
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">Detalhes da solicitação:</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">ID da solicitação:</span>
                  <span className="font-mono text-xs">{submittedRequestId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Arquivos enviados:</span>
                  <span>{submittedOrderData?.fileCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total de palavras:</span>
                  <span>{submittedOrderData?.wordCount.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Tamanho total:</span>
                  <span>{formatFileSize(submittedOrderData?.totalSize || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Valor estimado:</span>
                  <span>R$ {submittedOrderData?.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              Entraremos em contato em breve através do e-mail registrado.
            </p>
            
            <div className="mt-4">
              <CheckoutButton
                requestId={submittedOrderData?.requestId || ''}
                amount={submittedOrderData?.totalPrice || 0}
                customerEmail={form.getValues().email}
                customerName={form.getValues().name}
                description={`Tradução - ${submittedOrderData?.wordCount || 0} palavras`}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full sm:w-auto"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewQuote;
