// Array para armazenar faturas
let faturas = [];
let contadorFaturas = 0;

// Array para armazenar imagens anexadas
let imagensAnexadas = [];

// Inicializar a primeira fatura ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    adicionarFatura();
    
    // Listener para mudança de tipo de solicitação
    document.querySelectorAll('input[name="tipo"]').forEach(radio => {
        radio.addEventListener('change', atualizarCamposEspecificos);
    });

    // Listeners para formatação de data
    adicionarListenersData();

    // Listeners para formatação de valores monetários
    adicionarListenersValor();
    
    // Listeners para PN
    adicionarListenerPN();
    
    // Carregar histórico ao abrir a aba
    carregarHistorico();
    
    // Busca no histórico
    document.getElementById('buscarHistorico')?.addEventListener('input', filtrarHistorico);
    
    // Listener para upload de imagens
    document.getElementById('inputImagens')?.addEventListener('change', handleImagensUpload);
});

function atualizarCamposEspecificos() {
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    
    // Esconder todos os campos específicos
    document.getElementById('campos-agrupamento').style.display = 'none';
    document.getElementById('campos-parcelamento').style.display = 'none';
    document.getElementById('campos-segunda-via').style.display = 'none';
    
    // Mostrar o campo específico do tipo selecionado
    if (tipo === 'agrupamento') {
        document.getElementById('campos-agrupamento').style.display = 'block';
    } else if (tipo === 'parcelamento') {
        document.getElementById('campos-parcelamento').style.display = 'block';
    } else if (tipo === 'segunda_via') {
        document.getElementById('campos-segunda-via').style.display = 'block';
    }
}

function adicionarFatura() {
    contadorFaturas++;
    const id = contadorFaturas;
    
    const faturaDiv = document.createElement('div');
    faturaDiv.className = 'fatura-item';
    faturaDiv.id = `fatura-${id}`;
    
    faturaDiv.innerHTML = `
        <div class="fatura-header">
            <h3>Fatura #${id}</h3>
            <button type="button" class="btn-remove" onclick="removerFatura(${id})">✕</button>
        </div>
        <div class="fatura-fields">
            <div class="form-group">
                <label>Data de Vencimento:</label>
                <input type="text" class="data-input" id="data-${id}" placeholder="DD/MM/AAAA" maxlength="10" onchange="atualizarFaturas()">
            </div>
            <div class="form-group">
                <label>Valor da Fatura:</label>
                <input type="text" class="valor-input" id="valor-${id}" placeholder="R$ 0,00" onchange="atualizarFaturas()">
            </div>
        </div>
    `;
    
    document.getElementById('faturas-container').appendChild(faturaDiv);
    
    // Adicionar listeners de formatação
    aplicarMascaraData(document.getElementById(`data-${id}`));
    aplicarMascaraValor(document.getElementById(`valor-${id}`));
}

function removerFatura(id) {
    const faturaDiv = document.getElementById(`fatura-${id}`);
    if (faturaDiv) {
        faturaDiv.remove();
        atualizarFaturas();
    }
}

function atualizarFaturas() {
    faturas = [];
    let valorTotal = 0;
    
    // Coletar todas as faturas
    document.querySelectorAll('.fatura-item').forEach(item => {
        const id = item.id.split('-')[1];
        const dataInput = document.getElementById(`data-${id}`);
        const valorInput = document.getElementById(`valor-${id}`);
        
        if (dataInput && valorInput) {
            const data = dataInput.value;
            const valorTexto = valorInput.value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            const valor = parseFloat(valorTexto) || 0;
            
            // Validar data antes de adicionar
            if (data && data.length === 10 && !validarData(data)) {
                dataInput.style.borderColor = '#ff4757';
            } else if (data && data.length === 10) {
                dataInput.style.borderColor = '#ddd';
            }
            
            if (data && valor > 0 && validarData(data)) {
                faturas.push({ data, valor });
                valorTotal += valor;
            }
        }
    });
    
    // Atualizar valor total
    document.getElementById('valorTotal').value = formatarValor(valorTotal);
    
    // Verificar sequencialidade
    verificarSequencialidade();
}

