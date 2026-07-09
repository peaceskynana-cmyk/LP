const form = document.querySelector("#applyForm");
const message = document.querySelector("#formMessage");
const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScPOhPdd1bEUc8iZ6cWHWALOU7xBvp1wAV-m4G3VesEJ8T2mA/viewform?usp=publish-editor";
const coverPreview = document.querySelector("#bookCoverPreview");
const coverOptions = document.querySelectorAll("[data-cover-id]");
const coverChoiceResult = document.querySelector("#coverChoiceResult");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  window.open(googleFormUrl, "_blank", "noopener");
  message.textContent = "Googleフォームを開きました。フォームからお申し込みください。";
});

coverOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const coverId = option.dataset.coverId;
    const coverName = option.dataset.coverName;
    const coverClass = ["cover-classic", "cover-letter", "cover-gift"].find((name) => option.classList.contains(name));

    coverOptions.forEach((item) => {
      const selected = item === option;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    coverPreview.className = `book-cover ${coverClass}`;
    coverChoiceResult.textContent = `選択中: 表紙 ${coverId} / ${coverName}`;
  });
});
