// Array para armazenar faturas
let faturas = [];
let contadorFaturas = 0;

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
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor.length >= 2) {
            valor = valor.substring(0, 2) + '/' + valor.substring(2);
        }
        if (valor.length >= 5) {
            valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
        }
        
        e.target.value = valor;
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
            const valor = e.target.value;
            const cursorPos = e.target.selectionStart;
            
            // Se o cursor está logo após uma barra, apagar o número antes da barra
            if (valor[cursorPos - 1] === '/' && cursorPos === e.target.selectionEnd) {
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
    aplicarMascaraData(document.getElementById('dataPagamento'));
    aplicarMascaraData(document.getElementById('dataPagamentoEntrada'));
}

function adicionarListenersValor() {
    aplicarMascaraValor(document.getElementById('valorEntrada'));
    aplicarMascaraValor(document.getElementById('valorParcela'));
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
        
        // Validação: Data de pagamento deve ser hoje ou amanhã (verificar primeiro)
        if (dataPagamentoEntrada.length === 10) {
            const [dia, mes, ano] = dataPagamentoEntrada.split('/');
            const dataPagamento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            
            dataPagamento.setHours(0, 0, 0, 0);
            
            console.log('Validando data:', { dataPagamento, hoje, amanha });
            
            if (dataPagamento < hoje || dataPagamento > amanha) {
                const dataHoje = hoje.toLocaleDateString('pt-BR');
                const dataAmanha = amanha.toLocaleDateString('pt-BR');
                console.log('❌ Data inválida');
                mostrarMensagem(`Data de pagamento deve ser hoje (${dataHoje}) ou amanhã (${dataAmanha})!`, 'erro');
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
    
    // Montar resumo das faturas
    const faturasResumo = faturas.map(f => `${f.data} (${formatarValor(f.valor)})`).join('; ');
    
    const dados = {
        tipo: tipo,
        faturas_resumo: faturasResumo,
        valor_total: valorTotal,
        texto: texto
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
        } else {
            mostrarMensagem('Erro ao salvar: ' + data.erro, 'erro');
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

