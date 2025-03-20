import { useState, useEffect } from "react";
import { Plus, Minus, Eye, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeepLService } from "@/services/deepl";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface TranslatorOrder {
  id: string;                // ID local ou temporário
  request_id?: string;       // ID real da tabela translationrequests (chave primária)
  number: string;
  date: string;
  status: "Disponível" | "Em Andamento" | "Concluído" | "Contratado";
  service: {
    type: string;
    languages: string;
    direction?: string;
    deadline?: string;
  };
  documents: {
    name: string;
    size: string;
    path?: string;
  }[];
  pricing: {
    basePrice?: number;
    additional?: number;
    discount?: number;
    total: number;
  };
  translated_file_path?: string; 
  translation_status?: string;
  user_id?: string;         // ID do usuário que criou o pedido
}

interface TranslatorOrderCardProps {
  order: TranslatorOrder;
  onUpload?: (files: FileList) => void;
  variant?: "available" | "inProgress" | "history";
  onPreviewClick?: (filePath: string) => void;
  isLoading?: boolean;
  onAcceptOrder?: (orderId: string) => void;
  acceptingOrder?: boolean;
  onWorkspaceClick?: () => void;
}

const getStatusColor = (status: TranslatorOrder["status"]) => {
  switch (status) {
    case "Contratado":
      return "text-green-600";
    case "Disponível":
      return "text-orange-600";
    case "Em Andamento":
      return "text-yellow-600";
    case "Concluído":
      return "text-green-600";
    default:
      return "text-gray-500";
  }
};

