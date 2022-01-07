$(function(){
    
    // Testando se o navegador suporta a API
    window.SpeechRecognition = window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null;

    //caso não suporte esta API DE VOZ            
    if (window.SpeechRecognition === null) {
        document.getElementById('unsupported').classList.remove('hidden');
    }else {
        //Definindo um protótipo ( método replaceAt() ) da classe string para alterar um caractere específico do texto
        String.prototype.replaceAt = function(index, replacement) {
            return this.substr(0, index) + replacement + this.substr(index + replacement.length);
        }

        //let recognizer = new window.SpeechRecognition();
        let recognizer = typeof SpeechRecognition === 'undefined' ? new webkitSpeechRecognition : new SpeechRecognition;
        let transcription = document.getElementById("transcription");
        let mic = document.querySelector("#mic");


        
        //Para o reconhecedor de voz, não parar de ouvir, mesmo que tenha pausas no usuario
        recognizer.continuous = true;

        //Caso tenha áudio de voz, entra nesta função.
        recognizer.onresult = function(event){
            for (var i = event.resultIndex; i < event.results.length; i++) {
                //isFinal para que entre nesta função apenas se a pessoa fizer uma pausa na fala.
                if(event.results[i].isFinal){                                     
                   
                    //texto na íntegra, sem qualquer alteração.
                    let texto = event.results[i][0].transcript;
                    console.log(texto);

                    texto = formatar(transcription.innerHTML + texto);

                    //console.log(transcription);
                    
                    transcription.innerHTML = texto;

                    //Faz aparecer o botão de download e baixa o arquivo em formato html, caso o botão seja clicado.
                    let btnDownload = document.getElementById("download");                    
                    btnDownload.setAttribute("class", "btn btn-sm btn-secondary d-block download")
                    btnDownload.addEventListener("click", download);
                    
                    //console.log(event.results[i][0]);
                    document.getElementById("precisao").innerHTML = "<b>Precisão: </b>" + event.results[i][0].confidence.toFixed(2) * 100 + "%";
                }else{
                    //Caso não ocorra algum problema em meio a execução, ele transcreve o que foi falado até o momento do erro.
                    const texto = event.results[i][0].transcript;
                    transcription.innerHTML += texto;
                }
            }
        }
        var fala;
        var fala2;
        let gravando = false;
        //Evento de clique no microfone. 
        mic.addEventListener("click",function(){
            //Se estiver gravando, encerra a gravação e deixa o microfone na cor cinza.
            if(gravando){
                recognizer.stop();
                mic.style.background="#777";
                gravando = false;
                mic.style.boxShadow="none";
            }else{
                try {
                    //Configura o idioma para Português do Brasil
                    recognizer.lang = "pt-BR";
                    
                    console.log(recognizer);

                    //Começa a gravação e deixa o microfone na cor vermelha
                    recognizer.start();
                    recognizer.onstart=function(){
                        gravando = true;
                        mic.style.background="#c40233";
                    }

                    //Se a pessoa estiver falando, chama a função de animação do microfone.
                    recognizer.onspeechstart=function(){
                        if(fala){
                            clearInterval(fala);
                        }
                        fala = setInterval(falando, 400);
                        
                    }
                    //Encerra a animação
                    recognizer.onsoundend=function(){
                        paraFala(fala);
                    }
                    
                    
                    
                    
                  } catch(ex) {
                    alert("Ops! Ocorreu um erro: "+ex.message);
                  }
                
            }
            
        });
        //Animação do microfone
        function falando(){
            mic.style.boxShadow="0px 0px 2px 4px red";
            fala2 = setTimeout(function(){
                mic.style.boxShadow="none";
            }, 200)
        }
        //Encerra a animação
        function paraFala(fala){
            clearInterval(fala);
            clearTimeout(fala2);
        }
        //Função para achar qualquer tipo de ponto em que a próxima letra deva ser maiuscula.
        function procuraPonto(txt, ponto){;
            let indiceUltimoPonto = 0;
            let posicaoInicial = 0;
            while(posicaoInicial != -1){
                posicaoInicial = txt.indexOf(ponto, indiceUltimoPonto);
                
                let posicaoFinal = posicaoInicial + ponto.length;

                indiceUltimoPonto = posicaoInicial + 2;

                //Verifica se o caractere depois do ponto é uma letra minúscula pela tabela ASCII
                if(posicaoInicial > -1 && txt.length > posicaoFinal +1)               
                    if(txt[posicaoFinal+1].charCodeAt(0) >=97 && txt[posicaoFinal+1].charCodeAt(0) <=122){
                        //console.log("Caractere na posiçao final: " + txt[posicaoFinal+1]);
                        
                        txt = txt.replaceAt(posicaoFinal+1, txt[posicaoFinal+1].toUpperCase());

                    }
            }
            return txt;
        }

        //Função para alterar ou corrigir palavras do texto.
        function alteraPalavra(txt, palavra, caractere){
            let regEx = new RegExp(palavra, 'g');
            let palavraRegEx = txt.match(regEx);
            
            while(palavraRegEx){
                txt = txt.replace(palavra, caractere);
                palavraRegEx = txt.match(regEx);                
            }
            return txt;
        }

        //Função para editar o texto antes de apresentá-lo ao usuário.
        function formatar(texto){
            //Primeira letra do texto maiúscula
            if(texto[0]!="(" && texto[0]!="\"" && texto[0]!=" "){
                let primeira = texto.slice(0,1);
                texto = texto.replace(primeira, primeira.toUpperCase())
            }else{
                texto[1] = texto[1].toUpperCase();
            }

            //Maiúsculas depois de pontos
            texto = procuraPonto(texto, " ponto final");
            texto = procuraPonto(texto, " Ponto final");
            texto = procuraPonto(texto, " com final");
            texto = procuraPonto(texto, " bom final");
            texto = procuraPonto(texto, ".");
            texto = procuraPonto(texto, " dois pontos");
            texto = procuraPonto(texto, " Dois pontos");
            texto = procuraPonto(texto, ":");
            texto = procuraPonto(texto, " ponto de interrogação");
            texto = procuraPonto(texto, " Ponto de interrogação");
            texto = procuraPonto(texto, "? ");
            texto = procuraPonto(texto, " ponto de exclamação");
            texto = procuraPonto(texto, " Ponto de exclamação");
            texto = procuraPonto(texto, "! ");

            //Alterando as palavra chaves e consertando erros
            texto = alteraPalavra(texto, " ponto final", ".");
            texto = alteraPalavra(texto, " Ponto final", ".");
            texto = alteraPalavra(texto, " com final", ".");
            texto = alteraPalavra(texto, " bom final", ".");
            texto = alteraPalavra(texto, " dois pontos", ":");
            texto = alteraPalavra(texto, " Dois pontos", ":");
            texto = alteraPalavra(texto, " ponto de interrogação", "? ");
            texto = alteraPalavra(texto, " Ponto de interrogação", "? ");
            texto = alteraPalavra(texto, " ponto de exclamação", "! ");
            texto = alteraPalavra(texto, " Ponto de exclamação", "! ");
            texto = alteraPalavra(texto, " vírgula", ",");
            texto = alteraPalavra(texto, " Vírgula", ",");
            texto = alteraPalavra(texto, "abre parênteses", "(");
            texto = alteraPalavra(texto, "Abre parênteses", "(");
            texto = alteraPalavra(texto, "fecha parênteses", ")");
            texto = alteraPalavra(texto, "Fecha parênteses", ")");
            texto = alteraPalavra(texto, "abre aspas", "\"");
            texto = alteraPalavra(texto, "Abre aspas", "\"");
            texto = alteraPalavra(texto, "fecha aspas", "\"");
            texto = alteraPalavra(texto, "Fecha aspas", "\"");
            texto = alteraPalavra(texto, " nova linha", "<br>&nbsp;&nbsp;&nbsp;&nbsp;");
            texto = alteraPalavra(texto, " Nova linha", "<br>&nbsp;&nbsp;&nbsp;&nbsp;");
            texto = alteraPalavra(texto, " nossa linha", "<br>&nbsp;&nbsp;&nbsp;&nbsp;");
            texto = alteraPalavra(texto, " Nossa linha", "<br>&nbsp;&nbsp;&nbsp;&nbsp;");
            texto = alteraPalavra(texto, "tabular", "&nbsp;&nbsp;&nbsp;&nbsp;");
            texto = alteraPalavra(texto, "Tabular", "&nbsp;&nbsp;&nbsp;&nbsp;");
            
            texto = procuraPonto(texto, "&nbsp;&nbsp;&nbsp;&nbsp;");
            
            return texto;
        }
        
        //Função para o usuário baixar um arquivo no formato html com o texto já editado.
        function download(){
            let a = document.body.appendChild(
                document.createElement("a")
            );
            a.download = "laudo_falado.html";
            a.href = "data:text/html," + document.getElementById("transcription").innerHTML;
            a.click(); 
            
        }

        
    }
    
})