import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  celular: z.string().min(1, "Celular é obrigatório"),
  idiomaOrigem: z.string().min(1, "Selecione o idioma de origem"),
  idiomaDestino: z.string().min(1, "Selecione o idioma de destino"),
  tipoTraducao: z.string().min(1, "Selecione o tipo de tradução"),
});

const NewQuote = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
      idiomaOrigem: "",
      idiomaDestino: "",
      tipoTraducao: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Novo orçamento</h1>
        <p className="text-gray-500 mt-1">Solicite sua tradução com apenas alguns cliques.</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-[#23B0DE] font-medium">
            <div className="bg-[#23B0DE] text-white rounded-full w-6 h-6 flex items-center justify-center">
              1
            </div>
            <span>Informação</span>
            <div className="flex-1 h-px bg-[#E2F3FE]"></div>
            <div className="bg-[#E2F3FE] text-[#23B0DE] rounded-full w-6 h-6 flex items-center justify-center">
              2
            </div>
            <span className="text-gray-400">Documentos</span>
            <div className="flex-1 h-px bg-[#E2F3FE]"></div>
            <div className="bg-[#E2F3FE] text-[#23B0DE] rounded-full w-6 h-6 flex items-center justify-center">
              3
            </div>
            <span className="text-gray-400">Orçamento</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome*</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail*</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu e-mail" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular*</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu celular" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="idiomaOrigem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma de origem*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="en">Inglês</SelectItem>
                          <SelectItem value="es">Espanhol</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idiomaDestino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma de destino*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="en">Inglês</SelectItem>
                          <SelectItem value="es">Espanhol</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tipoTraducao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de tradução*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de tradução" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="juramentada">Juramentada</SelectItem>
                        <SelectItem value="simples">Simples</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-[#23B0DE] hover:bg-[#198BAC] text-white px-8">
                  Continuar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default NewQuote;