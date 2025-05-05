const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "/login.html";
}

document.querySelector(".user-name").textContent = `Xin chào, ${currentUser.username}`;

const tempRecipe = JSON.parse(localStorage.getItem("tempRecipe"));
if (!tempRecipe) {
  window.location.href = "/page/my-recipes.html";
}

// ==== Render thông tin cơ bản ====
let badge = document.querySelector(".badge span");
let likeCount = document.querySelector(".likes-summary span");
let image = document.querySelector(".summary-image img");

badge.textContent = tempRecipe.category?.[0]?.name || "Community Recipes";
likeCount.textContent = tempRecipe.likes || 0;
image.src = tempRecipe.coverSrc || "/assets/images/img-avata-food/default-avata.png";

let nameField = document.querySelectorAll(".info-value")[0];
let descField = document.querySelectorAll(".info-value")[1];
let authorField = document.querySelectorAll(".info-value")[2];
let totalTimeField = document.querySelectorAll(".info-value")[3];
let prepTimeField = document.querySelectorAll(".info-value")[4];
let finalWeightField = document.querySelectorAll(".info-value")[5];
let portionsField = document.querySelectorAll(".info-value")[6];
nameField.textContent = tempRecipe.name;
descField.textContent = tempRecipe.description;
authorField.textContent = tempRecipe.author;
totalTimeField.textContent = tempRecipe.totalTime;
prepTimeField.textContent = tempRecipe.preparationTime;
finalWeightField.textContent = tempRecipe.finalWeight != null? `${tempRecipe.finalWeight} grams` : "-";
portionsField.textContent = tempRecipe.portions;

// ==== Render tags ====
let tagContainer = document.querySelector(".summary-tags");
let ingredientList = document.querySelector(".ingredients-list");
tagContainer.innerHTML = tempRecipe.category.map(c => `
  <span class="tag">
    <img src="/assets/images/img-icon/Icon (1).png" alt="">
    ${c.name}
  </span>
`).join("");

// ==== Render ingredients ====
ingredientList.innerHTML = tempRecipe.ingredients.map(i => `
  <div class="ingredient-item">
    1 portion of ${i.food.name}
  </div>
`).join("");

// ==== Render cooking steps ====
let methodContent = document.querySelector(".method-content");
methodContent.innerHTML = tempRecipe.cookingMethods.map(step => {
  return `${step.content}<br><br>`;
}).join("");

// ==== Render macronutrients tổng ====
let fatValue = document.getElementById("fatValue");
let carbValue = document.getElementById("carbValue");
let proteinValue = document.getElementById("proteinValue");
let fiberValue = document.getElementById("fiberValue");

function renderMacro() {
  let fat = 0, carb = 0, protein = 0, fiber = 0;

  tempRecipe.ingredients.forEach(i => {
    fat += Number(i.food.macronutrients?.fat || 0);
    carb += Number(i.food.macronutrients?.carbohydrate || 0);
    protein += Number(i.food.macronutrients?.protein || 0);
    fiber += Number(i.food.micronutrients?.fiber || 0);
  });

  fatValue.textContent = `${fat.toFixed(1)}g`;
  carbValue.textContent = `${carb.toFixed(1)}g`;
  proteinValue.textContent = `${protein.toFixed(1)}g`;
  fiberValue.textContent = `${fiber.toFixed(1)}g`;

  drawMacroPieChart(fat, carb, protein);
}

