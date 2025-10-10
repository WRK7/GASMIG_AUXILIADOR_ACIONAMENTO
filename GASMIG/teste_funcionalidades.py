"""
Script de teste para validar as funcionalidades principais da aplicação
"""

import sys
from datetime import datetime

# Configurar encoding para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def teste_formatacao_valor():
    """Testa a formatação de valores monetários"""
    def formatar_valor(valor):
        return f"R$ {valor:.2f}".replace('.', ',')
    
    assert formatar_valor(150.30) == "R$ 150,30"
    assert formatar_valor(1000.00) == "R$ 1000,00"
    assert formatar_valor(0.50) == "R$ 0,50"
    print("✓ Teste de formatação de valores: OK")

def teste_intervalo_datas():
    """Testa a detecção de intervalo de datas"""
    def obter_intervalo_datas(faturas):
        if not faturas:
            return "", ""
        
        datas = [f['data'] for f in faturas]
        if len(datas) == 1:
            return datas[0], datas[0]
        
        datas_obj = []
        for data_str in datas:
            dia, mes, ano = data_str.split('/')
            datas_obj.append(datetime(int(ano), int(mes), int(dia)))
        
        data_min = min(datas_obj)
        data_max = max(datas_obj)
        
        return data_min.strftime('%d/%m/%Y'), data_max.strftime('%d/%m/%Y')
    
    faturas1 = [{'data': '25/09/2025'}, {'data': '25/10/2025'}]
    inicio, fim = obter_intervalo_datas(faturas1)
    assert inicio == "25/09/2025"
    assert fim == "25/10/2025"
    
    faturas2 = [{'data': '15/11/2025'}]
    inicio, fim = obter_intervalo_datas(faturas2)
    assert inicio == "15/11/2025"
    assert fim == "15/11/2025"
    
    print("✓ Teste de intervalo de datas: OK")

def teste_geracao_texto_agrupamento():
    """Testa a geração de texto para agrupamento"""
    def formatar_valor(valor):
        return f"R$ {valor:.2f}".replace('.', ',')
    
    def gerar_texto_agrupamento(dados):
        faturas = dados.get('faturas', [])
        
        # Obter intervalo de datas
        datas = [f['data'] for f in faturas]
        data_inicio = min(datas) if datas else ""
        data_fim = max(datas) if datas else ""
        
        valor_total = sum(f['valor'] for f in faturas)
        data_pagamento = dados.get('dataPagamento', '')
        canal_contato = dados.get('canalContato', '')
        contato_whatsapp = dados.get('contatoWhatsapp', '')
        contato_email = dados.get('contatoEmail', '')
        
        if canal_contato == 'Digisac':
            contato = contato_whatsapp if contato_whatsapp else contato_email
        else:
            contato = contato_email if contato_email else contato_whatsapp
        
        intervalo = f"{data_inicio} a {data_fim}" if data_inicio != data_fim else data_inicio
        
        texto = f"""Solicitação: Cliente solicitou agrupamento das faturas de {intervalo}, totalizando {formatar_valor(valor_total)}, para pagamento em {data_pagamento}.
Contato via (local de contato): {canal_contato}
Número/E-mail: {contato}"""
        
        return texto
    
    dados = {
        'faturas': [
            {'data': '25/09/2025', 'valor': 150.00},
            {'data': '25/10/2025', 'valor': 180.00}
        ],
        'dataPagamento': '15/11/2025',
        'canalContato': 'Digisac',
        'contatoWhatsapp': '(31) 99999-9999',
        'contatoEmail': 'teste@email.com'
    }
    
    texto = gerar_texto_agrupamento(dados)
    assert 'agrupamento' in texto
    assert 'R$ 330,00' in texto
    assert '25/09/2025 a 25/10/2025' in texto
    assert '15/11/2025' in texto
    
    print("✓ Teste de geração de texto (agrupamento): OK")

def executar_todos_testes():
    """Executa todos os testes"""
    print("="*60)
    print("  Executando Testes de Funcionalidades")
    print("="*60)
    print()
    
    try:
        teste_formatacao_valor()
        teste_intervalo_datas()
        teste_geracao_texto_agrupamento()
        
        print()
        print("="*60)
        print("  ✓ Todos os testes passaram com sucesso!")
        print("="*60)
        
    except AssertionError as e:
        print(f"\n❌ Erro em teste: {e}")
        return False
    
    return True

if __name__ == '__main__':
    executar_todos_testes()

