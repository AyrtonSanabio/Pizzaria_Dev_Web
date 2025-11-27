// =========================
// CONFIG / CONSTANTES
// =========================

var precosPorNome = {
    "Chicken Pizza": 22.99,
    "Calabresa": 15.45,
    "Italiana": 85.99,
    "Mussarela": 58.99,
    "Portuguesa": 15.99,
    "Marguerita": 15.99,
    "Pepperoni": 55.99,
    "Palmito": 23.99,
    "Special full house": 34.99
  };
  
  var CUPONS = {
    "PIZZA10": 0.10,     // 10% desconto sobre subtotal
    "PIZZA100": 0.90,     // 10% desconto sobre subtotal
    "FRETEGRATIS": 0     // frete grátis
  };
  
  var FRETE_BASE = 12.00;
  var LIMITE_FRETE_GRATIS = 120.00;
  
  
  // =========================
  /* ESTADO GLOBAL */
  // =========================
  
  var carrinho = [];
  var cupomAtivo = null;
  
  var badgeCarrinho = null;
  var painelCarrinho = null;
  var listaCarrinho = null;
  var totalCarrinhoSpan = null;
  var subtotalSpan = null;
  var freteSpan = null;
  var descontoSpan = null;
  var inputCupom = null;
  
  
  // =========================
  /* LOCAL STORAGE */
  // =========================
  
  function carregarCarrinhoLocal() {
    try {
      var salvo = localStorage.getItem("carrinho_pizza");
      var salvoCupom = localStorage.getItem("carrinho_pizza_cupom");
      if (salvo) {
        carrinho = JSON.parse(salvo);
      }
      if (salvoCupom) {
        cupomAtivo = salvoCupom;
      }
    } catch (e) {
      carrinho = [];
      cupomAtivo = null;
    }
  }
  
  function salvarCarrinhoLocal() {
    try {
      localStorage.setItem("carrinho_pizza", JSON.stringify(carrinho));
      if (cupomAtivo) {
        localStorage.setItem("carrinho_pizza_cupom", cupomAtivo);
      } else {
        localStorage.removeItem("carrinho_pizza_cupom");
      }
    } catch (e) {
      // ignora
    }
  }
  
  
  // =========================
  /* INICIALIZAÇÃO PRINCIPAL */
  // =========================
  
  function inicializar() {
    carregarCarrinhoLocal();
    criarPainelCarrinho();
  
    badgeCarrinho = document.querySelector(".badge-carrinho");
    if (!badgeCarrinho) {
      var navDireita = document.querySelector(".nav-bar-direita");
      if (navDireita) {
        var span = document.createElement("span");
        span.className = "badge-carrinho";
        span.textContent = "0";
        navDireita.appendChild(span);
        badgeCarrinho = span;
      }
    }
  
    registrarBotoesAddCarrinho();
    atualizarUIcarrinho();
  }
  
  document.addEventListener("DOMContentLoaded", inicializar);
  
  
  // =========================
  /* PAINEL DO CARRINHO */
  // =========================
  
  function criarPainelCarrinho() {
    painelCarrinho = document.createElement("div");
    painelCarrinho.className = "painel-carrinho";
  
    painelCarrinho.innerHTML =
      "<div class='cabecalho-carrinho'>" +
        "<h3>Seu carrinho</h3>" +
        "<button class='fechar-carrinho'>Fechar</button>" +
      "</div>" +
      "<ul class='lista-carrinho'></ul>" +
      "<div class='resumo-carrinho'>" +
        "<div class='resumo-linha'><span>Subtotal</span><span>R$ <span class='subtotal-carrinho'>0.00</span></span></div>" +
        "<div class='resumo-linha'><span>Desconto</span><span>- R$ <span class='desconto-carrinho'>0.00</span></span></div>" +
        "<div class='resumo-linha'><span>Frete</span><span>R$ <span class='frete-carrinho'>0.00</span></span></div>" +
        "<div class='resumo-linha' style='font-weight:700; font-size:15px; margin-top:4px;'><span>Total</span><span>R$ <span class='total-carrinho'>0.00</span></span></div>" +
        "<div class='cupom-area'>" +
          "<input type='text' class='input-cupom' placeholder='Cupom (ex: PIZZA10)'>" +
          "<button class='aplicar-cupom'>OK</button>" +
        "</div>" +
      "</div>" +
      "<div class='acoes-carrinho'>" +
        "<button class='limpar-carrinho'>Limpar</button>" +
        "<button class='finalizar-compra'>Finalizar</button>" +
      "</div>";
  
    document.body.appendChild(painelCarrinho);
  
    listaCarrinho = painelCarrinho.querySelector(".lista-carrinho");
    totalCarrinhoSpan = painelCarrinho.querySelector(".total-carrinho");
    subtotalSpan = painelCarrinho.querySelector(".subtotal-carrinho");
    freteSpan = painelCarrinho.querySelector(".frete-carrinho");
    descontoSpan = painelCarrinho.querySelector(".desconto-carrinho");
    inputCupom = painelCarrinho.querySelector(".input-cupom");
  
    var btnFechar = painelCarrinho.querySelector(".fechar-carrinho");
    var btnLimpar = painelCarrinho.querySelector(".limpar-carrinho");
    var btnFinalizar = painelCarrinho.querySelector(".finalizar-compra");
    var btnCupom = painelCarrinho.querySelector(".aplicar-cupom");
  
    btnFechar.addEventListener("click", function () {
      painelCarrinho.style.display = "none";
    });
  
    btnLimpar.addEventListener("click", function () {
      carrinho = [];
      cupomAtivo = null;
      salvarCarrinhoLocal();
      atualizarUIcarrinho();
    });
  
    btnFinalizar.addEventListener("click", function () {
      if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
      }
      var resumo = montarResumoTexto();
      alert(resumo);
      carrinho = [];
      cupomAtivo = null;
      salvarCarrinhoLocal();
      atualizarUIcarrinho();
    });
  
    btnCupom.addEventListener("click", function () {
      aplicarCupomDigitado();
    });
  
    var botaoAbrir = document.createElement("button");
    botaoAbrir.className = "botao-abrir-carrinho";
    botaoAbrir.textContent = "Ver carrinho";
    document.body.appendChild(botaoAbrir);
  
    botaoAbrir.addEventListener("click", function () {
      if (painelCarrinho.style.display === "none" || painelCarrinho.style.display === "") {
        painelCarrinho.style.display = "block";
      } else {
        painelCarrinho.style.display = "none";
      }
    });
  }
  
  
  // =========================
  /* CUPOM / FRETE / RESUMO */
  // =========================
  
  function aplicarCupomDigitado() {
    var texto = inputCupom.value;
    if (!texto) {
      alert("Digite um cupom.");
      return;
    }
    var codigo = texto.toUpperCase().trim();
    if (CUPONS[codigo] == null && codigo !== "FRETEGRATIS") {
      alert("Cupom inválido.");
      return;
    }
    cupomAtivo = codigo;
    salvarCarrinhoLocal();
    atualizarUIcarrinho();
    alert("Cupom aplicado: " + codigo);
  }
  
  function calcularSubtotal() {
    var total = 0;
    var i;
    for (i = 0; i < carrinho.length; i++) {
      total = total + carrinho[i].preco * carrinho[i].quantidade;
    }
    return total;
  }
  
  function calcularDesconto(subtotal) {
    if (!cupomAtivo) return 0;
    if (cupomAtivo === "FRETEGRATIS") return 0;
    var taxa = CUPONS[cupomAtivo];
    if (!taxa) return 0;
    return subtotal * taxa;
  }
  
  function calcularFrete(subtotal, desconto) {
    var valorConsiderado = subtotal - desconto;
    if (cupomAtivo === "FRETEGRATIS") {
      return 0;
    }
    if (valorConsiderado >= LIMITE_FRETE_GRATIS) {
      return 0;
    }
    if (valorConsiderado === 0) {
      return 0;
    }
    return FRETE_BASE;
  }
  
  function montarResumoTexto() {
    var texto = "Resumo do pedido:\n\n";
    var i;
    for (i = 0; i < carrinho.length; i++) {
      var item = carrinho[i];
      texto +=
        "- " +
        item.quantidade +
        "x " +
        item.nome +
        " (R$ " +
        item.preco.toFixed(2) +
        ")\n";
    }
    var subtotal = calcularSubtotal();
    var desconto = calcularDesconto(subtotal);
    var frete = calcularFrete(subtotal, desconto);
    var total = subtotal - desconto + frete;
  
    texto += "\nSubtotal: R$ " + subtotal.toFixed(2);
    texto += "\nDesconto: R$ " + desconto.toFixed(2);
    texto += "\nFrete: R$ " + frete.toFixed(2);
    texto += "\nTotal: R$ " + total.toFixed(2);
  
    return texto;
  }
  
  
  // =========================
  /* ADIÇÃO / ALTERAÇÃO CARRINHO */
  // =========================
  
  function registrarBotoesAddCarrinho() {
    var botoes = document.querySelectorAll(".add-carrinho");
    var i;
    for (i = 0; i < botoes.length; i++) {
      botoes[i].addEventListener("click", onClickAddCarrinho);
    }
  }
  
  function onClickAddCarrinho(evento) {
    var botao = evento.currentTarget;
    var card = encontrarCardDoProduto(botao);
  
    if (!card) {
      return;
    }
  
    var nome = extrairNomeDoCard(card);
    var preco = extrairPrecoDoCard(card);
  
    if (!nome) {
      return;
    }
  
    if (preco == null) {
      if (precosPorNome[nome]) {
        preco = precosPorNome[nome];
      } else {
        preco = 0;
      }
    }
  
    adicionarItemCarrinho(nome, preco);
    salvarCarrinhoLocal();
    atualizarUIcarrinho();
  }
  
  function encontrarCardDoProduto(elemento) {
    var atual = elemento;
    while (atual) {
      if (
        atual.classList &&
        (
          atual.classList.contains("card-pizza-flip") ||
          atual.classList.contains("container-oferta") ||
          atual.classList.contains("cardapio-container-child") ||
          atual.classList.contains("container-terceira-oferta")
        )
      ) {
        return atual;
      }
      atual = atual.parentNode;
    }
    return null;
  }
  
  function extrairNomeDoCard(card) {
    var h1 = card.querySelector("h1");
    if (h1 && h1.textContent) {
      return h1.textContent.trim();
    }
    var texto = card.querySelector(".pizza-flip-texto h1");
    if (texto && texto.textContent) {
      return texto.textContent.trim();
    }
    return null;
  }
  
  function extrairPrecoDoCard(card) {
    var ps = card.getElementsByTagName("p");
    var i;
    for (i = 0; i < ps.length; i++) {
      var texto = ps[i].textContent.trim();
      if (texto[0] === "R") {
        var valorStr = texto.replace("R", "").replace("$", "").trim();
        valorStr = valorStr.replace(",", ".");
        var valor = parseFloat(valorStr);
        if (!isNaN(valor)) {
          return valor;
        }
      }
    }
    return null;
  }
  
  function adicionarItemCarrinho(nome, preco) {
    var i;
    for (i = 0; i < carrinho.length; i++) {
      if (carrinho[i].nome === nome) {
        carrinho[i].quantidade = carrinho[i].quantidade + 1;
        return;
      }
    }
    carrinho.push({
      nome: nome,
      preco: preco,
      quantidade: 1
    });
  }
  
  function alterarQuantidade(nome, delta) {
    var i;
    for (i = 0; i < carrinho.length; i++) {
      if (carrinho[i].nome === nome) {
        carrinho[i].quantidade = carrinho[i].quantidade + delta;
        if (carrinho[i].quantidade <= 0) {
          carrinho.splice(i, 1);
        }
        return;
      }
    }
  }
  
  function removerItemCarrinho(nome) {
    var i;
    for (i = 0; i < carrinho.length; i++) {
      if (carrinho[i].nome === nome) {
        carrinho.splice(i, 1);
        break;
      }
    }
  }
  
  
  // =========================
  /* UI DO CARRINHO */
  // =========================
  
  function atualizarUIcarrinho() {
    var totalItens = 0;
    var i;
    for (i = 0; i < carrinho.length; i++) {
      totalItens = totalItens + carrinho[i].quantidade;
    }
  
    if (badgeCarrinho) {
      badgeCarrinho.textContent = String(totalItens);
    }
  
    if (!listaCarrinho) {
      return;
    }
  
    listaCarrinho.innerHTML = "";
  
    for (i = 0; i < carrinho.length; i++) {
      var item = carrinho[i];
  
      var li = document.createElement("li");
  
      var divInfo = document.createElement("div");
      divInfo.className = "item-info";
  
      var spanNome = document.createElement("span");
      spanNome.textContent = item.nome;
  
      var spanPreco = document.createElement("span");
      spanPreco.textContent =
        "R$ " +
        item.preco.toFixed(2) +
        " • Subtotal R$ " +
        (item.preco * item.quantidade).toFixed(2);
  
      divInfo.appendChild(spanNome);
      divInfo.appendChild(spanPreco);
  
      var divCtrl = document.createElement("div");
      divCtrl.className = "item-controles";
  
      var btnMenos = document.createElement("button");
      btnMenos.textContent = "-";
      btnMenos.className = "btn-qty";
  
      var spanQtd = document.createElement("span");
      spanQtd.textContent = item.quantidade;
  
      var btnMais = document.createElement("button");
      btnMais.textContent = "+";
      btnMais.className = "btn-qty";
  
      var btnRemover = document.createElement("button");
      btnRemover.textContent = "X";
      btnRemover.className = "btn-remove";
  
      btnMenos.addEventListener("click", criarHandlerAlterarQuantidade(item.nome, -1));
      btnMais.addEventListener("click", criarHandlerAlterarQuantidade(item.nome, 1));
      btnRemover.addEventListener("click", criarHandlerRemocao(item.nome));
  
      divCtrl.appendChild(btnMenos);
      divCtrl.appendChild(spanQtd);
      divCtrl.appendChild(btnMais);
      divCtrl.appendChild(btnRemover);
  
      li.appendChild(divInfo);
      li.appendChild(divCtrl);
  
      listaCarrinho.appendChild(li);
    }
  
    var subtotal = calcularSubtotal();
    var desconto = calcularDesconto(subtotal);
    var frete = calcularFrete(subtotal, desconto);
    var total = subtotal - desconto + frete;
  
    if (subtotalSpan) subtotalSpan.textContent = subtotal.toFixed(2);
    if (descontoSpan) descontoSpan.textContent = desconto.toFixed(2);
    if (freteSpan) freteSpan.textContent = frete.toFixed(2);
    if (totalCarrinhoSpan) totalCarrinhoSpan.textContent = total.toFixed(2);
  
    if (inputCupom && cupomAtivo) {
      inputCupom.value = cupomAtivo;
    }
  }
  
  function criarHandlerRemocao(nome) {
    return function () {
      removerItemCarrinho(nome);
      salvarCarrinhoLocal();
      atualizarUIcarrinho();
    };
  }
  
  function criarHandlerAlterarQuantidade(nome, delta) {
    return function () {
      alterarQuantidade(nome, delta);
      salvarCarrinhoLocal();
      atualizarUIcarrinho();
    };
  }
  
  
  // =========================
  // EXTRAS: MENU, SOCIAIS, SCROLL, FILTRO
  // =========================
  
  function scrollParaId(id) {
    var alvo = document.getElementById(id);
    if (!alvo) {
      return;
    }
    alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  
  function inicializarMenuSuperior() {
    var itens = document.querySelectorAll(".nav-bar-esquerda ul li a");
    var i;
    for (i = 0; i < itens.length; i++) {
      itens[i].addEventListener("click", onClickMenuSuperior);
    }
  }
  
  function onClickMenuSuperior(evento) {
    var texto = evento.currentTarget.textContent.toLowerCase();
    texto = texto.replace("+", "").trim();
  
    if (texto === "home") {
      scrollParaId("sec-home");
    } else if (texto === "about us") {
      scrollParaId("sec-about");
    } else if (texto === "shop") {
      scrollParaId("sec-cardapio");
    } else if (texto === "blog") {
      scrollParaId("sec-blog");
    } else if (texto === "page") {
      scrollParaId("sec-footer");
    }
  }
  
  function inicializarMenuHamburguer() {
    var icones = document.querySelectorAll(".nav-bar-direita svg");
    if (icones.length < 3) {
      return;
    }
    var iconMenu = icones[2];
  
    iconMenu.style.cursor = "pointer";
    iconMenu.addEventListener("click", function () {
      var navEsq = document.querySelector(".nav-bar-esquerda ul");
      if (!navEsq) {
        return;
      }
      if (navEsq.style.display === "flex" || navEsq.style.display === "block") {
        navEsq.style.display = "none";
      } else {
        navEsq.style.display = "block";
      }
    });
  }
  
  function inicializarFooterMenu() {
    var footerMenu = null;
    var uls = document.querySelectorAll("footer ul");
    var i;
    for (i = 0; i < uls.length; i++) {
      var titulo = uls[i].querySelector("h1");
      if (titulo && titulo.textContent.toLowerCase().indexOf("nosso menu") !== -1) {
        footerMenu = uls[i];
        break;
      }
    }
    if (!footerMenu) {
      return;
    }
  
    var itens = footerMenu.querySelectorAll("li a");
    for (i = 0; i < itens.length; i++) {
      itens[i].addEventListener("click", onClickFooterMenu);
      itens[i].style.cursor = "pointer";
    }
  }
  
  function onClickFooterMenu(evento) {
    var texto = evento.currentTarget.textContent.toLowerCase().trim();
    filtrarCardapioPorCategoriaFooter(texto);
  }
  
  function filtrarCardapioPorCategoriaFooter(categoria) {
    var cards = document.querySelectorAll(".cardapio-container-child");
    var i;
  
    for (i = 0; i < cards.length; i++) {
      var card = cards[i];
      var nome = extrairNomeDoCard(card);
      var nomeLower = nome ? nome.toLowerCase() : "";
  
      var mostrar = true;
  
      if (categoria.indexOf("pizza") !== -1) {
        mostrar = true;
      } else if (categoria.indexOf("burguer") !== -1) {
        mostrar = false;
      } else if (categoria.indexOf("batata") !== -1) {
        mostrar = false;
      } else if (categoria.indexOf("refrigerante") !== -1) {
        mostrar = false;
      } else if (categoria.indexOf("doces") !== -1) {
        mostrar = false;
      }
  
      card.style.display = mostrar ? "flex" : "none";
    }
  
    scrollParaId("sec-cardapio");
  }
  
  function inicializarSociais() {
    var sociais = document.querySelectorAll(".social-link");
    var i;
    for (i = 0; i < sociais.length; i++) {
      sociais[i].addEventListener("click", onClickSocial);
    }
  }
  
  function onClickSocial(evento) {
    evento.preventDefault();
    var url = evento.currentTarget.getAttribute("href");
    if (!url) {
      return;
    }
    window.open(url, "_blank");
  }
  
  function inicializarAnchorsSuave() {
    var links = document.querySelectorAll('a[href^="#"]');
    var i;
  
    for (i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (evento) {
        var href = evento.currentTarget.getAttribute("href");
        if (!href || href === "#" || href === "#0") {
          return;
        }
        evento.preventDefault();
        var id = href.substring(1);
        scrollParaId(id);
      });
    }
  }
  
  function inicializarExtras() {
    inicializarMenuSuperior();
    inicializarMenuHamburguer();
    inicializarFooterMenu();
    inicializarSociais();
    inicializarAnchorsSuave();
  }
  
  document.addEventListener("DOMContentLoaded", inicializarExtras);
  

  // =========================
