/* =========================================================
   VEYRA IA
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const SUPABASE_URL =
    "https://dazwnwkkszydyrcoajll.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_q87setC5fqkaVhHRWdlabw_UWNav-5H";

const VEYRA_API_URL =
    "https://dazwnwkkszydyrcoajll.supabase.co/functions/v1/hyper-endpoint";


/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   PERSONALIDADE DA VEYRA
========================================================= */

const VEYRA_PERSONALITY = `
Você é a Veyra IA.

Seu objetivo é ajudar o usuário de forma clara, natural e útil.

Responda sempre em português do Brasil quando o usuário falar português.

Seja amigável, direta e inteligente.

Não invente informações.

Quando não souber algo, diga claramente que não sabe.

Não fique repetindo a pergunta do usuário.

Evite respostas desnecessariamente longas.

Explique assuntos difíceis de maneira simples.

Quando estiver ajudando com programação, dê instruções práticas e código pronto quando necessário.

Considere o contexto da conversa antes de responder.

Você é uma assistente chamada Veyra.
`;


/* =========================================================
   ESTADO
========================================================= */

let database = {
    conversations: []
};

let currentUser = null;

let currentConversation = null;

let selectedImage = null;

let authMode = "login";

let isSending = false;


/* =========================================================
   ELEMENTOS
========================================================= */

const authScreen =
    document.getElementById("authScreen");

const app =
    document.getElementById("app");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupPassword =
    document.getElementById("signupPassword");

const loginButton =
    document.getElementById("loginButton");

const signupButton =
    document.getElementById("signupButton");

const showSignup =
    document.getElementById("showSignup");

const showLogin =
    document.getElementById("showLogin");

const loginMessage =
    document.getElementById("loginMessage");

const signupMessage =
    document.getElementById("signupMessage");

const chat =
    document.getElementById("chat");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const newChatButton =
    document.getElementById("newChat");

const conversationList =
    document.getElementById("conversationList");

const settingsButton =
    document.getElementById("settingsBtn");

const aboutButton =
    document.getElementById("aboutBtn");

const imageButton =
    document.getElementById("imageButton");

const imageInput =
    document.getElementById("imageInput");

const userProfile =
    document.getElementById("userProfile");

const profileMenu =
    document.getElementById("profileMenu");

const logoutButton =
    document.getElementById("logoutButton");

const userAvatar =
    document.getElementById("userAvatar");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const statusText =
    document.getElementById("statusText");

const header =
    document.querySelector(".header");

const sidebar =
    document.querySelector(".sidebar");


/* =========================================================
   MENU MOBILE
========================================================= */

let mobileMenuButton = null;

let mobileOverlay = null;


function criarMenuMobile() {

    if (!header || !sidebar) {
        return;
    }


    /* BOTÃO */

    mobileMenuButton =
        document.createElement("button");

    mobileMenuButton.id =
        "mobileMenuButton";

    mobileMenuButton.className =
        "mobile-menu-button";

    mobileMenuButton.type =
        "button";

    mobileMenuButton.setAttribute(
        "aria-label",
        "Abrir menu"
    );

    mobileMenuButton.innerHTML = "☰";


    header.insertBefore(
        mobileMenuButton,
        header.firstChild
    );


    /* OVERLAY */

    mobileOverlay =
        document.createElement("div");

    mobileOverlay.id =
        "mobileOverlay";

    mobileOverlay.className =
        "mobile-overlay";


    document.body.appendChild(
        mobileOverlay
    );


    /* BOTÃO ABRIR/FECHAR */

    mobileMenuButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            alternarMenuMobile();

        }
    );


    /* CLICAR FORA */

    mobileOverlay.addEventListener(
        "click",
        function () {

            fecharMenuMobile();

        }
    );


    /* ESC */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                fecharMenuMobile();

            }

        }
    );


    /* REDIMENSIONAMENTO */

    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 700) {

                fecharMenuMobile();

            }

        }
    );

}