function verificarSeFaturasSequenciais() {
    if (faturas.length < 2) {
        return true; // Uma única fatura é considerada "sequencial" para fins de texto
    }
    
    // Ordenar datas
    const datasOrdenadas = faturas.map(f => {
        const [dia, mes, ano] = f.data.split('/');
        return new Date(ano, mes - 1, dia);
    }).sort((a, b) => a - b);
    
    // Verificar se são sequenciais (mês a mês)
    for (let i = 1; i < datasOrdenadas.length; i++) {
        const diff = datasOrdenadas[i] - datasOrdenadas[i - 1];
        const diffDias = diff / (1000 * 60 * 60 * 24);
        
        // Se a diferença não está entre 28 e 31 dias, não é sequencial
        if (diffDias < 28 || diffDias > 31) {
            return false;
        }
    }
    
    return true;
}

function verificarSequencialidade() {
    const statusDiv = document.getElementById('status-sequencial');
    
    if (faturas.length < 2) {
        statusDiv.innerHTML = '';
        return;
    }
    
    const sequencial = verificarSeFaturasSequenciais();
    
    if (sequencial) {
        statusDiv.innerHTML = '<span class="status-sequencial">✓ Faturas sequenciais</span>';
    } else {
        statusDiv.innerHTML = '<span class="status-nao-sequencial">⚠ Faturas com intervalos não sequenciais</span>';
    }
}

function formatarValor(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function validarData(dataStr) {
    if (dataStr.length !== 10) return false;
    
    const [dia, mes, ano] = dataStr.split('/').map(n => parseInt(n));
    
    // Validar ranges básicos
    if (dia < 1 || dia > 31) return false;
    if (mes < 1 || mes > 12) return false;
    if (ano < 2000 || ano > 2100) return false;
    
    // Validar se a data é válida usando objeto Date
    const data = new Date(ano, mes - 1, dia);
    return data.getDate() === dia && data.getMonth() === mes - 1 && data.getFullYear() === ano;
}

function aplicarMascaraData(input) {
    input.addEventListener('input', function(e) {
        const cursorPos = e.target.selectionStart;
        let valor = e.target.value.replace(/\D/g, '');
        let novoValor = '';
        
        // Adicionar barras nas posições corretas
        for (let i = 0; i < valor.length && i < 8; i++) {
            if (i === 2 || i === 4) {
                novoValor += '/';
            }
            novoValor += valor[i];
        }
        
        // Calcular nova posição do cursor
        let novaPosicao = cursorPos;
        if (e.target.value.length < novoValor.length) {
            // Inserindo: avançar cursor se passou por uma barra
            if (novoValor[cursorPos - 1] === '/') {
                novaPosicao = cursorPos + 1;
            }
        }
        
        e.target.value = novoValor;
        e.target.setSelectionRange(novaPosicao, novaPosicao);
    });
    
    // Validar data ao sair do campo
    input.addEventListener('blur', function(e) {
        const valor = e.target.value;
        if (valor.length === 10 && !validarData(valor)) {
            e.target.style.borderColor = '#ff4757';
            mostrarMensagem('❌ Data inválida! Use DD/MM/AAAA (ex: 10/10/2025)', 'erro');
        } else if (valor.length === 10) {
            e.target.style.borderColor = '#667eea';
        }
    });
    
    // Permitir apagar corretamente com backspace
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace') {
            const cursorPos = e.target.selectionStart;
            const valor = e.target.value;
            
            // Se o cursor está logo após uma barra, apagar o número antes da barra
            if (cursorPos > 0 && valor[cursorPos - 1] === '/' && cursorPos === e.target.selectionEnd) {
                e.preventDefault();
                e.target.value = valor.substring(0, cursorPos - 2) + valor.substring(cursorPos);
                e.target.setSelectionRange(cursorPos - 2, cursorPos - 2);
            }
        }
    });
}

function aplicarMascaraValor(input) {
    input.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor === '') {
            e.target.value = '';
            return;
        }
        
        valor = parseInt(valor).toString();
        
        while (valor.length < 3) {
            valor = '0' + valor;
        }
        
        const reais = valor.slice(0, -2);
        const centavos = valor.slice(-2);
        
        e.target.value = `R$ ${parseInt(reais).toLocaleString('pt-BR')},${centavos}`;
    });
}

