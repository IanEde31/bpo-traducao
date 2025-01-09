import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <span className="text-sm text-gray-600">Olá, Usuário!</span>
        </div>
      </div>
    </div>
  );
}