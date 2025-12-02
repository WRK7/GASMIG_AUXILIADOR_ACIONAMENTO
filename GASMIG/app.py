from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
from datetime import datetime
import os
import sys
import json

# Configuração para funcionar como executável
if getattr(sys, 'frozen', False):
    # Rodando como executável
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'static')
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
    # Salvar histórico na mesma pasta do executável
    BASE_DIR = os.path.dirname(sys.executable)
else:
    # Rodando como script Python normal
    app = Flask(__name__)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Desabilitar cache de templates completamente
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Configuração - histórico sempre salvo em local permanente
HISTORICO_FILE = os.path.join(BASE_DIR, 'historico.json')
HISTORICO_CSV_FILE = os.path.join(BASE_DIR, 'historico.csv')

def formatar_valor(valor):
    """Formata valor para R$ XX,XX"""
    return f"R$ {valor:.2f}".replace('.', ',')

def obter_intervalo_datas(faturas):
    """Obtém a menor e maior data das faturas"""
    if not faturas:
        return "", ""
    
    datas = [f['data'] for f in faturas]
    if len(datas) == 1:
        return datas[0], datas[0]
    
    # Converter para datetime para comparação
    datas_obj = []
    for data_str in datas:
        dia, mes, ano = data_str.split('/')
        datas_obj.append(datetime(int(ano), int(mes), int(dia)))
    
    data_min = min(datas_obj)
    data_max = max(datas_obj)
    
    return data_min.strftime('%d/%m/%Y'), data_max.strftime('%d/%m/%Y')

def gerar_texto_agrupamento(dados):
    """Gera texto para solicitação de Agrupamento"""
    pn = dados.get('pn', '')
    faturas = dados.get('faturas', [])
    data_inicio, data_fim = obter_intervalo_datas(faturas)
    valor_total = sum(f['valor'] for f in faturas)
    data_pagamento = dados.get('dataPagamento', '')
    canal_contato = dados.get('canalContato', '')
    contato_whatsapp = dados.get('contatoWhatsapp', '')
    contato_email = dados.get('contatoEmail', '')
    faturas_sequenciais = dados.get('faturasSequenciais', True)
    
    # Determinar o contato a exibir
    if canal_contato == 'Digisac':
        contato = contato_whatsapp if contato_whatsapp else contato_email
    else:  # E-mail
        contato = contato_email if contato_email else contato_whatsapp
    
    # Escolher conector baseado na sequencialidade
    if data_inicio != data_fim:
        conector = "a" if faturas_sequenciais else "e"
        intervalo = f"{data_inicio} {conector} {data_fim}"
    else:
        intervalo = data_inicio
    
    texto = f"""PN: {pn} - Solicitação: Cliente solicitou agrupamento das faturas de {intervalo}, totalizando {formatar_valor(valor_total)}, para pagamento em {data_pagamento}.
Contato via (local de contato): {canal_contato}
Número/E-mail: {contato}"""
    
    return texto

def gerar_texto_parcelamento(dados):
    """Gera texto para solicitação de Parcelamento"""
    pn = dados.get('pn', '')
    faturas = dados.get('faturas', [])
    data_inicio, data_fim = obter_intervalo_datas(faturas)
    valor_total = sum(f['valor'] for f in faturas)
    valor_entrada = dados.get('valorEntrada', 0)
    qtd_parcelas = dados.get('qtdParcelas', 0)
    valor_parcela = dados.get('valorParcela', 0)
    data_pagamento_entrada = dados.get('dataPagamentoEntrada', '')
    canal_contato = dados.get('canalContato', '')
    contato_whatsapp = dados.get('contatoWhatsapp', '')
    contato_email = dados.get('contatoEmail', '')
    faturas_sequenciais = dados.get('faturasSequenciais', True)
    
    # Determinar o contato a exibir
    if canal_contato == 'Digisac':
        contato = contato_whatsapp if contato_whatsapp else contato_email
    else:  # E-mail
        contato = contato_email if contato_email else contato_whatsapp
    
    # Escolher conector baseado na sequencialidade
    if data_inicio != data_fim:
        conector = "a" if faturas_sequenciais else "e"
        intervalo = f"{data_inicio} {conector} {data_fim}"
    else:
        intervalo = data_inicio
    
    texto = f"""PN: {pn} - Solicitação: Cliente solicitou parcelamento das faturas de {intervalo}, totalizando {formatar_valor(valor_total)}. 
Entrada de {formatar_valor(valor_entrada)} + {qtd_parcelas} parcelas de {formatar_valor(valor_parcela)}. Pagamento da entrada até {data_pagamento_entrada}.
Contato via (local de contato): {canal_contato}
Número/E-mail: {contato}"""
    
    return texto

