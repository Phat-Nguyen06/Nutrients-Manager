// ==== Kiểm tra đăng nhập ====
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

// ==== Lấy tất cả công thức từ localStorage ====
let recipes = JSON.parse(localStorage.getItem("recipes")) || [
  {
    id: 1,
    coverSrc: "/assets/images/img-avata-food/default-avata.png",
    name: "Turmeric Roasted Cauliflower Salad (lowfodmap)",
    description: "Our roasted cauliflower salad with turmeric is low in calories and packed with punchy flavor.",
    author: "Joana Jardim",
    totalTime: "00:40",
    preparationTime: "00:40",
    finalWeight: "978.8 grams",
    portions: 4,
    ingredients: [
      "Cauliflower", "Turmeric", "Olive oil"
    ],
    cookingMethods: [
      {
        id: 1,
        content: "STEP 1 Heat the oven to 200C/fan 180C/gas 6. Put the cauliflower in an ovenproof dish or tin."
      }
    ],
    category: [
      { id: 1, name: "vegetarian" },
      { id: 2, name: "appetizer" }
    ],
    tags: ["Vegetarian dishes", "Low calorie"],
    likes: 37,
    energy: 143,
    fat: 6,
    carbs: 18,
    protein: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    coverSrc: "/assets/images/img-avata-food/default-avata.png",
    name: "Vegetable & Egg Scramble* (lowfodmap)",
    description: "A hearty scramble for breakfast lovers, packed with veggies and flavor.",
    author: "Joana Jardim",
    totalTime: "00:30",
    preparationTime: "00:15",
    finalWeight: "550 grams",
    portions: 2,
    ingredients: ["Eggs", "Bell pepper", "Zucchini"],
    cookingMethods: [
      {
        id: 1,
        content: "STEP 1 Whisk eggs and cook with veggies on medium heat until set."
      }
    ],
    category: [{ id: 3, name: "breakfast" }],
    tags: ["Lean & Green", "Low Added Sugar", "Diabetic Friendly", "HBP Friendly", "Vegetarian dishes"],
    likes: 33,
    energy: 87,
    fat: 4,
    carbs: 8,
    protein: 5,
    createdAt: new Date().toISOString()
  }
];

localStorage.setItem("recipes", JSON.stringify(recipes));

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
      <div class="card-left">
        <div class="card-badge">
          <i class="fas fa-users"></i>
          <span>${recipe.category}</span>
        </div>
        <img class="card-img" src="${recipe.coverSrc || "/assets/images/img-avata-food/default-avata.png"}" alt="recipe image">
      </div>
  
      <div class="card-right">
        <div class="card-header">
          <div>
            <h2 class="recipe-title">${recipe.name}</h2>
            <p class="author">${recipe.author}</p>
            <p class="tags">${recipe.tags?.join(", ") || "No tags"}</p>
          </div>

          <div class="likes" data-id="${recipe.id}">
            <i class="${recipe.likedBy?.includes(currentUser.email) ? 'fas' : 'far'} fa-heart"></i>
            <span>${recipe.likes || 0}</span>
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
      if (!isDisabled && page !== null) {
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

  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const recipesToShow = filtered.slice(start, end);

  renderAllRecipes(recipesToShow);
  renderPagination(filtered);
}

// ==== Gắn sự kiện ====
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


// ==== Xử lý thả tim (like) kèm hiệu ứng +1 bay lên ====
document.addEventListener("click", function (e) {
  const heartIcon = e.target.closest(".likes i");
  if (!heartIcon) return;

  const card = heartIcon.closest(".recipe-card");
  const recipeTitle = card.querySelector(".recipe-title").textContent.trim();

  const recipe = recipes.find(r => r.name === recipeTitle);
  if (!recipe) return;

  if (!recipe.likedBy) recipe.likedBy = [];

  const isLiked = recipe.likedBy.includes(currentUser.email);

  const likesDiv = heartIcon.closest(".likes");

  if (isLiked) {
    recipe.likedBy = recipe.likedBy.filter(email => email !== currentUser.email);
    if (recipe.likes > 0) recipe.likes--;
    renderPaginatedRecipes();
    localStorage.setItem("recipes", JSON.stringify(recipes));

    Toastify({
      text: "Đã bỏ thả tim 💔",
      duration: 2000,
      gravity: "top",
      position: "center",
      backgroundColor: "#FFCDD2",
      style: {
        borderRadius: "8px",
      },
    }).showToast();
  } else {
    recipe.likedBy.push(currentUser.email);
    recipe.likes++;

    Toastify({
      text: "Bạn đã thả tim 💖",
      duration: 2000,
      gravity: "top",
      position: "center",
      backgroundColor: "#FFCDD2",
      style: {
        borderRadius: "8px",
      },
    }).showToast();
  }
  
  localStorage.setItem("recipes", JSON.stringify(recipes));
  renderPaginatedRecipes();
});


