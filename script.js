const form = document.querySelector("#applyForm");
const message = document.querySelector("#formMessage");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name")?.trim() || "未入力";
  const email = formData.get("email")?.trim() || "未入力";
  const person = formData.get("person")?.trim() || "未入力";
  const subject = "ワークシート取り寄せ希望";
  const body = [
    "ワークシートの取り寄せを希望します。",
    "",
    `お名前: ${name}`,
    `メールアドレス: ${email}`,
    `聞きたい相手: ${person}`,
  ].join("\n");

  window.location.href = `mailto:peacenana@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  message.textContent = "メール作成画面を開きました。内容を確認して送信してください。";
});