function adicionarListenersData() {
    const dataPagamento = document.getElementById('dataPagamento');
    const dataPagamentoEntrada = document.getElementById('dataPagamentoEntrada');
    
    aplicarMascaraData(dataPagamento);
    aplicarMascaraData(dataPagamentoEntrada);
    
    // Validar data de pagamento (Agrupamento) - não pode ser passado
    dataPagamento.addEventListener('blur', function() {
        const valor = this.value;
        if (valor.length === 10 && validarData(valor)) {
            const [dia, mes, ano] = valor.split('/');
            const dataSelecionada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            dataSelecionada.setHours(0, 0, 0, 0);
            
            if (dataSelecionada < hoje) {
                this.style.borderColor = '#ff4757';
                mostrarMensagem('❌ Data de pagamento não pode ser no passado!', 'erro');
            } else {
                this.style.borderColor = '#667eea';
            }
        }
    });
    
    // Validar data de pagamento entrada (Parcelamento) - não pode ser passado
    dataPagamentoEntrada.addEventListener('blur', function() {
        const valor = this.value;
        if (valor.length === 10 && validarData(valor)) {
            const [dia, mes, ano] = valor.split('/');
            const dataSelecionada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            dataSelecionada.setHours(0, 0, 0, 0);
            
            if (dataSelecionada < hoje) {
                this.style.borderColor = '#ff4757';
                mostrarMensagem('❌ Data de pagamento não pode ser no passado!', 'erro');
            } else {
                this.style.borderColor = '#667eea';
            }
        }
    });
}

