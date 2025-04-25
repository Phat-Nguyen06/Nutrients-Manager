
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "/login.html";
}
document.querySelector(".user-name").textContent = `Xin chào, ${currentUser.username}`;

let btnSignOut = document.querySelector(".signout-btn");
btnSignOut.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "/login.html";
});

let foods = JSON.parse(localStorage.getItem("foods")) || [
  {
    id: 1,
    name: "Boiled Egg",
    source: "Minh Cuong Tran",
    category: "Protein Foods",
    quantity: "1 egg (50g)",
    macronutrients: {
      energy: 78,
      fat: 5,
      carbohydrate: 0.6,
      protein: 6,
    }
  },
  {
    id: 2,
    name: "Brown Rice, cooked",
    source: "Minh Cuong Tran",
    category: "Grains",
    quantity: "1 cup (195g)",
    macronutrients: {
      energy: 216,
      fat: 1.8,
      carbohydrate: 45,
      protein: 5,
    }
  },
  {
    id: 3,
    name: "Grilled Chicken Breast",
    source: "Minh Cuong Tran",
    category: "Protein Foods",
    quantity: "100g",
    macronutrients: {
      energy: 165,
      fat: 3.6,
      carbohydrate: 0,
      protein: 31,
    }
  },
  {
    id: 4,
    name: "Apple",
    source: "Minh Cuong Tran",
    category: "Fruits",
    quantity: "1 medium (182g)",
    macronutrients: {
      energy: 95,
      fat: 0.3,
      carbohydrate: 25,
      protein: 0.5,
    }
  },
  {
    id: 5,
    name: "Broccoli, steamed",
    source: "Minh Cuong Tran",
    category: "Vegetables and Vegetable Products",
    quantity: "1 cup (156g)",
    macronutrients: {
      energy: 55,
      fat: 0.6,
      carbohydrate: 11,
      protein: 3.7,
    }
  },
  {
    id: 6,
    name: "Salmon, grilled",
    source: "Minh Cuong Tran",
    category: "Fish and Seafood",
    quantity: "100g",
    macronutrients: {
      energy: 208,
      fat: 13,
      carbohydrate: 0,
      protein: 20,
    }
  },
  {
    id: 7,
    name: "Whole Wheat Bread",
    source: "Minh Cuong Tran",
    category: "Grains",
    quantity: "1 slice (28g)",
    macronutrients: {
      energy: 69,
      fat: 1.1,
      carbohydrate: 12,
      protein: 3.6,
    }
  },
  {
    id: 8,
    name: "Banana",
    source: "Minh Cuong Tran",
    category: "Fruits",
    quantity: "1 medium (118g)",
    macronutrients: {
      energy: 105,
      fat: 0.3,
      carbohydrate: 27,
      protein: 1.3,
    }
  },
  {
    id: 9,
    name: "Avocado",
    source: "Minh Cuong Tran",
    category: "Fruits",
    quantity: "1 fruit (201g)",
    macronutrients: {
      energy: 322,
      fat: 29,
      carbohydrate: 17,
      protein: 4,
    }
  },
  {
    id: 10,
    name: "Greek Yogurt, plain",
    source: "Minh Cuong Tran",
    category: "Dairy and Eggs",
    quantity: "1 cup (245g)",
    macronutrients: {
      energy: 130,
      fat: 0.4,
      carbohydrate: 9,
      protein: 23,
    }
  }
];

// ===== DOM Element =====
const foodList = document.querySelector(".food-table");
const paginationContainer = document.querySelector(".pagination-foods");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortNutrientSelect");
const categorySelect = document.getElementById("foodCategorySelect");


let currentPage = 1;
const itemsPerPage = 6;

// ===== Render Cards =====
function renderFoods(arr) {
  let html = "";
  arr.forEach(food => {
    html += `
      <div class="food-row" onclick="showFoodDetail(${food.id})">
          <div class="food-info">
              <p class="food-name">${food.name}</p>
              <p class="food-source">${food.source}</p>
          </div>
          <div class="nutrients">${food.macronutrients?.energy ?? "-"} kcal<br><span>Energy</span></div>
          <div class="nutrients">${food.macronutrients?.fat ?? "-"} g<br><span>Fat</span></div>
          <div class="nutrients">${food.macronutrients?.carbohydrate ?? "-"} g<br><span>Carbohydrate</span></div>
          <div class="nutrients">${food.macronutrients?.protein ?? "-"} g<br><span>Protein</span></div>
      </div>
    `;
  });

  foodList.innerHTML = arr.length ? html : "<p>No foods found.</p>";
}

// ===== Lọc, tìm kiếm, sắp xếp =====
let currentSortKey = "";
let isSortAsc = false;

