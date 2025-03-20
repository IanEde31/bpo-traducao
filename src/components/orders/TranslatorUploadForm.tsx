import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface TranslatorUploadFormProps {
  onUpload: (files: FileList) => void;
  acceptedFormats?: string;
}

export function TranslatorUploadForm({
  onUpload,
  acceptedFormats = ".pdf, .doc, .docx, .txt, .rtf"
}: TranslatorUploadFormProps) {
  return (
    <Card className="p-6 mt-4">
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Enviar arquivos</h3>
        
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <Button 
              variant="ghost" 
              className="relative"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Selecionar arquivos
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept={acceptedFormats}
                onChange={(e) => e.target.files && onUpload(e.target.files)}
              />
            </Button>
            <p className="text-sm text-gray-500">
              Formatos aceitos: {acceptedFormats}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button>Finalizar</Button>
        </div>
      </div>
    </Card>
  );
}