function adicionarListenersValor() {
    const valorEntrada = document.getElementById('valorEntrada');
    const valorParcela = document.getElementById('valorParcela');
    const qtdParcelas = document.getElementById('qtdParcelas');
    
    aplicarMascaraValor(valorEntrada);
    aplicarMascaraValor(valorParcela);
    
    // Validar entrada mínima (50%) ao sair do campo
    valorEntrada.addEventListener('blur', function() {
        const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
        if (tipo !== 'parcelamento') return;
        
        const valor = this.value;
        if (!valor) return;
        
        const valorEntradaNum = parseFloat(valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        const valorTotal = faturas.reduce((sum, f) => sum + f.valor, 0);
        const minimoEntrada = valorTotal * 0.5;
        
        if (valorEntradaNum < minimoEntrada) {
            this.style.borderColor = '#ff4757';
            mostrarMensagem(`❌ Entrada mínima: 50% do total (${formatarValor(minimoEntrada)})`, 'erro');
        } else {
            this.style.borderColor = '#667eea';
            validarSomaParcelamento();
        }
    });
    
    // Validar valor mínimo de parcela (R$ 40) ao sair do campo
    valorParcela.addEventListener('blur', function() {
        const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
        if (tipo !== 'parcelamento') return;
        
        const valor = this.value;
        if (!valor) return;
        
        const valorParcelaNum = parseFloat(valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        
        if (valorParcelaNum < 40.00) {
            this.style.borderColor = '#ff4757';
            mostrarMensagem('❌ Valor mínimo de cada parcela: R$ 40,00', 'erro');
        } else {
            this.style.borderColor = '#667eea';
            validarSomaParcelamento();
        }
    });
    
    // Validar soma ao alterar quantidade de parcelas
    qtdParcelas.addEventListener('blur', validarSomaParcelamento);
    qtdParcelas.addEventListener('input', validarSomaParcelamento);
}

function validarSomaParcelamento() {
    const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
    if (tipo !== 'parcelamento') return;
    
    const valorEntrada = document.getElementById('valorEntrada').value;
    const valorParcela = document.getElementById('valorParcela').value;
    const qtdParcelas = document.getElementById('qtdParcelas').value;
    
    if (!valorEntrada || !valorParcela || !qtdParcelas) return;
    
    const valorEntradaNum = parseFloat(valorEntrada.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    const valorParcelaNum = parseFloat(valorParcela.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    const qtdParcelasNum = parseInt(qtdParcelas);
    const valorTotal = faturas.reduce((sum, f) => sum + f.valor, 0);
    
    if (isNaN(valorEntradaNum) || isNaN(valorParcelaNum) || isNaN(qtdParcelasNum)) return;
    
    const totalParcelas = valorParcelaNum * qtdParcelasNum;
    const somaTotal = valorEntradaNum + totalParcelas;
    const diferenca = Math.abs(somaTotal - valorTotal);
    
    if (diferenca > 0.50) {
        mostrarMensagem(
            `❌ A soma não confere! Entrada (${formatarValor(valorEntradaNum)}) + Parcelas (${qtdParcelasNum}x ${formatarValor(valorParcelaNum)} = ${formatarValor(totalParcelas)}) = ${formatarValor(somaTotal)}, mas o total é ${formatarValor(valorTotal)}. Diferença: ${formatarValor(diferenca)}`,
            'erro'
        );
    }
}

function gerarTexto() {
    console.log('=== INICIANDO GERAÇÃO DE TEXTO ===');
    
    // Validar datas de todas as faturas antes
    let datasInvalidas = false;
    document.querySelectorAll('.data-input').forEach(input => {
        if (input.value.length === 10 && !validarData(input.value)) {
            input.style.borderColor = '#ff4757';
            datasInvalidas = true;
        }
    });
    
    if (datasInvalidas) {
        mostrarMensagem('❌ Corrija as datas inválidas antes de gerar!', 'erro');
        return;
    }
    
    // Validações
    if (faturas.length === 0) {
        mostrarMensagem('❌ Adicione pelo menos uma fatura com data e valor válidos!', 'erro');
        return;
    }
    
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    console.log('Tipo selecionado:', tipo);
    
    // Obter e validar PN
    const pn = obterPN();
    if (!pn) {
        mostrarMensagem('❌ Preencha o PN completo (10 dígitos)!', 'erro');
        return;
    }
    
    const canalContato = document.getElementById('canalContato').value;
    const contatoWhatsapp = document.getElementById('contatoWhatsapp').value;
    const contatoEmail = document.getElementById('contatoEmail').value;
    
    // Validar contato
    if (!contatoWhatsapp && !contatoEmail) {
        mostrarMensagem('Preencha pelo menos um contato (WhatsApp ou E-mail)!', 'erro');
        return;
    }
    
    // Verificar se as faturas são sequenciais
    const saoSequenciais = verificarSeFaturasSequenciais();
    console.log('Faturas sequenciais?', saoSequenciais);
    
    // Montar dados
    const dados = {
        tipo: tipo,
        pn: pn,
        faturas: faturas,
        canalContato: canalContato,
        contatoWhatsapp: contatoWhatsapp,
        contatoEmail: contatoEmail,
        faturasSequenciais: saoSequenciais
    };
    
    // Adicionar campos específicos por tipo
    if (tipo === 'agrupamento') {
        const dataPagamento = document.getElementById('dataPagamento').value;
        if (!dataPagamento) {
            mostrarMensagem('Preencha a data para pagamento!', 'erro');
            return;
        }
        
        // Validar que não é passado
        const [dia, mes, ano] = dataPagamento.split('/');
        const dataSelecionada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataSelecionada.setHours(0, 0, 0, 0);
        
        if (dataSelecionada < hoje) {
            mostrarMensagem('❌ Data de pagamento não pode ser no passado!', 'erro');
            return;
        }
        
        dados.dataPagamento = dataPagamento;
    } else if (tipo === 'parcelamento') {
        console.log('=== VALIDANDO PARCELAMENTO ===');
        
        const valorEntrada = document.getElementById('valorEntrada').value;
        const qtdParcelas = document.getElementById('qtdParcelas').value;
        const valorParcela = document.getElementById('valorParcela').value;
        const dataPagamentoEntrada = document.getElementById('dataPagamentoEntrada').value;
        
        console.log('Valores:', { valorEntrada, qtdParcelas, valorParcela, dataPagamentoEntrada });
        
        if (!valorEntrada || !qtdParcelas || !valorParcela || !dataPagamentoEntrada) {
            console.log('❌ Campos não preenchidos');
            mostrarMensagem('Preencha todos os campos de parcelamento!', 'erro');
            return;
        }
        
        const valorEntradaNum = parseFloat(valorEntrada.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        const valorParcelaNum = parseFloat(valorParcela.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        const valorTotal = faturas.reduce((sum, f) => sum + f.valor, 0);
        
        console.log('Valores numéricos:', { valorEntradaNum, valorParcelaNum, valorTotal });
        
        // Validação: Data de pagamento não pode ser no passado
        if (dataPagamentoEntrada.length === 10) {
            const [dia, mes, ano] = dataPagamentoEntrada.split('/');
            const dataPagamento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            dataPagamento.setHours(0, 0, 0, 0);
            
            console.log('Validando data:', { dataPagamento, hoje });
            
            if (dataPagamento < hoje) {
                console.log('❌ Data no passado');
                mostrarMensagem('❌ Data de pagamento não pode ser no passado!', 'erro');
                return;
            }
        }
        
        // Validação: Valor mínimo de parcela R$ 40,00
        console.log('Validando valor parcela:', valorParcelaNum);
        if (valorParcelaNum < 40.00) {
            console.log('❌ Valor parcela < 40');
            mostrarMensagem('❌ Valor mínimo de cada parcela: R$ 40,00', 'erro');
            return;
        }
        
        // Validação: Entrada mínima de 50%
        const minimoEntrada = valorTotal * 0.5;
        console.log('Validando entrada:', { valorEntradaNum, minimoEntrada });
        if (valorEntradaNum < minimoEntrada) {
            console.log('❌ Entrada < 50%');
            mostrarMensagem(`❌ Entrada mínima: 50% do total (${formatarValor(minimoEntrada)})`, 'erro');
            return;
        }
        
        // Validação: Entrada + Parcelas deve ser igual ao total
        const qtdParcelasNum = parseInt(qtdParcelas);
        const totalParcelas = valorParcelaNum * qtdParcelasNum;
        const somaTotal = valorEntradaNum + totalParcelas;
        const diferenca = Math.abs(somaTotal - valorTotal);
        
        console.log('Validando soma:', { valorEntradaNum, totalParcelas, somaTotal, valorTotal, diferenca });
        
        // Permitir diferença de até R$ 0,50 por conta de arredondamentos
        if (diferenca > 0.50) {
            console.log('❌ Soma não bate');
            mostrarMensagem(
                `❌ A soma não confere! Entrada (${formatarValor(valorEntradaNum)}) + Parcelas (${qtdParcelasNum}x ${formatarValor(valorParcelaNum)} = ${formatarValor(totalParcelas)}) = ${formatarValor(somaTotal)}, mas o total é ${formatarValor(valorTotal)}. Diferença: ${formatarValor(diferenca)}`,
                'erro'
            );
            return;
        }
        
        console.log('✅ Todas validações passaram');
        
        dados.valorEntrada = valorEntradaNum;
        dados.qtdParcelas = qtdParcelasNum;
        dados.valorParcela = valorParcelaNum;
        dados.dataPagamentoEntrada = dataPagamentoEntrada;
    }
    
    // Fazer requisição ao backend
    fetch('/gerar_nota', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.erro) {
            mostrarMensagem('Erro: ' + data.erro, 'erro');
        } else {
            document.getElementById('textoGerado').value = data.texto;
            document.getElementById('resultado-section').style.display = 'block';
            document.getElementById('resultado-section').scrollIntoView({ behavior: 'smooth' });
        }
    })
    .catch(error => {
        mostrarMensagem('Erro ao gerar texto: ' + error, 'erro');
    });
}

function copiarTexto() {
    const texto = document.getElementById('textoGerado').value;
    
    if (!texto) {
        mostrarMensagem('Nenhum texto para copiar!', 'erro');
        return;
    }
    
    navigator.clipboard.writeText(texto)
        .then(() => {
            mostrarMensagem('Texto copiado com sucesso! ✓', 'sucesso');
        })
        .catch(err => {
            mostrarMensagem('Erro ao copiar texto: ' + err, 'erro');
        });
}

function salvarHistorico() {
    const texto = document.getElementById('textoGerado').value;
    
    if (!texto) {
        mostrarMensagem('Gere um texto antes de salvar no histórico!', 'erro');
        return;
    }
    
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const valorTotal = document.getElementById('valorTotal').value;
    const pn = obterPN();
    
    // Montar resumo das faturas
    const faturasResumo = faturas.map(f => `${f.data} (${formatarValor(f.valor)})`).join('; ');
    
    const dados = {
        tipo: tipo,
        pn: pn,
        faturas_resumo: faturasResumo,
        valor_total: valorTotal,
        texto: texto,
        imagens: imagensAnexadas  // Incluir imagens
    };
    
    fetch('/salvar_historico', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            mostrarMensagem(data.mensagem, 'sucesso');
            carregarHistorico(); // Atualizar histórico
            
            // Limpar imagens anexadas após salvar
            imagensAnexadas = [];
            document.getElementById('previewImagens').innerHTML = '';
            document.getElementById('inputImagens').value = '';
        } else {
            mostrarMensagem('Erro ao salvar: ' + (data.erro || 'Erro desconhecido'), 'erro');
        }
    })
    .catch(error => {
        mostrarMensagem('Erro ao salvar no histórico: ' + error, 'erro');
    });
}

function downloadHistorico() {
    window.location.href = '/download_historico';
}

function mostrarMensagem(texto, tipo) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.style.display = 'block';
    
    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 5000);
}