// EXTRAS 2: SCROLL REVEAL, MENU ATIVO, TOAST, TEMA
// =========================

// marca se já inicializou extras2
var extras2Iniciado = false;

function inicializarExtras2() {
  if (extras2Iniciado) {
    return;
  }
  extras2Iniciado = true;

  prepararSecoesAnimadas();
  inicializarScrollReveal();
  inicializarMenuAtivo();
  inicializarToasts();
  inicializarTemaToggle();
}

// garante que rode junto com outros DOMContentLoaded
document.addEventListener("DOMContentLoaded", inicializarExtras2);


// ---------- SCROLL REVEAL ----------

function prepararSecoesAnimadas() {
  var secoes = document.querySelectorAll(
    ".introducao, .pizza-flip-rolagem-lateral, .pizza-ofertas, .segunda-oferta, .cardapio, footer"
  );
  var i;
  for (i = 0; i < secoes.length; i++) {
    secoes[i].classList.add("section-anim");
  }
}

function inicializarScrollReveal() {
  // Versão simples com scroll + getBoundingClientRect
  window.addEventListener("scroll", verificarSecoesVisiveis);
  // chamar uma vez no começo
  verificarSecoesVisiveis();
}

function verificarSecoesVisiveis() {
  var secoes = document.querySelectorAll(".section-anim");
  var i;
  var alturaJanela = window.innerHeight || document.documentElement.clientHeight;

  for (i = 0; i < secoes.length; i++) {
    var rect = secoes[i].getBoundingClientRect();
    var visivel = rect.top < alturaJanela * 0.85;
    if (visivel) {
      secoes[i].classList.add("on-screen");
    }
  }
}


