/* =====================================================
   VEYRA IA 0.8
   SCRIPT COMPLETO
   ===================================================== */


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const SUPABASE_URL =
    "https://dazwnwkkszydyrcoajll.supabase.co";


/*
   COLE A SUA PUBLISHABLE KEY DO SUPABASE AQUI.

   Não coloque aqui sua chave secreta da OpenRouter.
*/

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_q87setC5fqkaVhHRWdlabw_UWNav-5H";


/* =====================================================
   OPENROUTER
   ===================================================== */

const OPENROUTER_API_KEY =
    localStorage.getItem("veyra_openrouter_key") || "";

/* =====================================================
   API DE IMAGENS
   ===================================================== */

const IMAGE_API = {

    enabled: false,

    url: "",

    apiKey: "",

    model: "",

    enabledByUser: false

};


/* =====================================================
   SUPABASE CLIENT
   ===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );


/* =====================================================
   VEYRA
   ===================================================== */

const Veyra = {

    name: "Veyra",

    version: "0.8.0",

    apiURL:
        "https://openrouter.ai/api/v1/chat/completions",

    model:
        "openrouter/free",

    storageKey:
        "veyra_data",

    personality: `
Você é a Veyra, uma inteligência artificial amigável,
útil, direta e inteligente.

Responda em português do Brasil quando o usuário falar
em português.

Não invente informações.

Se não souber alguma coisa, diga claramente que não sabe.

Explique assuntos difíceis de maneira simples.

Não seja excessivamente formal.

Evite respostas enormes quando uma resposta curta resolver.

Quando o usuário pedir código, entregue código funcional
e explique somente o necessário.

Quando o usuário pedir ajuda passo a passo,
explique em etapas simples.

Não fique repetindo a mesma informação.

Seu objetivo é ajudar o usuário de forma prática.
`

};


/* =====================================================
   ESTADO
   ===================================================== */

let database = {

    conversations: [],

    currentConversation: null

};

let currentUser = null;

let selectedImage = null;

let authMode = "login";

let isSending = false;


/* =====================================================
   DOM
   ===================================================== */

const app =
    document.querySelector(".app");

const authScreen =
    document.getElementById(
        "authScreen"
    );

const authTitle =
    document.getElementById(
        "authTitle"
    );

const authSubtitle =
    document.getElementById(
        "authSubtitle"
    );

const authName =
    document.getElementById(
        "authName"
    );

const nameGroup =
    document.getElementById(
        "nameGroup"
    );

const authEmail =
    document.getElementById(
        "authEmail"
    );

const authPassword =
    document.getElementById(
        "authPassword"
    );

const authButton =
    document.getElementById(
        "authButton"
    );

const authToggle =
    document.getElementById(
        "authToggle"
    );

const authError =
    document.getElementById(
        "authError"
    );


