// Script para promover um usuário a administrador
// Execute este script no console do navegador ou usando a API do Supabase

// Função para promover usuário para admin usando email
async function promoverUsuarioParaAdmin(email) {
  // Obter o usuário pelo email
  const { data: usuarios, error: erroConsulta } = await supabase
    .from('users')
    .select('user_id, email, role')
    .eq('email', email);
    
  if (erroConsulta) {
    console.error('Erro ao buscar usuário:', erroConsulta);
    return { sucesso: false, mensagem: 'Erro ao buscar usuário', erro: erroConsulta };
  }
  
  if (!usuarios || usuarios.length === 0) {
    return { sucesso: false, mensagem: 'Usuário não encontrado com este email' };
  }
  
  const usuario = usuarios[0];
  console.log('Usuário encontrado:', usuario);
  
  // Atualizar a role para 'admin'
  const { error: erroAtualizacao } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('user_id', usuario.user_id);
  
  if (erroAtualizacao) {
    console.error('Erro ao promover usuário:', erroAtualizacao);
    return { sucesso: false, mensagem: 'Erro ao promover usuário', erro: erroAtualizacao };
  }
  
  return { 
    sucesso: true, 
    mensagem: `Usuário ${email} promovido a administrador com sucesso!`
  };
}

// Exemplo de uso:
// Substitua 'seu-email@exemplo.com' pelo seu email
// promoverUsuarioParaAdmin('seu-email@exemplo.com').then(console.log);