def gerar_texto_segunda_via(dados):
    """Gera texto para solicitação de Segunda Via"""
    pn = dados.get('pn', '')
    faturas = dados.get('faturas', [])
    data_inicio, data_fim = obter_intervalo_datas(faturas)
    valor_total = sum(f['valor'] for f in faturas)
    canal_contato = dados.get('canalContato', '')
    contato_whatsapp = dados.get('contatoWhatsapp', '')
    contato_email = dados.get('contatoEmail', '')
    faturas_sequenciais = dados.get('faturasSequenciais', True)
    
    # Determinar o contato a exibir
    if canal_contato == 'Digisac':
        contato = contato_whatsapp if contato_whatsapp else contato_email
    else:  # E-mail
        contato = contato_email if contato_email else contato_whatsapp
    
    # Escolher conector baseado na sequencialidade
    if data_inicio != data_fim:
        conector = "a" if faturas_sequenciais else "e"
        intervalo = f"{data_inicio} {conector} {data_fim}"
    else:
        intervalo = data_inicio
    
    texto = f"""PN: {pn} - Solicitação: Cliente solicitou segunda via das faturas de {intervalo}, totalizando {formatar_valor(valor_total)}. 
Contato via (local de contato): {canal_contato}
Número/E-mail: {contato}"""
    
    return texto

@app.route('/')
def index():
    """Rota principal - retorna a interface"""
    from flask import make_response
    response = make_response(render_template('index.html'))
    # Desabilitar cache para garantir atualização
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/teste_template')
def teste_template():
    """Rota de teste - mostra caminho do template"""
    template_path = os.path.join(BASE_DIR, 'templates', 'index.html')
    existe = os.path.exists(template_path)
    with open(template_path, 'r', encoding='utf-8') as f:
        conteudo = f.read()
    tem_botao = 'Limpar Dados' in conteudo
    return f"""
    <h1>Teste de Template</h1>
    <p>Caminho: {template_path}</p>
    <p>Arquivo existe: {existe}</p>
    <p>Tem botão "Limpar Dados": {tem_botao}</p>
    <p>Versão no comentário: {"2.1" if "VERSÃO 2.1" in conteudo else "NÃO ENCONTRADA"}</p>
    <hr>
    <h2>Primeiras 1000 caracteres:</h2>
    <pre>{conteudo[:1000]}</pre>
    """

