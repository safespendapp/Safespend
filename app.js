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
    .filter(b =>
      !b.paid &&
      b.date &&
      b.date >= today()
    )
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    );
}


function upcomingIncome() {
  return data.income
    .filter(i =>
      i.date &&
      i.date >= today()
    )
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    );
}


function safeSpend() {

  const bills =
    upcomingBills().reduce(
      (total, bill) =>
        total + (Number(bill.amount) || 0),
      0
    );

  const income =
    upcomingIncome().reduce(
      (total, item) =>
        total + (Number(item.amount) || 0),
      0
    );

  return (
    (Number(data.balance) || 0) +
    income -
    bills
  );
}


function render() {

  const bills = upcomingBills();
  const inc = upcomingIncome();
  const safe = safeSpend();

  const balance =
    Number(data.balance) || 0;

  const billsTotal =
    bills.reduce(
      (total, bill) =>
        total + (Number(bill.amount) || 0),
      0
    );


  const safeEl =
    document.getElementById("safeSpend");

  if (safeEl) {
    safeEl.textContent =
      money(safe);
  }


  const balanceEl =
    document.getElementById("balanceOut");

  if (balanceEl) {
    balanceEl.textContent =
      money(balance);
  }


  const billsEl =
    document.getElementById("billsOut");

  if (billsEl) {
    billsEl.textContent =
      money(billsTotal);
  }


  const balanceInput =
    document.getElementById("balanceInput");

  if (
    balanceInput &&
    document.activeElement !== balanceInput
  ) {
    balanceInput.value =
      balance ? balance : "";
  }


  const note =
    document.getElementById("safeNote");

  if (note) {

    note.textContent =
      safe >= 0
        ? "This is your projected amount after upcoming bills."
        : "Your upcoming bills are more than your available money.";
  }


  const warning =
    document.getElementById("warning");

  if (warning) {

    warning.classList.toggle(
      "hidden",
      safe >= 0
    );

    warning.textContent =
      safe < 0
        ? `You're projected to be ${money(
            Math.abs(safe)
          )} short based on what you've entered.`
        : "";
  }


  const nextBills =
    document.getElementById("nextBills");

  if (nextBills) {

    nextBills.innerHTML =
      bills
        .slice(0, 5)
        .map(b =>
          itemHTML(b, "bill")
        )
        .join("") ||
      '<div class="empty">No upcoming unpaid bills.</div>';
  }


  const incomeList =
    document.getElementById("incomeList");

  if (incomeList) {

    incomeList.innerHTML =
      inc.length
        ? inc
            .map(i =>
              itemHTML(i, "income")
            )
            .join("")
        : '<div class="card empty">No upcoming income yet.</div>';
  }


  const billList =
    document.getElementById("billList");

  if (billList) {

    billList.innerHTML =
      data.bills.length
        ? [...data.bills]
            .sort((a, b) =>
              a.date.localeCompare(b.date)
            )
            .map(b =>
              itemHTML(b, "bill")
            )
            .join("")
        : '<div class="card empty">No bills yet.</div>';
  }


  const events = [
    ...data.income.map(x => ({
      ...x,
      type: "Income"
    })),

    ...data.bills.map(x => ({
      ...x,
      type: x.paid
        ? "Paid bill"
        : "Bill"
    }))
  ].sort((a, b) =>
    a.date.localeCompare(b.date)
  );


  const calendarList =
    document.getElementById("calendarList");

  if (calendarList) {

    calendarList.innerHTML =
      events.length

        ? events
            .map(
              x =>
                `<div class="item">
                  <div>
                    <div class="item-title">
                      ${x.type}: ${esc(
                        x.name || x.source
                      )}
                    </div>

                    <div class="item-sub">
                      ${dateText(x.date)}
                    </div>
                  </div>

                  <strong>
                    ${money(x.amount)}
                  </strong>
                </div>`
            )
            .join("")

        : '<div class="empty">Add income or bills to see your calendar.</div>';
  }
}


/* =========================
   SAVE CURRENT BALANCE
========================= */

document
  .getElementById("saveBalanceBtn")
  .addEventListener(
    "click",
    () => {

      const input =
        document.getElementById(
          "balanceInput"
        );

      const saved =
        document.getElementById(
          "balanceSaved"
        );

      const value =
        Number(input.value);

      if (
        input.value.trim() === "" ||
        !Number.isFinite(value) ||
        value < 0
      ) {

        saved.textContent =
          "Please enter a valid balance.";

        saved.className =
          "result bad";

        return;
      }

      data.balance = value;

      localStorage.setItem(
        KEY,
        JSON.stringify(data)
      );

      render();

      saved.textContent =
        "Balance saved.";

      saved.className =
        "result good";
    }
  );


/* =========================
   ESCAPE HTML
========================= */

