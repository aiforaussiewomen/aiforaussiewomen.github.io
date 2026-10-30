// AI for Aussie Women - Gemma chat widget.
// Dormant until window.AFW_CONFIG.CHAT_URL is set in site-config.js.
(function () {
  var cfg = window.AFW_CONFIG || {};
  if (!cfg.CHAT_URL || location.protocol !== "https:") return;

  var hist = [];
  var css = document.createElement("style");
  css.textContent =
    ".afw-chat-launcher{position:fixed;right:18px;bottom:18px;width:54px;height:54px;border-radius:50%;background:#CC007E;color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);z-index:9998}" +
    ".afw-chat-panel{position:fixed;right:18px;bottom:84px;width:320px;max-width:calc(100vw - 36px);height:440px;max-height:calc(100vh - 120px);background:#fff;border:1px solid #D7E3EE;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.18);display:flex;flex-direction:column;z-index:9999;overflow:hidden;font-family:Georgia,'Times New Roman',serif}" +
    ".afw-chat-panel[hidden]{display:none}" +
    ".afw-chat-head{background:#123F6B;color:#fff;padding:12px 16px;font-size:.95rem}" +
    ".afw-chat-head small{display:block;color:#E9F0F7;font-size:.75rem;margin-top:2px}" +
    ".afw-chat-msgs{flex:1;overflow-y:auto;padding:12px;background:#E9F0F7}" +
    ".afw-msg{max-width:85%;padding:8px 11px;border-radius:10px;margin-bottom:8px;font-size:.85rem;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}" +
    ".afw-msg.user{background:#CC007E;color:#fff;margin-left:auto}" +
    ".afw-msg.bot{background:#fff;color:#123F6B;border:1px solid #D7E3EE}" +
    ".afw-chat-row{display:flex;border-top:1px solid #D7E3EE;background:#fff}" +
    ".afw-chat-row input{flex:1;border:none;padding:12px;font-size:.9rem;font-family:inherit;outline:none;min-width:0}" +
    ".afw-chat-row button{border:none;background:#CC007E;color:#fff;padding:0 16px;cursor:pointer;font-size:.9rem;font-weight:bold}";
  document.head.appendChild(css);

  var launcher = document.createElement("button");
  launcher.className = "afw-chat-launcher";
  launcher.textContent = "\uD83D\uDCAC";
  launcher.setAttribute("aria-label", "Open chat");

  var panel = document.createElement("div");
  panel.className = "afw-chat-panel";
  panel.hidden = true;
  panel.innerHTML =
    '<div class="afw-chat-head">Ask a quick question<small>Honest answers - no jargon</small></div>' +
    '<div class="afw-chat-msgs" id="afw-msgs"></div>' +
    '<div class="afw-chat-row"><input id="afw-in" type="text" placeholder="Type your question..." maxlength="600"><button id="afw-send">Send</button></div>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var msgs = panel.querySelector("#afw-msgs"),
      input = panel.querySelector("#afw-in"),
      sendBtn = panel.querySelector("#afw-send");

  function bubble(role, text) {
    var d = document.createElement("div");
    d.className = "afw-msg " + (role === "user" ? "user" : "bot");
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  launcher.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      if (!msgs.children.length)
        bubble("bot", "Hi! Ask me anything about starting or running a small Australian business, or using AI. For the full free pack, use the form on this page.");
      input.focus();
    }
  });

  function send() {
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    bubble("user", text);
    hist.push({ role: "user", content: text });
    var t = bubble("bot", "...thinking");
    fetch(cfg.CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: hist.slice(-8) })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var reply = (d && d.reply) ? d.reply
          : "Sorry - something went wrong on my end. Try again in a moment.";
        t.textContent = reply;
        hist.push({ role: "assistant", content: reply });
      })
      .catch(function () {
        t.textContent = "Sorry - I can't reach my brain right now. Try again in a moment.";
      });
  }
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
})();