export function TranslatorOrderCard({ 
  order, 
  onUpload, 
  variant = "available", 
  onPreviewClick, 
  isLoading = false,
  onAcceptOrder,
  acceptingOrder = false,
  onWorkspaceClick 
}: TranslatorOrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedFileInfo, setTranslatedFileInfo] = useState<{ url: string, name: string } | null>(null);
  const { toast } = useToast();

  // Debug: Imprime o objeto order completo para verificar sua estrutura
  useEffect(() => {
    console.log("TranslatorOrderCard - Estrutura completa do pedido:", JSON.stringify(order, null, 2));
  }, [order]);

  useEffect(() => {
    const fetchTranslatedFile = async () => {
      if (order.translated_file_path) {
        try {
          // Correção: getPublicUrl() não retorna um objeto com 'error', apenas 'data'
          const { data } = await supabase
            .storage
            .from('arquivos_traduzidos')
            .getPublicUrl(order.translated_file_path);
          
          // Extrair o nome do arquivo do caminho
          const fileName = order.translated_file_path.split('/').pop() || 'arquivo_traduzido';
          
          setTranslatedFileInfo({
            url: data.publicUrl,
            name: fileName
          });
          
          console.log('Arquivo traduzido disponível:', data.publicUrl);
        } catch (error) {
          console.error('Erro ao processar arquivo traduzido:', error);
        }
      }
    };

    fetchTranslatedFile();
  }, [order.translated_file_path]);

  const handleDownloadTranslatedFile = () => {
    if (translatedFileInfo?.url) {
      const link = document.createElement('a');
      link.href = translatedFileInfo.url;
      link.download = translatedFileInfo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleTranslateWithAI = async () => {
    try {
      setTranslating(true);
      toast({
        title: "Iniciando tradução",
        description: "Conectando à API DeepL para tradução automática",
      });

      // Criar consulta para obter os dados atualizados diretamente do banco de dados
      const getRequestDetails = async () => {
        // Se tivermos o request_id, vamos usá-lo diretamente
        if (order.request_id) {
          const { data, error } = await supabase
            .from('translationrequests')
            .select('*')
            .eq('request_id', order.request_id)
            .single();
            
          if (error) {
            console.error('Erro ao buscar detalhes do pedido:', error);
            return null;
          }
          
          console.log('Dados do pedido obtidos do banco:', data);
          return data;
        }
        return null;
      };
      
      // Obter detalhes atualizados do pedido
      const requestDetails = await getRequestDetails();
      // Usar o ID real do banco de dados se disponível
      const effectiveRequestId = requestDetails?.request_id || order.request_id || order.id;
      
      console.log('ID efetivo para processamento:', effectiveRequestId);
      
      if (!effectiveRequestId) {
        throw new Error('Não foi possível determinar o ID do pedido para processamento');
      }

      const [sourceLang, targetLang] = order.service.languages
        .split(" para ")
        .map(lang => lang.toLowerCase());
        
      const { data: fileData, error: fileError } = await supabase.storage
        .from('arquivos_carregados')
        .download(order.documents[0].path || '');
      
      if (fileError || !fileData) {
        throw new Error('Não foi possível baixar o arquivo original');
      }

      const file = new File([fileData], order.documents[0].name, {
        type: fileData.type,
      });
      
      toast({
        title: "Tradução iniciada",
        description: "Enviando documento para o DeepL. Isso pode levar alguns momentos.",
      });

      const translatedBlob = await DeepLService.translateDocument({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        file: file,
        filename: order.documents[0].name
      }, (status) => {
        if (status.status === 'translating') {
          toast({
            title: "Tradução em andamento",
            description: status.secondsRemaining 
              ? `Tempo restante estimado: ${status.secondsRemaining}s` 
              : "Processando documento...",
          });
        }
      });

      const originalFileName = order.documents[0].name;
      const fileExtension = originalFileName.includes('.') 
        ? `.${originalFileName.split('.').pop()}`
        : '';
      const fileNameWithoutExtension = originalFileName.includes('.')
        ? originalFileName.substring(0, originalFileName.lastIndexOf('.'))
        : originalFileName;
      
      const sanitizeFileName = (name: string) => {
        return name
          .normalize('NFD')                     // Normaliza para decomposição Unicode
          .replace(/[\u0300-\u036f]/g, '')      // Remove acentos
          .replace(/\s+/g, '_');                // Substitui espaços por underscores
      };
      
      const sanitizedFileName = sanitizeFileName(fileNameWithoutExtension);
      const sanitizedTargetLang = sanitizeFileName(targetLang);
      
      const translatedFileName = `${sanitizedFileName}_${sanitizedTargetLang}${fileExtension}`;
      
      // Construir o caminho do arquivo com o ID efetivo
      const translatedFilePath = `traduzidos/${effectiveRequestId}/${translatedFileName}`;
      
      console.log(`Caminho do arquivo traduzido: ${translatedFilePath}`);
      
      const translatedFile = new File([translatedBlob], translatedFileName, {
        type: translatedBlob.type || 'application/octet-stream'
      });
      
      const { error: uploadError } = await supabase.storage
        .from('arquivos_traduzidos')
        .upload(translatedFilePath, translatedFile, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw new Error(`Erro ao salvar o documento traduzido: ${uploadError.message}`);
      }
      
      if (translatedBlob.size < 100) {
        console.warn("AVISO: Tamanho do documento traduzido é muito pequeno, pode ser um erro:", translatedBlob.size);
      }
      console.log(`Arquivo traduzido (${translatedBlob.size} bytes) salvo em ${translatedFilePath}`);
      
      // Atualizar o registro usando a chave primária correta
      const updateData = {
        translated_file_path: translatedFilePath,
        translation_status: 'auto_translated'
      };
      
      console.log("Atualizando registro com os seguintes dados:", {
        request_id: effectiveRequestId,
        data: updateData
      });
      
      // Ajuste na consulta de atualização para usar o ID correto e adicionar logging detalhado
      const { data: updateResult, error: updateError } = await supabase
        .from('translationrequests')
        .update(updateData)
        .eq('request_id', effectiveRequestId)
        .select();
          
      if (updateError) {
        console.error("Detalhes completos do erro de atualização:", updateError);
        throw new Error(`Erro ao atualizar o status da tradução: ${updateError.message}`);
      }
      
      console.log("Resultado da atualização:", updateResult);
      
      // Atualize o estado local com o novo arquivo traduzido
      setTranslatedFileInfo({
        url: supabase.storage.from('arquivos_traduzidos').getPublicUrl(translatedFilePath).data.publicUrl,
        name: translatedFileName
      });

      toast({
        title: "Tradução concluída",
        description: "O documento foi traduzido com sucesso e está pronto para revisão.",
      });

    } catch (error) {
      console.error('Erro ao traduzir com IA:', error);
      toast({
        variant: "destructive",
        title: "Erro ao traduzir",
        description: error instanceof Error ? error.message : "Não foi possível realizar a tradução com IA.",
      });
    } finally {
      setTranslating(false);
    }
  };

  // Adicionando uma renderização condicional mais clara para o botão de download
  const renderTranslatedFileSection = () => {
    if (!translatedFileInfo) return null;
    
    return (
      <div className="mt-4">
        <h3 className="font-medium mb-2 text-blue-600">Arquivo Traduzido</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full bg-blue-100 hover:bg-blue-200"
                onClick={() => {
                  window.open(translatedFileInfo.url, '_blank');
                }}
              >
                <Eye className="h-4 w-4 text-blue-600" />
              </Button>
              <span className="text-sm font-medium text-blue-800">{translatedFileInfo.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
              onClick={handleDownloadTranslatedFile}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
          {order.translation_status === 'auto_translated' && (
            <div className="text-xs text-blue-600 italic pl-2">
              Traduzido automaticamente via DeepL
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Orçamento número: <span className="font-medium">{order.number}</span></span>
            <span className="text-sm text-gray-600">Data: <span className="font-medium">{order.date}</span></span>
            <span className={`font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400"
          >
            {expanded ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {expanded && (
          <div className={`grid ${expanded ? 'grid-cols-2 gap-4' : 'grid-cols-1'} mt-4`}>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Serviço</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{order.service.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Idiomas:</span>
                    <span className="font-medium">{order.service.languages}</span>
                  </div>
                  {order.service.direction && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Direção:</span>
                      <span className="font-medium">{order.service.direction}</span>
                    </div>
                  )}
                  {order.service.deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prazo:</span>
                      <span className="font-medium">{order.service.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Documentos</h3>
                <div className="space-y-2">
                  {order.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewClick?.(doc.path || '');
                          }}
                          disabled={isLoading || !doc.path}
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{doc.size}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {renderTranslatedFileSection()}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Preço</h3>
                <div className="space-y-1">
                  {order.pricing.basePrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço base:</span>
                      <span className="font-medium">R$ {order.pricing.basePrice.toFixed(2)}</span>
                    </div>
                  )}
                  {order.pricing.additional && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adicional:</span>
                      <span className="font-medium">R$ {order.pricing.additional.toFixed(2)}</span>
                    </div>
                  )}
                  {order.pricing.discount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Desconto:</span>
                      <span className="font-medium">R$ {order.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>R$ {order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {variant === "available" && (
                <div className="flex justify-end">
                  <Button 
                    className="bg-[#23B0DE] hover:bg-[#198BAC] text-white"
                    onClick={() => onAcceptOrder?.(order.id)}
                    disabled={acceptingOrder}
                  >
                    {acceptingOrder ? "Processando..." : "Aceitar"}
                  </Button>
                </div>
              )}

              {variant === "inProgress" && (
                <div className="space-y-2">
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files && onUpload) onUpload(files);
                        };
                        input.click();
                      }}
                    >
                      Enviar arquivos
                    </Button>
                    {onWorkspaceClick && (
                      <Button 
                        className="bg-[#23B0DE] hover:bg-[#198BAC] text-white"
                        onClick={onWorkspaceClick}
                      >
                        Abrir Workspace
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
