import { useEffect, useState } from "react"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { PageHeader } from "@/components/ui/page-header"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  name: string
  birth_date: string
  is_individual: boolean
  cpf: string | null
  cnpj: string | null
  phone: string
  email: string
  newsletter: boolean
}

export function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (error) throw error

        setProfile(data)
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSubmit = async (formData: any) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          birth_date: formData.birthDate,
          is_individual: formData.isIndividual,
          cpf: formData.cpf,
          cnpj: formData.cnpj,
          phone: formData.phone,
          email: formData.email,
          newsletter: formData.newsletter,
        })
        .eq("user_id", user.id)

      if (error) throw error
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  const initialFormData = profile
    ? {
        name: profile.name,
        birthDate: new Date(profile.birth_date),
        isIndividual: profile.is_individual,
        cpf: profile.cpf || undefined,
        cnpj: profile.cnpj || undefined,
        phone: profile.phone,
        email: profile.email,
        newsletter: profile.newsletter,
      }
    : undefined

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Perfil"
        text="Visualize e edite suas informações pessoais"
      />
      <div className="mt-8">
        <ProfileForm initialData={initialFormData} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
