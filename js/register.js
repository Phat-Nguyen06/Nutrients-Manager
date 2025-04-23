let registerForm = document.getElementById("register-form");


let users = JSON.parse(localStorage.getItem("users")) || [];

registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    let errorEmailRegister = document.getElementById("emailError");
    let errorUsernameRegister = document.getElementById("usernameError");
    let errorPasswordRegister = document.getElementById("passwordError");

    let hasError = false; // 👈

    if (email === "") {
        errorEmailRegister.textContent = "Vui lòng nhập Email.";
        errorEmailRegister.style.display = "block";
        hasError = true;
    } else {
        errorEmailRegister.textContent = "";
        errorEmailRegister.style.display = "none";
    }

    if (username === "") {
        errorUsernameRegister.textContent = "Vui lòng nhập tên đăng nhập.";
        errorUsernameRegister.style.display = "block";
        hasError = true;
    } else {
        errorUsernameRegister.textContent = "";
        errorUsernameRegister.style.display = "none";
    }

    if (password === "") {
        errorPasswordRegister.textContent = "Vui lòng nhập mật khẩu.";
        errorPasswordRegister.style.display = "block";
        hasError = true;
    } else {
        errorPasswordRegister.textContent = "";
        errorPasswordRegister.style.display = "none";
    }

    // Check trùng email
    const isExist = users.find(user => user.email === email);
    if (isExist) {
        errorEmailRegister.textContent = "Email đã được đăng ký.";
        errorEmailRegister.style.display = "block";
        hasError = true;
    }

    if (hasError) return;

    const hashedPassword = CryptoJS.SHA256(password).toString();

    let newUser = {
        email,
        username,
        password: hashedPassword
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    Toastify({
        text: '<i class="fas fa-check-circle"></i> <span style="margin-left: 8px;">Đăng ký thành công!</span>',
        duration: 3000,
        gravity: "top",
        position: "left",
        close: false,
        escapeMarkup: false,
        style: {
            background: "#28a745",
            color: "#FAF9F6",
            borderRadius: "10px",
            padding: "12px 18px",
            fontWeight: "500",
            fontSize: "14px",
            fontFamily: "'Segoe UI', sans-serif",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)"
        },
        stopOnFocus: true
    }).showToast();


    setTimeout(() => {
        registerForm.reset();
        window.location.href = "/login.html";
    }, 1000);

});