function esc(s) {

  return String(s).replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m])
  );
}


/* =========================
   ITEM HTML
========================= */

function itemHTML(x, type) {

  const title =
    type === "bill"
      ? esc(x.name)
      : esc(x.source);

  const status =
    type === "bill"

      ? x.paid
        ? '<span class="pill paid">Paid</span>'
        : '<span class="pill">Due</span>'

      : '<span class="pill">Income</span>';

  return `
    <div class="item">

      <div>

        <div class="item-title">
          ${title}
        </div>

        <div class="item-sub">
          ${dateText(x.date)} · ${status}
        </div>

      </div>

      <div class="item-actions">

        <strong>
          ${money(x.amount)}
        </strong>

        <button
          class="delete"
          onclick="removeItem('${type}','${x.id}')"
        >
          ×
        </button>

      </div>

    </div>
  `;
}


/* =========================
   DELETE
========================= */

window.removeItem = (type, id) => {

  if (!confirm("Delete this item?")) {
    return;
  }

  const key =
    type === "bill"
      ? "bills"
      : "income";

  data[key] =
    data[key].filter(
      x => x.id !== id
    );

  save();
};


/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll("[data-screen]")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        const screen =
          btn.dataset.screen;

        document
          .querySelectorAll(".screen")
          .forEach(x =>
            x.classList.remove("active")
          );

        document
          .getElementById(screen)
          ?.classList.add("active");

        document
          .querySelectorAll(".navbtn")
          .forEach(x =>
            x.classList.toggle(
              "active",
              x.dataset.screen === screen
            )
          );
      }
    );
  });


/* =========================
   ADD INCOME
========================= */

document
  .getElementById("incomeForm")
  .addEventListener(
    "submit",
    e => {

      e.preventDefault();

      data.income.push({

        id: crypto.randomUUID(),

        source:
          document.getElementById(
            "incomeSource"
          ).value,

        amount:
          Number(
            document.getElementById(
              "incomeAmount"
            ).value
          ) || 0,

        date:
          document.getElementById(
            "incomeDate"
          ).value,

        recurring:
          document.getElementById(
            "incomeRecurring"
          ).checked
      });

      e.target.reset();

      document.getElementById(
        "incomeDate"
      ).value = today();

      save();
    }
  );


/* =========================
   ADD BILL
========================= */

document
  .getElementById("billForm")
  .addEventListener(
    "submit",
    e => {

      e.preventDefault();

      data.bills.push({

        id: crypto.randomUUID(),

        name:
          document.getElementById(
            "billName"
          ).value,

        amount:
          Number(
            document.getElementById(
              "billAmount"
            ).value
          ) || 0,

        date:
          document.getElementById(
            "billDate"
          ).value,

        paid:
          document.getElementById(
            "billPaid"
          ).checked,

        recurring:
          document.getElementById(
            "billRecurring"
          ).checked
      });

      e.target.reset();

      document.getElementById(
        "billDate"
      ).value = today();

      save();
    }
  );


/* =========================
   CAN I AFFORD THIS?
========================= */

document
  .getElementById("affordBtn")
  .addEventListener(
    "click",
    () => {

      const amount =
        Number(
          document.getElementById(
            "affordAmount"
          ).value
        );

      const result =
        document.getElementById(
          "affordResult"
        );

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
        (after >= 0
          ? "good"
          : "bad");

      result.textContent =
        after >= 0

          ? `Yes — you'd have about ${money(
              after
            )} left after that purchase.`

          : `Not safely — you'd be about ${money(
              Math.abs(after)
            )} short after that purchase.`;
    }
  );


/* =========================
   RESET
========================= */

document
  .getElementById("resetBtn")
  .addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "Erase all demo data?"
        )
      ) {
        return;
      }

      data = {
        balance: 0,
        income: [],
        bills: []
      };

      localStorage.removeItem(KEY);

      const balanceInput =
        document.getElementById(
          "balanceInput"
        );

      const balanceSaved =
        document.getElementById(
          "balanceSaved"
        );

      const affordAmount =
        document.getElementById(
          "affordAmount"
        );

      const affordResult =
        document.getElementById(
          "affordResult"
        );

      if (balanceInput) {
        balanceInput.value = "";
      }

      if (balanceSaved) {
        balanceSaved.textContent = "";
        balanceSaved.className =
          "result muted";
      }

      if (affordAmount) {
        affordAmount.value = "";
      }

      if (affordResult) {
        affordResult.textContent = "";
        affordResult.className =
          "result muted";
      }

      save();
    }
  );


/* =========================
   INITIAL DATES
========================= */

document.getElementById(
  "incomeDate"
).value = today();

document.getElementById(
  "billDate"
).value = today();


/* =========================
   INITIAL DISPLAY
========================= */

render();