const chat =
    document.getElementById(
        "chat"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const sendButton =
    document.getElementById(
        "sendButton"
    );

const newChat =
    document.getElementById(
        "newChat"
    );

const conversationList =
    document.getElementById(
        "conversationList"
    );


const settingsBtn =
    document.getElementById(
        "settingsBtn"
    );

const aboutBtn =
    document.getElementById(
        "aboutBtn"
    );


const statusDot =
    document.getElementById(
        "statusDot"
    );

const statusText =
    document.getElementById(
        "statusText"
    );

const modelStatus =
    document.getElementById(
        "modelStatus"
    );


const imageButton =
    document.getElementById(
        "imageButton"
    );

const imageInput =
    document.getElementById(
        "imageInput"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const previewImage =
    document.getElementById(
        "previewImage"
    );

const removeImage =
    document.getElementById(
        "removeImage"
    );


/* =====================================================
   DOM - PERFIL
   ===================================================== */

const userProfile =
    document.getElementById(
        "userProfile"
    );

const userProfileButton =
    document.getElementById(
        "userProfileButton"
    );

const userProfileMenu =
    document.getElementById(
        "userProfileMenu"
    );

const userAvatar =
    document.getElementById(
        "userAvatar"
    );

const userName =
    document.getElementById(
        "userName"
    );

const userEmail =
    document.getElementById(
        "userEmail"
    );

const menuUserAvatar =
    document.getElementById(
        "menuUserAvatar"
    );

const menuUserName =
    document.getElementById(
        "menuUserName"
    );

const menuUserEmail =
    document.getElementById(
        "menuUserEmail"
    );

const profileSettings =
    document.getElementById(
        "profileSettings"
    );

const profileLogout =
    document.getElementById(
        "profileLogout"
    );


/* =====================================================
   LOCAL STORAGE
   ===================================================== */

function salvarLocal() {

    try {

        localStorage.setItem(
            Veyra.storageKey,
            JSON.stringify(database)
        );

    } catch (erro) {

        console.warn(
            "Não foi possível salvar localmente:",
            erro
        );

    }

}


function carregarLocal() {

    try {

        const salvo =
            localStorage.getItem(
                Veyra.storageKey
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

    } catch (erro) {

        console.warn(
            "Erro ao carregar dados locais:",
            erro
        );

    }

}


/* =====================================================
   AUTH UI
   ===================================================== */

function showAuth() {

    if (authScreen) {

        authScreen.classList.remove(
            "hidden"
        );

    }

    if (app) {

        app.classList.add(
            "hidden"
        );

    }

}


function showApp() {

    if (authScreen) {

        authScreen.classList.add(
            "hidden"
        );

    }

    if (app) {

        app.classList.remove(
            "hidden"
        );

    }

}


function setAuthError(mensagem) {

    if (!authError) {
        return;
    }

    authError.textContent =
        mensagem || "";

}


function clearAuthFields() {

    if (authName) {
        authName.value = "";
    }

    if (authEmail) {
        authEmail.value = "";
    }

    if (authPassword) {
        authPassword.value = "";
    }

    setAuthError("");

}


function setAuthMode(modo) {

    authMode = modo;

    clearAuthFields();


    if (modo === "signup") {

        if (authTitle) {

            authTitle.textContent =
                "Criar conta";

        }

        if (authSubtitle) {

            authSubtitle.textContent =
                "Crie sua conta para salvar suas conversas.";

        }

        if (nameGroup) {

            nameGroup.classList.remove(
                "hidden"
            );

        }

        if (authButton) {

            authButton.textContent =
                "Criar conta";

        }

        if (authToggle) {

            authToggle.textContent =
                "Já tenho uma conta";

        }

    } else {

        if (authTitle) {

            authTitle.textContent =
                "Bem-vindo à Veyra";

        }

        if (authSubtitle) {

            authSubtitle.textContent =
                "Entre na sua conta para continuar.";

        }

        if (nameGroup) {

            nameGroup.classList.add(
                "hidden"
            );

        }

        if (authButton) {

            authButton.textContent =
                "Entrar";

        }

        if (authToggle) {

            authToggle.textContent =
                "Ainda não tenho uma conta";

        }

    }

}


/* =====================================================
   TRADUZIR ERROS AUTH
   ===================================================== */

function traduzirErroAuth(erro) {

    const mensagem =
        String(
            erro?.message || ""
        ).toLowerCase();


    if (
        mensagem.includes(
            "invalid login credentials"
        )
    ) {

        return "E-mail ou senha incorretos.";

    }


    if (
        mensagem.includes(
            "email not confirmed"
        )
    ) {

        return "Confirme seu e-mail antes de entrar.";

    }


    if (
        mensagem.includes(
            "user already registered"
        )
    ) {

        return "Este e-mail já possui uma conta.";

    }


    if (
        mensagem.includes(
            "password should be at least"
        )
    ) {

        return "A senha precisa ter pelo menos 6 caracteres.";

    }


    if (
        mensagem.includes(
            "invalid email"
        )
    ) {

        return "Digite um e-mail válido.";

    }


    if (
        mensagem.includes(
            "rate limit"
        )
    ) {

        return "Muitas tentativas. Aguarde um pouco.";

    }


    return (
        erro?.message ||
        "Não foi possível realizar a operação."
    );

}


/* =====================================================
   CADASTRO
   ===================================================== */

async function signUp() {

    const nome =
        authName?.value.trim() || "";

    const email =
        authEmail?.value.trim() || "";

    const senha =
        authPassword?.value || "";


    if (!nome) {

        setAuthError(
            "Digite seu nome."
        );

        return;

    }


    if (!email) {

        setAuthError(
            "Digite seu e-mail."
        );

        return;

    }


    if (senha.length < 6) {

        setAuthError(
            "A senha precisa ter pelo menos 6 caracteres."
        );

        return;

    }


    setAuthError("");


    if (authButton) {

        authButton.disabled = true;

        authButton.textContent =
            "Criando conta...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email,

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


        if (!data.session) {

            setAuthError(
                "Conta criada! Verifique seu e-mail para confirmar a conta e depois entre."
            );

            if (authButton) {

                authButton.disabled =
                    false;

                authButton.textContent =
                    "Criar conta";

            }

            return;

        }


        currentUser =
            data.user;


        await iniciarAplicacao(
            data.user
        );


    } catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );

        setAuthError(
            traduzirErroAuth(erro)
        );

    } finally {

        if (authButton) {

            authButton.disabled =
                false;

            authButton.textContent =
                authMode === "signup"
                    ? "Criar conta"
                    : "Entrar";

        }

    }

}


/* =====================================================
   LOGIN
   ===================================================== */

async function signIn() {

    const email =
        authEmail?.value.trim() || "";

    const senha =
        authPassword?.value || "";


    if (!email) {

        setAuthError(
            "Digite seu e-mail."
        );

        return;

    }


    if (!senha) {

        setAuthError(
            "Digite sua senha."
        );

        return;

    }


    setAuthError("");


    if (authButton) {

        authButton.disabled = true;

        authButton.textContent =
            "Entrando...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email,

                password: senha

            });


        if (error) {
            throw error;
        }


        currentUser =
            data.user;


        await iniciarAplicacao(
            data.user
        );


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );

        setAuthError(
            traduzirErroAuth(erro)
        );

    } finally {

        if (authButton) {

            authButton.disabled =
                false;

            authButton.textContent =
                authMode === "signup"
                    ? "Criar conta"
                    : "Entrar";

        }

    }

}