function getFilteredFoods() {
  let keyword = searchInput.value.toLowerCase().trim();
  let selectedCategory = categorySelect.value;
  let selectedSort = sortSelect.value;

  let filtered = foods.filter(food => {
    const matchKeyword = food.name.toLowerCase().includes(keyword);
    const matchCategory = !selectedCategory || food.category === selectedCategory;
    return matchKeyword && matchCategory;
  });

  if (currentSortKey) {
    filtered.sort((a, b) => {
      const aVal = a.macronutrients?.[currentSortKey.toLowerCase()] ?? 0;
      const bVal = b.macronutrients?.[currentSortKey.toLowerCase()] ?? 0;
      return isSortAsc ? aVal - bVal : bVal - aVal;
    });
  }

  return filtered;
}

// Tương tác nút tăng giảm
const sortIcon = document.querySelector(".sort-group i");

sortIcon.addEventListener("click", () => {
  if (!currentSortKey) return; // chưa chọn nutrient thì không xử lý

  isSortAsc = !isSortAsc; // toggle tăng/giảm
  // Đổi icon luôn nếu muốn
  sortIcon.classList.toggle("fa-sort-amount-up-alt", !isSortAsc);
  sortIcon.classList.toggle("fa-sort-amount-down-alt", isSortAsc);

  renderPaginatedFoods();
});



// ===== Phân trang =====
function renderPagination(filtered) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  let createBtn = (label, page, isActive = false, isDisabled = false) => {
    let btn = document.createElement("button");
    btn.textContent = label;
    btn.classList.add("page-btn");
    if (isActive) btn.classList.add("active");
    if (isDisabled) btn.disabled = true;

    btn.addEventListener("click", () => {
      if (!isDisabled && page !== null) {
        currentPage = page;
        renderPaginatedFoods();
      }
    });

    return btn;
  };

  paginationContainer.appendChild(createBtn("«", currentPage - 1, false, currentPage === 1));
  paginationContainer.appendChild(createBtn("1", 1, currentPage === 1));

  if (currentPage > 4) {
    paginationContainer.appendChild(createBtn("...", null, false, true));
  }

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    paginationContainer.appendChild(createBtn(i, i, currentPage === i));
  }

  if (currentPage < totalPages - 3) {
    paginationContainer.appendChild("...", null, false, true);
  }

  if (totalPages > 1) {
    paginationContainer.appendChild(createBtn(totalPages, totalPages, currentPage === totalPages));
  }

  paginationContainer.appendChild(createBtn("»", totalPages + 1, false, currentPage === totalPages));
}

function renderPaginatedFoods() {
  const filtered = getFilteredFoods();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  renderFoods(filtered.slice(start, end));
  renderPagination(filtered);
}

// ===== Thêm món mới =====
let modal = document.getElementById("createFoodModal");
let openModalBtn = document.querySelector(".create-food-btn");
openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

let closeModalBtn = document.getElementById("closeCreateModal");
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

let foodForm = document.querySelector("#createFoodModal .food-form");
foodForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = foodForm.querySelector(".field-block:nth-child(1) input").value.trim();
  const source = foodForm.querySelector(".field-block:nth-child(2) input").value.trim();
  const category = foodForm.querySelector(".field-block:nth-child(3) input").value.trim();
  const quantity = foodForm.querySelector(".field-block:nth-child(4) input").value.trim();

  if (!name || !source || !category || !quantity) {
    Toastify({
      text: "❗Vui lòng điền đầy đủ thông tin: Name, Source, Category, Quantity.",
      duration: 3500,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "#fff3cd",
        color: "#856404",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        fontWeight: "500"
      },
      offset: {
        y: 60
      }
    }).showToast();
    return;
  }

  // Lấy dữ liệu các chất chính
  const macroInputs = foodForm.querySelectorAll(".macro-grid .nutrient-row");

  let macronutrients = {};
  macroInputs.forEach(row => {
    const label = row.querySelector(".nutrient-label").textContent.trim()
      .toLowerCase()
      .replace(/[()]/g, "")
      .replace(/\s+/g, "_")
      .replace(/-/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const value = row.querySelector("input").value.trim();
    macronutrients[label] = value ? parseFloat(value) : null;
  });


  // (micronutrients)
  const microInputs = foodForm.querySelectorAll(".micro-grid .nutrient-row");
  let micronutrients = {};
  microInputs.forEach(row => {
    const label = row.querySelector(".nutrient-label").textContent.trim()
      .toLowerCase()
      .replace(/[()]/g, "")
      .replace(/\s+/g, "_")
      .replace(/-/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const value = row.querySelector("input").value.trim();
    micronutrients[label] = value ? parseFloat(value) : null;
  });

  const newFood = {
    id: Date.now(),
    name,
    source,
    category,
    quantity,
    macronutrients,
    micronutrients,
    createdAt: new Date().toISOString()
  };

  foods.push(newFood);
  localStorage.setItem("foods", JSON.stringify(foods));

  foodForm.reset();
  modal.style.display = "none";
  currentPage = 1;
  renderPaginatedFoods();
  Toastify({
    text: "🟢 Món ăn đã được thêm thành công!",
    duration: 3000,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: "#e8f5e9",
      color: "#2e7d32",
      borderRadius: "6px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      fontWeight: "500"
    }
  }).showToast();

});