function abrirMenuMobile() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.add(
        "mobile-open"
    );

    if (mobileOverlay) {

        mobileOverlay.classList.add(
            "active"
        );

    }

    if (mobileMenuButton) {

        mobileMenuButton.innerHTML =
            "✕";

        mobileMenuButton.setAttribute(
            "aria-label",
            "Fechar menu"
        );

    }

}


function fecharMenuMobile() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.remove(
        "mobile-open"
    );

    if (mobileOverlay) {

        mobileOverlay.classList.remove(
            "active"
        );

    }

    if (mobileMenuButton) {

        mobileMenuButton.innerHTML =
            "☰";

        mobileMenuButton.setAttribute(
            "aria-label",
            "Abrir menu"
        );

    }

}


function alternarMenuMobile() {

    if (!sidebar) {
        return;
    }

    if (
        sidebar.classList.contains(
            "mobile-open"
        )
    ) {

        fecharMenuMobile();

    } else {

        abrirMenuMobile();

    }

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function salvarLocal() {

    try {

        localStorage.setItem(
            "veyra_data",
            JSON.stringify(database)
        );

    } catch (error) {

        console.error(
            "Erro ao salvar local:",
            error
        );

    }

}


function carregarLocal() {

    try {

        const salvo =
            localStorage.getItem(
                "veyra_data"
            );

        if (!salvo) {
            return;
        }

        const dados =
            JSON.parse(salvo);

        if (
            dados &&
            Array.isArray(
                dados.conversations
            )
        ) {

            database = dados;

        }

    } catch (error) {

        console.error(
            "Erro ao carregar local:",
            error
        );

    }

}


/* =========================================================
   MENSAGENS DE AUTENTICAÇÃO
========================================================= */

function mostrarLogin() {

    authMode = "login";

    loginForm.style.display =
        "block";

    signupForm.style.display =
        "none";

    loginMessage.textContent =
        "";

    signupMessage.textContent =
        "";

}


function mostrarCadastro() {

    authMode = "signup";

    loginForm.style.display =
        "none";

    signupForm.style.display =
        "block";

    loginMessage.textContent =
        "";

    signupMessage.textContent =
        "";

}


/* =========================================================
   CADASTRO
========================================================= */

async function criarConta() {

    const nome =
        signupName.value.trim();

    const email =
        signupEmail.value.trim();

    const senha =
        signupPassword.value;


    if (!nome || !email || !senha) {

        signupMessage.textContent =
            "Preencha todos os campos.";

        return;

    }


    if (senha.length < 6) {

        signupMessage.textContent =
            "A senha precisa ter pelo menos 6 caracteres.";

        return;

    }


    signupButton.disabled =
        true;

    signupButton.textContent =
        "Criando...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email: email,

                password: senha,

                options: {

                    data: {

                        name: nome

                    }

                }

            });


        if (error) {
            throw error;
        }


        if (
            data.user &&
            !data.session
        ) {

            signupMessage.style.color =
                "#8fdb9d";

            signupMessage.textContent =
                "Conta criada! Verifique seu e-mail para confirmar.";

            signupName.value =
                "";

            signupEmail.value =
                "";

            signupPassword.value =
                "";

        } else {

            signupMessage.style.color =
                "#8fdb9d";

            signupMessage.textContent =
                "Conta criada com sucesso!";

        }

    } catch (error) {

        signupMessage.style.color =
            "#ff8f8f";

        signupMessage.textContent =
            error.message ||
            "Não foi possível criar a conta.";

    } finally {

        signupButton.disabled =
            false;

        signupButton.textContent =
            "Criar conta";

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function entrar() {

    const email =
        loginEmail.value.trim();

    const senha =
        loginPassword.value;


    if (!email || !senha) {

        loginMessage.textContent =
            "Digite seu e-mail e senha.";

        return;

    }


    loginButton.disabled =
        true;

    loginButton.textContent =
        "Entrando...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: senha

            });


        if (error) {
            throw error;
        }


        if (data.user) {

            await iniciarAplicacao(
                data.user
            );

        }

    } catch (error) {

        loginMessage.textContent =
            error.message ||
            "Não foi possível entrar.";

    } finally {

        loginButton.disabled =
            false;

        loginButton.textContent =
            "Entrar";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function sair() {

    await supabaseClient.auth.signOut();

    currentUser =
        null;

    currentConversation =
        null;

    database = {
        conversations: []
    };

    fecharMenuMobile();

    app.style.display =
        "none";

    authScreen.style.display =
        "flex";

    loginPassword.value =
        "";

}


/* =========================================================
   PERFIL
========================================================= */

function atualizarPerfil() {

    if (!currentUser) {
        return;
    }


    const nome =
        currentUser.user_metadata?.name ||
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split("@")[0] ||
        "Usuário";


    const email =
        currentUser.email ||
        "";


    userName.textContent =
        nome;

    userEmail.textContent =
        email;


    userAvatar.textContent =
        nome
            .charAt(0)
            .toUpperCase();

}


/* =========================================================
   CONVERSAS - SUPABASE
========================================================= */

async function carregarConversas() {

    if (!currentUser) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("conversations")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "updated_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        database.conversations =
            data || [];


        salvarLocal();

        renderizarConversas();


        if (
            database.conversations.length >
            0
        ) {

            const primeira =
                database.conversations[0];

            await selecionarConversa(
                primeira.id
            );

        } else {

            await criarNovaConversa();

        }

    } catch (error) {

        console.error(
            "Erro ao carregar conversas:",
            error
        );

        carregarLocal();

        renderizarConversas();

        if (
            database.conversations.length >
            0
        ) {

            await selecionarConversa(
                database.conversations[0].id
            );

        } else {

            criarNovaConversaLocal();

        }

    }

}