// ---------- MENU ATIVO NO SCROLL ----------

function inicializarMenuAtivo() {
  window.addEventListener("scroll", atualizarMenuAtivo);
  atualizarMenuAtivo();
}

function atualizarMenuAtivo() {
  var secoes = [
    { id: "sec-home", texto: "home" },
    { id: "sec-cardapio", texto: "shop" },
    { id: "sec-footer", texto: "page" }
  ];

  var posicaoScroll = window.scrollY || window.pageYOffset;
  var alturaJanela = window.innerHeight || document.documentElement.clientHeight;

  // descobre qual seção está mais “no foco” vertical
  var alvoId = null;
  var i;
  for (i = 0; i < secoes.length; i++) {
    var el = document.getElementById(secoes[i].id);
    if (!el) {
      continue;
    }
    var rect = el.getBoundingClientRect();
    var topoAbsoluto = rect.top + posicaoScroll;
    if (posicaoScroll + alturaJanela * 0.3 >= topoAbsoluto) {
      alvoId = secoes[i].id;
    }
  }

  var links = document.querySelectorAll(".nav-bar-esquerda ul li a");
  for (i = 0; i < links.length; i++) {
    links[i].classList.remove("ativo");
  }

  if (!alvoId) {
    return;
  }

  var textoAlvo = null;
  for (i = 0; i < secoes.length; i++) {
    if (secoes[i].id === alvoId) {
      textoAlvo = secoes[i].texto;
      break;
    }
  }
  if (!textoAlvo) {
    return;
  }

  for (i = 0; i < links.length; i++) {
    var textoLink = links[i].textContent.toLowerCase().replace("+", "").trim();
    if (textoLink === textoAlvo) {
      links[i].classList.add("ativo");
      break;
    }
  }
}


