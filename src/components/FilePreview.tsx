import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import mammoth from 'mammoth';
import { Document, Page } from 'react-pdf';
import { supabase } from '@/lib/supabase';
import '@/lib/pdf-worker';

interface FilePreviewProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onWordCount?: (count: number) => void;
}

type FileType = 'pdf' | 'docx' | 'image' | 'text' | 'unknown';

export function FilePreview({ file, isOpen, onClose, onWordCount }: FilePreviewProps) {
  const [content, setContent] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [error, setError] = useState<string | null>(null);

  const getFileType = useCallback((file: File): FileType => {
    if (!file || !file.type) return 'unknown';
    
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'text/plain' || file.type === 'text/csv') return 'text';
    
    return 'unknown';
  }, []);

  const cleanup = useCallback(() => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl('');
    }
    setContent('');
    setWordCount(0);
    setNumPages(0);
    setCurrentPage(1);
    setError(null);
    setFileType('unknown');
  }, [fileUrl]);

  useEffect(() => {
    if (!isOpen || !file) {
      cleanup();
      return;
    }

    const processFile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const type = getFileType(file);
        setFileType(type);
        
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        switch (type) {
          case 'pdf':
            const reader = new FileReader();
            reader.onload = async (e) => {
              if (e.target?.result) {
                try {
                  const text = await extractTextFromPdf(e.target.result as ArrayBuffer);
                  countWords(text);
                } catch (err) {
                  setError('Erro ao processar arquivo PDF. Por favor, tente novamente.');
                  console.error('Erro ao extrair texto do PDF:', err);
                }
              }
            };
            reader.readAsArrayBuffer(file);
            break;

          case 'docx':
            try {
              const arrayBuffer = await file.arrayBuffer();
              const result = await mammoth.extractRawText({ arrayBuffer });
              setContent(result.value);
              countWords(result.value);
            } catch (err) {
              setError('Erro ao processar arquivo DOCX. Por favor, tente novamente.');
              console.error('Erro ao extrair texto do DOCX:', err);
            }
            break;

          case 'text':
            try {
              const text = await file.text();
              setContent(text);
              countWords(text);
            } catch (err) {
              setError('Erro ao processar arquivo de texto. Por favor, tente novamente.');
              console.error('Erro ao ler arquivo de texto:', err);
            }
            break;

          case 'image':
            setContent('');
            setWordCount(0);
            break;

          default:
            setError('Tipo de arquivo não suportado');
            setContent('');
            setWordCount(0);
        }
      } catch (err) {
        setError('Erro ao processar arquivo. Por favor, tente novamente.');
        console.error('Erro ao processar arquivo:', err);
      } finally {
        setIsLoading(false);
      }
    };

    processFile();

    return () => cleanup();
  }, [file, isOpen, cleanup, getFileType]);

  const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const pdf = await import('pdfjs-dist');
      const doc = await pdf.getDocument(arrayBuffer).promise;
      let text = '';
      
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + ' ';
      }
      
      return text;
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error);
      return '';
    }
  };

  const countWords = useCallback((text: string) => {
    if (!text) return;
    
    // Remove caracteres especiais e números
    const cleanText = text
      .replace(/[0-9]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .trim();
    
    // Divide por espaços e filtra strings vazias
    const words = cleanText
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    setWordCount(words.length);
    if (onWordCount) onWordCount(words.length);
  }, [onWordCount]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2Icon className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-8 text-red-500">
          {error}
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <img
            src={fileUrl}
            alt="Preview"
            className="max-w-full h-auto"
            onError={() => setError('Erro ao carregar imagem')}
          />
        );

      case 'pdf':
        return (
          <div className="flex flex-col items-center">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(error) => setError('Erro ao carregar PDF')}
              className="max-h-[70vh] overflow-auto"
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader2Icon className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                width={600}
                loading={
                  <div className="flex items-center justify-center p-4">
                    <Loader2Icon className="h-6 w-6 animate-spin" />
                  </div>
                }
              />
            </Document>
            {numPages > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {numPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage >= numPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        );

      case 'text':
      case 'docx':
        return (
          <div className="max-h-[70vh] overflow-auto p-4 whitespace-pre-wrap">
            {content}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center p-8 text-gray-500">
            Visualização não disponível para este tipo de arquivo
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{file?.name || 'Arquivo'}</span>
            {wordCount > 0 && (
              <span className="text-sm text-gray-500">
                {wordCount} palavras
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
