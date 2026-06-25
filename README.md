# Cadastro de Produtos PWA

Este é um mini sistema PWA para cadastro de produtos com descrição, quantidade e valor.

## Publicar no GitHub Pages

1. Abra o terminal na pasta do projeto:
   ```powershell
   cd "c:\Users\Gabriel\Documents\Testes\PWA"
   ```
2. Inicialize o repositório Git (se ainda não existir):
   ```powershell
   git init
   git add .
   git commit -m "Adicionar projeto PWA de cadastro de produtos"
   ```
3. Crie o repositório no GitHub e copie a URL do remote.
4. Configure o remote e envie para o GitHub:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
   git push -u origin main
   ```

## Ativar GitHub Pages

1. Acesse o repositório no GitHub.
2. Vá em `Settings` > `Pages`.
3. Em `Source`, selecione `main` e `/(root)`.
4. Salve.
5. Aguarde até aparecer o link do site, por exemplo:
   ```text
   https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/
   ```

## Testar no celular

### Android (Chrome / Edge)
1. Abra o link do GitHub Pages no navegador do celular.
2. Aguarde a página carregar.
3. Se o botão `Instalar app` aparecer na tela, toque nele para instalar como PWA.
4. Se o botão não aparecer, deixe o site aberto e acesse novamente algumas vezes; o Chrome pode liberar o prompt depois.

> Importante: no Android Chrome, `Adicionar à tela inicial` também instala o PWA como app, desde que o site seja considerado instalável.

### iPhone (Safari)
1. Abra o link no Safari.
2. Toque em `Compartilhar`.
3. Escolha `Adicionar à Tela de Início`.

> Nota: no iPhone, isso cria um atalho no Safari e não é o mesmo comportamento de app nativo ou prompt de instalação automática do Android.```
## Dicas para o install prompt funcionar

- O site deve estar em HTTPS (GitHub Pages já é HTTPS).
- O `manifest.json` deve estar acessível.
- O `service-worker.js` deve ser registrado sem erros.
- Visite a página algumas vezes no navegador Android.

## Verificar se o PWA está pronto

No Chrome, abra as DevTools e vá em `Application` > `Manifest`.

- O ícone deve carregar.
- O `start_url` deve ser `./index.html`.
- O `display` deve ser `standalone`.

Também confira `Application` > `Service Workers` para ver se o service worker está ativo.

## Comandos úteis

Para subir novamente após alterações:
```powershell
git add .
git commit -m "Atualizar PWA"
git push
```

## Observação

No Android, o prompt automático só aparece se o Chrome considerar o site instalável. Se não aparecer, a instalação ainda funciona via menu do navegador.