// ---------- TOASTS (NOTIFICAÇÕES) ----------

var toastContainer = null;

function inicializarToasts() {
  toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);
}

// sobrescreve onClickAddCarrinho só para adicionar toast, mas reaproveita lógica
var onClickAddCarrinhoOriginal = onClickAddCarrinho;

onClickAddCarrinho = function (evento) {
  onClickAddCarrinhoOriginal(evento);
  var botao = evento.currentTarget;
  var card = encontrarCardDoProduto(botao);
  var nome = extrairNomeDoCard(card) || "Item";
  mostrarToast(nome + " adicionado ao carrinho");
};

function mostrarToast(mensagem) {
  if (!toastContainer) {
    inicializarToasts();
  }

  var toast = document.createElement("div");
  toast.className = "toast";

  var spanMsg = document.createElement("span");
  spanMsg.textContent = mensagem;

  var botaoFechar = document.createElement("button");
  botaoFechar.textContent = "x";

  botaoFechar.addEventListener("click", function () {
    removerToast(toast);
  });

  toast.appendChild(spanMsg);
  toast.appendChild(botaoFechar);
  toastContainer.appendChild(toast);

  // desaparece sozinho depois de 3 segundos
  setTimeout(function () {
    removerToast(toast);
  }, 3000);
}

