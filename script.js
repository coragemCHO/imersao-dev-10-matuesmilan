// --- Variáveis Globais e Seletores de Elementos ---
const cardContainer = document.querySelector('.card-container');
const caixaBusca = document.getElementById('caixa-busca');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const guideModal = document.getElementById('guide-modal');
const openGuideBtn = document.getElementById('open-guide-btn');
const closeGuideBtn = document.querySelector('.close-modal-btn');

let ferramentas = []; // Array para armazenar os dados das ferramentas carregadas do JSON.
let debounceTimer; // Variável para controlar o timer do "debounce" na busca.

/**
 * Carrega os dados das ferramentas a partir do arquivo data.json.
 * A função é assíncrona para aguardar a resposta da requisição.
 * Em caso de erro, exibe uma mensagem na tela.
 */
async function carregarDados() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        ferramentas = await response.json();
        exibirCards([]); // Inicialmente, exibe a lista vazia
    } catch (error) {
        console.error('Falha ao carregar o arquivo data.json:', error);
        cardContainer.innerHTML = '<p>Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
    }
}

/**
 * Renderiza os cards das ferramentas na tela.
 * @param {Array<Object>} listaFerramentas - A lista de ferramentas a ser exibida.
 * A função limpa o container, verifica se há resultados e cria um card para cada ferramenta.
 */
