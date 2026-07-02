const form = document.querySelector("#applyForm");
const message = document.querySelector("#formMessage");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "お申し込みありがとうございます。ごはん便りキットをお届けします。";
  form.reset();
});
