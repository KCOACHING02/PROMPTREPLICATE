/* ========================================
   AIDA Story Generator - Brille & Vibre
   Powered by Claude AI
   ======================================== */

// ---- State ----
let currentStep = 1;
const totalSteps = 6;

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
    // Load saved API key
    const savedKey = localStorage.getItem("aida_api_key");
    if (savedKey) {
        document.getElementById("apiKey").value = savedKey;
    }

    // Option click handlers
    document.querySelectorAll(".options").forEach(group => {
        const isSingle = group.classList.contains("single-select");
        group.querySelectorAll(".option").forEach(opt => {
            opt.addEventListener("click", () => {
                if (isSingle) {
                    group.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
                }
                opt.classList.toggle("selected");
            });
        });
    });

    updateProgress();
});

// ---- Navigation ----
function updateProgress() {
    const bar = document.getElementById("progressBar");
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    bar.style.width = percent + "%";

    document.querySelectorAll(".progress-label").forEach(label => {
        const step = parseInt(label.dataset.step);
        label.classList.remove("active", "completed");
        if (step === currentStep) label.classList.add("active");
        else if (step < currentStep) label.classList.add("completed");
    });
}

function showStep(step) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    const target = document.querySelector('.step[data-step="' + step + '"]');
    if (target) target.classList.add("active");
    updateProgress();

    // Build summary on last step
    if (step === totalSteps) {
        buildSummary();
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// ---- Helpers ----
function getSelectedText(category, joinWith) {
    if (joinWith === undefined) joinWith = ", ";
    var group = document.querySelector('.options[data-category="' + category + '"]');
    if (!group) return "";
    var items = group.querySelectorAll(".selected");
    var result = [];
    for (var i = 0; i < items.length; i++) {
        var text = items[i].querySelector(".option-title");
        result.push(text ? text.textContent.trim() : items[i].textContent.trim());
    }
    return result.join(joinWith);
}

function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function toggleApiKey() {
    const input = document.getElementById("apiKey");
    input.type = input.type === "password" ? "text" : "password";
}

// ---- Summary ----
function buildSummary() {
    const items = [
        { label: "Produit", value: getInputValue("productName") || "Non defini" },
        { label: "Categorie", value: getSelectedText("productCategory") || "Non definie" },
        { label: "Audience", value: getInputValue("targetAudience") || "Non definie" },
        { label: "Probleme", value: getSelectedText("painPoint") || "Non defini" },
        { label: "Desir", value: getSelectedText("desire") || "Non defini" },
        { label: "Plateforme", value: getSelectedText("platform") || "Non definie" },
        { label: "Slides", value: getSelectedText("slideCount") || "5 slides" },
        { label: "Ton", value: getSelectedText("tone") || "Non defini" },
        { label: "Storytelling", value: getSelectedText("storytelling") || "Non defini" },
        { label: "Langue", value: getSelectedText("language") || "Francais" },
        { label: "Objectif", value: getSelectedText("objective") || "Non defini" },
        { label: "CTA", value: getSelectedText("cta") || getInputValue("ctaCustom") || "Non defini" }
    ];

    const container = document.getElementById("summaryContent");
    container.innerHTML = items.map(function(item) {
        return '<div class="summary-item">' +
            '<span class="summary-label">' + item.label + '</span>' +
            '<span class="summary-value">' + item.value + '</span>' +
            '</div>';
    }).join("");
}

// ---- Claude API ----
function getModelId() {
    const selected = getSelectedText("model");
    if (selected.indexOf("Haiku") !== -1) return "claude-haiku-4-5-20251001";
    if (selected.indexOf("Opus") !== -1) return "claude-opus-4-6";
    return "claude-sonnet-4-6";
}

function buildPrompt() {
    const productName = getInputValue("productName");
    const productDesc = getInputValue("productDesc");
    const productPrice = getInputValue("productPrice");
    const productCategory = getSelectedText("productCategory");
    const targetAudience = getInputValue("targetAudience");
    const painPoint = getSelectedText("painPoint");
    const desire = getSelectedText("desire");
    const platform = getSelectedText("platform");
    const slideCount = getSelectedText("slideCount") || "5 slides";
    const tone = getSelectedText("tone");
    const storytelling = getSelectedText("storytelling");
    const language = getSelectedText("language") || "Francais";
    const objective = getSelectedText("objective");
    const cta = getSelectedText("cta") || getInputValue("ctaCustom");

    return "Tu es un expert en copywriting, psychologie de la vente et marketing digital. " +
        "Tu maitrises parfaitement la methode AIDA (Attention, Interet, Desir, Action).\n\n" +
        "Genere une story complete en utilisant la methode AIDA pour promouvoir le produit/service suivant.\n\n" +
        "=== BRIEFING ===\n" +
        "Produit/Service : " + (productName || "Non precise") + "\n" +
        "Description : " + (productDesc || "Non precise") + "\n" +
        "Prix : " + (productPrice || "Non precise") + "\n" +
        "Categorie : " + (productCategory || "Non precise") + "\n" +
        "Audience cible : " + (targetAudience || "Non precise") + "\n" +
        "Probleme principal : " + (painPoint || "Non precise") + "\n" +
        "Desir profond : " + (desire || "Non precise") + "\n" +
        "Plateforme : " + (platform || "Non precise") + "\n" +
        "Nombre de slides/sections : " + slideCount + "\n" +
        "Ton de voix : " + (tone || "Non precise") + "\n" +
        "Style de storytelling : " + (storytelling || "Non precise") + "\n" +
        "Langue : " + language + "\n" +
        "Objectif : " + (objective || "Non precise") + "\n" +
        "Call-to-Action : " + (cta || "Non precise") + "\n\n" +
        "=== FORMAT DE REPONSE ===\n" +
        "Reponds EXACTEMENT dans ce format avec ces marqueurs :\n\n" +
        "[STRATEGY_START]\n" +
        "Explique brievement la strategie AIDA choisie, pourquoi elle fonctionne pour cette cible, " +
        "et les leviers psychologiques utilises.\n" +
        "[STRATEGY_END]\n\n" +
        "[ATTENTION_START]\n" +
        "Contenu de la/des slide(s) Attention : hook puissant, phrase d'accroche qui arrete le scroll. " +
        "Indique le texte exact pour chaque slide avec [SLIDE X] devant.\n" +
        "[ATTENTION_END]\n\n" +
        "[INTEREST_START]\n" +
        "Contenu de la/des slide(s) Interet : developpe la curiosite, presente le probleme, " +
        "cree une connexion emotionnelle. Indique le texte exact pour chaque slide avec [SLIDE X] devant.\n" +
        "[INTEREST_END]\n\n" +
        "[DESIRE_START]\n" +
        "Contenu de la/des slide(s) Desir : montre la transformation, les benefices, la preuve sociale, " +
        "cree l'envie irrésistible. Indique le texte exact pour chaque slide avec [SLIDE X] devant.\n" +
        "[DESIRE_END]\n\n" +
        "[ACTION_START]\n" +
        "Contenu de la/des slide(s) Action : CTA clair et urgent, instruction precise, " +
        "derniere poussee emotionnelle. Indique le texte exact pour chaque slide avec [SLIDE X] devant.\n" +
        "[ACTION_END]\n\n" +
        "IMPORTANT : \n" +
        "- Adapte le format, la longueur et le style a la plateforme " + (platform || "") + "\n" +
        "- Utilise le ton " + (tone || "inspire") + "\n" +
        "- Ecris dans la langue : " + language + "\n" +
        "- Chaque slide doit etre percutante et autonome\n" +
        "- Utilise des emojis si pertinent pour la plateforme\n" +
        "- Les textes doivent etre prets a copier-coller";
}

async function callClaudeAPI(apiKey, prompt, model) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
            model: model,
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(function() { return {}; });
        throw new Error(err.error?.message || "Erreur API (" + response.status + ")");
    }

    const data = await response.json();
    return data.content[0].text;
}

