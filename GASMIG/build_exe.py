"""
Script para criar executável standalone da aplicação GASMIG
"""

import PyInstaller.__main__
import os
import shutil
import sys

# Configurar encoding UTF-8 para evitar erros com caracteres especiais
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def criar_executavel():
    """Cria o executável usando PyInstaller"""
    
    print("="*60)
    print("  Criando executável GASMIG")
    print("="*60)
    
    # Limpar builds anteriores (mais agressivo)
    print("Limpando builds anteriores...")
    for diretorio in ['build', 'dist', '__pycache__']:
        if os.path.exists(diretorio):
            print(f"  Removendo {diretorio}...")
            shutil.rmtree(diretorio)
    
    # Limpar arquivos .spec antigos
    for arquivo in os.listdir('.'):
        if arquivo.endswith('.spec'):
            print(f"  Removendo {arquivo}...")
            os.remove(arquivo)
    
    # Limpar cache do PyInstaller
    cache_pyinstaller = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'pyinstaller')
    if os.path.exists(cache_pyinstaller):
        print(f"  Removendo cache do PyInstaller...")
        shutil.rmtree(cache_pyinstaller, ignore_errors=True)
    
    print("\nIniciando processo de compilação...")
    
    # Determinar separador de caminho baseado no SO
    separador = ';' if sys.platform == 'win32' else ':'
    
    # Configurar PyInstaller
    PyInstaller.__main__.run([
        'app.py',                                      # Script principal
        '--name=GASMIG',                               # Nome do executável
        '--onefile',                                   # Arquivo único
        '--noconsole',                                 # Sem console
        f'--add-data=templates{separador}templates',   # Incluir templates
        f'--add-data=static{separador}static',         # Incluir arquivos estáticos
        '--clean',                                     # Limpar cache
        '--noconfirm',                                 # Não pedir confirmação
    ])
    
    print("\n" + "="*60)
    print("  [OK] Executavel criado com sucesso!")
    print("="*60)
    exe_path = os.path.abspath('dist/GASMIG.exe')
    print(f"\n[LOCAL] Localizacao: {exe_path}")
    print("\n[INFO] Para distribuir:")
    print("  1. Copie o arquivo dist/GASMIG.exe para outro computador")
    print("  2. Execute o arquivo (nao precisa instalar Python)")
    print("  3. O navegador abrira automaticamente com a ferramenta")
    print("\n[AVISO] Nota: O arquivo pode demorar alguns segundos para abrir")
    print("    devido a extracao dos recursos internos.")
    print("\n" + "="*60)

if __name__ == '__main__':
    try:
        criar_executavel()
    except Exception as e:
        print(f"\n[ERRO] Erro ao criar executavel: {e}")
        sys.exit(1)