/* =====================================================
   SAIR
   ===================================================== */

async function signOut() {

    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {
            throw error;
        }


    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

        alert(
            "Não foi possível sair da conta."
        );

        return;

    }


    currentUser = null;


    database = {

        conversations: [],

        currentConversation: null

    };


    selectedImage = null;

    isSending = false;


    limparImagem();


    if (messageInput) {

        messageInput.value = "";

    }


    fecharMenuPerfil();


    limparPerfilVisual();


    showAuth();


    setAuthMode(
        "login"
    );


    atualizarStatus();

}


/* =====================================================
   PERFIL
   ===================================================== */

function obterDadosPerfil(user) {

    if (!user) {

        return {

            nome: "Usuário",

            email: "",

            foto: ""

        };

    }


    const metadata =
        user.user_metadata || {};


    const nome =
        metadata.name ||
        metadata.full_name ||
        metadata.fullName ||
        metadata.user_name ||
        metadata.preferred_username ||
        user.email?.split("@")[0] ||
        "Usuário";


    const email =
        user.email || "";


    const foto =
        metadata.avatar_url ||
        metadata.picture ||
        metadata.avatar ||
        "";


    return {

        nome: String(nome),

        email: String(email),

        foto: String(foto)

    };

}


function obterInicial(nome) {

    const texto =
        String(
            nome || "U"
        ).trim();


    if (!texto) {
        return "U";
    }


    return texto
        .charAt(0)
        .toUpperCase();

}


function criarAvatarElemento(
    elemento,
    nome,
    foto
) {

    if (!elemento) {
        return;
    }


    elemento.innerHTML = "";


    if (foto) {

        const img =
            document.createElement(
                "img"
            );


        img.src = foto;

        img.alt = nome;

        img.referrerPolicy =
            "no-referrer";


        img.onerror = () => {

            elemento.innerHTML =
                "";

            elemento.textContent =
                obterInicial(nome);

        };


        elemento.appendChild(img);

        return;

    }


    elemento.textContent =
        obterInicial(nome);

}


function atualizarPerfil() {

    if (!currentUser) {
        return;
    }


    const perfil =
        obterDadosPerfil(
            currentUser
        );


    if (userName) {

        userName.textContent =
            perfil.nome;

    }


    if (userEmail) {

        userEmail.textContent =
            perfil.email;

    }


    if (menuUserName) {

        menuUserName.textContent =
            perfil.nome;

    }


    if (menuUserEmail) {

        menuUserEmail.textContent =
            perfil.email;

    }


    criarAvatarElemento(
        userAvatar,
        perfil.nome,
        perfil.foto
    );


    criarAvatarElemento(
        menuUserAvatar,
        perfil.nome,
        perfil.foto
    );

}


function limparPerfilVisual() {

    if (userName) {
        userName.textContent =
            "Usuário";
    }

    if (userEmail) {
        userEmail.textContent =
            "conta";
    }

    if (menuUserName) {
        menuUserName.textContent =
            "Usuário";
    }

    if (menuUserEmail) {
        menuUserEmail.textContent =
            "conta";
    }

    if (userAvatar) {

        userAvatar.innerHTML =
            "U";

    }

    if (menuUserAvatar) {

        menuUserAvatar.innerHTML =
            "U";

    }

}


function alternarMenuPerfil() {

    if (!userProfileMenu) {
        return;
    }

    userProfileMenu.classList.toggle(
        "hidden"
    );

}


