
// Toggle chatbot visibility
function toggleChat() {
  const chatbot = document.querySelector(".chatbot");
  const bubble = document.getElementById("chat-bubble");

  if (chatbot.style.display === "none" || chatbot.style.display === "") {
    chatbot.style.display = "flex"; // show chatbot
    bubble.style.display = "none"; // hide bubble
  } else {
    chatbot.style.display = "none"; // hide chatbot
    bubble.style.display = "flex"; // show bubble
  }
}

// Start with chatbot minimized
window.onload = () => {
  document.querySelector(".chatbot").style.display = "none";
  document.getElementById("chat-bubble").style.display = "flex";
};