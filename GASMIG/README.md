# Ferramenta de Geração de Notas de Atendimento - GASMIG

## Descrição
Sistema automatizado para geração de notas de atendimento padronizadas para solicitações de Agrupamento, Parcelamento e Segunda Via de faturas.

## Funcionalidades
- ✅ Geração automática de textos padronizados
- ✅ Sistema inteligente de adição de faturas
- ✅ Cálculo automático de valores totais
- ✅ Detecção de intervalo de datas
- ✅ Histórico de notas geradas em CSV
- ✅ Interface web moderna e intuitiva
- ✅ Cópia rápida do texto gerado

## Instalação

### Opção 1: Executável (Recomendado)
1. Baixe o arquivo `GASMIG.exe`
2. Execute o arquivo (não é necessário ter Python instalado)
3. O navegador abrirá automaticamente com a ferramenta

### Opção 2: Executar com Python
1. Certifique-se de ter Python 3.8+ instalado
2. Instale as dependências:
```bash
pip install -r requirements.txt
```
3. Execute a aplicação:
```bash
python app.py
```
4. Acesse no navegador: `http://localhost:5000`

## Como Usar

1. **Selecione o tipo de solicitação**: Agrupamento, Parcelamento ou Segunda Via
2. **Adicione as faturas**: Clique em "Adicionar Fatura" e preencha data e valor
3. **Preencha os campos específicos**: Dependendo do tipo selecionado
4. **Escolha o canal de contato**: Digisac ou E-mail
5. **Informe os dados de contato**: WhatsApp/Telefone e/ou E-mail
6. **Gere o texto**: O sistema gera automaticamente o texto formatado
7. **Copie o texto**: Clique em "Copiar Texto" para usar em outro sistema
8. **Salve no histórico**: Clique em "Salvar no Histórico" para registrar

## Criar Executável

Para gerar o executável standalone:
```bash
python build_exe.py
```

O arquivo `.exe` será criado na pasta `dist/`.

## Estrutura do Projeto
```
GASMIG/
├── app.py                 # Aplicação Flask principal
├── templates/
│   └── index.html        # Interface web
├── static/
│   ├── css/
│   │   └── style.css     # Estilos
│   └── js/
│       └── script.js     # Lógica frontend
├── historico.csv         # Histórico (gerado automaticamente)
├── requirements.txt      # Dependências
└── README.md            # Este arquivo
```

## Suporte
Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---
**Versão:** 1.0.0  
**Data:** 10/10/2025  
**Solicitante:** Adryan Guaraldo/Conciliador GASMIG

