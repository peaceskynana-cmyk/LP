const form = document.querySelector("#applyForm");
const message = document.querySelector("#formMessage");
const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScPOhPdd1bEUc8iZ6cWHWALOU7xBvp1wAV-m4G3VesEJ8T2mA/viewform?usp=publish-editor";

form.addEventListener("submit", (event) => {
  event.preventDefault();

  window.open(googleFormUrl, "_blank", "noopener");
  message.textContent = "Googleフォームを開きました。フォームからお申し込みください。";
});
