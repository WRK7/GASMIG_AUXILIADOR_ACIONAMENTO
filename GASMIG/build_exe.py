"""
Script para criar executável standalone da aplicação GASMIG
"""

import PyInstaller.__main__
import os
import shutil
import sys

def criar_executavel():
    """Cria o executável usando PyInstaller"""
    
    print("="*60)
    print("  Criando executável GASMIG")
    print("="*60)
    
    # Limpar builds anteriores
    if os.path.exists('build'):
        print("Removendo diretório build anterior...")
        shutil.rmtree('build')
    if os.path.exists('dist'):
        print("Removendo diretório dist anterior...")
        shutil.rmtree('dist')
    
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
    print("  ✓ Executável criado com sucesso!")
    print("="*60)
    print(f"\n📁 Localização: {os.path.abspath('dist/GASMIG.exe')}")
    print("\n📋 Para distribuir:")
    print("  1. Copie o arquivo dist/GASMIG.exe para outro computador")
    print("  2. Execute o arquivo (não precisa instalar Python)")
    print("  3. O navegador abrirá automaticamente com a ferramenta")
    print("\n⚠️  Nota: O arquivo pode demorar alguns segundos para abrir")
    print("    devido à extração dos recursos internos.")
    print("\n" + "="*60)

if __name__ == '__main__':
    try:
        criar_executavel()
    except Exception as e:
        print(f"\n❌ Erro ao criar executável: {e}")
        sys.exit(1)

