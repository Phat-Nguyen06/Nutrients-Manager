// ==== Kiểm tra đăng nhập ====
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "/login.html";
}
document.querySelector(".user-name").textContent = `Xin chào, ${currentUser.username}`;

// ==== Dữ liệu mặc định (có thể lấy từ localStorage sau) ====
let recipes = JSON.parse(localStorage.getItem("recipes")) || [
  {
    name: "Turmeric Roasted Cauliflower Salad (lowfodmap)",
    author: "Joana Jardim",
    category: "Community Recipes",
    tags: ["Vegetarian dishes"],
    likes: 37,
    energy: 143,
    fat: 6,
    carbs: 18,
    protein: 5
  },
  {
    name: "Vegetable & Egg Scramble* (lowfodmap)",
    author: "Joana Jardim",
    category: "Community Recipes",
    tags: ["Lean & Green", "Low Added Sugar", "Diabetic Friendly", "HBP Friendly", "Vegetarian dishes"],
    likes: 33,
    energy: 87,
    fat: 4,
    carbs: 8,
    protein: 5
  },
  {
    name: "Green Beans With Tofu and Roasted Peanuts (lowfodmap)",
    author: "Joana Jardim",
    category: "Community Recipes",
    tags: ["Vegetarian dishes"],
    likes: 22,
    energy: 99,
    fat: 6,
    carbs: 5,
    protein: 6
  },
  {
    name: "Berry Almond Smoothie (full fat milk)",
    author: "Joana Jardim",
    category: "Community Recipes",
    tags: ["Breakfast and snacks", "Vegetarian dishes", "Desserts"],
    likes: 13,
    energy: 106,
    fat: 6,
    carbs: 5,
    protein: 9
  },
  {
    name: "High Protein Blueberry Cheesecake",
    author: "Vasiliki Stavrou",
    category: "Community Recipes",
    tags: ["Desserts"],
    likes: 11,
    energy: 260,
    fat: 17,
    carbs: 23,
    protein: 4
  },
  {
    name: "Asian Chicken Almond Salad",
    author: "Vasiliki Stavrou",
    category: "Community Recipes",
    tags: ["Chicken Dishes", "Salads", "Lean & Green"],
    likes: 11,
    energy: 72,
    fat: 3,
    carbs: 6,
    protein: 7
  },
  {
    name: "Spicy Sausage and Veggie Stir Fry",
    author: "Vasiliki Stavrou",
    category: "Community Recipes",
    tags: ["Meat dishes", "Lean & Green"],
    likes: 11,
    energy: 73,
    fat: 3,
    carbs: 6,
    protein: 5
  },
  {
    name: "Berry Almond Smoothie",
    author: "Vasiliki Stavrou",
    category: "Community Recipes",
    tags: ["Breakfast and snacks", "Vegetarian dishes", "Desserts"],
    likes: 10,
    energy: 84,
    fat: 5,
    carbs: 8,
    protein: 5
  }
];

// ==== Biến điều khiển ====
const recipeList = document.querySelector(".recipe-list");
const paginationContainer = document.getElementById("pagination");
const searchInput = document.querySelector('.search-bar input[type="text"]');
const sortSelect = document.getElementById('sortSelect');
const categorySelect = document.getElementById('categorySelect');

let currentPage = 1;
const itemsPerPage = 4;

// ==== Hàm render card ====
function renderAllRecipes(recipeArr) {
  let textRecipeCard = "";

  recipeArr.forEach(recipe => {
    textRecipeCard += `
      <div class="recipe-card">
        <div class="card-badge">
          <div class="badge">${recipe.category}</div>
        </div>
        <div class="card-body">
          <div class="card-header">
            <div>
              <h2 class="recipe-title">${recipe.name}</h2>
              <div class="card-meta">
                <p class="author">${recipe.author}</p>
                <div class="likes">
                  <i class="far fa-heart"></i> <span>${recipe.likes || 0}</span>
                </div>
              </div>
              <p class="tags">${recipe.tags?.join(", ") || "No tags"}</p>
            </div>
          </div>
          <div class="nutrition-table">
            <div class="nutrient">by<br><strong>100g</strong></div>
            <div class="nutrient">Energy<br><strong>${recipe.energy || "?"} kcal</strong></div>
            <div class="nutrient">Fat<br><strong>${recipe.fat || "?"} g</strong></div>
            <div class="nutrient">Carbohydrate<br><strong>${recipe.carbs || "?"} g</strong></div>
            <div class="nutrient">Protein<br><strong>${recipe.protein || "?"} g</strong></div>
          </div>
        </div>
      </div>
    `;
  });

  recipeList.innerHTML = recipeArr.length > 0
    ? textRecipeCard
    : "<p>No recipes found.</p>";
}

// ==== Lọc và phân trang ====
function filterRecipes() {
  let keyword = searchInput.value.toLowerCase().trim();
  let selectedCategory = categorySelect.value;
  let selectedSort = sortSelect.value;

  let filtered = recipes.filter(recipe => {
    let nameMatch = recipe.name.toLowerCase().includes(keyword);
    let tagMatch = recipe.tags.join(" ").toLowerCase().includes(keyword);
    let matchKeyword = nameMatch || tagMatch;

    let matchCategory = !selectedCategory || recipe.tags.includes(selectedCategory);

    return matchKeyword && matchCategory;
  });

  if (selectedSort) {
    filtered.sort((a, b) =>
      (b[selectedSort.toLowerCase()] || 0) - (a[selectedSort.toLowerCase()] || 0)
    );
  }

  return filtered;
}

// ==== Render phân trang ====
function renderPagination(filteredRecipes) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  const createBtn = (label, page, isActive = false, isDisabled = false) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.classList.add("page-btn");
    if (isActive) btn.classList.add("active");
    if (isDisabled) btn.disabled = true;

    btn.addEventListener("click", () => {
      if (!isDisabled) {
        currentPage = page;
        renderPaginatedRecipes();
      }
    });

    return btn;
  };

  paginationContainer.appendChild(
    createBtn("«", currentPage - 1, false, currentPage === 1)
  );

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
    paginationContainer.appendChild(createBtn("...", null, false, true));
  }

  if (totalPages > 1) {
    paginationContainer.appendChild(createBtn(totalPages, totalPages, currentPage === totalPages));
  }

  paginationContainer.appendChild(
    createBtn("»", currentPage + 1, false, currentPage === totalPages)
  );
}

// ==== Hiển thị trang hiện tại ====
function renderPaginatedRecipes() {
  const filtered = filterRecipes();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const recipesToShow = filtered.slice(start, end);

  renderAllRecipes(recipesToShow);
  renderPagination(filtered);
}

// ==== Gắn sự kiện tìm kiếm / lọc / sắp xếp ====
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderPaginatedRecipes();
});

sortSelect.addEventListener("change", () => {
  currentPage = 1;
  renderPaginatedRecipes();
});

categorySelect.addEventListener("change", () => {
  currentPage = 1;
  renderPaginatedRecipes();
});

// ==== Lần đầu tải trang ====
renderPaginatedRecipes();
