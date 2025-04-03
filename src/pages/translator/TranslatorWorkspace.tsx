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

// Tipo para armazenar informações de arquivo
interface FileInfo {
  originalName: string;
  storagePath: string;
  fileType: string;
  wordCount: number;
}

// Tipo para armazenar os detalhes da tradução
interface TranslationDetails {
  id: string;
  request_id: string;
  file_name?: string; // Campo legado
  file_path?: string; // Campo legado
  source_language: string;
  target_language: string;
  word_count?: number; // Campo legado
  total_word_count?: number; // Novo campo
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
  translated_file_path?: string;
  files?: FileInfo[]; // Novo campo para múltiplos arquivos
  file_count?: number; // Novo campo
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
  // Estados para controle de múltiplos arquivos
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [filesUrls, setFilesUrls] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar detalhes da tradução
  useEffect(() => {
    async function fetchTranslationDetails() {
      try {
        if (!requestId) return;

        console.log("=== INICIANDO CARREGAMENTO DO WORKSPACE ===");
        console.log("ID da requisição:", requestId);

        // Buscar os dados da requisição de tradução na tabela correta
        const { data, error } = await supabase
          .from("translationrequests")
          .select("*")
          .eq("request_id", requestId)
          .single();

        if (error) throw error;

        console.log("Dados da requisição obtidos:", data);
        console.log("Campo translated_file_path:", data.translated_file_path);
        
        setTranslation(data);

        // Verificar se temos múltiplos arquivos (novo formato) ou um único arquivo (formato legado)
        if (data.files && data.files.length > 0) {
          console.log("Formato novo detectado com múltiplos arquivos:", data.files.length);
          
          // Criar URLs assinadas para todos os arquivos
          const urlsObj: {[key: string]: string} = {};
          
          // Processar o primeiro arquivo inicialmente
          const firstFile = data.files[0];
          setCurrentFileName(firstFile.originalName);
          
          // Criar URLs assinadas para todos os arquivos
          await Promise.all(data.files.map(async (file: FileInfo, index: number) => {
            try {
              const { data: fileData, error: fileError } = await supabase.storage
                .from("arquivos_carregados")
                .createSignedUrl(file.storagePath, 3600);

              if (fileError) throw fileError;
              urlsObj[file.storagePath] = fileData.signedUrl;
              
              // Se for o primeiro arquivo, carregar seu conteúdo
              if (index === 0) {
                setFileUrl(fileData.signedUrl);
                await loadFileContent(file.storagePath, file.originalName);
              }
            } catch (e) {
              console.error(`Erro ao processar arquivo ${file.originalName}:`, e);
            }
          }));
          
          setFilesUrls(urlsObj);
        } else if (data.file_path) {
          // Formato legado com um único arquivo
          console.log("Formato legado detectado com um único arquivo");
          setCurrentFileName(data.file_name || "Arquivo");
          
          const { data: fileData, error: fileError } = await supabase.storage
            .from("arquivos_carregados")
            .createSignedUrl(data.file_path, 3600);

          if (fileError) throw fileError;
          setFileUrl(fileData.signedUrl);

          // Tentar obter o conteúdo do arquivo se for um tipo de texto
          await loadFileContent(data.file_path, data.file_name);
        }

        // Verificar se já existe um arquivo traduzido para este pedido
        if (data.translated_file_path) {
          console.log("=== ARQUIVO TRADUZIDO ENCONTRADO ===");
          console.log("Caminho do arquivo traduzido:", data.translated_file_path);
          
          try {
            // Para compatibilidade com diferentes formatos de caminho, garantir que o caminho está normalizado
            // Em alguns casos pode ser apenas o nome do arquivo, em outros pode incluir a estrutura de diretórios
            const translatedPath = data.translated_file_path;
            
            console.log("Tentando criar URL assinada para:", translatedPath);
            
            // Criar URL assinada para o arquivo traduzido
            const { data: translatedUrlData, error: translatedUrlError } = await supabase.storage
              .from("arquivos_traduzidos")
              .createSignedUrl(translatedPath, 3600);
            
            if (translatedUrlError) {
              console.error("ERRO ao criar URL assinada para o documento traduzido:", translatedUrlError);
              
              // Para compatibilidade com formatos antigos, tentar com "traduzidos/" prefixado se ainda não tem
              if (!translatedPath.startsWith("traduzidos/") && !translatedUrlData) {
                console.log("Tentando formato alternativo com prefixo 'traduzidos/'");
                const alternativePath = `traduzidos/${data.request_id}/${translatedPath.split('/').pop()}`;
                
                const { data: altUrlData, error: altUrlError } = await supabase.storage
                  .from("arquivos_traduzidos")
                  .createSignedUrl(alternativePath, 3600);
                  
                if (!altUrlError && altUrlData) {
                  console.log("URL alternativa criada com sucesso:", altUrlData.signedUrl);
                  setTranslatedFileUrl(altUrlData.signedUrl);
                  
                  // Atualizar o caminho no banco para o formato padronizado
                  try {
                    const { error: updateError } = await supabase
                      .from("translationrequests")
                      .update({ translated_file_path: alternativePath })
                      .eq("request_id", data.request_id);
                      
                    if (updateError) {
                      console.error("Erro ao atualizar caminho para formato padronizado:", updateError);
                    } else {
                      console.log("Caminho atualizado para formato padronizado:", alternativePath);
                    }
                  } catch (e) {
                    console.error("Erro ao tentar atualizar caminho para formato padronizado:", e);
                  }
                }
              }
            } else if (translatedUrlData) {
              console.log("URL assinada do arquivo traduzido criada com sucesso:", translatedUrlData.signedUrl);
              setTranslatedFileUrl(translatedUrlData.signedUrl);
              
              // Se for um arquivo de texto, tentar carregar seu conteúdo
              const textFileExtensions = [".txt", ".md", ".html", ".xml", ".json", ".csv"];
              const hasTextExtension = textFileExtensions.some(ext => 
                data.translated_file_path.toLowerCase().endsWith(ext)
              );
              
              if (hasTextExtension) {
                try {
                  console.log("Tentando baixar conteúdo do arquivo de texto traduzido");
                  const { data: translatedFileData, error: downloadError } = await supabase.storage
                    .from("arquivos_traduzidos")
                    .download(translatedPath);
                    
                  if (downloadError) {
                    console.error("ERRO ao baixar conteúdo do arquivo traduzido:", downloadError);
                  } else if (translatedFileData) {
                    const text = await translatedFileData.text();
                    setTranslatedContent(text);
                    console.log("Conteúdo do documento traduzido carregado com sucesso");
                  } else {
                    console.warn("Download do arquivo traduzido não retornou dados");
                  }
                } catch (e) {
                  console.error("ERRO ao processar o conteúdo do documento traduzido:", e);
                }
              }
            } else {
              console.warn("Não foi possível obter URL assinada - retorno vazio");
            }
          } catch (e) {
            console.error("ERRO ao processar o documento traduzido:", e);
          }
        } else {
          console.log("Nenhum arquivo traduzido encontrado para esta requisição");
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

  // Função para alternar entre arquivos
  const changeCurrentFile = async (index: number) => {
    if (!translation || !translation.files || index >= translation.files.length) return;
    
    try {
      setCurrentFileIndex(index);
      const file = translation.files[index];
      
      // Verificar se o arquivo tem as propriedades necessárias
      if (!file || !file.storagePath) {
        console.error("Arquivo inválido ou sem caminho de armazenamento");
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Informações do arquivo incompletas ou inválidas.",
        });
        return;
      }
      
      // Definir o nome do arquivo com fallback seguro
      setCurrentFileName(file.originalName || 'Arquivo sem nome');
      
      // Verificar se já temos a URL do arquivo
      if (filesUrls[file.storagePath]) {
        setFileUrl(filesUrls[file.storagePath]);
      } else {
        // Criar URL assinada para o arquivo
        const { data: fileData, error: fileError } = await supabase.storage
          .from("arquivos_carregados")
          .createSignedUrl(file.storagePath, 3600);

        if (fileError) throw fileError;
        
        // Atualizar o objeto de URLs
        setFilesUrls(prev => ({
          ...prev,
          [file.storagePath]: fileData.signedUrl
        }));
        
        setFileUrl(fileData.signedUrl);
      }
      
      // Carregar conteúdo do arquivo
      await loadFileContent(file.storagePath, file.originalName || 'Arquivo sem nome');
      
    } catch (error) {
      console.error("Erro ao alternar entre arquivos:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o arquivo selecionado.",
      });
    }
  };

  // Função para carregar o conteúdo do arquivo
  async function loadFileContent(filePath: string, fileName: string) {
    try {
      // Verificar se temos um caminho de arquivo válido
      if (!filePath) {
        console.log("Caminho do arquivo não fornecido");
        setContent(""); // Limpar conteúdo anterior
        return;
      }
      
      // Verificar se é um tipo de arquivo de texto
      const textFileExtensions = [".txt", ".md", ".html", ".xml", ".json", ".csv"];
      const hasTextExtension = fileName && textFileExtensions.some(ext => 
        fileName.toLowerCase().endsWith(ext)
      );

      if (!hasTextExtension) {
        console.log("Arquivo não é do tipo texto, apenas visualização disponível");
        setContent(""); // Limpar conteúdo anterior
        return;
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from("arquivos_carregados")
        .download(filePath);

      if (fileError) throw fileError;
      
      if (!fileData) {
        console.log("Nenhum dado retornado para o arquivo");
        setContent("");
        return;
      }

      const text = await fileData.text();
      setContent(text);
    } catch (error) {
      console.error("Erro ao carregar conteúdo do arquivo:", error);
      setContent(""); // Limpar conteúdo em caso de erro
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

      console.log(`=== INICIANDO TRADUÇÃO COM IA ===`);
      console.log(`Preparando tradução: ${sourceLang} -> ${targetLang}`);
      console.log(`ID da requisição: ${translation.request_id}`);

      // Verificar se temos um caminho de arquivo válido
      if (!translation.file_path && (!translation.files || translation.files.length === 0)) {
        throw new Error("Não foi possível encontrar o arquivo para tradução");
      }

      // Determinar o caminho do arquivo a ser usado
      const filePath = translation.file_path || 
        (translation.files && translation.files.length > 0 ? translation.files[currentFileIndex].storagePath : null);

      if (!filePath) {
        throw new Error("Caminho do arquivo inválido");
      }

      // Download do arquivo original
      const { data: fileData, error: fileError } = await supabase.storage
        .from("arquivos_carregados")
        .download(filePath);

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

      // Modificado: Usar a mesma estrutura de pastas que o TranslatorOrderCard
      const translatedFilePath = `traduzidos/${translation.request_id}/${translatedFileName}`;
      console.log("Salvando arquivo com estrutura de pastas padrão:", translatedFilePath);

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

      // IMPORTANTE: Atualizar o campo translated_file_path na tabela translationrequests
      console.log("=== ATUALIZANDO REGISTRO NO BANCO DE DADOS ===");
      console.log("ID da requisição para atualização:", translation.request_id);
      console.log("Caminho do arquivo traduzido:", translatedFilePath);
      
      const { data: updateData, error: updateError } = await supabase
        .from("translationrequests")
        .update({ 
          translated_file_path: translatedFilePath 
        })
        .eq("request_id", translation.request_id)
        .select();

      if (updateError) {
        console.error("ERRO ao atualizar registro:", updateError);
        throw new Error(`Falha ao atualizar registro com o caminho do arquivo traduzido: ${updateError.message}`);
      }
      
      console.log("Registro atualizado com sucesso:", updateData);
      
      // Atualizar o objeto translation local com o novo caminho
      setTranslation(prevTranslation => {
        if (prevTranslation) {
          return {
            ...prevTranslation,
            translated_file_path: translatedFilePath
          };
        }
        return prevTranslation;
      });

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
      
      console.log("=== INICIANDO FINALIZAÇÃO DA TRADUÇÃO ===");
      console.log("ID da requisição:", translation.request_id);
      
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
        
        // Usar estrutura padronizada de pastas
        translatedFilePath = `traduzidos/${translation.request_id}/${fileName}`;
        
        console.log("Salvando texto com estrutura de pastas padrão:", translatedFilePath);
        
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
      
      console.log("Caminho do arquivo para inserção nas tabelas:", translatedFilePath);
      
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
      
      console.log("Registro inserido com sucesso na tabela translations");
      
      // Atualizar status e o caminho do arquivo traduzido na tabela translationrequests
      console.log("Atualizando status e caminho na tabela translationrequests");
      const { data: updateData, error: updateError } = await supabase
        .from("translationrequests")
        .update({ 
          status: "Concluído",
          translated_file_path: translatedFilePath 
        })
        .eq("request_id", translation.request_id)
        .select();
        
      if (updateError) {
        console.error("Erro ao atualizar status:", JSON.stringify(updateError));
        throw updateError;
      }
      
      console.log("Status e caminho atualizados com sucesso:", updateData);
      
      // Atualizar o objeto translation local
      setTranslation(prevTranslation => {
        if (prevTranslation) {
          return {
            ...prevTranslation,
            status: "Concluído",
            translated_file_path: translatedFilePath
          };
        }
        return prevTranslation;
      });
      
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
                <h2 className="text-xl font-semibold">{currentFileName}</h2>
                <p className="text-sm text-gray-500">
                  {translation.source_language} para {translation.target_language} • 
                  {translation.files ? 
                    `${translation.total_word_count || 0} palavras totais` : 
                    `${translation.word_count || 0} palavras`} • 
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
              <h3 className="text-lg font-medium mb-2">Documento do cliente</h3>
              
              {/* Seletor de arquivos - mostrar apenas se houver múltiplos arquivos */}
              {translation.files && translation.files.length > 1 && (
                <div className="mb-4">
                  <label htmlFor="file-selector" className="block text-sm font-medium mb-1">Selecionar arquivo:</label>
                  <select 
                    id="file-selector"
                    className="w-full p-2 border rounded-md bg-background"
                    value={currentFileIndex}
                    onChange={(e) => {
                      const newIndex = parseInt(e.target.value);
                      changeCurrentFile(newIndex);
                    }}
                  >
                    {translation.files.map((file, index) => (
                      <option key={index} value={index}>
                        {file.originalName} ({file.wordCount} palavras)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
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
