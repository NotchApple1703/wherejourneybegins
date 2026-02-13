/**
 * Shared Authentication Logic
 * Handles Login, Register, Modal Injection, and Account Redirection.
 */

// --- CONFIG & STATE ---
const AUTH_STATE = {
    currentUser: JSON.parse(localStorage.getItem("currentUser")) || null,
    users: JSON.parse(localStorage.getItem("users")) || [],
};

// --- DOM ELEMENTS (populated after injectAuthModal) ---
let authModal, authBox, authTitle, authBody, closeAuthBtn;

const TEMPLATES = {
    login: `
        <form id="loginForm">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="loginEmail" required placeholder="nhapemail@example.com">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="loginPassword" required placeholder="********">
            </div>
            <button type="submit" class="auth-submit-btn">Đăng nhập</button>
            <div class="auth-links">
                Chưa có tài khoản? <span id="goToRegister" style="cursor:pointer">Đăng ký</span><br>
                <span onclick="alert('Tính năng đang phát triển!')">Quên mật khẩu?</span>
            </div>
        </form>
    `,
    register: `
        <form id="registerForm">
            <div class="form-group">
                <label>Họ và tên</label>
                <input type="text" id="regName" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="regEmail" required>
            </div>
            <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" id="regPhone" required>
            </div>
             <div class="form-group">
                <label>Ngày sinh</label>
                <input type="date" id="regDob" required>
            </div>
            <div class="form-group">
                <label>Giới tính</label>
                <select id="regGender">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quốc tịch</label>
                <input type="text" id="regNation" required placeholder="Viet Nam">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="regPass" required>
            </div>
            <button type="submit" class="auth-submit-btn">Đăng ký</button>
            <div class="auth-links">
                Đã có tài khoản? <span id="goToLogin" style="cursor:pointer">Đăng nhập</span>
            </div>
        </form>
    `
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    injectAuthModal();
    initAuthButton();
    checkRestrictedAccess();
});

function checkRestrictedAccess() {
    // If on account page but not logged in, redirect
    if (window.location.pathname.includes("account.html") && !AUTH_STATE.currentUser) {
        window.location.href = "index.html";
        setTimeout(() => alert("Vui lòng đăng nhập để xem thông tin tài khoản."), 500);
    }
}

// --- CORE FUNCTIONS ---

function injectAuthModal() {
    // Don't inject if already exists (prevent duplicates)
    if (document.getElementById("authModal")) {
        bindModalElements();
        return;
    }

    const modalHTML = `
        <div class="auth-modal" id="authModal">
            <div class="auth-box" id="authBox">
                <span class="close-auth" id="closeAuth">&times;</span>
                <div class="auth-header">
                    <h2 id="authTitle">Đăng nhập</h2>
                </div>
                <div class="auth-body" id="authBody"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    bindModalElements();
}

function bindModalElements() {
    authModal = document.getElementById("authModal");
    authBox = document.getElementById("authBox");
    authTitle = document.getElementById("authTitle");
    authBody = document.getElementById("authBody");
    closeAuthBtn = document.getElementById("closeAuth");

    // Close Events
    closeAuthBtn.addEventListener("click", closeModal);
    authModal.addEventListener("click", (e) => {
        if (e.target === authModal) closeModal();
    });
}

function initAuthButton() {
    const authBtn = document.getElementById("authBtn");
    const authAvatar = document.getElementById("authAvatar");

    if (!authBtn || !authAvatar) return;

    // Update Avatar based on state
    if (AUTH_STATE.currentUser) {
        authAvatar.src = `https://ui-avatars.com/api/?name=${AUTH_STATE.currentUser.name}&background=0D8ABC&color=fff`;
    } else {
        authAvatar.src = "https://ui-avatars.com/api/?name=User&background=random";
    }

    // Click Event
    authBtn.addEventListener("click", () => {
        if (AUTH_STATE.currentUser) {
            // Redirect to Account Page
            window.location.href = "account.html";
        } else {
            // Open Login Modal
            renderLogin();
            openModal();
        }
    });
}

// --- RENDERERS ---

function openModal() {
    authModal.classList.add("active");
}

function closeModal() {
    authModal.classList.remove("active");
}

function renderLogin() {
    authTitle.innerText = "Đăng nhập";
    authBody.innerHTML = TEMPLATES.login;

    // Bind switch link
    document.getElementById("goToRegister").addEventListener("click", renderRegister);

    // Bind form submit
    document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const pass = document.getElementById("loginPassword").value;

        const user = AUTH_STATE.users.find(u => u.email === email && u.password === pass);
        if (user) {
            loginUser(user);
        } else {
            alert("Email hoặc mật khẩu không đúng!");
        }
    });
}

function renderRegister() {
    authTitle.innerText = "Đăng ký";
    authBody.innerHTML = TEMPLATES.register;

    // Bind switch link
    document.getElementById("goToLogin").addEventListener("click", renderLogin);

    // Bind form submit
    document.getElementById("registerForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const newUser = {
            name: document.getElementById("regName").value,
            email: document.getElementById("regEmail").value,
            phone: document.getElementById("regPhone").value,
            dob: document.getElementById("regDob").value,
            gender: document.getElementById("regGender").value,
            nationality: document.getElementById("regNation").value,
            password: document.getElementById("regPass").value
        };

        if (AUTH_STATE.users.some(u => u.email === newUser.email)) {
            alert("Email đã tồn tại!");
            return;
        }

        AUTH_STATE.users.push(newUser);
        localStorage.setItem("users", JSON.stringify(AUTH_STATE.users));
        loginUser(newUser);
        alert("Đăng ký thành công!");
    });
}

function loginUser(user) {
    AUTH_STATE.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Update UI
    const authAvatar = document.getElementById("authAvatar");
    if (authAvatar) {
        authAvatar.src = `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`;
    }

    closeModal();

    // Redirect if on account page? No, just stay or refresh?
    // If we were logging in to access account page, user probably wants to go there.
    // For now, just close modal. User can click avatar again to go to account page.
}

function logout() {
    AUTH_STATE.currentUser = null;
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// Global exposure for logout button in account.html (if we use inline onclick)
window.logout = logout;
window.AUTH_STATE = AUTH_STATE;
