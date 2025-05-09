import { useContext } from "react";
import { UserTypeContext } from "@/App";
import { ClientHome } from "@/components/home/ClientHome";
import { TranslatorHome } from "@/components/home/TranslatorHome";

export default function Home() {
  const { isTranslator } = useContext(UserTypeContext);
  
  return isTranslator ? <TranslatorHome /> : <ClientHome />;
}