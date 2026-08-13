const KEY = "safespend-v1";

let data = JSON.parse(
  localStorage.getItem(KEY) ||
  '{"balance":0,"income":[],"bills":[]}'
);

const money = n =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(n) || 0);

const today = () =>
  new Date().toISOString().slice(0, 10);

const dateText = d =>
  new Date(d + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const save = () => {
  localStorage.setItem(KEY, JSON.stringify(data));
  render();
};


function upcomingBills() {
  return data.bills
    .filter(b => !b.paid && b.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date));
}


function upcomingIncome() {
  return data.income
    .filter(i => i.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date));
}


function safeSpend() {
  const bills = upcomingBills().reduce(
    (s, b) => s + Number(b.amount),
    0
  );

  const income = upcomingIncome().reduce(
    (s, i) => s + Number(i.amount),
    0
  );

  return Number(data.balance) + income - bills;
}


function render() {
  const bills = upcomingBills();
  const inc = upcomingIncome();
  const safe = safeSpend();

  document.getElementById("safeSpend").textContent = money(safe);

  document.getElementById("balanceOut").textContent =
    money(data.balance);

  document.getElementById("billsOut").textContent = money(
    bills.reduce((s, b) => s + Number(b.amount), 0)
  );

  const note = document.getElementById("safeNote");

  note.textContent =
    safe >= 0
      ? "This is your projected amount after upcoming bills."
      : "Your upcoming bills are more than your available money.";

  const warning = document.getElementById("warning");

  if (warning) {
    warning.classList.toggle("hidden", safe >= 0);

    warning.textContent =
      safe < 0
        ? `You're projected to be ${money(
            Math.abs(safe)
          )} short based on what you've entered.`
        : "";
  }

  document.getElementById("nextBills").innerHTML =
    bills
      .slice(0, 5)
      .map(b => itemHTML(b, "bill"))
      .join("") ||
    '<div class="empty">No upcoming unpaid bills.</div>';

  document.getElementById("incomeList").innerHTML =
    inc.length
      ? inc.map(i => itemHTML(i, "income")).join("")
      : '<div class="card empty">No upcoming income yet.</div>';

  document.getElementById("billList").innerHTML =
    data.bills.length
      ? data.bills
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(b => itemHTML(b, "bill"))
          .join("")
      : '<div class="card empty">No bills yet.</div>';

  const events = [
    ...data.income.map(x => ({
      ...x,
      type: "Income"
    })),

    ...data.bills.map(x => ({
      ...x,
      type: x.paid ? "Paid bill" : "Bill"
    }))
  ].sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById("calendarList").innerHTML =
    events.length
      ? events
          .map(
            x =>
              `<div class="item">
                <div>
                  <div class="item-title">${x.type}: ${esc(
                x.name || x.source
              )}</div>
                  <div class="item-sub">${dateText(x.date)}</div>
                </div>
                <strong>${money(x.amount)}</strong>
              </div>`
          )
          .join("")
      : '<div class="empty">Add income or bills to see your calendar.</div>';

  updateBalanceField();
}


function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}


function itemHTML(x, type) {
  const title =
    type === "bill" ? esc(x.name) : esc(x.source);

  const status =
    type === "bill"
      ? x.paid
        ? '<span class="pill paid">Paid</span>'
        : '<span class="pill">Due</span>'
      : '<span class="pill">Income</span>';

  return `
    <div class="item">
      <div>
        <div class="item-title">${title}</div>
        <div class="item-sub">${dateText(x.date)} · ${status}</div>
      </div>

      <div class="item-actions">
        <strong>${money(x.amount)}</strong>
        <button
          class="delete"
          onclick="removeItem('${type}','${x.id}')"
        >×</button>
      </div>
    </div>
  `;
}


window.removeItem = (type, id) => {
  if (!confirm("Delete this item?")) return;

  data[type === "bill" ? "bills" : "income"] =
    data[type === "bill" ? "bills" : "income"].filter(
      x => x.id !== id
    );

  save();
};


/* =========================================================
   CURRENT BALANCE
   Creates the balance entry inside the Income screen.
   This does NOT change your existing HTML/design.
========================================================= */