/* =========================================================
   CRIAR CONVERSA
========================================================= */

async function criarNovaConversa() {

    if (!currentUser) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("conversations")
                .insert({

                    user_id:
                        currentUser.id,

                    title:
                        "Nova conversa",

                    messages:
                        []

                })
                .select()
                .single();


        if (error) {
            throw error;
        }


        database.conversations.unshift(
            data
        );


        salvarLocal();


        await selecionarConversa(
            data.id
        );


        renderizarConversas();

    } catch (error) {

        console.error(
            "Erro ao criar conversa:",
            error
        );

        criarNovaConversaLocal();

    }

}


function criarNovaConversaLocal() {

    const conversa = {

        id:
            crypto.randomUUID(),

        user_id:
            currentUser?.id || null,

        title:
            "Nova conversa",

        messages:
            [],

        created_at:
            new Date().toISOString(),

        updated_at:
            new Date().toISOString()

    };


    database.conversations.unshift(
        conversa
    );


    currentConversation =
        conversa;


    salvarLocal();

    renderizarConversas();

    renderizarChat();

}


/* =========================================================
   SELECIONAR CONVERSA
========================================================= */

async function selecionarConversa(
    id
) {

    const conversa =
        database.conversations.find(
            item => item.id === id
        );


    if (!conversa) {
        return;
    }


    currentConversation =
        conversa;


    renderizarConversas();

    renderizarChat();

    fecharMenuMobile();

}


/* =========================================================
   RENDERIZAR CONVERSAS
========================================================= */

