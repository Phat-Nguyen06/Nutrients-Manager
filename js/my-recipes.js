
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

// ==== Lấy mảng tổng recipes và kiểm tra xem user có công thức chưa ====
let allRecipes = JSON.parse(localStorage.getItem("recipes")) || [];

const hasRecipe = allRecipes.some(r => r.userEmail === currentUser.email);
if (!hasRecipe) {
  const sampleRecipes = [
    {
      id: Date.now(),
      userEmail: currentUser.email,
      author: currentUser.username,
      name: "Avocado Egg Toast",
      category: "Breakfast and snacks",
      description: "A simple toast with mashed avocado and soft-boiled egg.",
      image: "",
      likes: 12,
      tags: ["Vegetarian dishes", "Healthy"],
      energy: 220,
      fat: 14,
      carbs: 18,
      protein: 9,
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 1,
      userEmail: currentUser.email,
      author: currentUser.username,
      name: "Quinoa Chicken Bowl",
      category: "Lean & Green",
      description: "A protein-packed bowl with quinoa, chicken and veggies.",
      image: "",
      likes: 9,
      tags: ["High Protein", "Gluten Free"],
      energy: 310,
      fat: 10,
      carbs: 25,
      protein: 28,
      createdAt: new Date().toISOString()
    }
  ];
  allRecipes.push(...sampleRecipes);
  localStorage.setItem("recipes", JSON.stringify(allRecipes));
}

// ==== Lọc ra chỉ recipe của currentUser ====
let userRecipes = allRecipes.filter(r => r.userEmail === currentUser.email || (Array.isArray(r.likedBy) && r.likedBy.includes(currentUser.email)));

// ==== Biến điều khiển ====
const recipeList = document.querySelector(".recipe-list");
const paginationContainer = document.getElementById("pagination");
const searchInput = document.querySelector('.search-bar input[type="text"]');
const sortSelect = document.getElementById('sortSelect');
const categorySelect = document.getElementById('categorySelect');


let currentPage = 1;
const itemsPerPage = 4;

// ==== Render ====
function renderAllRecipes(recipeArr) {
  let html = "";
  recipeArr.forEach(recipe => {
    html += `
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

  recipeList.innerHTML = recipeArr.length ? html : "<p>No recipes found.</p>";
}

// ==== Filter & Paging ====
function getFilteredRecipes() {
  const keyword = searchInput.value.toLowerCase().trim();
  const selectedCategory = categorySelect.value;
  const selectedSort = sortSelect.value;

  let filtered = userRecipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(keyword);
    const tagMatch = recipe.tags.join(" ").toLowerCase().includes(keyword);
    const matchKeyword = nameMatch || tagMatch;

    const matchCategory = !selectedCategory || recipe.tags.includes(selectedCategory);

    return matchKeyword && matchCategory;
  });

  if (selectedSort) {
    filtered.sort((a, b) => (b[selectedSort.toLowerCase()] || 0) - (a[selectedSort.toLowerCase()] || 0));
  }

  return filtered;
}

function renderPaginatedRecipes() {
  const filtered = getFilteredRecipes();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const recipesToShow = filtered.slice(start, end);

  renderAllRecipes(recipesToShow);
  renderPagination(filtered);
}

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

  if (currentPage > 4) paginationContainer.appendChild(createBtn("...", null, false, true));

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    paginationContainer.appendChild(createBtn(i, i, currentPage === i));
  }

  if (currentPage < totalPages - 3) paginationContainer.appendChild(createBtn("...", null, false, true));

  if (totalPages > 1) {
    paginationContainer.appendChild(createBtn(totalPages, totalPages, currentPage === totalPages));
  }

  paginationContainer.appendChild(
    createBtn("»", currentPage + 1, false, currentPage === totalPages)
  );
}

// ==== Event Listeners ====
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

renderPaginatedRecipes();


document.addEventListener("click", function (e) {
  const heartIcon = e.target.closest(".likes i");

  if (!heartIcon) return;

  const card = heartIcon.closest(".recipe-card");
  const recipeTitle = card.querySelector(".recipe-title").textContent.trim();

  const recipe = allRecipes.find(r => r.name === recipeTitle);

  if (!recipe) return;

  // Khởi tạo mảng likedBy nếu chưa có
  if (!recipe.likedBy) recipe.likedBy = [];

  const isLiked = recipe.likedBy.includes(currentUser.email);

  if (isLiked) {
    // bỏ
    recipe.likedBy = recipe.likedBy.filter(email => email !== currentUser.email);
    if (recipe.likes > 0) {
      recipe.likes--;
    }
  } else {
    // thêm
    recipe.likedBy.push(currentUser.email);
    recipe.likes++;
  }

  localStorage.setItem("recipes", JSON.stringify(allRecipes));

  renderPaginatedRecipes();
});