// ===== FUNÇÕES DO PN =====
function adicionarListenerPN() {
    const pnSufixo = document.getElementById('pnSufixo');
    const pnPrefixo = document.getElementById('pnPrefixo');
    
    // Permitir apenas números no sufixo
    pnSufixo.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 5);
        atualizarPNCompleto();
    });
    
    // Atualizar ao mudar prefixo
    pnPrefixo.addEventListener('change', atualizarPNCompleto);
}

function atualizarPNCompleto() {
    const prefixo = document.getElementById('pnPrefixo').value;
    const sufixo = document.getElementById('pnSufixo').value.padEnd(5, '_');
    document.getElementById('pnCompleto').textContent = prefixo + sufixo;
}

function obterPN() {
    const prefixo = document.getElementById('pnPrefixo').value;
    const sufixo = document.getElementById('pnSufixo').value;
    return sufixo.length === 5 ? prefixo + sufixo : '';
}

// ===== FUNÇÕES DAS ABAS =====
function trocarAba(aba) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desativar todos os botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ativar aba selecionada
    document.getElementById(`aba-${aba}`).classList.add('active');
    event.target.classList.add('active');
    
    // Aumentar container se for histórico (compatibilidade com navegadores antigos)
    const container = document.querySelector('.container');
    if (aba === 'historico') {
        container.style.maxWidth = '1400px';
        carregarHistorico();
    } else {
        container.style.maxWidth = '900px';
    }
}