function removerToast(toast) {
  if (toast && toast.parentNode === toastContainer) {
    toastContainer.removeChild(toast);
  }
}


// ---------- TEMA DARK/LIGHT ----------

function inicializarTemaToggle() {
  var botaoTema = document.createElement("button");
  botaoTema.className = "botao-tema";
  botaoTema.textContent = "Tema";

  document.body.appendChild(botaoTema);

  // carrega tema salvo
  var temaSalvo = null;
  try {
    temaSalvo = localStorage.getItem("tema_pizzaria");
  } catch (e) {}

  if (temaSalvo === "claro") {
    document.body.classList.add("tema-claro");
  }

  botaoTema.addEventListener("click", function () {
    document.body.classList.toggle("tema-claro");
    var novoTema = document.body.classList.contains("tema-claro") ? "claro" : "escuro";
    try {
      localStorage.setItem("tema_pizzaria", novoTema);
    } catch (e) {}
  });
}


// =========================
// INTEGRAÇÃO COM API FAKE (ofertas extras)
// =========================

// Usando Fake Store API (produtos genéricos) + DummyJSON (receitas de pizza)
// https://fakestoreapi.com  /  https://dummyjson.com/recipes
// (só GET, nada que cobre ou precise de chave).

var ofertasApi = [];        // produtos vindos da API
var modalApi = null;        // modal para listar ofertas
var listaModalApi = null;   // UL/DIV dentro do modal

