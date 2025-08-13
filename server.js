const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/gerar-pdf', async (req, res) => {
    let browser;
    let page;

    try {
        const formData = req.body;

        const gerarLinhasTabela = (tableIndex) => {
            let linhas = '';
            for (let i = 0; i < 2; i++) {
                const apChecked = formData[`ap${tableIndex}`] && formData[`ap${tableIndex}`].includes(i.toString()) ? 'checked' : '';
                const rpChecked = formData[`rp${tableIndex}`] && formData[`rp${tableIndex}`].includes(i.toString()) ? 'checked' : '';
                
                const qtd = formData[`qtd${tableIndex}`] ? formData[`qtd${tableIndex}`][i] || '' : '';
                const unid = formData[`unid${tableIndex}`] ? formData[`unid${tableIndex}`][i] || '' : '';
                const descricao = formData[`descricao${tableIndex}`] ? formData[`descricao${tableIndex}`][i] || '' : '';
                const valorUnit = formData[`valorUnit${tableIndex}`] ? formData[`valorUnit${tableIndex}`][i] || '' : '';
                const valorTotal = formData[`valorTotal${tableIndex}`] ? formData[`valorTotal${tableIndex}`][i] || '' : '';

                linhas += `
                    <tr>
                        <td>${qtd}</td>
                        <td>${unid}</td>
                        <td>${descricao}</td>
                        <td>${valorUnit}</td>
                        <td>${valorTotal}</td>
                        <td><input type="checkbox" ${apChecked} disabled></td>
                        <td><input type="checkbox" ${rpChecked} disabled></td>
                    </tr>
                `;
            }
            return linhas;
        };

        const linhasTabela1 = gerarLinhasTabela('');
        const linhasTabela2 = gerarLinhasTabela('2');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Relatório de Atendimento JRV</title>
                <link rel="stylesheet" href="http://localhost:${port}/css/style.css">
                <style>
                    body {
                        padding: 0;
                        margin: 0;
                        font-size: 10px;
                    }
                    .relatorio-container {
                        box-shadow: none;
                        border: 1px solid #000;
                    }
                    button {
                        display: none;
                    }
                    input[type="text"],
                    input[type="password"],
                    input[type="date"],
                    input[type="time"],
                    input[type="number"],
                    textarea {
                        border: none;
                        background: transparent;
                        pointer-events: none;
                    }
                    th, td {
                        padding: 3px;
                    }
                </style>
            </head>
            <body>
                <div class="relatorio-container">
                    <header>
                        <div class="logo">JRV</div>
                        <h1>Relatório de Atendimento Técnico</h1>
                    </header>

                    <section class="secao">
                        <div class="linha">
                            <div class="campo flex-3 no-border">
                                <label>Cliente:</label>
                                <input type="text" value="${formData.cliente || ''}" readonly>
                            </div>
                            <div class="campo flex-1">
                                <label>Nº Ordem:</label>
                                <input type="text" value="${formData.nOrdem || ''}" readonly>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo flex-2 no-border">
                                <label>Endereço:</label>
                                <input type="text" value="${formData.endereco || ''}" readonly>
                            </div>
                            <div class="campo flex-1">
                                <label>CPF OU RG:</label>
                                <input type="text" value="${formData.cpfRg || ''}" readonly>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo flex-2 no-border">
                                <label>Contato Local:</label>
                                <input type="text" value="${formData.contatoLocal || ''}" readonly>
                            </div>
                            <div class="campo flex-1">
                                <label>Data in:</label>
                                <input type="date" value="${formData.dataInicio || ''}" readonly>
                            </div>
                            <div class="campo flex-1">
                                <label>Hora in:</label>
                                <input type="time" value="${formData.horaInicio || ''}" readonly>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo flex-2 no-border">
                                <label>Contato Local:</label>
                                <input type="text" value="${formData.contatoLocal2 || ''}" readonly>
                            </div>
                            <div class="campo flex-1">
                                <label>Data out:</label>
                                <input type="date" value="${formData.dataSaida || ''}" readonly>
                            </div>
                            <div class="campo flex-1">
                                <label>Hora out:</label>
                                <input type="time" value="${formData.horaSaida || ''}" readonly>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo flex-1 no-border">
                                <label>Atendente:</label>
                                <input type="text" value="${formData.atendente || ''}" readonly>
                            </div>
                            <div class="campo flex-1">
                                <label>TELEFONES:</label>
                                <input type="text" value="${formData.telefones || ''}" readonly>
                            </div>
                        </div>
                    </section>
                    
                    <section class="secao">
                        <div class="linha">
                            <div class="campo no-border" style="flex:1;">
                                <label>Informações do Objeto:</label>
                            </div>
                            <div class="campo" style="flex:2;">
                                <label>Usuário:</label>
                                <input type="text" value="${formData.usuario || ''}" readonly>
                            </div>
                            <div class="campo" style="flex:1;">
                                <label>Senha:</label>
                                <input type="password" value="${formData.senha || ''}" readonly>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo no-border">
                                <label>Marca:</label>
                                <input type="text" value="${formData.marca || ''}" readonly>
                            </div>
                            <div class="campo">
                                <label>Modelo:</label>
                                <input type="text" value="${formData.modelo || ''}" readonly>
                            </div>
                            <div class="campo">
                                <label>Memória:</label>
                                <input type="text" value="${formData.memoria || ''}" readonly>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo no-border">
                                <label>HD:</label>
                                <input type="text" value="${formData.hd || ''}" readonly>
                            </div>
                            <div class="campo">
                                <label>Processador:</label>
                                <input type="text" value="${formData.processador || ''}" readonly>
                            </div>
                            <div class="campo">
                                <label>MainBoard:</label>
                                <input type="text" value="${formData.mainboard || ''}" readonly>
                            </div>
                        </div>
                    </section>
                    
                    <section class="secao">
                        <div class="linha">
                            <div class="campo completo no-border">
                                <label>DEFEITO RECLAMADO:</label>
                                <textarea readonly rows="4">${formData.defeito || ''}</textarea>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo completo no-border">
                                <label>Detalhamentos:</label>
                                <textarea readonly rows="6">${formData.detalhamento || ''}</textarea>
                            </div>
                        </div>
                        <div class="linha">
                            <div class="campo completo no-border">
                                <label>OBSERVAÇÕES:</label>
                                <textarea readonly rows="2">${formData.obs1 || ''}</textarea>
                            </div>
                        </div>
                    </section>
                    
                    <section class="secao">
                        <div class="aviso">
                            <p>Atenção: Equipamentos não retirados, após passado orçamento, no prazo de 90 dias será vendido para cobrir os custos de serviços!!!</p>
                            <div class="de-acordo">
                                <label>De Acordo:</label>
                                <input type="text" readonly>
                            </div>
                        </div>
                    </section>
                    
                    <section class="secao">
                        <table id="tabela-materiais">
                            <thead>
                                <tr>
                                    <td colspan="7" style="border:none; border-bottom:1px solid #000;"><h3>Listagem de materiais pré-orçamento</h3></td>
                                </tr>
                                <tr>
                                    <th>Qtd.</th>
                                    <th>Unid.</th>
                                    <th class="descricao">Descrição</th>
                                    <th>Valor Unit.</th>
                                    <th>Valor</th>
                                    <th>AP</th>
                                    <th>RP</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linhasTabela1}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" style="text-align: right; font-weight: bold; border-left:none;">Total >>>:</td>
                                    <td colspan="3"><input type="text" value="${formData.totalGeral || ''}" readonly></td>
                                </tr>
                            </tfoot>
                        </table>
                    </section>

                    <section class="secao">
                        <table id="tabela-materiais2">
                            <thead>
                                <tr>
                                    <td colspan="7" style="border:none; border-bottom:1px solid #000;"><h3>Listagem de materiais pré-orçamento</h3></td>
                                </tr>
                                <tr>
                                    <th>Qtd.</th>
                                    <th>Unid.</th>
                                    <th class="descricao">Descrição</th>
                                    <th>Valor Unit.</th>
                                    <th>Valor</th>
                                    <th>AP</th>
                                    <th>RP</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linhasTabela2}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" style="text-align: right; font-weight: bold; border-left:none;">Total >>>:</td>
                                    <td colspan="3"><input type="text" value="${formData.totalGeral2 || ''}" readonly></td>
                                </tr>
                            </tfoot>
                        </table>
                    </section>
                    
                    <section class="secao">
                        <div class="linha">
                            <div class="campo completo no-border">
                                <h3 style="margin-top:0;">FORMAS DE PAGAMENTO</h3>
                                <div class="formas-pagamento">
                                    <label><input type="checkbox" ${formData.pagamento && formData.pagamento.includes('debito') ? 'checked' : ''} disabled> DÉBITO</label>
                                    <label><input type="checkbox" ${formData.pagamento && formData.pagamento.includes('credito') ? 'checked' : ''} disabled> CRÉDITO</label>
                                    <label><input type="checkbox" ${formData.pagamento && formData.pagamento.includes('cash') ? 'checked' : ''} disabled> CASH</label>
                                    <label>PIX: <input type="text" value="${formData.pixPagamento || ''}" readonly></label>
                                    <label>Outros: <input type="text" value="${formData.outrosPagamento || ''}" readonly></label>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section class="secao">
                        <div class="linha" style="border-top: none;">
                            <div class="campo no-border">
                                <div class="assinatura-block">
                                    <div class="assinatura-linha"></div>
                                    <p>Técnico JRV</p>
                                </div>
                            </div>
                            <div class="campo">
                                <div class="assinatura-block">
                                    <div class="assinatura-linha"></div>
                                    <p>Ass. Responsável Cliente</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <footer>
                        <p>JRV Automação e Informática MEI - "A solução que você precisa!"</p>
                        <p>Tel: (11) 2056-5008 / (11) 993.447.737 - e-mail: jaime_viana@jrvti.com.br - www.jrvti.com.br</p>
                        <p class="final">Deus seja louvado!</p>
                    </footer>
                </div>
            </body>
            </html>
        `;

        browser = await puppeteer.launch();
        page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_atendimento.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
        res.status(500).send('Erro ao gerar o PDF.');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});