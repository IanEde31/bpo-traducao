import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeepLService } from "@/services/deepl";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Save, ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipo para armazenar os detalhes da tradução
interface TranslationDetails {
  id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  source_language: string;
  target_language: string;
  word_count: number;
  price_per_word: number;
  total_price: number;
  status: string;
  delivery_date: string;
  created_at: string;
  client_id: string;
  translator_id: string;
  content?: string;
  translated_content?: string;
  service_type?: string;
}

export function TranslatorWorkspace() {
  const { requestId } = useParams<{ requestId: string }>();
  const [translation, setTranslation] = useState<TranslationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [translatedFileUrl, setTranslatedFileUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [autosaveMessage, setAutosaveMessage] = useState("");
  const [translateStatus, setTranslateStatus] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar detalhes da tradução
  useEffect(() => {
    async function fetchTranslationDetails() {
      try {
        if (!requestId) return;

        // Buscar os dados da requisição de tradução na tabela correta
        const { data, error } = await supabase
          .from("translationrequests")
          .select("*")
          .eq("request_id", requestId)
          .single();

        if (error) throw error;

        setTranslation(data);

        // Buscar o arquivo para pré-visualização
        if (data.file_path) {
          const { data: fileData, error: fileError } = await supabase.storage
            .from("arquivos_carregados")
            .createSignedUrl(data.file_path, 3600);

          if (fileError) throw fileError;
          setFileUrl(fileData.signedUrl);

          // Tentar obter o conteúdo do arquivo se for um tipo de texto
          await loadFileContent(data.file_path, data.file_name);
        }

      } catch (error) {
        console.error("Erro ao buscar detalhes da tradução:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os detalhes da tradução.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTranslationDetails();
  }, [requestId, toast]);

  // Função para carregar o conteúdo do arquivo
  async function loadFileContent(filePath: string, fileName: string) {
    try {
      // Verificar se é um tipo de arquivo de texto
      const textFileExtensions = [".txt", ".md", ".html", ".xml", ".json", ".csv"];
      const hasTextExtension = textFileExtensions.some(ext => 
        fileName.toLowerCase().endsWith(ext)
      );

      if (!hasTextExtension) {
        console.log("Arquivo não é do tipo texto, apenas visualização disponível");
        return;
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from("arquivos_carregados")
        .download(filePath);

      if (fileError) throw fileError;

      const text = await fileData.text();
      setContent(text);
    } catch (error) {
      console.error("Erro ao carregar conteúdo do arquivo:", error);
    }
  }

  // Função para salvar o progresso da tradução
  const saveTranslation = async () => {
    if (!translation || !translatedContent.trim()) return;
    
    try {
      setSaveLoading(true);
      
      const { error } = await supabase
        .from("translation_progress")
        .upsert({
          translation_id: translation.request_id,
          translated_content: translatedContent,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: "translation_id"
        });

      if (error) throw error;
      
      // Atualizar mensagem de autosave
      const now = new Date();
      setAutosaveMessage(`Último salvamento: ${formatDistanceToNow(now, { 
        addSuffix: true,
        locale: ptBR
      })}`);

    } catch (error) {
      console.error("Erro ao salvar tradução:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o progresso da tradução.",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Configurar autosave
  useEffect(() => {
    // Cancelar o timer anterior se existir
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Configurar novo timer para autosave (a cada 30 segundos)
    if (translatedContent.trim() && translation) {
      autosaveTimerRef.current = setTimeout(() => {
        saveTranslation();
      }, 30000); // 30 segundos
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [translatedContent, translation]);

  // Função para traduzir com IA - correção objetiva
  const translateWithAI = async () => {
    if (!translation) return;

    try {
      setTranslating(true);
      toast({
        title: "Tradução iniciada",
        description: "Processando documento...",
      });

      // Extrair idiomas
      const sourceLang = translation.source_language.toLowerCase();
      const targetLang = translation.target_language.toLowerCase();

      console.log(`Preparando tradução: ${sourceLang} -> ${targetLang}`);

      // Download do arquivo original
      const { data: fileData, error: fileError } = await supabase.storage
        .from("arquivos_carregados")
        .download(translation.file_path);

      if (fileError) {
        throw new Error(`Erro ao baixar arquivo original: ${fileError.message}`);
      }

      if (!fileData) {
        throw new Error("Não foi possível obter o arquivo original");
      }

      // Criar um arquivo com o conteúdo baixado
      const fileName = translation.file_name;
      const file = new File([fileData], fileName, {
        type: fileData.type,
      });

      console.log(`Arquivo preparado: ${fileName}, tamanho: ${file.size} bytes`);

      // Traduzir o documento usando DeepL
      const translatedDoc = await DeepLService.translateDocument(
        {
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          file: file,
          filename: fileName,
        },
        (status) => {
          console.log("Status da tradução:", status);
          if (status.status === "translating" && status.secondsRemaining) {
            setTranslateStatus(`Traduzindo... ${status.secondsRemaining}s restantes`);
          } else if (status.status === "translating") {
            setTranslateStatus("Traduzindo...");
          } else if (status.status === "done" && status.errorMessage) {
            setTranslateStatus(`Erro: ${status.errorMessage}`);
          }
        }
      );

      console.log("Documento traduzido recebido, tamanho:", translatedDoc.size);

      // Nome extremamente simplificado para testar upload - sem estrutura de diretórios
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 10000);
      const fileExt = fileName.includes('.') ? '.' + fileName.split('.').pop() : '';
      const translatedFileName = `file_${timestamp}_${randomNum}${fileExt}`;

      // Caminho SEM estrutura de pasta - diretamente na raiz do bucket
      const translatedFilePath = translatedFileName;
      console.log("Salvando arquivo com nome simplificado:", translatedFilePath);

      // Upload do arquivo traduzido - simplificado ao máximo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("arquivos_traduzidos")
        .upload(translatedFilePath, translatedDoc);

      if (uploadError) {
        console.error("Erro de upload (detalhado):", JSON.stringify(uploadError));
        throw new Error(`Erro ao fazer upload do documento traduzido: ${uploadError.message}`);
      }

      console.log("Upload realizado com sucesso:", uploadData);

      // Criar URL assinada
      const { data: urlData } = await supabase.storage
        .from("arquivos_traduzidos")
        .createSignedUrl(translatedFilePath, 3600);
      
      // Atualizar a URL do arquivo traduzido para visualização
      if (urlData?.signedUrl) {
        setTranslatedFileUrl(urlData.signedUrl);
        console.log("URL assinada criada:", urlData.signedUrl);
      } else {
        console.warn("Não foi possível criar URL assinada");
      }

      // Se for um arquivo de texto, tentar extrair o conteúdo
      const textFileExtensions = [".txt", ".md", ".html", ".xml", ".json", ".csv"];
      const hasTextExtension = textFileExtensions.some(ext => 
        translatedFileName.toLowerCase().endsWith(ext)
      );

      if (hasTextExtension) {
        try {
          const text = await translatedDoc.text();
          setTranslatedContent(text);
          console.log("Conteúdo do texto extraído");
        } catch (e) {
          console.warn("Não foi possível extrair texto do documento:", e);
        }
      }

      // Atualizar status
      toast({
        title: "Tradução concluída",
        description: "Documento traduzido com sucesso",
      });
      setTranslateStatus("");

    } catch (error) {
      console.error("Erro na tradução:", error);
      toast({
        variant: "destructive",
        title: "Erro na tradução",
        description: error instanceof Error ? error.message : "Erro desconhecido durante a tradução",
      });
      setTranslateStatus("Falha na tradução");
    } finally {
      setTranslating(false);
    }
  };

  // Função para finalizar tradução - sem redirecionamento
  const submitTranslation = async () => {
    if (!translation) return;
    
    try {
      setSaveLoading(true);
      
      // Verificar arquivo traduzido
      if (!translatedFileUrl && !translatedContent) {
        toast({
          variant: "destructive",
          title: "Documento não traduzido",
          description: "Por favor, traduza o documento antes de finalizar",
        });
        setSaveLoading(false);
        return;
      }
      
      // Definir o caminho para o bucket
      let translatedFilePath = "";
      
      // Se temos conteúdo mas não arquivo, criar o arquivo
      if (!translatedFileUrl && translatedContent) {
        // Nome simplificado para o arquivo
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 10000);
        const fileName = `texto_${timestamp}_${randomNum}.txt`;
        const fileBlob = new Blob([translatedContent], { type: 'text/plain' });
        
        // Caminho simplificado - apenas o nome do arquivo
        translatedFilePath = fileName;
        
        console.log("Salvando texto em:", translatedFilePath);
        
        // Upload simplificado ao máximo
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("arquivos_traduzidos")
          .upload(translatedFilePath, fileBlob);
          
        if (uploadError) {
          console.error("Erro de upload (detalhado):", JSON.stringify(uploadError));
          throw new Error("Erro ao salvar arquivo texto: " + uploadError.message);
        }
        
        console.log("Upload de texto realizado com sucesso:", uploadData);
          
        // Obter URL
        const { data: urlData } = await supabase.storage
          .from("arquivos_traduzidos")
          .createSignedUrl(translatedFilePath, 3600);
          
        if (urlData) {
          setTranslatedFileUrl(urlData.signedUrl);
        }
      } else if (translatedFileUrl) {
        // Extrair o caminho do arquivo da URL assinada
        // URL exemplo: https://xxx.supabase.co/storage/v1/object/arquivos_traduzidos/{caminho}
        const urlParts = translatedFileUrl.split('arquivos_traduzidos/');
        if (urlParts.length > 1) {
          translatedFilePath = urlParts[1].split('?')[0]; // Remove parâmetros da URL
        } else {
          // Fallback - criar novo nome para referência no banco se não conseguir extrair da URL
          const timestamp = new Date().getTime();
          const randomNum = Math.floor(Math.random() * 10000);
          translatedFilePath = `arquivo_${timestamp}_${randomNum}.pdf`;
        }
      }
      
      console.log("Caminho do arquivo para inserção na tabela translations:", translatedFilePath);
      
      // Registrar tradução
      const { error: insertError } = await supabase
        .from("translations")
        .insert({
          request_id: translation.request_id,
          translator_id: translation.translator_id,
          translated_file_path: translatedFilePath,
          completed_at: new Date().toISOString(),
        });
        
      if (insertError) {
        console.error("Erro ao inserir tradução:", JSON.stringify(insertError));
        throw insertError;
      }
      
      // Atualizar status
      const { error: updateError } = await supabase
        .from("translationrequests")
        .update({ 
          status: "Concluído",
          translated_file_path: translatedFilePath 
        })
        .eq("request_id", translation.request_id);
        
      if (updateError) {
        console.error("Erro ao atualizar status:", JSON.stringify(updateError));
        throw updateError;
      }
      
      toast({
        title: "Tradução finalizada",
        description: "Tradução concluída e salva com sucesso",
      });
      
      // Sem redirecionamento automático - previne tela branca
      
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar",
        description: error instanceof Error ? error.message : "Falha ao finalizar tradução",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Workspace de Tradução</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : translation ? (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">{translation.file_name}</h2>
                <p className="text-sm text-gray-500">
                  {translation.source_language} para {translation.target_language} • 
                  {translation.word_count} palavras • 
                  Prazo: {new Date(translation.delivery_date).toLocaleDateString()}
                </p>
              </div>
              
              {/* Botão Traduzir com IA em destaque */}
              <Button
                onClick={translateWithAI}
                disabled={translating}
                className="bg-[#23B0DE] hover:bg-[#198BAC] text-white w-full lg:w-auto"
              >
                <Wand2 className={`h-4 w-4 mr-2 ${translating ? 'animate-spin' : ''}`} />
                {translating ? "Traduzindo..." : "Traduzir com IA"}
              </Button>
            </div>

            <div className="mt-2">
              <div className="flex justify-end text-xs text-gray-500">
                <span>{autosaveMessage}</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Documento Original */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Documento Original</h3>
              
              <Tabs defaultValue="preview">
                <TabsList className="mb-2">
                  <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
                  <TabsTrigger value="text">Texto</TabsTrigger>
                  <TabsTrigger 
                    value="translated" 
                    disabled={!translatedFileUrl && !translatedContent}
                  >
                    Documento Traduzido
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="h-[500px] overflow-auto border rounded-md">
                  {fileUrl ? (
                    translation.file_name.endsWith(".pdf") ? (
                      <iframe 
                        src={fileUrl} 
                        className="w-full h-full" 
                        title="PDF Preview"
                      />
                    ) : translation.file_name.match(/\.(jpe?g|png|gif|bmp|webp)$/i) ? (
                      <img 
                        src={fileUrl} 
                        alt="Document preview" 
                        className="max-w-full h-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p>Visualização não disponível para este tipo de arquivo.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => window.open(fileUrl, '_blank')}
                          >
                            Abrir arquivo externamente
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>Visualização não disponível</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="text">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="O conteúdo do documento original aparecerá aqui se for um arquivo de texto."
                    className="h-[500px] resize-none"
                    readOnly={!content}
                  />
                </TabsContent>
                
                {/* Nova aba para o documento traduzido */}
                <TabsContent value="translated" className="h-[500px] overflow-auto border rounded-md">
                  {translatedFileUrl ? (
                    translation.file_name.endsWith(".pdf") || 
                    translation.file_name.endsWith(".docx") || 
                    translation.file_name.endsWith(".txt") ? (
                      <iframe 
                        src={translatedFileUrl} 
                        className="w-full h-full" 
                        title="Translated Document Preview"
                      />
                    ) : translation.file_name.match(/\.(jpe?g|png|gif|bmp|webp)$/i) ? (
                      <img 
                        src={translatedFileUrl} 
                        alt="Translated document preview" 
                        className="max-w-full h-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p>Visualização da tradução não disponível para este tipo de arquivo.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => window.open(translatedFileUrl, '_blank')}
                          >
                            Abrir arquivo traduzido externamente
                          </Button>
                        </div>
                      </div>
                    )
                  ) : translatedContent ? (
                    <div className="p-4 whitespace-pre-wrap">
                      {translatedContent}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>Ainda não há documento traduzido disponível</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Tradução */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Tradução</h3>
              
              <Tabs defaultValue="edit">
                <TabsList className="mb-2">
                  <TabsTrigger value="edit">Editar</TabsTrigger>
                  <TabsTrigger value="preview" disabled={!translatedContent.trim()}>Pré-visualização</TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit">
                  <Textarea
                    ref={contentRef}
                    value={translatedContent}
                    onChange={(e) => setTranslatedContent(e.target.value)}
                    placeholder="Digite ou cole a tradução aqui. Clique em 'Traduzir com IA' para gerar uma tradução automática."
                    className="h-[500px] resize-none"
                  />
                  
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button
                      variant="outline"
                      onClick={saveTranslation}
                      disabled={saveLoading || !translatedContent.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveLoading ? "Salvando..." : "Salvar progresso"}
                    </Button>
                    
                    <Button
                      onClick={submitTranslation}
                      disabled={saveLoading || !translatedContent.trim()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Finalizar e Enviar
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="h-[500px] overflow-auto border rounded-md p-4">
                  <div className="whitespace-pre-wrap">
                    {translatedContent || "Nenhum conteúdo traduzido ainda."}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <p>Tradução não encontrada ou você não tem permissão para acessá-la.</p>
        </div>
      )}
    </div>
  );
}

export default TranslatorWorkspace;