function inicializarApiOfertas() {
  // cria botão flutuante só para brincar com a API
  var botaoApi = document.createElement("button");
  botaoApi.textContent = "Importar ofertas da API";
  botaoApi.style.position = "fixed";
  botaoApi.style.left = "24px";
  botaoApi.style.top = "80px";
  botaoApi.style.zIndex = "9999";
  botaoApi.style.padding = "6px 12px";
  botaoApi.style.fontSize = "11px";
  botaoApi.style.borderRadius = "999px";
  botaoApi.style.border = "none";
  botaoApi.style.cursor = "pointer";
  botaoApi.style.background = "#263238";
  botaoApi.style.color = "#fff";

  document.body.appendChild(botaoApi);

  botaoApi.addEventListener("click", function () {
    // se já tiver ofertas carregadas, só abre modal
    if (ofertasApi.length > 0) {
      abrirModalApi();
      return;
    }
    carregarOfertasDaApi();
  });

  criarModalApi();
}

document.addEventListener("DOMContentLoaded", inicializarApiOfertas);


// ----- CHAMANDO AS APIS -----

function carregarOfertasDaApi() {
  // Mostra um toast dizendo que está carregando
  mostrarToast("Carregando ofertas da API...");

  // Busca produtos genéricos
  var request1 = fetch("https://fakestoreapi.com/products?limit=3")
    .then(function (res) { return res.json(); })
    .catch(function (err) {
      console.log("Erro ao buscar produtos:", err);
      return [];
    });

  // Busca receitas de pizza
  var request2 = fetch("https://dummyjson.com/recipes/tag/Pizza")
    .then(function (res) { return res.json(); })
    .then(function (json) {
      // DummyJSON retorna { recipes: [...] }
      return json.recipes || [];
    })
    .catch(function (err) {
      console.log("Erro ao buscar receitas:", err);
      return [];
    });

  Promise.all([request1, request2]).then(function (arrays) {
    var produtos = arrays[0];
    var receitas = arrays[1];

    ofertasApi = [];

    // Normaliza produtos
    var i;
    for (i = 0; i < produtos.length; i++) {
      ofertasApi.push({
        origem: "FakeStore",
        nome: produtos[i].title,
        preco: produtos[i].price,
        infoExtra: produtos[i].category || ""
      });
    }

    // Normaliza receitas
    for (i = 0; i < receitas.length; i++) {
      var r = receitas[i];
      var precoSimulado = 20 + (i * 3); // só para exemplo
      ofertasApi.push({
        origem: "DummyJSON",
        nome: r.name,
        preco: precoSimulado,
        infoExtra: r.difficulty + " • " + r.cuisine
      });
    }

    console.log("Ofertas carregadas da API:", ofertasApi);

    mostrarToast("Ofertas da API carregadas!");
    atualizarModalApi();
    abrirModalApi();
  });
}