function fecharMenuPerfil() {

    if (!userProfileMenu) {
        return;
    }

    userProfileMenu.classList.add(
        "hidden"
    );

}


/* =====================================================
   CARREGAR CONVERSAS
   ===================================================== */

async function carregarConversasSupabase() {

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
            (data || []).map(
                conversa => ({

                    id:
                        conversa.id,

                    title:
                        conversa.title ||
                        "Nova conversa",

                    messages:
                        Array.isArray(
                            conversa.messages
                        )
                            ? conversa.messages
                            : [],

                    created_at:
                        conversa.created_at,

                    updated_at:
                        conversa.updated_at

                })
            );


        if (
            database.conversations.length === 0
        ) {

            await criarNovaConversa(
                false
            );

        } else {

            database.currentConversation =
                database
                    .conversations[0]
                    .id;

        }


        salvarLocal();

        renderizarConversas();

        carregarConversaAtual();


    } catch (erro) {

        console.error(
            "Erro ao carregar conversas:",
            erro
        );


        renderizarConversas();

        carregarConversaAtual();

    }

}


/* =====================================================
   SALVAR CONVERSA
   ===================================================== */

async function salvarConversaSupabase(
    conversa
) {

    if (
        !currentUser ||
        !conversa
    ) {

        return;

    }


    const payload = {

        id:
            conversa.id,

        user_id:
            currentUser.id,

        title:
            conversa.title ||
            "Nova conversa",

        messages:
            conversa.messages ||
            [],

        updated_at:
            new Date().toISOString()

    };


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("conversations")
                .upsert(
                    payload,
                    {
                        onConflict: "id"
                    }
                )
                .select()
                .single();


        if (error) {
            throw error;
        }


        if (data) {

            conversa.updated_at =
                data.updated_at;

        }


        salvarLocal();


    } catch (erro) {

        console.error(
            "Erro ao salvar conversa:",
            erro
        );

        salvarLocal();

    }

}


/* =====================================================
   DELETAR CONVERSA
   ===================================================== */