function renderizarConversas() {

    if (!conversationList) {
        return;
    }


    conversationList.innerHTML =
        "";


    database.conversations.forEach(
        conversa => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "conversation-item";


            if (
                currentConversation &&
                currentConversation.id ===
                    conversa.id
            ) {

                item.classList.add(
                    "active"
                );

            }


            const texto =
                document.createElement(
                    "span"
                );

            texto.textContent =
                conversa.title ||
                "Nova conversa";


            item.appendChild(
                texto
            );


            item.addEventListener(
                "click",
                function () {

                    selecionarConversa(
                        conversa.id
                    );

                }
            );


            conversationList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SALVAR CONVERSA
========================================================= */

async function salvarConversa() {

    if (
        !currentConversation ||
        !currentUser
    ) {
        return;
    }


    currentConversation.updated_at =
        new Date().toISOString();


    salvarLocal();


    try {

        const {
            error
        } =
            await supabaseClient
                .from("conversations")
                .update({

                    title:
                        currentConversation.title,

                    messages:
                        currentConversation.messages,

                    updated_at:
                        currentConversation.updated_at

                })
                .eq(
                    "id",
                    currentConversation.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {

            console.error(
                "Erro ao salvar conversa:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Erro ao salvar:",
            error
        );

    }


    renderizarConversas();

}


/* =========================================================
   RENDERIZAR CHAT
========================================================= */

function renderizarChat() {

    if (!chat) {
        return;
    }


    chat.innerHTML =
        "";


    if (
        !currentConversation ||
        !Array.isArray(
            currentConversation.messages
        ) ||
        currentConversation.messages.length === 0
    ) {

        mostrarWelcome();

        return;

    }


    currentConversation.messages.forEach(
        mensagem => {

            adicionarMensagemNaTela(
                mensagem.role,
                mensagem.content
            );

        }
    );


    rolarChat();

}


/* =========================================================
   WELCOME
========================================================= */

function mostrarWelcome() {

    const welcome =
        document.createElement(
            "div"
        );

    welcome.className =
        "welcome";


    welcome.innerHTML = `
        <h1>Olá, eu sou a Veyra.</h1>

        <p>
            Uma IA criada para conversar,
            ajudar e aprender com o contexto
            da conversa.
        </p>

        <div class="suggestions">

            <button class="suggestion">
                Explique algo de forma simples
            </button>

            <button class="suggestion">
                Me ajude com programação
            </button>

            <button class="suggestion">
                Me dê uma ideia para um projeto
            </button>

            <button class="suggestion">
                O que você consegue fazer?
            </button>

        </div>
    `;


    chat.appendChild(
        welcome
    );


    const botoes =
        welcome.querySelectorAll(
            ".suggestion"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                function () {

                    messageInput.value =
                        botao.textContent.trim();

                    messageInput.focus();

                }
            );

        }
    );

}


/* =========================================================
   ADICIONAR MENSAGEM NA TELA
========================================================= */

function adicionarMensagemNaTela(
    role,
    content
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "message " +
        (
            role === "user"
                ? "user"
                : "assistant"
        );


    const messageContent =
        document.createElement(
            "div"
        );

    messageContent.className =
        "message-content";


    if (
        typeof content === "string"
    ) {

        messageContent.innerHTML =
            formatarResposta(
                content
            );

    } else {

        messageContent.textContent =
            String(content);

    }


    wrapper.appendChild(
        messageContent
    );


    chat.appendChild(
        wrapper
    );


    return wrapper;

}


/* =========================================================
   FORMATAR RESPOSTA
========================================================= */

function escaparHTML(texto) {

    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function formatarResposta(texto) {

    let resultado =
        escaparHTML(texto);


    resultado =
        resultado.replace(
            /```([\s\S]*?)```/g,
            function (_, codigo) {

                return (
                    "<pre><code>" +
                    codigo.trim() +
                    "</code></pre>"
                );

            }
        );


    resultado =
        resultado.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    resultado =
        resultado.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    resultado =
        resultado.replace(
            /\n/g,
            "<br>"
        );


    return resultado;

}


/* =========================================================
   PENSANDO
========================================================= */

function mostrarPensando() {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "message assistant";


    const content =
        document.createElement(
            "div"
        );

    content.className =
        "message-content thinking";


    content.textContent =
        "Veyra está pensando...";


    wrapper.appendChild(
        content
    );


    chat.appendChild(
        wrapper
    );


    rolarChat();


    return wrapper;

}


/* =========================================================
   SCROLL
========================================================= */

function rolarChat() {

    requestAnimationFrame(
        function () {

            chat.scrollTop =
                chat.scrollHeight;

        }
    );

}


/* =========================================================
   MENSAGENS PARA IA
========================================================= */

function criarMensagensIA() {

    const mensagens = [

        {
            role: "system",

            content:
                VEYRA_PERSONALITY

        }

    ];


    if (
        currentConversation &&
        Array.isArray(
            currentConversation.messages
        )
    ) {

        currentConversation.messages.forEach(
            mensagem => {

                if (
                    mensagem.role === "user" ||
                    mensagem.role === "assistant"
                ) {

                    mensagens.push({

                        role:
                            mensagem.role,

                        content:
                            mensagem.content

                    });

                }

            }
        );

    }


    return mensagens;

}


/* =========================================================
   PERGUNTAR À IA
========================================================= */

async function perguntarIA() {

    if (!currentUser) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    const {
        data: sessionData,
        error: sessionError
    } =
        await supabaseClient.auth.getSession();


    if (sessionError) {
        throw sessionError;
    }


    let session =
        sessionData.session;


    if (!session) {

        const {
            data,
            error
        } =
            await supabaseClient.auth.refreshSession();


        if (error) {
            throw error;
        }


        session =
            data.session;

    }


    if (!session) {

        throw new Error(
            "Sessão expirada. Entre novamente."
        );

    }


    const mensagens =
        criarMensagensIA();


    const resposta =
        await fetch(
            VEYRA_API_URL,
            {

                method: "POST",

                mode: "cors",

                cache: "no-store",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        session.access_token

                },

                body:
                    JSON.stringify({

                        messages:
                            mensagens

                    })

            }
        );


    const dados =
        await resposta.json();


    if (!resposta.ok) {

        throw new Error(
            dados?.error ||
            dados?.message ||
            "Erro ao conectar com a IA."
        );

    }


    const respostaIA =
        dados?.choices?.[0]?.message?.content;


    if (!respostaIA) {

        throw new Error(
            "A IA não retornou uma resposta."
        );

    }


    return respostaIA;

}


/* =========================================================
   ENVIAR MENSAGEM
========================================================= */

async function enviarMensagem() {

    if (isSending) {
        return;
    }


    const texto =
        messageInput.value.trim();


    if (!texto && !selectedImage) {
        return;
    }


    if (!currentConversation) {

        await criarNovaConversa();

    }


    if (!currentConversation) {
        return;
    }


    isSending =
        true;


    sendButton.disabled =
        true;


    let textoUsuario =
        texto;


    if (
        selectedImage &&
        !textoUsuario
    ) {

        textoUsuario =
            "Analise esta imagem.";

    }


    /* =========================
       MENSAGEM DO USUÁRIO
    ========================== */

    currentConversation.messages.push({

        role: "user",

        content:
            textoUsuario

    });


    /* PRIMEIRA MENSAGEM = TÍTULO */

    if (
        currentConversation.title ===
            "Nova conversa"
    ) {

        currentConversation.title =
            textoUsuario
                .substring(0, 40) ||
            "Nova conversa";

    }


    messageInput.value =
        "";

    ajustarTextarea();


    selectedImage =
        null;


    if (imageInput) {

        imageInput.value =
            "";

    }


    adicionarMensagemNaTela(
        "user",
        textoUsuario
    );


    rolarChat();


    await salvarConversa();


    /* =========================
       PENSANDO
    ========================== */

    const thinking =
        mostrarPensando();


    try {

        const resposta =
            await perguntarIA();


        thinking.remove();


        currentConversation.messages.push({

            role: "assistant",

            content:
                resposta

        });


        adicionarMensagemNaTela(
            "assistant",
            resposta
        );


        await salvarConversa();


        rolarChat();

    } catch (error) {

        console.error(
            "Erro na IA:",
            error
        );


        thinking.remove();


        const mensagemErro =
            "Não consegui responder agora. " +
            (
                error.message ||
                "Tente novamente."
            );


        currentConversation.messages.push({

            role: "assistant",

            content:
                mensagemErro

        });


        adicionarMensagemNaTela(
            "assistant",
            mensagemErro
        );


        await salvarConversa();

    } finally {

        isSending =
            false;

        sendButton.disabled =
            false;

        messageInput.focus();

    }

}


/* =========================================================
   TEXTAREA
========================================================= */

function ajustarTextarea() {

    if (!messageInput) {
        return;
    }


    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            140
        ) +
        "px";

}


/* =========================================================
   NOVA CONVERSA
========================================================= */

async function novaConversa() {

    fecharMenuMobile();

    await criarNovaConversa();

}


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

function abrirConfiguracoes() {

    fecharMenuMobile();

    alert(
        "As configurações da Veyra serão adicionadas aqui."
    );

}


/* =========================================================
   SOBRE
========================================================= */

function abrirSobre() {

    fecharMenuMobile();

    alert(
        "Veyra IA\n\n" +
        "Assistente de inteligência artificial."
    );

}


/* =========================================================
   INICIAR APLICAÇÃO
========================================================= */

async function iniciarAplicacao(
    user
) {

    currentUser =
        user;


    authScreen.style.display =
        "none";

    app.style.display =
        "flex";


    atualizarPerfil();


    if (statusText) {

        statusText.textContent =
            "Online";

    }


    carregarLocal();


    await carregarConversas();


    messageInput.focus();

}


/* =========================================================
   EVENTOS DE AUTENTICAÇÃO
========================================================= */

if (showSignup) {

    showSignup.addEventListener(
        "click",
        mostrarCadastro
    );

}


if (showLogin) {

    showLogin.addEventListener(
        "click",
        mostrarLogin
    );

}


if (loginButton) {

    loginButton.addEventListener(
        "click",
        entrar
    );

}


if (signupButton) {

    signupButton.addEventListener(
        "click",
        criarConta
    );

}


if (loginPassword) {

    loginPassword.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                entrar();

            }

        }
    );

}


