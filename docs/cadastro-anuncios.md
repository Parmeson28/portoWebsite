# Cadastro de anúncios

A tela está em `/admin/products/preview`. No painel `/adminPanel`, use **Produtos** no menu lateral ou o atalho **Editar prévia do item**. O controller já protege essa rota e redireciona usuários sem autenticação para `/adminLogin`; o fluxo de login foi preservado.

## Executar e conferir

Com Java 21 e a configuração de banco do ambiente disponíveis, inicie a aplicação com `./gradlew bootRun`. Use a porta configurada no ambiente, faça login pelo fluxo existente e abra a rota acima.

1. No desktop, confira fotos à esquerda; título, preço, disponibilidade e contato à direita; descrição e informações técnicas abaixo das fotos.
2. Em larguras de 390 e 320 px, confira a coluna única: fotos, título, preço, disponibilidade, contato, descrição e ficha técnica, sem rolagem horizontal.
3. Adicione fotos JPG, PNG ou WebP, navegue pelas setas, pelo teclado e pelas miniaturas, escolha uma capa e remova fotos. O limite é de 8 fotos de até 2 MB cada. Confira também arquivos inválidos e endereços de imagem que não carregam.
4. Edite título, preço, disponibilidade e telefone com DDI/DDD. O botão do WhatsApp deve refletir os dados e ficar desativado para telefone inválido. Adicione e remova informações técnicas.
5. Clique em **Salvar rascunho** e recarregue a página: os campos e as fotos devem voltar. Rascunhos da tela anterior também são compatíveis. O rascunho depende deste navegador e da mesma origem (protocolo, domínio e porta).
6. Faça outra alteração e clique em **Cancelar**. Recusar o descarte mantém a edição; confirmá-lo volta ao painel e mantém o último rascunho salvo.
7. Se o armazenamento do navegador estiver bloqueado ou cheio, salvar deve mostrar um erro e manter os dados na tela. Fotos grandes podem exceder a cota do navegador mesmo dentro do limite por arquivo.

O teste existente da proteção da rota pode ser executado com:

```sh
./gradlew test --tests com.portoWebsite.PortoMaquinas.controller.AdminControllerTest
```

## Persistência e pendências

Não há API de cadastro de anúncios nem upload de imagens no projeto. `Product` é um modelo básico, sem repositório ou serviço de persistência para anúncios. A tela salva um rascunho real no `localStorage`, incluindo as fotos selecionadas; não envia dados ao servidor nem publica no catálogo. A mensagem de sucesso aparece apenas depois de o navegador confirmar essa gravação. Endereços externos de imagens continuam dependendo do servidor de origem.

Para habilitar o cadastro no catálogo, faltam endpoints autenticados de criação/edição, modelo e schema para descrição, disponibilidade, contato, ficha técnica e fotos, repositório/serviço de persistência e armazenamento/upload de imagens com validação no servidor. Depois, será necessário conectar o envio da tela a essas APIs e confirmar o salvamento somente após resposta de persistência.

## Arquivos da tela

- `src/main/resources/templates/adminProductPreview.html`: estrutura editável no layout de detalhes.
- `src/main/resources/static/css/product-editor.css`: estilos isolados e responsividade.
- `src/main/resources/static/js/product-editor.js`: galeria, contato, ficha técnica, rascunho e cancelamento.
- `src/main/resources/static/css/common.css`: estilos de base usados pela tela e pelo atalho do painel.
- `src/main/resources/templates/adminPanel.html`: acesso pelo menu Produtos e atalho.
- `src/main/java/com/portoWebsite/PortoMaquinas/controller/AdminController.java`: rota protegida.
- `src/test/java/com/portoWebsite/PortoMaquinas/controller/AdminControllerTest.java`: teste de acesso à rota.

O login não faz parte desta entrega.