async function deletarConversa(
    conversaId
) {

    if (!conversaId) {
        return;
    }


    const conversa =
        database.conversations.find(
            item =>
                item.id ===
                conversaId
        );


    if (!conversa) {
        return;
    }


    if (currentUser) {

        try {

            const {
                error
            } =
                await supabaseClient
                    .from("conversations")
                    .delete()
                    .eq(
                        "id",
                        conversaId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (error) {
                throw error;
            }


        } catch (erro) {

            console.error(
                "Erro ao excluir conversa:",
                erro
            );

            return;

        }

    }


    database.conversations =
        database.conversations.filter(
            item =>
                item.id !==
                conversaId
        );


    if (
        database.currentConversation ===
        conversaId
    ) {

        database.currentConversation =
            database.conversations.length
                ? database.conversations[0].id
                : null;

    }


    salvarLocal();

    renderizarConversas();

    carregarConversaAtual();

}


/* =====================================================
   CRIAR NOVA CONVERSA
   ===================================================== */

async function criarNovaConversa(
    salvarOnline = true
) {

    const conversa = {

        id:
            gerarId(),

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


    database.currentConversation =
        conversa.id;


    salvarLocal();

    renderizarConversas();

    carregarConversaAtual();


    if (salvarOnline) {

        await salvarConversaSupabase(
            conversa
        );

    }


    if (messageInput) {

        messageInput.focus();

    }

}


/* =====================================================
   ID
   ===================================================== */

function gerarId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {

        return window.crypto.randomUUID();

    }


    return (
        "veyra-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}


/* =====================================================
   CONVERSA ATUAL
   ===================================================== */

function obterConversaAtual() {

    if (
        !database.currentConversation
    ) {

        return null;

    }


    return database.conversations.find(

        conversa =>
            conversa.id ===
            database.currentConversation

    ) || null;

}


/* =====================================================
   RENDERIZAR SIDEBAR
   ===================================================== */

function renderizarConversas() {

    if (!conversationList) {
        return;
    }


    conversationList.innerHTML = "";


    database.conversations.forEach(
        conversa => {

            const item =
                document.createElement(
                    "button"
                );


            item.className =
                "conversation-item";


            if (
                conversa.id ===
                database.currentConversation
            ) {

                item.classList.add(
                    "active"
                );

            }


            const titulo =
                document.createElement(
                    "span"
                );


            titulo.textContent =
                conversa.title ||
                "Nova conversa";


            item.appendChild(
                titulo
            );


            item.addEventListener(
                "click",
                () => {

                    database.currentConversation =
                        conversa.id;

                    salvarLocal();

                    renderizarConversas();

                    carregarConversaAtual();

                }
            );


            conversationList.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   CARREGAR CONVERSA
   ===================================================== */

function carregarConversaAtual() {

    if (!chat) {
        return;
    }


    const conversa =
        obterConversaAtual();


    if (!conversa) {

        showWelcome();

        return;

    }


    chat.innerHTML = "";


    if (
        !conversa.messages ||
        conversa.messages.length === 0
    ) {

        showWelcome();

        return;

    }


    conversa.messages.forEach(
        mensagem => {

            addMessage(
                mensagem.role,
                mensagem.content,
                false,
                mensagem.image || null
            );

        }
    );


    scrollChat();

}


/* =====================================================
   WELCOME
   ===================================================== */

function showWelcome() {

    if (!chat) {
        return;
    }


    chat.innerHTML = `

        <div class="welcome">

            <div class="welcome-icon">
                V
            </div>

            <h2>
                Olá, eu sou a Veyra.
            </h2>

            <p>
                Uma IA criada para ajudar você
                de forma simples, rápida e prática.
            </p>

            <div class="suggestions">

                <button
                    class="suggestion"
                    data-prompt="Explique um assunto difícil de maneira simples.">

                    Explique algo difícil de maneira simples

                </button>

                <button
                    class="suggestion"
                    data-prompt="Me ajude a criar um projeto.">

                    Me ajude a criar um projeto

                </button>

                <button
                    class="suggestion"
                    data-prompt="Me ensine alguma coisa interessante.">

                    Me ensine alguma coisa interessante

                </button>

                <button
                    class="suggestion"
                    data-prompt="Me ajude a resolver um problema.">

                    Me ajude a resolver um problema

                </button>

            </div>

        </div>

    `;


    document
        .querySelectorAll(
            ".suggestion"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        if (messageInput) {

                            messageInput.value =
                                botao.dataset.prompt;

                            ajustarTextarea();

                            messageInput.focus();

                        }

                    }
                );

            }
        );

}


/* =====================================================
   ADICIONAR MENSAGEM
   ===================================================== */

function addMessage(
    role,
    content,
    scroll = true,
    image = null
) {

    if (!chat) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message " +
        (
            role === "user"
                ? "user"
                : "assistant"
        );


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    if (image) {

        const img =
            document.createElement(
                "img"
            );


        img.src = image;

        img.className =
            "message-image";


        bubble.appendChild(
            img
        );

    }


    if (content) {

        const texto =
            document.createElement(
                "div"
            );


        texto.innerHTML =
            formatarResposta(
                content
            );


        bubble.appendChild(
            texto
        );

    }


    message.appendChild(
        bubble
    );


    chat.appendChild(
        message
    );


    if (scroll) {

        scrollChat();

    }

}


/* =====================================================
   FORMATAR RESPOSTA
   ===================================================== */

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;

}


function formatarResposta(texto) {

    if (!texto) {
        return "";
    }


    let seguro =
        escaparHTML(
            String(texto)
        );


    const blocosCodigo = [];


    seguro =
        seguro.replace(
            /```([\s\S]*?)```/g,
            (
                match,
                codigo
            ) => {

                const indice =
                    blocosCodigo.length;


                blocosCodigo.push(
                    codigo.trim()
                );


                return (
                    "___VEYRA_CODE_" +
                    indice +
                    "___"
                );

            }
        );


    seguro =
        seguro.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    seguro =
        seguro.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    seguro =
        seguro.replace(
            /\n/g,
            "<br>"
        );


    blocosCodigo.forEach(
        (
            codigo,
            indice
        ) => {

            const placeholder =
                "___VEYRA_CODE_" +
                indice +
                "___";


            const bloco =
                `
                <pre><code>${codigo}</code></pre>
                `;


            seguro =
                seguro.replace(
                    placeholder,
                    bloco
                );

        }
    );


    return seguro;

}


/* =====================================================
   THINKING
   ===================================================== */

function showThinking() {

    removeThinking();


    if (!chat) {
        return;
    }


    const thinking =
        document.createElement(
            "div"
        );


    thinking.id =
        "veyra-thinking";


    thinking.className =
        "thinking";


    thinking.innerHTML = `

        <span></span>
        <span></span>
        <span></span>

    `;


    chat.appendChild(
        thinking
    );


    scrollChat();

}


function hideThinking() {

    removeThinking();

}


function removeThinking() {

    const thinking =
        document.getElementById(
            "veyra-thinking"
        );


    if (thinking) {

        thinking.remove();

    }

}


/* =====================================================
   SCROLL
   ===================================================== */

function scrollChat() {

    if (!chat) {
        return;
    }


    requestAnimationFrame(
        () => {

            chat.scrollTop =
                chat.scrollHeight;

        }
    );

}


/* =====================================================
   OPENROUTER
   ===================================================== */

async function perguntarIA(
    texto,
    imagemBase64,
    historico
) {

    let apiKey =
        localStorage.getItem(
            "veyra_openrouter_key"
        );


    if (!apiKey) {

        apiKey =
            OPENROUTER_API_KEY;

    }


    if (!apiKey) {

        throw new Error(
            "A chave da OpenRouter ainda não foi configurada."
        );

    }


    const mensagens = [];


    mensagens.push({

        role: "system",

        content:
            Veyra.personality

    });


    const historicoLimitado =
        Array.isArray(historico)
            ? historico.slice(-8)
            : [];


    for (
        const mensagem
        of historicoLimitado
    ) {

        if (
            mensagem.role !== "user" &&
            mensagem.role !== "assistant"
        ) {

            continue;

        }


        if (
            mensagem.role === "user" &&
            mensagem.image
        ) {

            mensagens.push({

                role: "user",

                content: [

                    {

                        type: "text",

                        text:
                            mensagem.content ||
                            "Analise esta imagem."

                    },

                    {

                        type: "image_url",

                        image_url: {

                            url:
                                mensagem.image

                        }

                    }

                ]

            });

        } else {

            mensagens.push({

                role:
                    mensagem.role,

                content:
                    mensagem.content ||
                    ""

            });

        }

    }


    if (imagemBase64) {

        const ultima =
            mensagens[
                mensagens.length - 1
            ];


        if (
            ultima &&
            ultima.role === "user"
        ) {

            ultima.content = [

                {

                    type: "text",

                    text:
                        texto ||
                        "Analise esta imagem."

                },

                {

                    type: "image_url",

                    image_url: {

                        url:
                            imagemBase64

                    }

                }

            ];

        }

    }


    const resposta =
        await fetch(
            Veyra.apiURL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        apiKey

                },

                body:
                    JSON.stringify({

                        model:
                            Veyra.model,

                        messages:
                            mensagens,

                        temperature:
                            0.7,

                        max_tokens:
                            800

                    })

            }
        );


    let dados = null;


    try {

        dados =
            await resposta.json();

    } catch {

        throw new Error(
            "A API retornou uma resposta inválida."
        );

    }


    if (!resposta.ok) {

        throw new Error(

            dados?.error?.message ||

            "Erro na API da OpenRouter."

        );

    }


    const conteudo =
        dados?.choices?.[0]?.message?.content;


    if (
        typeof conteudo === "string" &&
        conteudo.trim()
    ) {

        return conteudo.trim();

    }


    throw new Error(
        "A Veyra não recebeu uma resposta válida."
    );

}


