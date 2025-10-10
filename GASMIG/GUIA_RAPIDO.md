# 📋 Guia Rápido - Ferramenta GASMIG

## 🚀 Como Iniciar

### Opção 1: Usando o Executável (Recomendado)
1. Execute o arquivo `GASMIG.exe`
2. Aguarde alguns segundos
3. O navegador abrirá automaticamente
4. Pronto para usar!

### Opção 2: Usando Python
```bash
python app.py
```
Acesse: http://localhost:5000

## 📝 Como Usar

### 1️⃣ Selecionar Tipo de Solicitação
- **Agrupamento**: Juntar faturas para pagamento único
- **Parcelamento**: Dividir valor em parcelas
- **Segunda Via**: Solicitar cópia de faturas

### 2️⃣ Adicionar Faturas
1. Clique em "➕ Adicionar Fatura"
2. Preencha:
   - **Data**: Formato DD/MM/AAAA (ex: 25/10/2025)
   - **Valor**: Será formatado automaticamente (ex: 150,00)
3. Adicione quantas faturas precisar
4. Para remover: clique no "✕" da fatura

**💡 Dica**: O sistema mostra se as faturas são sequenciais ou não!

### 3️⃣ Preencher Campos Específicos

#### Para Agrupamento:
- Data para pagamento

#### Para Parcelamento:
- Valor da entrada
- Quantidade de parcelas
- Valor de cada parcela
- Data de pagamento da entrada

#### Para Segunda Via:
- Apenas informações de contato

### 4️⃣ Informações de Contato
- **Contato via**: Escolha Digisac ou E-mail
- **WhatsApp/Telefone**: (00) 00000-0000
- **E-mail**: email@exemplo.com

> ⚠️ Preencha pelo menos um contato!

### 5️⃣ Gerar e Usar o Texto
1. Clique em "**Gerar Nota**"
2. O texto aparecerá formatado
3. Clique em "📋 **Copiar Texto**" para copiar
4. Cole em outro sistema (Ctrl+V)

### 6️⃣ Histórico
- **💾 Salvar no Histórico**: Registra a nota gerada
- **📥 Baixar Histórico (CSV)**: Baixa arquivo com todas as notas salvas

## ✨ Funcionalidades Automáticas

✅ **Cálculo automático** do valor total das faturas  
✅ **Detecção de intervalo** de datas (menor → maior)  
✅ **Formatação automática** de valores em R$  
✅ **Verificação de sequencialidade** das faturas  
✅ **Validação de campos** obrigatórios  

## 📊 Exemplos de Uso

### Exemplo 1: Agrupamento Simples
```
Faturas:
- 25/09/2025: R$ 150,00
- 25/10/2025: R$ 180,00

Data para pagamento: 15/11/2025
Contato via: Digisac
WhatsApp: (31) 99999-9999

Resultado:
"Solicitação: Cliente solicitou agrupamento das faturas de 
25/09/2025 a 25/10/2025, totalizando R$ 330,00, para pagamento 
em 15/11/2025.
Contato via (local de contato): Digisac
Número/E-mail: (31) 99999-9999"
```

### Exemplo 2: Parcelamento
```
Faturas:
- 25/08/2025: R$ 200,00
- 25/09/2025: R$ 200,00
- 25/10/2025: R$ 200,00

Entrada: R$ 100,00
Parcelas: 5 x R$ 100,00
Data entrada: 05/11/2025

Resultado:
"Solicitação: Cliente solicitou parcelamento das faturas de 
25/08/2025 a 25/10/2025, totalizando R$ 600,00. 
Entrada de R$ 100,00 + 5 parcelas de R$ 100,00. Pagamento da 
entrada até 05/11/2025.
Contato via (local de contato): Digisac
Número/E-mail: (31) 99999-9999"
```

## 🔧 Criar Executável

Para gerar o arquivo `.exe`:
```bash
python build_exe.py
```

O executável estará em: `dist/GASMIG.exe`

## ❓ Dúvidas Comuns

**P: O valor não está formatando corretamente**  
R: Digite apenas números. O sistema formata automaticamente em R$ XX,XX

**P: Como adiciono mais de uma fatura?**  
R: Clique em "Adicionar Fatura" quantas vezes precisar

**P: Posso usar em outro computador?**  
R: Sim! Copie o GASMIG.exe e execute (não precisa Python)

**P: Onde fica o histórico salvo?**  
R: No arquivo `historico.csv` na mesma pasta do programa

---

**Versão:** 1.0.0  
**Suporte:** Equipe GASMIG