@app.route('/gerar_nota', methods=['POST'])
def gerar_nota():
    """Gera o texto da nota baseado nos dados recebidos"""
    try:
        dados = request.json
        tipo = dados.get('tipo', '')
        
        if tipo == 'agrupamento':
            texto = gerar_texto_agrupamento(dados)
        elif tipo == 'parcelamento':
            texto = gerar_texto_parcelamento(dados)
        elif tipo == 'segunda_via':
            texto = gerar_texto_segunda_via(dados)
        else:
            return jsonify({'erro': 'Tipo de solicitação inválido'}), 400
        
        return jsonify({'texto': texto})
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/salvar_historico', methods=['POST'])
def salvar_historico():
    """Salva a nota gerada no histórico JSON"""
    try:
        dados = request.json
        
        # Preparar registro
        registro = {
            'data_hora': datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
            'pn': dados.get('pn', ''),
            'tipo': dados.get('tipo', '').title().replace('_', ' '),
            'faturas': dados.get('faturas_resumo', ''),
            'valor_total': dados.get('valor_total', ''),
            'texto': dados.get('texto', ''),
            'imagens': dados.get('imagens', [])  # Incluir imagens (Base64)
        }
        
        # Carregar histórico existente
        historico = []
        if os.path.exists(HISTORICO_FILE):
            try:
                with open(HISTORICO_FILE, 'r', encoding='utf-8') as f:
                    historico = json.load(f)
            except:
                historico = []
        
        # Adicionar novo registro
        historico.append(registro)
        
        # Salvar histórico
        with open(HISTORICO_FILE, 'w', encoding='utf-8') as f:
            json.dump(historico, f, ensure_ascii=False, indent=2)
        
        return jsonify({'sucesso': True, 'mensagem': 'Histórico salvo com sucesso!'})
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/listar_historico', methods=['GET'])
def listar_historico():
    """Lista todo o histórico"""
    try:
        if not os.path.exists(HISTORICO_FILE):
            return jsonify({'sucesso': True, 'historico': []})
        
        with open(HISTORICO_FILE, 'r', encoding='utf-8') as f:
            historico = json.load(f)
        
        # Ordenar do mais recente para o mais antigo
        historico.reverse()
        
        return jsonify({'sucesso': True, 'historico': historico})
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/limpar_historico', methods=['POST'])
def limpar_historico():
    """Limpa todo o histórico"""
    try:
        if os.path.exists(HISTORICO_FILE):
            os.remove(HISTORICO_FILE)
        
        return jsonify({'sucesso': True, 'mensagem': 'Histórico limpo com sucesso!'})
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/remover_item_historico', methods=['POST'])
def remover_item_historico():
    """Remove um item específico do histórico"""
    try:
        if not os.path.exists(HISTORICO_FILE):
            return jsonify({'sucesso': False, 'erro': 'Nenhum histórico disponível'}), 404
        
        dados = request.json
        
        # Carregar histórico
        with open(HISTORICO_FILE, 'r', encoding='utf-8') as f:
            historico = json.load(f)
        
        # Encontrar e remover o item
        item_encontrado = False
        historico_novo = []
        
        for item in historico:
            # Comparar pelos campos principais para identificar o item
            if (item.get('pn', '') == dados.get('pn', '') and
                item.get('data_hora', '') == dados.get('data_hora', '') and
                item.get('tipo', '').lower() == dados.get('tipo', '').lower()):
                item_encontrado = True
                continue  # Não adiciona este item ao novo histórico
            historico_novo.append(item)
        
        if not item_encontrado:
            return jsonify({'sucesso': False, 'erro': 'Item não encontrado no histórico'}), 404
        
        # Salvar histórico atualizado
        with open(HISTORICO_FILE, 'w', encoding='utf-8') as f:
            json.dump(historico_novo, f, ensure_ascii=False, indent=2)
        
        return jsonify({'sucesso': True, 'mensagem': 'Item removido com sucesso!'})
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/download_historico')
def download_historico():
    """Exporta histórico como CSV"""
    try:
        if not os.path.exists(HISTORICO_FILE):
            return jsonify({'erro': 'Nenhum histórico disponível'}), 404
        
        # Carregar JSON e converter para CSV
        with open(HISTORICO_FILE, 'r', encoding='utf-8') as f:
            historico = json.load(f)
        
        if not historico:
            return jsonify({'erro': 'Nenhum histórico disponível'}), 404
        
        # Limpar dados para melhor formatação no CSV
        historico_limpo = []
        for item in historico:
            # Substituir quebras de linha por espaço no texto
            texto_limpo = item.get('texto', '').replace('\n', ' ').replace('\r', '')
            # Remover múltiplos espaços
            texto_limpo = ' '.join(texto_limpo.split())
            
            historico_limpo.append({
                'Data/Hora': item.get('data_hora', ''),
                'PN': item.get('pn', ''),
                'Tipo': item.get('tipo', ''),
                'Faturas': item.get('faturas', ''),
                'Valor Total': item.get('valor_total', ''),
                'Texto Gerado': texto_limpo
            })
        
        # Criar DataFrame
        df = pd.DataFrame(historico_limpo)
        
        # Salvar como CSV com formatação adequada
        df.to_csv(HISTORICO_CSV_FILE, 
                 index=False, 
                 encoding='utf-8-sig', 
                 sep=';',
                 quoting=1)  # QUOTE_ALL para garantir que campos com ; fiquem entre aspas
        
        return send_file(HISTORICO_CSV_FILE, 
                        as_attachment=True, 
                        download_name=f'historico_notas_{datetime.now().strftime("%d%m%Y")}.csv',
                        mimetype='text/csv')
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    # Abrir o navegador automaticamente
    import webbrowser
    from threading import Timer
    
    def abrir_navegador():
        webbrowser.open('http://127.0.0.1:8080')
    
    Timer(1.5, abrir_navegador).start()
    
    # Iniciar aplicação com todas as opções de reload na porta 8080
    app.run(debug=True, use_reloader=True, port=8080, extra_files=['templates/index.html', 'static/js/script.js', 'static/css/style.css'])