/* =====================================================
   ENVIO
   ===================================================== */

async function enviarMensagem() {

    if (isSending) {
        return;
    }


    const texto =
        messageInput?.value.trim() || "";


    if (
        !texto &&
        !selectedImage
    ) {

        return;

    }


    if (!currentUser) {

        setAuthError(
            "Faça login para usar a Veyra."
        );

        showAuth();

        return;

    }


    let conversa =
        obterConversaAtual();


    if (!conversa) {

        await criarNovaConversa();

        conversa =
            obterConversaAtual();

    }


    if (!conversa) {
        return;
    }


    isSending = true;


    if (sendButton) {

        sendButton.disabled = true;

    }


    const imagem =
        selectedImage;


    const mensagemTexto =
        texto ||
        "Analise esta imagem.";


    if (
        conversa.messages.length === 0
    ) {

        conversa.title =
            criarTitulo(
                mensagemTexto
            );

    }


    conversa.messages.push({

        role: "user",

        content:
            mensagemTexto,

        image:
            imagem || null,

        created_at:
            new Date().toISOString()

    });


    addMessage(
        "user",
        mensagemTexto,
        true,
        imagem
    );


    if (messageInput) {

        messageInput.value = "";

    }


    ajustarTextarea();

    limparImagem();

    salvarLocal();


    await salvarConversaSupabase(
        conversa
    );


    showThinking();


    try {

        const resposta =
            await perguntarIA(
                mensagemTexto,
                imagem,
                conversa.messages
            );


        hideThinking();


        conversa.messages.push({

            role:
                "assistant",

            content:
                resposta,

            created_at:
                new Date().toISOString()

        });


        addMessage(
            "assistant",
            resposta,
            true
        );


        conversa.updated_at =
            new Date().toISOString();


        salvarLocal();


        await salvarConversaSupabase(
            conversa
        );


        renderizarConversas();


    } catch (erro) {

        hideThinking();


        console.error(
            "Erro Veyra:",
            erro
        );


        const mensagemErro =
            `
Não consegui responder agora.

${traduzirErroIA(erro)}
            `.trim();


        addMessage(
            "assistant",
            mensagemErro,
            true
        );

    } finally {

        isSending = false;


        if (sendButton) {

            sendButton.disabled =
                false;

        }


        if (messageInput) {

            messageInput.focus();

        }

    }

}


