import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Help = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Ajuda</h1>
      
      <Card className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-medium text-center mb-2">Precisa de ajuda?</h2>
        <p className="text-muted-foreground text-center mb-6">
          Acesse a área de dúvidas ou entre em contato conosco.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button variant="default" className="bg-[#00B1EA] hover:bg-[#00A1D6]">
            Área de dúvidas
          </Button>
          <Button variant="outline">
            Fale conosco
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Help;