// ----- MODAL PARA MOSTRAR OFERTAS DA API -----

function criarModalApi() {
  modalApi = document.createElement("div");
  modalApi.style.position = "fixed";
  modalApi.style.top = "0";
  modalApi.style.left = "0";
  modalApi.style.width = "100vw";
  modalApi.style.height = "100vh";
  modalApi.style.backgroundColor = "rgba(0,0,0,0.6)";
  modalApi.style.display = "none";
  modalApi.style.alignItems = "center";
  modalApi.style.justifyContent = "center";
  modalApi.style.zIndex = "9998";

  var caixa = document.createElement("div");
  caixa.style.width = "90%";
  caixa.style.maxWidth = "480px";
  caixa.style.maxHeight = "80vh";
  caixa.style.overflowY = "auto";
  caixa.style.background = "#121218";
  caixa.style.borderRadius = "14px";
  caixa.style.padding = "14px";
  caixa.style.border = "1px solid rgba(255,255,255,0.15)";

  var topo = document.createElement("div");
  topo.style.display = "flex";
  topo.style.justifyContent = "space-between";
  topo.style.alignItems = "center";
  topo.style.marginBottom = "8px";

  var titulo = document.createElement("h3");
  titulo.textContent = "Ofertas da API";
  titulo.style.margin = "0";
  titulo.style.fontSize = "16px";

  var botaoFechar = document.createElement("button");
  botaoFechar.textContent = "Fechar";
  botaoFechar.style.border = "none";
  botaoFechar.style.cursor = "pointer";
  botaoFechar.style.padding = "4px 10px";
  botaoFechar.style.borderRadius = "999px";
  botaoFechar.style.fontSize = "11px";
  botaoFechar.style.background = "#263238";
  botaoFechar.style.color = "#fff";

  topo.appendChild(titulo);
  topo.appendChild(botaoFechar);

  listaModalApi = document.createElement("div");

  caixa.appendChild(topo);
  caixa.appendChild(listaModalApi);
  modalApi.appendChild(caixa);
  document.body.appendChild(modalApi);

  modalApi.addEventListener("click", function (evento) {
    if (evento.target === modalApi) {
      fecharModalApi();
    }
  });
  botaoFechar.addEventListener("click", fecharModalApi);
}

function abrirModalApi() {
  if (!modalApi) {
    return;
  }
  modalApi.style.display = "flex";
}

function fecharModalApi() {
  if (!modalApi) {
    return;
  }
  modalApi.style.display = "none";
}

function atualizarModalApi() {
  if (!listaModalApi) {
    return;
  }
  listaModalApi.innerHTML = "";

  if (ofertasApi.length === 0) {
    var vazio = document.createElement("p");
    vazio.textContent = "Nenhuma oferta carregada.";
    listaModalApi.appendChild(vazio);
    return;
  }

  var i;
  for (i = 0; i < ofertasApi.length; i++) {
    var oferta = ofertasApi[i];

    var linha = document.createElement("div");
    linha.style.display = "flex";
    linha.style.justifyContent = "space-between";
    linha.style.alignItems = "center";
    linha.style.padding = "6px 0";
    linha.style.borderBottom = "1px dashed rgba(255,255,255,0.18)";

    var info = document.createElement("div");
    info.style.display = "flex";
    info.style.flexDirection = "column";

    var spanNome = document.createElement("span");
    spanNome.textContent = oferta.nome + " (" + oferta.origem + ")";

    var spanExtra = document.createElement("span");
    spanExtra.textContent =
      "R$ " + oferta.preco.toFixed(2) +
      (oferta.infoExtra ? " • " + oferta.infoExtra : "");
    spanExtra.style.fontSize = "12px";
    spanExtra.style.color = "rgba(255,255,255,0.8)";

    info.appendChild(spanNome);
    info.appendChild(spanExtra);

    var botaoAdd = document.createElement("button");
    botaoAdd.textContent = "+ Carrinho";
    botaoAdd.style.border = "none";
    botaoAdd.style.cursor = "pointer";
    botaoAdd.style.padding = "4px 10px";
    botaoAdd.style.borderRadius = "999px";
    botaoAdd.style.fontSize = "11px";
    botaoAdd.style.background = "#ff9100";
    botaoAdd.style.color = "#000";

    // captura nome e preço desta oferta
    (function (nome, preco) {
      botaoAdd.addEventListener("click", function () {
        adicionarItemCarrinho(nome, preco);
        salvarCarrinhoLocal();
        atualizarUIcarrinho();
        mostrarToast(nome + " (API) adicionado ao carrinho");
      });
    })(oferta.nome, oferta.preco);

    linha.appendChild(info);
    linha.appendChild(botaoAdd);
    listaModalApi.appendChild(linha);
  }
}