// ===== Sự kiện tìm kiếm, lọc, sắp xếp =====
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderPaginatedFoods();
});
categorySelect.addEventListener("change", () => {
  currentPage = 1;
  renderPaginatedFoods();
});
sortSelect.addEventListener("change", () => {
  currentSortKey = sortSelect.value;
  currentPage = 1;
  renderPaginatedFoods();
});


let currentEditIndex = null;

function showFoodDetail(foodId) {
  const food = foods.find(f => f.id === foodId);
  currentEditIndex = food.id;
  if (!food) return;

  const modal = document.getElementById("foodModal");

  // Gán thông tin cơ bản
  document.getElementById("food-form-name").value = food.name;
  document.getElementById("food-form-source").value = food.source;
  document.getElementById("food-form-category").value = food.category;
  document.getElementById("food-form-quantity").value = food.quantity;

  // Gán macronutrients
  const macros = food.macronutrients || {};
  const macroInputs = modal.querySelectorAll(".macro-grid .nutrient-row");
  macroInputs.forEach(row => {
    const label = row.querySelector(".nutrient-label").textContent.trim()
      .toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "_").replace(/-/g, "_").replace(/[^a-z0-9_]/g, "");
    row.querySelector("input").value = macros[label] ?? "";
  });

  // Gán micronutrients
  const micros = food.micronutrients || {};
  const microInputs = modal.querySelectorAll(".micro-grid .nutrient-row");
  microInputs.forEach(row => {
    const label = row.querySelector(".nutrient-label").textContent.trim()
      .toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "_").replace(/-/g, "_").replace(/[^a-z0-9_]/g, "");
    row.querySelector("input").value = micros[label] ?? "";
  });

  // Hiện modal lên
  modal.style.display = "flex";
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("foodModal").style.display = "none";
});

// ===== Cập nhật món ăn sau khi chỉnh sửa (modal info) =====
const foodInfoForm = document.querySelector("#foodModal form.food-form");

foodInfoForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("food-form-name").value.trim();
  const source = document.getElementById("food-form-source").value.trim();
  const category = document.getElementById("food-form-category").value.trim();
  const quantity = document.getElementById("food-form-quantity").value.trim();

  if (!name || !source || !category || !quantity) {
    Toastify({
      text: "❗Vui lòng điền đầy đủ thông tin: Name, Source, Category, Quantity.",
      duration: 3500,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "#fff3cd",
        color: "#856404",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        fontWeight: "500"
      },
      offset: {
        y: 60
      }
    }).showToast();
    return;
  }

  const food = foods.find(f => f.id === currentEditIndex);
  if (!food) return;

  food.name = name;
  food.source = source;
  food.category = category;
  food.quantity = quantity;

  const macros = {};
  const macroInputs = foodInfoForm.querySelectorAll(".macro-grid .nutrient-row");
  macroInputs.forEach(row => {
    const label = row.querySelector(".nutrient-label").textContent.trim()
      .toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "_").replace(/-/g, "_").replace(/[^a-z0-9_]/g, "");
    const value = row.querySelector("input").value.trim();
    macros[label] = value ? parseFloat(value) : null;
  });
  food.macronutrients = macros;

  const micros = {};
  const microInputs = foodInfoForm.querySelectorAll(".micro-grid .nutrient-row");
  microInputs.forEach(row => {
    const label = row.querySelector(".nutrient-label").textContent.trim()
      .toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "_").replace(/-/g, "_").replace(/[^a-z0-9_]/g, "");
    const value = row.querySelector("input").value.trim();
    micros[label] = value ? parseFloat(value) : null;
  });
  food.micronutrients = micros;

  localStorage.setItem("foods", JSON.stringify(foods));

  document.getElementById("foodModal").style.display = "none";
  renderPaginatedFoods();

  Toastify({
    text: "Cập nhật món ăn thành công!",
    duration: 3000,
    style: { background: "#4caf50" },
  }).showToast();
});


// ===== Khởi động =====
renderPaginatedFoods();
