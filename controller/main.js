// ====================================================  FILTRAR CATEGORIAS DE PIZZAS ====================================================================//

// Pega os cliques nos botões de filtro ex: “Todas”, “Tradicionais”, “Doces”, “Veg”
// Quando o usuário clicar, mostra apenas os itens do cardápio que pertencem aquela categoria

// Seleciona todos os botões que têm o atributo data-filtro e os itens do cardápio que têm o atributo data-categoria
var botoes = document.querySelectorAll("[data-filtro]");
var itens = document.querySelectorAll("[data-categoria]");

// Percorre todos os botões
for (var i = 0; i < botoes.length; i++) {
    // Adiciona um evento de clique em cada botão
    botoes[i].addEventListener("click", function() {

        // Remove a classe 'active' de todos os botões
        for (var j = 0; j < botoes.length; j++) {
            botoes[j].classList.remove("active");
            botoes[j].classList.remove("btn-warning");
            botoes[j].classList.add("btn-outline-warning");
        }

        // Marca o botão clicado como ativo
        this.classList.add("active");
        this.classList.remove("btn-outline-warning");
        this.classList.add("btn-warning");

        //  Pega o valor do filtro do botão clicado
        var filtro = this.getAttribute("data-filtro");

        // . Percorre todos os itens do cardápio
        for (var k = 0; k < itens.length; k++) {
            var categoria = itens[k].getAttribute("data-categoria");

            // Se o filtro for "todas" ou a categoria do item for igual ao filtro
            if (filtro === "todas" || categoria === filtro) {
                itens[k].style.display = "block"; // mostra o item
            } else {
                itens[k].style.display = "none";  // esconde o item
            }
        }
    });
}

// ============================================================ CARRINHO DE COMPRAS COM JQUERY ===============================================================//

$(document).ready(function() {
    var total = 0;

// Adicionar ao carrinho
$(".adicionar-carrinho").click(function() {
    var nome = $(this).data("nome");
    var preco = parseFloat($(this).data("preco"));

    $("#itens-carrinho").append("<li>" + nome + " - R$ " + preco.toFixed(2) + "</li>");

    var contador = $("#contador-carrinho");
    var quantidade = parseInt(contador.text()) + 1;
    contador.text(quantidade);

    total += preco;
    $("#total-carrinho").text(total.toFixed(2));

    contador.fadeOut(100).fadeIn(100);
});

// Destacar item do cardápio ao passar o mouse
$(".adicionar-carrinho").hover(
    function() {
    $(this).css("transform", "scale(1.2)"); 
    },
    function() {
        $(this).css("transform", "scale(1)");   // volta ao normal
    }
);


// Limpar carrinho
    $("#limpar-carrinho").click(function() {
    $("#itens-carrinho").empty();
    $("#contador-carrinho").text("0");
    $("#total-carrinho").text("0.00");
    total = 0;
});

// Remover item ao clicar nele
$("#itens-carrinho").on("click", "li", function() {

    var textoItem = $(this).text(); //"Pizza Margherita - R$ 44.90"
    var precoItem = parseFloat(textoItem.split("R$")[1]);

    total -= precoItem;

    var contador = $("#contador-carrinho");
    var quantidade = parseInt(contador.text()) - 1;
    contador.text(quantidade);

    $("#total-carrinho").text(total.toFixed(2));

    $(this).remove();


});


// Finalizar no WhatsApp
$("#carrinho-whatsapp").click(function(e) {
    e.preventDefault();

  if ($("#contador-carrinho").text() === "0") {
    alert("Seu carrinho está vazio. Adicione itens antes de finalizar.");
    return;
  }

    var itens = $("#itens-carrinho li").map(function() {
        return "- " + $(this).text();
    }).get().join("%0A");

    var mensagem = "Olá, gostaria de finalizar meu pedido:%0A" + itens + "%0A%0ATotal: R$ " + $("#total-carrinho").text();

    var numeroWhatsapp = "5537999492573";
    var url = "https://wa.me/" + numeroWhatsapp + "?text=" + mensagem;

    window.open(url, "_blank");
});
});

// ========================================================  USO DE API PARA BUSCAR PELO CEP ============================================================//


// Buscar endereço pelo CEP usando ViaCEP
$("#buscar-cep").click(function() {
    var cep = $("#cep").val().replace(/\D/g, ""); // remove caracteres não numéricos
  
    if (cep !== "") {
      $.getJSON("https://viacep.com.br/ws/" + cep + "/json/", function(dados) {
        if (!("erro" in dados)) {
          $("#rua").val(dados.logradouro);
          $("#bairro").val(dados.bairro);
          $("#cidade").val(dados.localidade);
          $("#estado").val(dados.uf);
        } else {
          alert("CEP não encontrado.");
        }
      });
    } else {
      alert("Digite um CEP válido.");
    }
  });
  
  // Enviar pelo WhatsApp
$("#botao-contato-whatsapp").click(function() {
  var nome = $("#nome").val().trim();
  var telefone = $("#telefone").val().trim();
  var cep = $("#cep").val().trim();
  var mensagem = $("#mensagem").val().trim(); // trim() = remover espaços

  // Verificação de campos obrigatórios
  if (nome === "" || telefone === "" || cep === "") {

    if (nome === "") {
      alert("Por favor, preencha o campo nome");
      return;
    }

    if (telefone === "") {
        alert("Por favor, preencha o campo de telefone");
        return;
    }

    if (cep === "") {
        alert("Por favor, o campo de cep.");
        return;
    }
  }


  // Remove espaços e verifica se é número
if (isNaN(telefone)) {
  alert("Telefone deve conter apenas números.");
  return;
}

// Verifica quantidade mínima de dígitos (exemplo: 10 para DDD + número)
if (telefone.length < 10) {
  alert("Telefone deve ter pelo menos 10 dígitos.");
  return;
} 

  var rua = $("#rua").val();
  var bairro = $("#bairro").val();
  var cidade = $("#cidade").val();
  var estado = $("#estado").val();

  var texto = "Olá, meu nome é " + nome + " (" + telefone + ").\n" +
              "Endereço: " + rua + ", " + bairro + ", " + cidade + " - " + estado + "\n\n" +
              "Mensagem: " + mensagem;

  var numeroWhatsapp = "5537999492573"; 
  var url = "https://wa.me/" + numeroWhatsapp + "?text=" + encodeURIComponent(texto);

  window.open(url, "_blank");
});
  