function exibirCards(listaFerramentas) {
    cardContainer.innerHTML = ''; // Limpa os cards existentes

    if (caixaBusca.value.trim().length > 0 && listaFerramentas.length === 0) {
        cardContainer.innerHTML = '<p>Nenhuma ferramenta encontrada com este termo.</p>';
        return;
    }

    const termoBusca = caixaBusca.value;
    const regex = new RegExp(termoBusca, 'gi'); // Expressão regular para destacar o termo buscado (global e case-insensitive).

    listaFerramentas.forEach((ferramenta, index) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.05}s`; // Adiciona o atraso para a animação
 
        // Destaca o termo de busca no nome da ferramenta, se houver um termo.
        const nomeDestacado = ferramenta.nome.replace(regex, (match) => `<mark>${match}</mark>`);

        const nomeFinal = termoBusca ? nomeDestacado : ferramenta.nome;


        card.innerHTML = `
        <h2>${nomeFinal}</h2>
        <p><strong>Ano (versão relevante):</strong> ${ferramenta.ano_versao_relevante}</p>
        <p>${ferramenta.descricao}</p>
        <div class="categorias-container">
            <strong>Categorias:</strong> ${ferramenta.categorias.map(cat => `<span class="categoria-tag" onclick="buscarPorCategoria('${cat}')">${cat}</span>`).join('')}
        </div>
        <a href="${ferramenta.link}" target="_blank" class="saiba-mais-link">Saiba mais</a>
        `;

        cardContainer.appendChild(card);
    });
}

/**
 * Inicia o processo de busca com base no valor da caixa de busca.
 * Diferencia entre uma busca por nome e uma busca por categoria (ex: categoria:"Metagenômica").
 */
function iniciarBusca() {
    const termoBusca = caixaBusca.value.trim();
    const termoBuscaLower = termoBusca.toLowerCase();

    if (termoBusca.length === 0) {
        exibirCards([]); // Limpa os resultados se a busca estiver vazia
        return;
    }

    let resultados;
    // Verifica se a busca segue o padrão de filtro por categoria.
    const categorySearchPattern = /^categoria:"(.+)"$/i;
    const match = termoBusca.match(categorySearchPattern);

    if (match) {
        // Se encontrou o padrão, busca por categoria
        const categoria = match[1].toLowerCase();
        resultados = ferramentas.filter(ferramenta =>
            ferramenta.categorias.some(cat => cat.toLowerCase() === categoria)
        );
    } else {
        // Senão, busca pelo nome da ferramenta
        resultados = ferramentas.filter(ferramenta =>
            ferramenta.nome.toLowerCase().includes(termoBuscaLower)
        );
    }

    exibirCards(resultados);
}


// --- Event Listeners ---

// Adiciona um listener para buscar enquanto o usuário digita, com "debounce".
caixaBusca.addEventListener('input', () => {
    clearTimeout(debounceTimer); // Cancela o timer anterior para reiniciar a contagem.
    debounceTimer = setTimeout(() => {
        iniciarBusca();
    }, 300); // Aguarda 300ms após o usuário parar de digitar para iniciar a busca.
});

// Listener para o botão de alternar modo claro/escuro.
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Salva a preferência no localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        darkModeToggle.textContent = '☀️'; // Altera ícone para sol
    } else {
        localStorage.setItem('darkMode', 'disabled');
        darkModeToggle.textContent = '🌙'; // Altera ícone para lua
    }
});

// Listener que é acionado quando o conteúdo da página é carregado.
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    } else {
        darkModeToggle.textContent = '🌙';
    }
});

// --- Lógica do Modal de Guia ---

/**
 * Abre o modal do guia.
 */
function openModal() {
    guideModal.classList.add('visible');
    document.body.classList.add('modal-open');
}
/**
 * Fecha o modal do guia.
 */
function closeModal() {
    guideModal.classList.remove('visible');
    document.body.classList.remove('modal-open');
}

openGuideBtn.addEventListener('click', openModal);
closeGuideBtn.addEventListener('click', closeModal);
guideModal.addEventListener('click', (event) => { // Fecha o modal ao clicar fora da área de conteúdo.
    // Fecha o modal se o clique for no overlay (fundo), mas não no conteúdo
    if (event.target === guideModal) {
        closeModal();
    }
});

// --- Lógica do Botão "Voltar ao Topo" ---
const backToTopBtn = document.getElementById('back-to-top-btn');

// Mostra ou esconde o botão com base na posição de rolagem da página.
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

// Adiciona a funcionalidade de rolagem suave para o topo ao clicar no botão.
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Rolagem suave!
    });
});

// --- Lógica do Guia de Análise Interativo ("Não sabe por onde começar?") ---
const dataTypeSelect = document.getElementById('data-type');
const goalControlGroup = document.getElementById('goal-control-group');
const analysisGoalSelect = document.getElementById('analysis-goal');
const suggestionResultDiv = document.getElementById('suggestion-result');

const analysisGoals = {
    // Objetivos para dados de Amplicon (16S/ITS)
    amplicon: {
        '': 'Selecione...',
        'taxonomia': 'Identificar quem está na minha amostra (Taxonomia)',
        'funcional': 'Prever o que a comunidade pode fazer (Função)'
    },
    // Objetivos para dados de Metagenômica (Shotgun)
    shotgun: {
        '': 'Selecione...',
        'taxonomia': 'Identificar quem está na minha amostra (Taxonomia)',
        'funcional': 'Identificar o que a comunidade está fazendo (Função)',
        'montagem': 'Montar genomas a partir dos meus dados (MAGs)'
    },
    // Objetivos para dados de Genomas de Isolados
    genomes: {
        '': 'Selecione...',
        'qualidade': 'Avaliar a qualidade dos meus genomas',
        'anotacao': 'Anotar genes e funções no meu genoma',
        'taxonomia': 'Classificar taxonomicamente meus genomas',
        'pangenoma': 'Comparar um grupo de genomas (Pangenoma)'
    },
    // Objetivos para dados de Transcriptômica (RNA-seq)
    rnaseq: {
        '': 'Selecione...',
        'dge': 'Analisar expressão gênica diferencial',
        'assembly': 'Montar transcritos de novo (sem genoma de referência)'
    },
    // Objetivos para Análise de Variantes
    variants: {
        '': 'Selecione...',
        'calling': 'Identificar variantes (SNPs/Indels) a partir de um genoma'
    }
};

// Atualiza as opções do segundo select quando o primeiro (tipo de dado) é alterado.
dataTypeSelect.addEventListener('change', () => {
    const selectedType = dataTypeSelect.value;
    analysisGoalSelect.innerHTML = ''; // Limpa opções anteriores
    suggestionResultDiv.innerHTML = ''; // Limpa resultado anterior

    if (selectedType && analysisGoals[selectedType]) {
        const goals = analysisGoals[selectedType];
        for (const value in goals) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = goals[value];
            analysisGoalSelect.appendChild(option);
        }
        goalControlGroup.style.display = 'block';
    } else {
        goalControlGroup.style.display = 'none';
    }
});

// Gera a sugestão de fluxo de trabalho quando o segundo select (objetivo) é alterado.
analysisGoalSelect.addEventListener('change', () => {
    const dataType = dataTypeSelect.value;
    const goal = analysisGoalSelect.value;
    suggestionResultDiv.innerHTML = ''; // Limpa ao mudar

    if (!dataType || !goal) return;

    let suggestionHTML = '<h4>Sugestão de Fluxo de Análise:</h4>';

    // Array para guardar os nomes das ferramentas da sugestão para o botão "Mostrar Ferramentas".
    let suggestedTools = [];

    if (dataType === 'amplicon' && goal === 'taxonomia') {
        suggestedTools = ['FastQC', 'Fastp', 'QIIME 2', 'Mothur', 'PhyloSeq'];
        suggestionHTML += `
            <ol>
                <li><strong>Controle de Qualidade (QC):</strong> Inicie avaliando a qualidade das leituras com <a href="#" onclick="searchAndShow('FastQC')">FastQC</a>. Em seguida, use <a href="#" onclick="searchAndShow('Fastp')">Fastp</a> para remover adaptadores e filtrar sequências de baixa qualidade.</li>
                <li><strong>Processamento e Classificação:</strong> Utilize uma plataforma integrada como <a href="#" onclick="searchAndShow('QIIME 2')">QIIME 2</a> ou <a href="#" onclick="searchAndShow('Mothur')">Mothur</a>. Elas processam as sequências (ex: DADA2 no QIIME 2 para gerar ASVs) e realizam a classificação taxonômica. Para análise estatística e visualização em R, o pacote <a href="#" onclick="searchAndShow('PhyloSeq')">PhyloSeq</a> é excelente.</li>
            </ol>`;
    } else if (dataType === 'amplicon' && goal === 'funcional') {
        suggestedTools = ['QIIME 2', 'Mothur', 'PICRUSt'];
        suggestionHTML += `
            <ol>
                <li><strong>Passo Prévio:</strong> Primeiro, você precisa de um perfil taxonômico (tabela de ASVs/OTUs), gerado com <a href="#" onclick="searchAndShow('QIIME 2')">QIIME 2</a> ou <a href="#" onclick="searchAndShow('Mothur')">Mothur</a>.</li>
                <li><strong>Predição Funcional:</strong> Com a tabela de táxons em mãos, utilize o <a href="#" onclick="searchAndShow('PICRUSt')">PICRUSt</a> para prever o potencial funcional da comunidade.</li>
            </ol>`;
    } else if (dataType === 'shotgun' && goal === 'taxonomia') {
        suggestedTools = ['FastQC', 'Fastp', 'Kraken2', 'Kaiju', 'MetaPhlAn', 'SqueezeMeta'];
        suggestionHTML += `
            <ol>
                <li><strong>Controle de Qualidade (QC):</strong> Comece com <a href="#" onclick="searchAndShow('FastQC')">FastQC</a> e <a href="#" onclick="searchAndShow('Fastp')">Fastp</a> para limpar suas leituras.</li>
                <li><strong>Classificação Taxonômica:</strong> Para obter o perfil taxonômico diretamente das leituras, você pode usar ferramentas rápidas como <a href="#" onclick="searchAndShow('Kraken2')">Kraken2</a>, <a href="#" onclick="searchAndShow('Kaiju')">Kaiju</a> ou <a href="#" onclick="searchAndShow('MetaPhlAn')">MetaPhlAn</a>.</li>
                <li><strong>Solução Integrada:</strong> Como alternativa, o pipeline <a href="#" onclick="searchAndShow('SqueezeMeta')">SqueezeMeta</a> realiza o QC, montagem e classificação em um único fluxo de trabalho.</li>
            </ol>`;
    } else if (dataType === 'shotgun' && goal === 'funcional') {
        suggestedTools = ['FastQC', 'Fastp', 'HUMAnN', 'Anvi\'o', 'SqueezeMeta'];
        suggestionHTML += `
            <ol>
                <li><strong>Controle de Qualidade (QC):</strong> Limpe suas leituras com <a href="#" onclick="searchAndShow('FastQC')">FastQC</a> e <a href="#" onclick="searchAndShow('Fastp')">Fastp</a>.</li>
                <li><strong>Análise Funcional:</strong> A análise pode ser feita com o <a href="#" onclick="searchAndShow('HUMAnN')">HUMAnN</a>, que identifica vias metabólicas a partir das leituras. Para uma análise e visualização mais aprofundada, explore a plataforma <a href="#" onclick="searchAndShow('Anvi\'o')">Anvi'o</a>.</li>
                <li><strong>Solução Integrada:</strong> O pipeline <a href="#" onclick="searchAndShow('SqueezeMeta')">SqueezeMeta</a> também realiza a anotação funcional como parte de seu fluxo automatizado.</li>
            </ol>`;
    } else if (dataType === 'shotgun' && goal === 'montagem') {
        suggestedTools = ['FastQC', 'Fastp', 'MEGAHIT', 'CheckM', 'Anvi\'o', 'SqueezeMeta'];
        suggestionHTML += `
            <ol>
                <li><strong>Controle de Qualidade (QC):</strong> Limpe suas leituras com <a href="#" onclick="searchAndShow('FastQC')">FastQC</a> e <a href="#" onclick="searchAndShow('Fastp')">Fastp</a>.</li>
                <li><strong>Montagem (Assembly):</strong> Use um montador otimizado para metagenomas, como o <a href="#" onclick="searchAndShow('MEGAHIT')">MEGAHIT</a>, para reconstruir contigs.</li>
                <li><strong>Binning e Avaliação:</strong> Agrupe os contigs em Metagenome-Assembled Genomes (MAGs) e avalie a qualidade deles com o <a href="#" onclick="searchAndShow('CheckM')">CheckM</a>. A plataforma <a href="#" onclick="searchAndShow('Anvi\'o')">Anvi'o</a> é excelente para o refinamento e análise interativa de MAGs.</li>
                <li><strong>Solução Integrada:</strong> O pipeline <a href="#" onclick="searchAndShow('SqueezeMeta')">SqueezeMeta</a> automatiza todas essas etapas, desde o QC até a geração e avaliação de MAGs.</li>
            </ol>`;
    } else if (dataType === 'genomes' && goal === 'qualidade') {
        suggestedTools = ['CheckM'];
        suggestionHTML += `<p>Para avaliar a completude e contaminação de genomas (sejam de isolados ou MAGs), a ferramenta padrão-ouro é o <a href="#" onclick="searchAndShow('CheckM')">CheckM</a>. Ele verifica a presença de genes marcadores de cópia única.</p>`;
    } else if (dataType === 'genomes' && goal === 'taxonomia') {
        suggestedTools = ['GTDB-Tk'];
        suggestionHTML += `<p>Para atribuir uma taxonomia robusta e padronizada a genomas de bactérias e arqueias, utilize o <a href="#" onclick="searchAndShow('GTDB-Tk')">GTDB-Tk</a>. Ele posiciona seu genoma em uma árvore filogenética de referência e atribui a classificação com base no banco de dados GTDB.</p>`;
    } else if (dataType === 'genomes' && goal === 'anotacao') {
        suggestedTools = ['Prokka'];
        suggestionHTML += `<p>Para uma anotação rápida e completa de genomas bacterianos, a ferramenta <a href="#" onclick="searchAndShow('Prokka')">Prokka</a> é o padrão da indústria. Ela identifica ORFs, tRNA, rRNA e atribui funções básicas.</p>`;
    } else if (dataType === 'genomes' && goal === 'pangenoma') {
        suggestedTools = ['Roary', 'Anvi\'o'];
        suggestionHTML += `<p>Para análise de pangenoma (identificação de genes do core e acessórios), a ferramenta <a href="#" onclick="searchAndShow('Roary')">Roary</a> é uma escolha rápida e popular. Para uma análise mais aprofundada e visualizações interativas, a plataforma <a href="#" onclick="searchAndShow('Anvi\'o')">Anvi'o</a> oferece um fluxo de trabalho completo para pangenômica.</p>`;
    } else if (dataType === 'rnaseq' && goal === 'dge') {
        suggestedTools = ['FastQC', 'Fastp', 'STAR', 'Hisat2', 'DESeq2', 'EdgeR'];
        suggestionHTML += `
            <ol>
                <li><strong>Controle de Qualidade (QC):</strong> Use <a href="#" onclick="searchAndShow('FastQC')">FastQC</a> e <a href="#" onclick="searchAndShow('Fastp')">Fastp</a> para limpar suas leituras de RNA-seq.</li>
                <li><strong>Mapeamento:</strong> Alinhe suas leituras contra um genoma de referência usando um alinhador ciente de splicing, como <a href="#" onclick="searchAndShow('STAR')">STAR</a> ou <a href="#" onclick="searchAndShow('Hisat2')">Hisat2</a>.</li>
                <li><strong>Análise de Expressão Diferencial:</strong> Com as contagens de leituras por gene, utilize pacotes em R como <a href="#" onclick="searchAndShow('DESeq2')">DESeq2</a> ou <a href="#" onclick="searchAndShow('EdgeR')">EdgeR</a> para identificar genes diferencialmente expressos entre suas condições.</li>
            </ol>`;
    } else if (dataType === 'rnaseq' && goal === 'assembly') {
        suggestedTools = ['FastQC', 'Fastp', 'Trinity'];
        suggestionHTML += `<p>Para montar transcritos a partir de dados de RNA-seq sem um genoma de referência (de novo), a ferramenta mais utilizada e robusta é a <a href="#" onclick="searchAndShow('Trinity')">Trinity</a>. Não se esqueça de realizar o controle de qualidade das leituras antes com <a href="#" onclick="searchAndShow('FastQC')">FastQC</a> e <a href="#" onclick="searchAndShow('Fastp')">Fastp</a>.</p>`;
    } else if (dataType === 'variants' && goal === 'calling') {
        suggestedTools = ['BWA', 'Minimap2', 'SAMtools', 'GATK', 'IGV'];
        suggestionHTML += `
            <ol>
                <li><strong>Mapeamento:</strong> Alinhe suas leituras de sequenciamento contra o genoma de referência. Use <a href="#" onclick="searchAndShow('BWA')">BWA</a> para leituras curtas ou <a href="#" onclick="searchAndShow('Minimap2')">Minimap2</a> para leituras longas.</li>
                <li><strong>Processamento do Alinhamento:</strong> Utilize o <a href="#" onclick="searchAndShow('SAMtools')">SAMtools</a> para ordenar, indexar e processar os arquivos de alinhamento (formato BAM).</li>
                <li><strong>Identificação de Variantes (Variant Calling):</strong> O <a href="#" onclick="searchAndShow('GATK')">GATK</a> é o kit de ferramentas padrão-ouro para identificar SNPs e Indels com alta precisão, seguindo suas "Best Practices".</li>
                <li><strong>Visualização:</strong> Inspecione visualmente suas variantes e os alinhamentos de leituras usando o <a href="#" onclick="searchAndShow('IGV')">IGV</a> (Integrative Genomics Viewer).</li>
            </ol>`;
    } else {
        suggestionHTML = '';
    }

    // Adiciona o botão "Mostrar Ferramentas do Fluxo" se houver ferramentas na sugestão.
    if (suggestedTools.length > 0) {
        suggestionHTML += `<button class="show-tools-btn" onclick='showSuggestedTools(${JSON.stringify(suggestedTools)})'>Mostrar Ferramentas do Fluxo</button>`;
    }

    suggestionResultDiv.innerHTML = suggestionHTML;
});

// --- Funções Auxiliares ---

/**
 * Função auxiliar usada nos links do guia para buscar e exibir uma ferramenta específica.
 * @param {string} term O nome da ferramenta a ser buscada
 */
function searchAndShow(term) {
    caixaBusca.value = term;
    iniciarBusca();
    // Rola a página para a seção de resultados
    cardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Inicia uma busca por categoria quando uma tag de categoria é clicada.
 * @param {string} categoria A categoria a ser buscada.
 */
function buscarPorCategoria(categoria) {
    // Preenche a caixa de busca com o filtro e inicia a busca
    caixaBusca.value = `categoria:"${categoria}"`;
    iniciarBusca();
    cardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Exibe os cards de uma lista de ferramentas sugeridas pelo guia interativo.
 * @param {string[]} toolNames - Um array com os nomes das ferramentas a serem exibidas.
 */
function showSuggestedTools(toolNames) {
    // Limpa a caixa de busca para não destacar nenhum termo
    caixaBusca.value = '';

    const lowerCaseToolNames = toolNames.map(name => name.toLowerCase());

    const resultados = ferramentas.filter(ferramenta =>
        lowerCaseToolNames.includes(ferramenta.nome.toLowerCase())
    );
    exibirCards(resultados);
    cardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}