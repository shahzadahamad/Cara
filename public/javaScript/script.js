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

if (hide) {
  setTimeout(() => {
    hide.style.opacity = 0;
  }, 5000);
}

// otp
const otpInputs = document.querySelectorAll(".input-field input");

if (otpInputs.length > 0) {
  window.onload = function () {
    otpInputs[0].focus();
  };
}

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
      if (!input.value) {
        prevInput.focus();
      }
    }
  });
});

// Add to cart
function addToCart(id, isLogin) {
  // alert cart sweet akert
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 800,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  if (isLogin) {
    Toast.fire({
      icon: "success",
      title: "Product Added To Cart",
    });
  }

  event.stopPropagation();
  fetch(`/add-to-cart?id=${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.status) {
        window.location.href = "/login";
      }
    })
    .catch((error) => console.log(error.message));
}

// add to wishlist
async function addToWishlist(id,i) {

  event.stopPropagation();
  try {

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 800,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    const response = await axios.post("/add-to-wishlist", { id });

    if (response.data.status) {
      const wishlist = document.getElementById(`wishlist${i}`);
      wishlist.style.color = 'red';

      Toast.fire({
        icon: "success",
        title: "Product Added To Wishlist",
      });
    }else{
      Toast.fire({
        icon: "error",
        title: "Product exist In Washlist",
    });
    }

    if(response.data.login){
      window.location.href = "/login";
    }
  } catch (error) {
    console.log(error.message);
  }
}
