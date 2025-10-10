from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
from datetime import datetime
import os
import sys

# Configuração para funcionar como executável
if getattr(sys, 'frozen', False):
    # Rodando como executável
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'static')
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
else:
    # Rodando como script Python normal
    app = Flask(__name__)

# Configuração
HISTORICO_FILE = 'historico.csv'

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
    
    texto = f"""Solicitação: Cliente solicitou agrupamento das faturas de {intervalo}, totalizando {formatar_valor(valor_total)}, para pagamento em {data_pagamento}.
Contato via (local de contato): {canal_contato}
Número/E-mail: {contato}"""
    
    return texto

def gerar_texto_parcelamento(dados):
    """Gera texto para solicitação de Parcelamento"""
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
    
    texto = f"""Solicitação: Cliente solicitou parcelamento das faturas de {intervalo}, totalizando {formatar_valor(valor_total)}. 
Entrada de {formatar_valor(valor_entrada)} + {qtd_parcelas} parcelas de {formatar_valor(valor_parcela)}. Pagamento da entrada até {data_pagamento_entrada}.
Contato via (local de contato): {canal_contato}
Número/E-mail: {contato}"""
    
    return texto

def gerar_texto_segunda_via(dados):
    """Gera texto para solicitação de Segunda Via"""
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
    
    texto = f"""Solicitação: Cliente solicitou segunda via das faturas de {intervalo}, totalizando {formatar_valor(valor_total)}. 
Contato via (local de contato): {canal_contato}
Número/E-mail: {contato}"""
    
    return texto

@app.route('/')
def index():
    """Rota principal - retorna a interface"""
    return render_template('index.html')

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
    """Salva a nota gerada no histórico CSV"""
    try:
        dados = request.json
        
        # Preparar dados para o CSV
        registro = {
            'Data/Hora': datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
            'Tipo': dados.get('tipo', '').title().replace('_', ' '),
            'Faturas': dados.get('faturas_resumo', ''),
            'Valor Total': dados.get('valor_total', ''),
            'Texto Gerado': dados.get('texto', '')
        }
        
        # Criar DataFrame
        df = pd.DataFrame([registro])
        
        # Salvar ou adicionar ao CSV (usando ; como separador para Excel em português)
        if os.path.exists(HISTORICO_FILE):
            df.to_csv(HISTORICO_FILE, mode='a', header=False, index=False, encoding='utf-8-sig', sep=';')
        else:
            df.to_csv(HISTORICO_FILE, mode='w', header=True, index=False, encoding='utf-8-sig', sep=';')
        
        return jsonify({'sucesso': True, 'mensagem': 'Histórico salvo com sucesso!'})
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/download_historico')
def download_historico():
    """Faz download do arquivo de histórico CSV"""
    try:
        if not os.path.exists(HISTORICO_FILE):
            return jsonify({'erro': 'Nenhum histórico disponível'}), 404
        
        return send_file(HISTORICO_FILE, 
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
        webbrowser.open('http://127.0.0.1:5000')
    
    Timer(1.5, abrir_navegador).start()
    
    # Iniciar aplicação
    app.run(debug=True, use_reloader=False)