function createBalanceEntry() {
  const incomeScreen =
    document.getElementById("income");

  const incomeForm =
    document.getElementById("incomeForm");

  if (!incomeScreen || !incomeForm) return;

  if (document.getElementById("balanceEntryCard")) return;

  const card = document.createElement("div");

  card.id = "balanceEntryCard";
  card.className = "card";

  card.innerHTML = `
    <div class="section-heading">
      <div class="eyebrow">YOUR MONEY</div>
      <h2>Current balance</h2>
    </div>

    <p>
      Enter the amount currently in your account.
    </p>

    <div class="row">
      <input
        id="balanceInput"
        type="number"
        min="0"
        step="0.01"
        inputmode="decimal"
        placeholder="Current balance"
      >

      <button
        id="saveBalanceBtn"
        type="button"
      >
        Save
      </button>
    </div>

    <div
      id="balanceSaved"
      class="result muted"
    ></div>
  `;

  incomeScreen.insertBefore(card, incomeForm);

  document
    .getElementById("saveBalanceBtn")
    .addEventListener("click", saveBalance);
}


function updateBalanceField() {
  const input =
    document.getElementById("balanceInput");

  if (!input) return;

  if (document.activeElement !== input) {
    input.value =
      data.balance === 0
        ? ""
        : data.balance;
  }
}


function saveBalance() {
  const input =
    document.getElementById("balanceInput");

  const message =
    document.getElementById("balanceSaved");

  if (!input) return;

  const raw = input.value.trim();

  if (raw === "") {
    message.textContent =
      "Enter your current balance.";

    message.className =
      "result bad";

    return;
  }

  const amount = Number(raw);

  if (!Number.isFinite(amount) || amount < 0) {
    message.textContent =
      "Enter a valid balance.";

    message.className =
      "result bad";

    return;
  }

  data.balance = amount;

  localStorage.setItem(
    KEY,
    JSON.stringify(data)
  );

  render();

  message.textContent =
    "Balance saved.";

  message.className =
    "result good";
}


/* =========================================================
   NAVIGATION
========================================================= */

document
  .querySelectorAll("[data-screen]")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      const s = btn.dataset.screen;

      document
        .querySelectorAll(".screen")
        .forEach(x =>
          x.classList.remove("active")
        );

      document
        .getElementById(s)
        .classList.add("active");

      document
        .querySelectorAll(".navbtn")
        .forEach(x =>
          x.classList.toggle(
            "active",
            x.dataset.screen === s
          )
        );
    });
  });


/* =========================================================
   INCOME
========================================================= */

document
  .getElementById("incomeForm")
  .addEventListener("submit", e => {
    e.preventDefault();

    data.income.push({
      id: crypto.randomUUID(),
      source: incomeSource.value,
      amount: Number(incomeAmount.value),
      date: incomeDate.value,
      recurring: incomeRecurring.checked
    });

    e.target.reset();

    incomeDate.value = today();

    save();
  });


/* =========================================================
   BILLS
========================================================= */

document
  .getElementById("billForm")
  .addEventListener("submit", e => {
    e.preventDefault();

    data.bills.push({
      id: crypto.randomUUID(),
      name: billName.value,
      amount: Number(billAmount.value),
      date: billDate.value,
      paid: billPaid.checked,
      recurring: billRecurring.checked
    });

    e.target.reset();

    billDate.value = today();

    save();
  });


/* =========================================================
   CAN I AFFORD THIS?
   LEFT EXACTLY AS IT WAS
========================================================= */

document
  .getElementById("affordBtn")
  .addEventListener("click", () => {

    const amount = Number(
      document.getElementById("affordAmount").value
    );

    const result =
      document.getElementById("affordResult");

    if (!amount) {
      result.textContent =
        "Enter an amount to check.";

      result.className =
        "result muted";

      return;
    }

    const after =
      safeSpend() - amount;

    result.className =
      "result " +
      (after >= 0 ? "good" : "bad");

    result.textContent =
      after >= 0
        ? `Yes — you'd have about ${money(
            after
          )} left after that purchase.`
        : `Not safely — you'd be about ${money(
            Math.abs(after)
          )} short after that purchase.`;
  });


/* =========================================================
   RESET
========================================================= */

document
  .getElementById("resetBtn")
  .addEventListener("click", () => {

    if (!confirm("Erase all demo data?")) return;

    data = {
      balance: 0,
      income: [],
      bills: []
    };

    localStorage.removeItem(KEY);

    const affordAmount =
      document.getElementById("affordAmount");

    const affordResult =
      document.getElementById("affordResult");

    if (affordAmount) {
      affordAmount.value = "";
    }

    if (affordResult) {
      affordResult.textContent = "";
      affordResult.className =
        "result muted";
    }

    save();
  });


/* =========================================================
   DATES
========================================================= */

incomeDate.value = today();
billDate.value = today();


/* =========================================================
   START
========================================================= */

createBalanceEntry();

render();
