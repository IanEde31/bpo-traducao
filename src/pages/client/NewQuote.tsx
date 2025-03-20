import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { format, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { CalendarIcon, Eye, Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Configuração do worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Tipos
interface FileInfo {
  file: File;
  wordCount: number;
  isProcessing: boolean;
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
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'application/vnd.ms-powerpoint': ['.ppt'],
};

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

const NewQuote: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Função para formatar número de telefone
  function formatPhoneNumber(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }

  // Função para processar o upload do arquivo
  async function handleFileDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileInfo({
      file,
      wordCount: 0,
      isProcessing: true,
    });

    try {
      const wordCount = await calculateWordCount(file);
      setFileInfo(prev => prev ? { ...prev, wordCount, isProcessing: false } : null);
      calculateQuote(wordCount);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setFileInfo(null);
      toast({
        variant: "destructive",
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Não foi possível processar o arquivo.",
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
      if (!fileInfo) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar cotação",
          description: "Por favor, carregue um arquivo e preencha todos os campos obrigatórios.",
        });
        return;
      }

      setIsSubmitting(true);

      // Upload do arquivo
      const originalFileName = fileInfo.file.name;
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
      const fileExt = originalFileName.substring(originalFileName.lastIndexOf('.'));
      const safeFileName = `${fileNameWithoutExt}_${timestamp}${fileExt}`.replace(/[^a-zA-Z0-9.-_]/g, '_');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('arquivos_carregados')
        .upload(safeFileName, fileInfo.file);

      if (uploadError) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      console.log('Upload concluído com sucesso:', uploadData);

      // Criar solicitação
      const requestId = uuidv4();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const translationRequest = {
        request_id: requestId,
        user_id: user.id,
        file_name: fileInfo.file.name,
        file_path: safeFileName,
        bucket_name: 'arquivos_carregados',
        file_type: fileInfo.file.type,
        word_count: fileInfo.wordCount,
        service_type: formData.translationType,
        translation_subtype: formData.translationType === 'certificada' ? formData.translationSubtype : null,
        source_language: formData.sourceLanguage,
        target_language: formData.targetLanguage,
        delivery_date: formData.deliveryDate.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        price_per_word: quoteDetails?.pricePerWord || 0,
        total_price: quoteDetails?.totalPrice || 0,
        currency: 'BRL',
        valid_until: addBusinessDays(new Date(), 7).toISOString()
      };

      const { error: requestError } = await supabase
        .from('translationrequests')
        .insert(translationRequest);

      if (requestError) {
        throw requestError;
      }

      toast({
        title: "Cotação enviada com sucesso!",
        description: "Seu pedido foi registrado com sucesso. Em breve entraremos em contato.",
      });

      form.reset();
      setFileInfo(null);
      setQuoteDetails(null);
      setActiveStep(0);

    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar cotação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    onDrop: handleFileDrop,
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
    if (fileInfo?.file && showPreview) {
      const url = URL.createObjectURL(fileInfo.file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fileInfo?.file, showPreview]);

  // Função para abrir preview
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInfo?.file) {
      setShowPreview(true);
    }
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
                      {fileInfo ? (
                        <div className="space-y-3">
                          <p className="text-base sm:text-lg font-medium break-all">{fileInfo.file.name}</p>
                          {fileInfo.isProcessing ? (
                            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <p className="text-sm sm:text-base">Processando arquivo...</p>
                            </div>
                          ) : (
                            <p className="text-sm sm:text-base text-muted-foreground">
                              {fileInfo.wordCount.toLocaleString('pt-BR')} palavras
                            </p>
                          )}
                        </div>
                      ) : isDragActive ? (
                        <p className="text-sm sm:text-base text-primary">Solte o arquivo aqui...</p>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-muted-foreground" />
                          <p className="text-sm sm:text-base">Arraste e solte seu arquivo aqui, ou clique para selecionar</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Formatos aceitos: PDF, DOC, DOCX, TXT
                          </p>
                        </div>
                      )}
                    </div>
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
                              <span>1</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Páginas:</span>
                              <span>-</span>
                            </div>
                            {fileInfo && (
                              <div className="mt-2 bg-accent/50 rounded p-2 flex items-center justify-between">
                                <span className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs sm:text-sm truncate">{fileInfo.file.name}</span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {Math.round(fileInfo.file.size / 1024)} KB
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
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Preço unitário:</span>
                              <span>R$ {quoteDetails.pricePerWord.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Adicional:</span>
                              <span>R$ 0,00</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Desconto:</span>
                              <span>0,00</span>
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
                      onClick={async () => {
                        if (activeStep === 0) {
                          const isValid = await form.trigger();
                          if (isValid) {
                            setActiveStep(1);
                          }
                        } else if (activeStep === 1 && fileInfo && !fileInfo.isProcessing) {
                          setActiveStep(2);
                        }
                      }}
                      disabled={activeStep === 1 && (!fileInfo || fileInfo.isProcessing)}
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
    </>
  );
};

export default NewQuote;