/* =====================================================
   TÍTULO
   ===================================================== */

function criarTitulo(texto) {

    const limpo =
        String(texto)
            .replace(/\s+/g, " ")
            .trim();


    if (!limpo) {

        return "Nova conversa";

    }


    if (limpo.length <= 34) {

        return limpo;

    }


    return (
        limpo.slice(0, 34) +
        "..."
    );

}


/* =====================================================
   ERROS IA
   ===================================================== */

function traduzirErroIA(erro) {

    const mensagem =
        String(
            erro?.message || ""
        );


    if (
        mensagem.includes(
            "chave da OpenRouter"
        )
    ) {

        return mensagem;

    }


    if (
        mensagem.includes("401")
    ) {

        return "A chave da OpenRouter parece inválida.";

    }


    if (
        mensagem.includes("402")
    ) {

        return "A OpenRouter informou que não há créditos suficientes para essa solicitação.";

    }


    if (
        mensagem.includes("429")
    ) {

        return "A API está temporariamente limitada. Aguarde um pouco e tente novamente.";

    }


    return (
        mensagem ||
        "Ocorreu um erro desconhecido."
    );

}


/* =====================================================
   IMAGEM
   ===================================================== */

function prepararImagem(file) {

    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Escolha um arquivo de imagem."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        event => {

            selectedImage =
                event.target.result;


            if (previewImage) {

                previewImage.src =
                    selectedImage;

            }


            if (imagePreview) {

                imagePreview.classList.remove(
                    "hidden"
                );

            }

        };


    reader.readAsDataURL(
        file
    );

}


function limparImagem() {

    selectedImage =
        null;


    if (imageInput) {

        imageInput.value =
            "";

    }


    if (previewImage) {

        previewImage.src =
            "";

    }


    if (imagePreview) {

        imagePreview.classList.add(
            "hidden"
        );

    }

}


/* =====================================================
   TEXTAREA
   ===================================================== */

function ajustarTextarea() {

    if (!messageInput) {
        return;
    }


    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            150
        ) + "px";

}


/* =====================================================
   CONFIGURAÇÕES
   ===================================================== */

function abrirConfiguracoes() {

    const atual =
        localStorage.getItem(
            "veyra_openrouter_key"
        ) || "";


    const opcao =
        prompt(

            "CONFIGURAÇÕES DA VEYRA\n\n" +

            "1 - Configurar chave da OpenRouter\n" +

            "2 - Sair da conta\n\n" +

            "Digite 1 ou 2:",

            "1"

        );


    if (opcao === null) {
        return;
    }


    if (
        opcao.trim() === "2"
    ) {

        const confirmar =
            confirm(

                "Deseja realmente sair da sua conta?\n\n" +

                "Suas conversas continuarão salvas na sua conta."

            );


        if (confirmar) {

            signOut();

        }


        return;

    }


    if (
        opcao.trim() !== "1"
    ) {

        alert(
            "Opção inválida."
        );

        return;

    }


    const novaChave =
        prompt(

            "Cole sua chave da OpenRouter:",

            atual

        );


    if (
        novaChave === null
    ) {

        return;

    }


    const chave =
        novaChave.trim();


    if (!chave) {

        localStorage.removeItem(
            "veyra_openrouter_key"
        );


        alert(
            "Chave da OpenRouter removida."
        );


        return;

    }


    localStorage.setItem(
        "veyra_openrouter_key",
        chave
    );


    alert(
        "Chave da OpenRouter salva neste navegador."
    );

}


/* =====================================================
   SOBRE
   ===================================================== */

function abrirSobre() {

    alert(

        "Veyra IA\n\n" +

        "Versão " +

        Veyra.version +

        "\n\n" +

        "Assistente de inteligência artificial."

    );

}


/* =====================================================
   STATUS
   ===================================================== */

function atualizarStatus() {

    if (statusText) {

        statusText.textContent =
            currentUser
                ? "Online"
                : "Offline";

    }


    if (statusDot) {

        statusDot.classList.toggle(
            "offline",
            !currentUser
        );

    }


    if (modelStatus) {

        modelStatus.textContent =
            Veyra.model;

    }

}