if (signupPassword) {

    signupPassword.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                criarConta();

            }

        }
    );

}


/* =========================================================
   EVENTOS DO CHAT
========================================================= */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        enviarMensagem
    );

}


if (messageInput) {

    messageInput.addEventListener(
        "input",
        ajustarTextarea
    );


    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                enviarMensagem();

            }

        }
    );

}


/* =========================================================
   IMAGEM
========================================================= */

if (imageButton) {

    imageButton.addEventListener(
        "click",
        function () {

            imageInput.click();

        }
    );

}


if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const arquivo =
                imageInput.files?.[0];


            if (!arquivo) {

                selectedImage =
                    null;

                return;

            }


            selectedImage =
                arquivo;

        }
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        novaConversa
    );

}


if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        abrirConfiguracoes
    );

}


if (aboutButton) {

    aboutButton.addEventListener(
        "click",
        abrirSobre
    );

}


/* =========================================================
   PERFIL
========================================================= */

if (userProfile) {

    userProfile.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            userProfile.classList.toggle(
                "open"
            );

        }
    );

}


document.addEventListener(
    "click",
    function () {

        if (userProfile) {

            userProfile.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            sair();

        }
    );

}


/* =========================================================
   AUTENTICAÇÃO SUPABASE
========================================================= */

supabaseClient.auth.onAuthStateChange(
    async function (
        event,
        session
    ) {

        if (session?.user) {

            if (
                !currentUser ||
                currentUser.id !==
                    session.user.id
            ) {

                await iniciarAplicacao(
                    session.user
                );

            }

        } else {

            currentUser =
                null;

            currentConversation =
                null;

            app.style.display =
                "none";

            authScreen.style.display =
                "flex";

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        criarMenuMobile();

        carregarLocal();


        try {

            const {
                data
            } =
                await supabaseClient.auth.getSession();


            if (data.session?.user) {

                await iniciarAplicacao(
                    data.session.user
                );

            } else {

                authScreen.style.display =
                    "flex";

                app.style.display =
                    "none";

            }

        } catch (error) {

            console.error(
                "Erro ao iniciar Veyra:",
                error
            );

            authScreen.style.display =
                "flex";

            app.style.display =
                "none";

        }

    }
);