// ---- Parse Response ----
function parseAIDAResponse(text) {
    function extract(start, end) {
        var i = text.indexOf(start);
        var j = text.indexOf(end);
        if (i === -1 || j === -1) return "";
        return text.substring(i + start.length, j).trim();
    }

    return {
        strategy: extract("[STRATEGY_START]", "[STRATEGY_END]"),
        attention: extract("[ATTENTION_START]", "[ATTENTION_END]"),
        interest: extract("[INTEREST_START]", "[INTEREST_END]"),
        desire: extract("[DESIRE_START]", "[DESIRE_END]"),
        action: extract("[ACTION_START]", "[ACTION_END]")
    };
}

// ---- Render Result ----
function renderResult(parsed) {
    var sections = [
        { key: "attention", label: "Attention", badge: "attention", icon: "A" },
        { key: "interest", label: "Interet", badge: "interest", icon: "I" },
        { key: "desire", label: "Desir", badge: "desire", icon: "D" },
        { key: "action", label: "Action", badge: "action", icon: "A" },
        { key: "strategy", label: "Strategie", badge: "strategy", icon: "S" }
    ];

    var html = "";
    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        var content = parsed[s.key] || "Contenu non genere";
        // Convert line breaks for display
        content = content.replace(/\n/g, "<br>");
        html += '<div class="aida-section visible" data-section="' + s.key + '">' +
            '<div class="aida-section-title">' +
            '<span class="aida-badge ' + s.badge + '">' + s.icon + '</span> ' +
            s.label +
            '</div>' +
            '<div>' + content + '</div>' +
            '</div>';
    }

    document.getElementById("resultContent").innerHTML = html;
}

