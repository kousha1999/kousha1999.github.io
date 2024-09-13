(() => {
  // <stdin>
  (function() {
    const copyIcon = document.getElementById("code-copy").innerHTML;
    const copyIconDone = document.getElementById("code-copy-done").innerHTML;
    function createCopyButton(highlightDiv) {
      const button = document.createElement("button");
      button.className = "right-1 top-1 absolute";
      button.type = "button";
      button.innerHTML = copyIcon;
      button.addEventListener("click", () => copyCodeToClipboard(button, highlightDiv));
      highlightDiv.insertBefore(button, highlightDiv.firstChild);
    }
    document.querySelectorAll(".highlight").forEach((highlightDiv) => createCopyButton(highlightDiv));
    async function copyCodeToClipboard(button, highlightDiv) {
      let codeToCopy = highlightDiv.querySelector("code").textContent;
      if (highlightDiv.querySelector("table")) {
        codeToCopy = highlightDiv.querySelector("td:last-child code").textContent;
      }
      let permissionGranted = true;
      try {
        var result = await navigator.permissions.query({ name: "clipboard-write" });
        if (result.state != "granted" && result.state != "prompt") {
          permissionGranted = false;
        }
      } catch (_) {
      }
      try {
        if (permissionGranted) {
          await navigator.clipboard.writeText(codeToCopy);
        } else {
          copyCodeBlockExecCommand(codeToCopy, highlightDiv);
        }
      } catch (_) {
        copyCodeBlockExecCommand(codeToCopy, highlightDiv);
      } finally {
        button.blur();
        button.innerHTML = copyIconDone;
        setTimeout(function() {
          button.innerHTML = copyIcon;
        }, 2e3);
      }
    }
    function copyCodeBlockExecCommand(codeToCopy, highlightDiv) {
      const textArea = document.createElement("textArea");
      textArea.contentEditable = "true";
      textArea.readOnly = "false";
      textArea.className = "copyable-text-area";
      textArea.value = codeToCopy;
      highlightDiv.insertBefore(textArea, highlightDiv.firstChild);
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      textArea.setSelectionRange(0, 999999);
      document.execCommand("copy");
      highlightDiv.removeChild(textArea);
    }
  })();
})();
