# Modelo de Dados (Inicial)

## Entidades principais

### Cidade
- **id**
- **nome**
- **estado**
- **timezone**
- **ativo**

### Unidade
- **id**
- **cidade_id**
- **nome**
- **endereco**
- **ativo**

### Setor
- **id**
- **unidade_id**
- **nome**
- **ativo**

### Tela
- **id**
- **setor_id**
- **codigo_patrimonio**
- **localizacao_descritiva**
- **status** (online, offline, manutencao)
- **ultima_sincronizacao**

### Playlist
- **id**
- **nome**
- **setor_id**
- **janela_exibicao** (horário de início e fim)
- **prioridade**

### Conteudo
- **id**
- **tipo** (imagem, video, noticia, integracao)
- **titulo**
- **arquivo_url**
- **duracao_segundos**
- **ativo**

### PlaylistItem
- **id**
- **playlist_id**
- **conteudo_id**
- **ordem**
- **duracao_override** (opcional)

## Relacionamentos

- Uma **Cidade** possui muitas **Unidades**.
- Uma **Unidade** possui muitos **Setores**.
- Um **Setor** possui muitas **Telas**.
- Um **Setor** possui muitas **Playlists**.
- Uma **Playlist** possui muitos **Itens** vinculados a **Conteudos**.

## Regras iniciais

- Uma tela só pode receber playlists do seu setor.
- Playlists com maior prioridade substituem as demais dentro da janela de exibição.
- Conteúdos podem ser reutilizados em múltiplas playlists.