// ---- Tab Navigation ----
function showTab(tab) {
    // Update tab buttons
    document.querySelectorAll(".aida-tab").forEach(function(t) { t.classList.remove("active"); });
    document.querySelector('.aida-tab[data-tab="' + tab + '"]').classList.add("active");

    // Show/hide sections
    document.querySelectorAll(".aida-section").forEach(function(s) {
        if (tab === "full") {
            s.classList.add("visible");
        } else {
            s.classList.toggle("visible", s.dataset.section === tab);
        }
    });
}

// ---- Generate ----
async function generateAIDA() {
    const apiKey = getInputValue("apiKey");
    if (!apiKey) {
        showToast("Veuillez entrer votre cle API Anthropic");
        return;
    }

    // Save API key
    localStorage.setItem("aida_api_key", apiKey);

    const btn = document.getElementById("generateBtn");
    btn.disabled = true;
    btn.textContent = "Generation en cours...";

    // Show result section with loading
    const resultSection = document.getElementById("resultSection");
    resultSection.style.display = "block";
    document.getElementById("loadingIndicator").style.display = "block";
    document.getElementById("aidaTabs").style.display = "none";
    document.getElementById("resultContent").innerHTML = "";

    resultSection.scrollIntoView({ behavior: "smooth" });

    try {
        const prompt = buildPrompt();
        const model = getModelId();
        const response = await callClaudeAPI(apiKey, prompt, model);

        // Parse and render
        const parsed = parseAIDAResponse(response);

        // Store raw response for copy
        resultSection.dataset.rawResponse = response;

        renderResult(parsed);

        document.getElementById("loadingIndicator").style.display = "none";
        document.getElementById("aidaTabs").style.display = "flex";

        showToast("Story AIDA generee avec succes !");
    } catch (err) {
        document.getElementById("loadingIndicator").style.display = "none";
        document.getElementById("resultContent").innerHTML =
            '<div style="color: var(--attention); padding: 20px; text-align: center;">' +
            '<p style="font-weight: 700; font-size: 16px;">Erreur de generation</p>' +
            '<p style="margin-top: 8px;">' + escapeHtml(err.message) + '</p>' +
            '<p style="margin-top: 12px; font-size: 13px; color: var(--brown-light);">' +
            'Verifiez votre cle API et reessayez.</p></div>';
    }

    btn.disabled = false;
    btn.textContent = "Generer ma Story AIDA";
}

function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ---- Actions ----
function copyResult() {
    const sections = document.querySelectorAll(".aida-section");
    var text = "";
    for (var i = 0; i < sections.length; i++) {
        text += sections[i].textContent.trim() + "\n\n";
    }

    navigator.clipboard.writeText(text.trim()).then(function() {
        showToast("Contenu copie !");
    }).catch(function() {
        // Fallback
        var ta = document.createElement("textarea");
        ta.value = text.trim();
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("Contenu copie !");
    });
}

function regenerate() {
    generateAIDA();
}

function resetAll() {
    // Reset form
    document.querySelectorAll(".option.selected").forEach(function(o) {
        o.classList.remove("selected");
    });
    document.querySelectorAll("input[type='text'], input[type='password'], textarea").forEach(function(el) {
        if (el.id !== "apiKey") el.value = "";
    });

    // Re-select defaults
    var defaultSlide = document.querySelector('.options[data-category="slideCount"] .option:nth-child(2)');
    if (defaultSlide) defaultSlide.classList.add("selected");
    var defaultLang = document.querySelector('.options[data-category="language"] .option:first-child');
    if (defaultLang) defaultLang.classList.add("selected");
    var defaultModel = document.querySelector('.options[data-category="model"] .option:first-child');
    if (defaultModel) defaultModel.classList.add("selected");

    // Hide results
    document.getElementById("resultSection").style.display = "none";

    // Go to step 1
    currentStep = 1;
    showStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---- Toast ----
function showToast(message) {
    var existing = document.querySelector(".toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() { toast.classList.add("show"); }, 10);
    setTimeout(function() {
        toast.classList.remove("show");
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}