// ===== FUNÇÕES DO HISTÓRICO =====
let historicoCompleto = [];

function carregarHistorico() {
    fetch('/listar_historico')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                historicoCompleto = data.historico;
                exibirHistorico(historicoCompleto);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar histórico:', error);
        });
}

function exibirHistorico(historico) {
    const tbody = document.getElementById('corpoHistorico');
    
    if (!historico || historico.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    Nenhum registro no histórico ainda.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = historico.map((item, index) => {
        const temImagens = item.imagens && item.imagens.length > 0;
        const qtdImagens = temImagens ? item.imagens.length : 0;
        
        return `
            <tr>
                <td>${item.data_hora}</td>
                <td><strong>${item.pn || 'N/A'}</strong></td>
                <td><span style="color: #667eea;">${item.tipo}</span></td>
                <td>
                    <strong>${item.valor_total}</strong>
                    ${temImagens ? `<br><small style="color: #28a745;">📎 ${qtdImagens} imagem(ns)</small>` : ''}
                </td>
                <td>
                    <div class="texto-preview" onclick="mostrarTextoCompleto(${index})">
                        ${item.texto.substring(0, 50)}...
                    </div>
                </td>
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="btn btn-success" style="padding: 5px 10px; font-size: 0.9rem;" onclick="copiarTextoHistorico(${index})" title="Copiar texto">
                            📋
                        </button>
                        <button class="btn btn-info" style="padding: 5px 10px; font-size: 0.9rem;" onclick="baixarTextoHistorico(${index})" title="Baixar arquivo">
                            📥
                        </button>
                        ${temImagens ? `
                            <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.9rem;" onclick="abrirModalImagens(${index})" title="Ver imagens">
                                🖼️
                            </button>
                        ` : ''}
                        <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.9rem;" onclick="removerItemHistorico('${(item.pn || '').replace(/'/g, "\\'")}', '${item.data_hora.replace(/'/g, "\\'")}', '${item.tipo.replace(/'/g, "\\'")}')" title="Remover item">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarHistorico() {
    const busca = document.getElementById('buscarHistorico').value.toLowerCase();
    const filtrado = historicoCompleto.filter(item => 
        item.data_hora.toLowerCase().includes(busca) ||
        (item.pn && item.pn.toLowerCase().includes(busca)) ||
        item.tipo.toLowerCase().includes(busca) ||
        item.texto.toLowerCase().includes(busca)
    );
    exibirHistorico(filtrado);
}

function mostrarTextoCompleto(index) {
    const item = historicoCompleto[index];
    alert(item.texto);
}

function copiarTextoHistorico(index) {
    const item = historicoCompleto[index];
    navigator.clipboard.writeText(item.texto)
        .then(() => {
            mostrarMensagem('Texto copiado com sucesso! ✓', 'sucesso');
        })
        .catch(err => {
            mostrarMensagem('Erro ao copiar texto: ' + err, 'erro');
        });
}

function baixarTextoHistorico(index) {
    const item = historicoCompleto[index];
    
    // Criar nome do arquivo
    const dataLimpa = item.data_hora.replace(/[\/\s:]/g, '_');
    const nomeArquivo = `Nota_${item.pn}_${dataLimpa}.txt`;
    
    // Criar blob com o texto
    const blob = new Blob([item.texto], { type: 'text/plain;charset=utf-8' });
    
    // Criar link temporário e fazer download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
    
    // Limpar
    URL.revokeObjectURL(link.href);
    
    mostrarMensagem('Arquivo baixado com sucesso! ✓', 'sucesso');
}

function exportarHistoricoCSV() {
    window.location.href = '/download_historico';
}

function limparHistorico() {
    if (confirm('⚠️ Tem certeza que deseja limpar TODO o histórico? Esta ação não pode ser desfeita!')) {
        fetch('/limpar_historico', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    mostrarMensagem('Histórico limpo com sucesso!', 'sucesso');
                    carregarHistorico();
                }
            })
            .catch(error => {
                mostrarMensagem('Erro ao limpar histórico: ' + error, 'erro');
            });
    }
}

function removerItemHistorico(pn, dataHora, tipo) {
    const confirmacao = confirm(`⚠️ Tem certeza que deseja remover este item?\n\nPN: ${pn || 'N/A'}\nTipo: ${tipo}\nData: ${dataHora}\n\nEsta ação não pode ser desfeita!`);
    
    if (!confirmacao) return;
    
    fetch('/remover_item_historico', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pn: pn,
            data_hora: dataHora,
            tipo: tipo
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            mostrarMensagem('Item removido com sucesso!', 'sucesso');
            carregarHistorico();
        } else {
            mostrarMensagem('Erro ao remover item: ' + (data.erro || 'Erro desconhecido'), 'erro');
        }
    })
    .catch(error => {
        mostrarMensagem('Erro ao remover item: ' + error, 'erro');
    });
}

function limparFormulario() {
    if (!confirm('Limpar todos os dados do formulário?')) {
        return;
    }
    
    // Limpar tipo de solicitação (voltar para agrupamento)
    document.querySelector('input[name="tipo"][value="agrupamento"]').checked = true;
    atualizarCamposEspecificos();
    
    // Limpar PN
    document.getElementById('pnPrefixo').value = '70000';
    document.getElementById('pnSufixo').value = '';
    atualizarPNCompleto();
    
    // Limpar faturas
    document.getElementById('faturas-container').innerHTML = '';
    faturas = [];
    contadorFaturas = 0;
    adicionarFatura();
    atualizarFaturas();
    
    // Limpar campos específicos de agrupamento
    document.getElementById('dataPagamento').value = '';
    
    // Limpar campos específicos de parcelamento
    document.getElementById('valorEntrada').value = '';
    document.getElementById('qtdParcelas').value = '';
    document.getElementById('valorParcela').value = '';
    document.getElementById('dataPagamentoEntrada').value = '';
    
    // Limpar contatos
    document.getElementById('canalContato').value = 'Digisac';
    document.getElementById('contatoWhatsapp').value = '';
    document.getElementById('contatoEmail').value = '';
    
    // Limpar imagens
    imagensAnexadas = [];
    document.getElementById('previewImagens').innerHTML = '';
    document.getElementById('inputImagens').value = '';
    
    // Limpar resultado
    document.getElementById('textoGerado').value = '';
    document.getElementById('resultado-section').style.display = 'none';
    
    // Limpar mensagens
    document.getElementById('mensagem').style.display = 'none';
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    mostrarMensagem('Formulário limpo com sucesso!', 'sucesso');
}

// ===== FUNÇÕES DE IMAGENS =====
function handleImagensUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('previewImagens');
    
    // Validar tamanho máximo (100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB em bytes
    
    for (let file of files) {
        if (file.size > maxSize) {
            mostrarMensagem(`❌ Imagem "${file.name}" excede o tamanho máximo de 100MB!`, 'erro');
            continue;
        }
        
        if (!file.type.startsWith('image/')) {
            mostrarMensagem(`❌ Arquivo "${file.name}" não é uma imagem válida!`, 'erro');
            continue;
        }
        
        // Converter para Base64
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagemBase64 = e.target.result;
            
            // Adicionar ao array
            const imagemObj = {
                nome: file.name,
                tipo: file.type,
                tamanho: file.size,
                data: imagemBase64
            };
            
            imagensAnexadas.push(imagemObj);
            
            // Adicionar preview
            const previewItem = document.createElement('div');
            previewItem.style.cssText = 'position: relative; display: inline-block;';
            previewItem.innerHTML = `
                <img src="${imagemBase64}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;">
                <button type="button" onclick="removerImagem(${imagensAnexadas.length - 1})" 
                        style="position: absolute; top: -8px; right: -8px; background: #ff4757; color: white; border: none; 
                               border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; font-weight: bold;">
                    ×
                </button>
            `;
            preview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    }
    
    // Limpar input
    event.target.value = '';
}

function removerImagem(index) {
    imagensAnexadas.splice(index, 1);
    
    // Recriar preview
    const preview = document.getElementById('previewImagens');
    preview.innerHTML = '';
    
    imagensAnexadas.forEach((img, i) => {
        const previewItem = document.createElement('div');
        previewItem.style.cssText = 'position: relative; display: inline-block;';
        previewItem.innerHTML = `
            <img src="${img.data}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;">
            <button type="button" onclick="removerImagem(${i})" 
                    style="position: absolute; top: -8px; right: -8px; background: #ff4757; color: white; border: none; 
                           border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; font-weight: bold;">
                ×
            </button>
        `;
        preview.appendChild(previewItem);
    });
}

function abrirModalImagens(index) {
    const item = historicoCompleto[index];
    
    if (!item.imagens || item.imagens.length === 0) {
        mostrarMensagem('Este registro não possui imagens anexadas.', 'erro');
        return;
    }
    
    const galeria = document.getElementById('galeria-imagens');
    galeria.innerHTML = '';
    
    item.imagens.forEach((img, i) => {
        const imgElement = document.createElement('div');
        imgElement.style.cssText = 'flex: 0 0 calc(33.333% - 10px); min-width: 200px;';
        imgElement.innerHTML = `
            <div style="border: 2px solid #ddd; border-radius: 8px; overflow: hidden; background: #f8f9fa;">
                <img src="${img.data}" style="width: 100%; height: 200px; object-fit: contain; background: white; cursor: pointer;" 
                     onclick="abrirImagemNovaAba('${img.data}', '${img.nome}')" title="Clique para abrir em tamanho original">
                <div style="padding: 10px; background: white;">
                    <small style="color: #666; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        📎 ${img.nome}
                    </small>
                    <small style="color: #999;">${formatarTamanho(img.tamanho)}</small>
                    <button onclick="baixarImagem('${img.data}', '${img.nome}')" 
                            style="margin-top: 5px; padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                        📥 Baixar
                    </button>
                </div>
            </div>
        `;
        galeria.appendChild(imgElement);
    });
    
    document.getElementById('modalImagens').style.display = 'flex';
}

function fecharModalImagens() {
    document.getElementById('modalImagens').style.display = 'none';
}

function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function abrirImagemNovaAba(dataUrl, nome) {
    // Abrir imagem Base64 em nova aba
    const novaAba = window.open();
    novaAba.document.write(`
        <html>
            <head>
                <title>${nome}</title>
                <style>
                    body { margin: 0; display: flex; justify-content: center; align-items: center; background: #333; min-height: 100vh; }
                    img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                </style>
            </head>
            <body>
                <img src="${dataUrl}" alt="${nome}">
            </body>
        </html>
    `);
}

function baixarImagem(dataUrl, nome) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = nome;
    link.click();
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modalImagens');
    if (event.target == modal) {
        fecharModalImagens();
    }
}

