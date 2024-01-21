// navbar
const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

if (bar) {
  bar.addEventListener("click", () => {
    nav.classList.add("active");
  });
}

if (close) {
  close.addEventListener("click", () => {
    nav.classList.remove("active");
  });
}

// forms
const hide = document.getElementById("hide");

setTimeout(() => {
  hide.style.opacity=0;
}, 5000);

// otp
const otpInputs = document.querySelectorAll(".input-field input");

window.onload = function() {
  otpInputs[0].focus();
};

otpInputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    const currentInput = input;
    const nextInput = otpInputs[index + 1];
    const prevInput = otpInputs[index - 1];

    const numericValue = parseInt(currentInput.value, 10);
    if (isNaN(numericValue)) {
      currentInput.value = "";
      return;
    }

    if (currentInput.value.length > 1) {
      lastInputValue = currentInput.value.charAt(currentInput.value.length - 1);
      currentInput.value = lastInputValue;
      return;
    }

    if (currentInput.value && nextInput && index < otpInputs.length - 1) {
      nextInput.focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    prevInput = otpInputs[index - 1];
    if (e.key === "Backspace" && index > 0) {
       if(!input.value){
        prevInput.focus();
       }
    }
  });
});