// =========================
// FAVORITOS / WISHLIST
// =========================

var favoritos = []; // nomes dos itens favoritos

function alternarFavorito(nome) {
  var i;
  for (i = 0; i < favoritos.length; i++) {
    if (favoritos[i] === nome) {
      favoritos.splice(i, 1);
      console.log("Removido dos favoritos:", nome, "->", favoritos);
      return false;
    }
  }
  favoritos.push(nome);
  console.log("Adicionado aos favoritos:", nome, "->", favoritos);
  return true;
}

// hook na atualização da UI pra encaixar botão "fav" em cada item do carrinho
var atualizarUIcarrinhoOriginal2 = atualizarUIcarrinho;

atualizarUIcarrinho = function () {
  atualizarUIcarrinhoOriginal2();

  // depois que o carrinho foi montado, injeta um marcadinho de favorito
  try {
    var itensLi = document.querySelectorAll(".lista-carrinho li");
    var i;
    for (i = 0; i < itensLi.length; i++) {
      var li = itensLi[i];
      // evita duplicar
      if (li.querySelector(".btn-favorito")) {
        continue;
      }
      var nomeSpan = li.querySelector(".item-info span");
      if (!nomeSpan) {
        continue;
      }
      var nome = nomeSpan.textContent;

      var botaoFav = document.createElement("button");
      botaoFav.textContent = "♡";
      botaoFav.className = "btn-favorito";
      botaoFav.style.marginLeft = "4px";
      botaoFav.style.border = "none";
      botaoFav.style.cursor = "pointer";
      botaoFav.style.background = "transparent";
      botaoFav.style.color = "#ffcc80";
      botaoFav.style.fontSize = "14px";

      (function (n, b) {
        b.addEventListener("click", function () {
          var virouFavorito = alternarFavorito(n);
          b.textContent = virouFavorito ? "♥" : "♡";
        });
      })(nome, botaoFav);

      var divInfo = li.querySelector(".item-info");
      if (divInfo) {
        divInfo.appendChild(botaoFav);
      }
    }
  } catch (e) {
    console.log("Erro ao desenhar favoritos:", e);
  }
};




// =========================
// ATALHOS DE TECLADO (CTRL + H / CTRL + M / CTRL + B)
// =========================

function inicializarAtalhosTeclado() {
    document.addEventListener("keydown", function (evento) {

        // ignora se estiver digitando em input ou textarea
        var tag = evento.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") {
            return;
        }

        // só reage se Ctrl estiver pressionado
        if (!evento.ctrlKey) {
            return;
        }

        // normaliza tecla
        var key = "";
        if (evento.key) {
            key = evento.key.toLowerCase();
        } else if (evento.code) {
            key = evento.code.toLowerCase();
        }

        // Ctrl + B -> abre/fecha carrinho
        if (key === "b" || key === "keyb") {
            evento.preventDefault();
            if (typeof painelCarrinho !== "undefined" && painelCarrinho) {
                var atual = painelCarrinho.style.display;
                if (atual === "none" || atual === "") {
                    painelCarrinho.style.display = "block";
                } else {
                    painelCarrinho.style.display = "none";
                }
            }
            return;
        }

        // Ctrl + M -> ir para cardápio
        if (key === "m" || key === "keym") {
            evento.preventDefault();
            if (typeof scrollParaId === "function") {
                scrollParaId("sec-cardapio");
            }
            return;
        }

        // Ctrl + H -> ir para home/topo
        if (key === "h" || key === "keyh") {
            evento.preventDefault();
            if (typeof scrollParaId === "function") {
                scrollParaId("sec-home");
            }
            return;
        }
    });
}

document.addEventListener("DOMContentLoaded", inicializarAtalhosTeclado);