// ==== Render chart ====
let pieChartInstance = null;
function drawMacroPieChart(fat, carb, protein) {
  const ctx = document.getElementById('macroPieChart').getContext('2d');
  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Fat', 'Carbohydrate', 'Protein'],
      datasets: [{
        data: [fat, carb, protein],
        backgroundColor: ['#e57373', '#ffb74d', '#4db6ac']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// ==== Render micronutrients ====
let micronutrientList = document.getElementById("micronutrientList");
function renderMicronutrients() {
  let textMicronutrientList = "";
  let totalSodium = 0, totalVitaminA = 0, totalVitaminB6 = 0, totalVitaminB12 = 0, totalVitaminC = 0, totalVitaminD_D2_D3 = 0,
    totalVitaminE = 0, totalVitaminK = 0, totalSugars = 0, totalCalcium = 0, totalIron = 0, totalMagnesium = 0, totalPhosphorus = 0,
    totalPotassium = 0, totalZinc = 0, totalCopper = 0, totalFluoride = 0, totalManganese = 0, totalSelenium = 0, totalThiamin = 0,
    totalRiboflavin = 0, totalNiacin = 0, totalPantothenicAcid = 0, totalFolateTotal = 0;

  tempRecipe.ingredients.forEach(item => {
    const main = item.food.micronutrients || {};
    totalSodium += Number(main.sodium || 0);
    totalVitaminA += Number(main.vitamin_a || 0);
    totalVitaminB6 += Number(main.vitamin_b_6 || 0);
    totalVitaminB12 += Number(main.vitamin_b_12 || 0);
    totalVitaminC += Number(main.vitamin_c || 0);
    totalVitaminD_D2_D3 += Number(main.vitamin_d_d2__d3 || 0);
    totalVitaminE += Number(main.vitamin_e || 0);
    totalVitaminK += Number(main.vitamin_k || 0);
    totalSugars += Number(main.sugars || 0);
    totalCalcium += Number(main.calcium || 0);
    totalIron += Number(main.iron || 0);
    totalMagnesium += Number(main.magnesium || 0);
    totalPhosphorus += Number(main.phosphorus || 0);
    totalPotassium += Number(main.potassium || 0);
    totalZinc += Number(main.zinc || 0);
    totalCopper += Number(main.copper || 0);
    totalFluoride += Number(main.fluoride || 0);
    totalManganese += Number(main.manganese || 0);
    totalSelenium += Number(main.selenium || 0);
    totalThiamin += Number(main.thiamin || 0);
    totalRiboflavin += Number(main.riboflavin || 0);
    totalNiacin += Number(main.niacin || 0);
    totalPantothenicAcid += Number(main.pantothenic_acid || 0);
    totalFolateTotal += Number(main.folate_total || 0);
  });

  textMicronutrientList = `
      <tr><td>Sodium</td><td>${totalSodium} mg</td></tr>
      <tr><td>Vitamin A</td><td>${totalVitaminA} µg</td></tr>
      <tr><td>Vitamin B6</td><td>${totalVitaminB6} mg</td></tr>
      <tr><td>Vitamin B12</td><td>${totalVitaminB12} µg</td></tr>
      <tr><td>Vitamin C</td><td>${totalVitaminC} mg</td></tr>
      <tr><td>Vitamin D (D2+D3)</td><td>${totalVitaminD_D2_D3} µg</td></tr>
      <tr><td>Vitamin E</td><td>${totalVitaminE} mg</td></tr>
      <tr><td>Vitamin K</td><td>${totalVitaminK} µg</td></tr>
      <tr><td>Sugars</td><td>${totalSugars} g</td></tr>
      <tr><td>Calcium</td><td>${totalCalcium} mg</td></tr>
      <tr><td>Iron</td><td>${totalIron} mg</td></tr>
      <tr><td>Magnesium</td><td>${totalMagnesium} mg</td></tr>
      <tr><td>Phosphorus</td><td>${totalPhosphorus} mg</td></tr>
      <tr><td>Potassium</td><td>${totalPotassium} mg</td></tr>
      <tr><td>Zinc</td><td>${totalZinc} mg</td></tr>
      <tr><td>Copper</td><td>${totalCopper} mg</td></tr>
      <tr><td>Fluoride</td><td>${totalFluoride} mg</td></tr>
      <tr><td>Manganese</td><td>${totalManganese} mg</td></tr>
      <tr><td>Selenium</td><td>${totalSelenium} µg</td></tr>
      <tr><td>Thiamin</td><td>${totalThiamin} mg</td></tr>
      <tr><td>Riboflavin</td><td>${totalRiboflavin} mg</td></tr>
      <tr><td>Niacin</td><td>${totalNiacin} mg</td></tr>
      <tr><td>Pantothenic Acid</td><td>${totalPantothenicAcid} mg</td></tr>
      <tr><td>Folate Total</td><td>${totalFolateTotal} µg</td></tr>
  `;

  micronutrientList.innerHTML = textMicronutrientList;
}

// ==== Xử lý click Add to favourite ==== 
let addFavBtn = document.querySelector(".btn-fav");
let likeIcon = document.querySelector(".likes-summary i");
addFavBtn.addEventListener("click", () => {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
  const recipe = recipes.find(r => r.id === tempRecipe.id);

  if (!recipe) return;

  if (!recipe.likedBy) recipe.likedBy = [];
  const isLiked = recipe.likedBy.includes(currentUser.email);

  if (isLiked) {
    recipe.likedBy = recipe.likedBy.filter(e => e !== currentUser.email);
    recipe.likes = Math.max(0, (recipe.likes || 0) - 1);
    likeIcon.classList.remove("fas");
    likeIcon.classList.add("far");
  } else {
    recipe.likedBy.push(currentUser.email);
    recipe.likes = (recipe.likes || 0) + 1;
    likeIcon.classList.remove("far");
    likeIcon.classList.add("fas");
  }

  likeCount.textContent = recipe.likes;
  localStorage.setItem("recipes", JSON.stringify(recipes));
});

// ==== Initial Render ==== 
renderMacro();
renderMicronutrients();
