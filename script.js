document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = today.toLocaleString("en-US", { month: "short" });
  const year = String(today.getFullYear()).slice(-2);
  const todayStr = `${day}-${month}-${year}`;

  document.getElementById("date-text").textContent = today.toDateString();

  fetch("holidays.csv")
    .then((response) => response.text())
    .then((csv) => {
      const lines = csv.trim().split("\n");
      const rows = lines.slice(1);

      const holidaysToday = rows
        .map(line => line.split("\t").map(field => field.replace(/^\uFEFF/, '').trim()))
        .filter(cols => cols[4] === todayStr); // Match short date

      const container = document.getElementById("countries-container");
      container.innerHTML = "";

      if (holidaysToday.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#fff;'>No holidays today.</p>";
        return;
      }

      // Group holidays by country
      const countryMap = {};
      holidaysToday.forEach(cols => {
        const shortCode = cols[0]; // Short Country code
        const country = cols[1];
        const festival = {
          headline: cols[2],
          description: cols[5],
          shortCode: shortCode
        };
        if (!countryMap[country]) {
          countryMap[country] = {
            code: shortCode,
            festivals: []
          };
        }
        countryMap[country].festivals.push(festival);
      });

      // Build Cards
      Object.entries(countryMap).forEach(([country, data]) => {
        const card = document.createElement("section");
        card.className = "country-card";

        const upper = document.createElement("div");
        upper.className = "country-card-upper";

        const flagImg = document.createElement("img");
        flagImg.src = `https://flagcdn.com/w40/${data.code.toLowerCase()}.png`;
        flagImg.alt = country;
        flagImg.className = "flag-icon";

        const countryName = document.createElement("span");
        countryName.className = "country-name";
        countryName.textContent = country;

        upper.appendChild(flagImg);
        upper.appendChild(countryName);

        const lower = document.createElement("div");
        lower.className = "country-card-lower";

        data.festivals.forEach(fest => {
          const festDiv = document.createElement("div");

          const headline = document.createElement("div");
          headline.className = "festival-headline";
          headline.textContent = fest.headline;

          const desc = document.createElement("div");
          desc.className = "festival-desc";
          desc.textContent = fest.description;

          festDiv.appendChild(headline);
          festDiv.appendChild(desc);
          lower.appendChild(festDiv);
        });

        card.appendChild(upper);
        card.appendChild(lower);
        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error loading holidays.csv", error);
    });
});