/* =====================================================
   INICIAR APLICAÇÃO
   ===================================================== */

async function iniciarAplicacao(
    user
) {

    currentUser =
        user;


    showApp();

    atualizarStatus();

    atualizarPerfil();


    await carregarConversasSupabase();


    if (messageInput) {

        messageInput.focus();

    }

}


/* =====================================================
   EVENTOS AUTH
   ===================================================== */

if (authButton) {

    authButton.addEventListener(
        "click",
        () => {

            if (
                authMode ===
                "signup"
            ) {

                signUp();

            } else {

                signIn();

            }

        }
    );

}


if (authToggle) {

    authToggle.addEventListener(
        "click",
        () => {

            setAuthMode(

                authMode ===
                    "login"
                    ? "signup"
                    : "login"

            );

        }
    );

}


/* =====================================================
   ENTER LOGIN
   ===================================================== */

[
    authEmail,
    authPassword,
    authName
].forEach(
    campo => {

        if (!campo) {
            return;
        }


        campo.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();


                    if (
                        authMode ===
                        "signup"
                    ) {

                        signUp();

                    } else {

                        signIn();

                    }

                }

            }
        );

    }
);


/* =====================================================
   NOVA CONVERSA
   ===================================================== */

if (newChat) {

    newChat.addEventListener(
        "click",
        () => {

            criarNovaConversa();

        }
    );

}


/* =====================================================
   ENVIAR
   ===================================================== */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        enviarMensagem
    );

}


if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                    "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                enviarMensagem();

            }

        }
    );


    messageInput.addEventListener(
        "input",
        ajustarTextarea
    );

}


/* =====================================================
   IMAGEM
   ===================================================== */

if (imageButton) {

    imageButton.addEventListener(
        "click",
        () => {

            imageInput?.click();

        }
    );

}


if (imageInput) {

    imageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            prepararImagem(
                file
            );

        }
    );

}


if (removeImage) {

    removeImage.addEventListener(
        "click",
        limparImagem
    );

}


/* =====================================================
   CONFIGURAÇÕES
   ===================================================== */

if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        abrirConfiguracoes
    );

}


if (aboutBtn) {

    aboutBtn.addEventListener(
        "click",
        abrirSobre
    );

}


/* =====================================================
   PERFIL
   ===================================================== */

if (userProfileButton) {

    userProfileButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            alternarMenuPerfil();

        }
    );

}


if (profileSettings) {

    profileSettings.addEventListener(
        "click",
        () => {

            fecharMenuPerfil();

            abrirConfiguracoes();

        }
    );

}


if (profileLogout) {

    profileLogout.addEventListener(
        "click",
        () => {

            fecharMenuPerfil();


            const confirmar =
                confirm(

                    "Deseja realmente sair da sua conta?\n\n" +

                    "Suas conversas continuarão salvas."

                );


            if (confirmar) {

                signOut();

            }

        }
    );

}


document.addEventListener(
    "click",
    event => {

        if (
            userProfile &&
            !userProfile.contains(
                event.target
            )
        ) {

            fecharMenuPerfil();

        }

    }
);


/* =====================================================
   SUPABASE AUTH STATE
   ===================================================== */

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        if (
            event ===
                "SIGNED_IN" &&
            session?.user
        ) {

            currentUser =
                session.user;


            showApp();

            atualizarStatus();

            atualizarPerfil();

        }


        if (
            event ===
            "SIGNED_OUT"
        ) {

            currentUser =
                null;


            database = {

                conversations: [],

                currentConversation:
                    null

            };


            selectedImage = null;

            isSending = false;


            showAuth();

            limparPerfilVisual();

            atualizarStatus();

        }

    }
);


/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

async function iniciarVeyra() {

    carregarLocal();


    showAuth();


    setAuthMode(
        "login"
    );


    if (
        !SUPABASE_PUBLISHABLE_KEY ||
        SUPABASE_PUBLISHABLE_KEY ===
            "COLE_SUA_PUBLISHABLE_KEY_AQUI"
    ) {

        console.error(
            "Configure a Publishable Key do Supabase."
        );


        setAuthError(
            "Configure a Publishable Key do Supabase no script.js."
        );


        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {
            throw error;
        }


        if (
            data?.session?.user
        ) {

            await iniciarAplicacao(
                data.session.user
            );

        } else {

            showAuth();

        }


    } catch (erro) {

        console.error(
            "Erro ao iniciar Veyra:",
            erro
        );


        showAuth();


        setAuthError(
            "Não foi possível conectar ao sistema de contas."
        );

    }

}


/* =====================================================
   START
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarVeyra
);