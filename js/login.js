// === Tự động điền email nếu đã lưu ===
window.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.querySelector('input[type="email"]');
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const savedEmail = localStorage.getItem("rememberEmail");
  
    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberMeCheckbox.checked = true;
    }
  });
  
  // === Xử lý đăng nhập ===
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const rememberMeCheckbox = document.getElementById("rememberMe");
  
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const users = JSON.parse(localStorage.getItem("users")) || [];
  
    if (email === "" || password === "") {
      Toastify({
        text: `<i class="fa-solid fa-circle-xmark"></i> <strong> Email và mật khẩu không được bỏ trống!</strong>`,
        duration: 4000,
        gravity: "top",
        position: "center",
        close: true,
        escapeMarkup: false,
        style: {
          background: "#ffe2e2",
          color: "#000",
          borderRadius: "10px",
          padding: "12px 18px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          borderLeft: "6px solid #f44336"
        },
        stopOnFocus: true
      }).showToast();
      return;
    }
  
    const foundUser = users.find(
      user => user.email === email && user.password === CryptoJS.SHA256(password).toString()
    );
  
    if (!foundUser) {
      Toastify({
        text: `<i class="fa-solid fa-circle-xmark"></i> <strong> Email hoặc mật khẩu không đúng!</strong>`,
        duration: 4000,
        gravity: "top",
        position: "center",
        close: true,
        escapeMarkup: false,
        style: {
          background: "#ffe2e2",
          color: "#000",
          borderRadius: "10px",
          padding: "12px 18px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          borderLeft: "6px solid #f44336"
        },
        stopOnFocus: true
      }).showToast();
      return;
    }
  
    // === Ghi nhớ email nếu checkbox được chọn ===
    if (rememberMeCheckbox.checked) {
      localStorage.setItem("rememberEmail", email);
    } else {
      localStorage.removeItem("rememberEmail");
    }
  
    // === Lưu người dùng hiện tại vào localStorage ===
    const userInfo = {
      email: foundUser.email,
      username: foundUser.username,
      password: CryptoJS.SHA256(foundUser.password).toString()
    };
  
    localStorage.setItem("currentUser", JSON.stringify(userInfo));
  
    Toastify({
      text: `<i class="fa-solid fa-circle-check"></i> Đăng nhập thành công`,
      duration: 2500,
      gravity: "top",
      position: "center",
      close: false,
      escapeMarkup: false,
      style: {
        background: "#d4fcd4",
        color: "#000",
        borderRadius: "10px",
        padding: "12px 18px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        borderLeft: "6px solid #4CAF50"
      },
      stopOnFocus: true
    }).showToast();
  
    // === Chuyển về trang chính sau 1 giây ===
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1000);
  });
  