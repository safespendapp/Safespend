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


/* =========================================================
   SAFE SPEND FOX
   Uses the actual fox artwork uploaded to the repository.
   The house remains visible behind her.
========================================================= */

function addSafeSpendFox() {

  const welcomeArt =
    document.querySelector(".welcome-art");

  if (!welcomeArt) return;

  /* Prevent duplicate foxes if render/navigation runs again */

  if (document.getElementById("safeSpendFox")) {
    return;
  }

  /* Add fox styling without requiring changes to styles.css */

  if (!document.getElementById("safeSpendFoxStyles")) {

    const style =
      document.createElement("style");

    style.id =
      "safeSpendFoxStyles";

    style.textContent = `

      .welcome-art.safe-fox-stage{
        position:relative !important;
        width:130px !important;
        height:110px !important;
        flex:0 0 130px !important;
        display:block !important;
        overflow:visible !important;
      }

      .welcome-art.safe-fox-stage > img:not(.safe-spend-fox){
        position:absolute !important;
        right:0 !important;
        bottom:0 !important;
        width:90px !important;
        height:90px !important;
        max-width:90px !important;
        max-height:90px !important;
        object-fit:contain !important;
        z-index:2 !important;
      }

      .safe-spend-fox{
        position:absolute !important;
        left:0 !important;
        bottom:-2px !important;
        width:76px !important;
        height:76px !important;
        max-width:76px !important;
        max-height:76px !important;
        object-fit:contain !important;
        z-index:5 !important;
        display:block !important;
        pointer-events:none !important;
        filter:drop-shadow(
          0 5px 7px rgba(45,65,51,.10)
        );
      }

      .safe-fox-greenery{
        position:absolute !important;
        left:-5px !important;
        bottom:-1px !important;
        width:86px !important;
        height:38px !important;
        z-index:4 !important;
        pointer-events:none !important;
        opacity:.72 !important;
        border-radius:50% !important;
        background:
          radial-gradient(
            ellipse at 18% 80%,
            rgba(113,135,116,.48) 0 18%,
            transparent 19%
          ),
          radial-gradient(
            ellipse at 40% 72%,
            rgba(135,150,111,.38) 0 17%,
            transparent 18%
          ),
          radial-gradient(
            ellipse at 63% 82%,
            rgba(113,135,116,.42) 0 19%,
            transparent 20%
          ),
          radial-gradient(
            ellipse at 82% 72%,
            rgba(135,150,111,.34) 0 15%,
            transparent 16%
          );
      }

      @media(max-width:430px){

        .welcome-art.safe-fox-stage{
          width:112px !important;
          height:94px !important;
          flex:0 0 112px !important;
        }

        .welcome-art.safe-fox-stage > img:not(.safe-spend-fox){
          width:78px !important;
          height:78px !important;
          max-width:78px !important;
          max-height:78px !important;
        }

        .safe-spend-fox{
          width:66px !important;
          height:66px !important;
          max-width:66px !important;
          max-height:66px !important;
          left:-2px !important;
          bottom:-1px !important;
        }

        .safe-fox-greenery{
          width:76px !important;
          height:32px !important;
        }
      }

      @media(max-width:360px){

        .welcome-art.safe-fox-stage{
          width:100px !important;
          height:84px !important;
          flex:0 0 100px !important;
        }

        .welcome-art.safe-fox-stage > img:not(.safe-spend-fox){
          width:68px !important;
          height:68px !important;
          max-width:68px !important;
          max-height:68px !important;
        }

        .safe-spend-fox{
          width:59px !important;
          height:59px !important;
          max-width:59px !important;
          max-height:59px !important;
        }

        .safe-fox-greenery{
          width:68px !important;
          height:29px !important;
        }
      }

    `;

    document.head.appendChild(style);
  }

  welcomeArt.classList.add(
    "safe-fox-stage"
  );

  /* Create the greenery behind the fox */

  const greenery =
    document.createElement("div");

  greenery.className =
    "safe-fox-greenery";

  greenery.setAttribute(
    "aria-hidden",
    "true"
  );

  welcomeArt.appendChild(
    greenery
  );

  /* Create the actual fox */

  const fox =
    document.createElement("img");

  fox.id =
    "safeSpendFox";

  fox.className =
    "safe-spend-fox";

  fox.src =
    "d55d9c8d-9edc-4b9b-9b01-d1ca17b49da9.png";

  fox.alt =
    "SafeSpend fox";

  fox.loading =
    "eager";

  fox.decoding =
    "async";

  welcomeArt.appendChild(
    fox
  );
}


function upcomingBills() {
  return data.bills
    .filter(b => !b.paid && b.date >= today())
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    );
}


function upcomingIncome() {
  return data.income
    .filter(i => i.date >= today())
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    );
}


function safeSpend() {

  const bills =
    upcomingBills().reduce(
      (s, b) =>
        s + Number(b.amount),
      0
    );

  const income =
    upcomingIncome().reduce(
      (s, i) =>
        s + Number(i.amount),
      0
    );

  return (
    Number(data.balance) +
    income -
    bills
  );
}


function render() {

  const bills =
    upcomingBills();

  const inc =
    upcomingIncome();

  const safe =
    safeSpend();

  document.getElementById(
    "safeSpend"
  ).textContent =
    money(safe);

  document.getElementById(
    "balanceOut"
  ).textContent =
    money(data.balance);

  document.getElementById(
    "billsOut"
  ).textContent =
    money(
      bills.reduce(
        (s, b) =>
          s + Number(b.amount),
        0
      )
    );

  const note =
    document.getElementById(
      "safeNote"
    );

  note.textContent =
    safe >= 0
      ? "This is your projected amount after upcoming bills."
      : "Your upcoming bills are more than your available money.";

  const warning =
    document.getElementById(
      "warning"
    );

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

  document.getElementById(
    "nextBills"
  ).innerHTML =
    bills
      .slice(0, 5)
      .map(
        b =>
          itemHTML(
            b,
            "bill"
          )
      )
      .join("") ||
    '<div class="empty">No upcoming unpaid bills.</div>';

  document.getElementById(
    "incomeList"
  ).innerHTML =
    inc.length
      ? inc
          .map(
            i =>
              itemHTML(
                i,
                "income"
              )
          )
          .join("")
      : '<div class="card empty">No upcoming income yet.</div>';

  document.getElementById(
    "billList"
  ).innerHTML =
    data.bills.length
      ? [...data.bills]
          .sort(
            (a, b) =>
              a.date.localeCompare(
                b.date
              )
          )
          .map(
            b =>
              itemHTML(
                b,
                "bill"
              )
          )
          .join("")
      : '<div class="card empty">No bills yet.</div>';

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

  ].sort(
    (a, b) =>
      a.date.localeCompare(
        b.date
      )
  );

  document.getElementById(
    "calendarList"
  ).innerHTML =
    events.length
      ? events
          .map(
            x =>
              `<div class="item">

                <div>

                  <div class="item-title">
                    ${x.type}: ${esc(
                      x.name ||
                      x.source
                    )}
                  </div>

                  <div class="item-sub">
                    ${dateText(
                      x.date
                    )}
                  </div>

                </div>

                <strong>
                  ${money(
                    x.amount
                  )}
                </strong>

              </div>`
          )
          .join("")
      : '<div class="empty">Add income or bills to see your calendar.</div>';

  /* Make sure the fox remains present */

  addSafeSpendFox();
}


function esc(s) {

  return String(s).replace(
    /[&<>"']/g,
    m =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[m])
  );
}


function itemHTML(
  x,
  type
) {

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
          ${dateText(
            x.date
          )} · ${status}
        </div>

      </div>

      <div class="item-actions">

        <strong>
          ${money(
            x.amount
          )}
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


window.removeItem = (
  type,
  id
) => {

  if (
    !confirm(
      "Delete this item?"
    )
  ) return;

  const key =
    type === "bill"
      ? "bills"
      : "income";

  data[key] =
    data[key].filter(
      x =>
        x.id !== id
    );

  save();
};


/* =========================================================
   NAVIGATION
========================================================= */

document
  .querySelectorAll(
    "[data-screen]"
  )
  .forEach(
    btn => {

      btn.addEventListener(
        "click",
        () => {

          const s =
            btn.dataset.screen;

          document
            .querySelectorAll(
              ".screen"
            )
            .forEach(
              x =>
                x.classList.remove(
                  "active"
                )
            );

          document
            .getElementById(
              s
            )
            .classList.add(
              "active"
            );

          document
            .querySelectorAll(
              ".navbtn"
            )
            .forEach(
              x =>
                x.classList.toggle(
                  "active",
                  x.dataset.screen ===
                    s
                )
            );

        }
      );

    }
  );


/* =========================================================
   CURRENT BALANCE
========================================================= */

const balanceInput =
  document.getElementById(
    "balanceInput"
  );

const saveBalanceBtn =
  document.getElementById(
    "saveBalanceBtn"
  );

const balanceSaved =
  document.getElementById(
    "balanceSaved"
  );


if (balanceInput) {

  balanceInput.value =
    data.balance > 0
      ? data.balance
      : "";
}


if (saveBalanceBtn) {

  saveBalanceBtn.addEventListener(
    "click",
    () => {

      const raw =
        balanceInput.value.trim();

      if (raw === "") {

        if (balanceSaved) {

          balanceSaved.textContent =
            "Enter your current balance.";

          balanceSaved.className =
            "result bad";
        }

        return;
      }

      const amount =
        Number(raw);

      if (
        !Number.isFinite(
          amount
        ) ||
        amount < 0
      ) {

        if (balanceSaved) {

          balanceSaved.textContent =
            "Please enter a valid balance.";

          balanceSaved.className =
            "result bad";
        }

        return;
      }

      data.balance =
        amount;

      localStorage.setItem(
        KEY,
        JSON.stringify(data)
      );

      render();

      if (balanceSaved) {

        balanceSaved.textContent =
          "Balance saved.";

        balanceSaved.className =
          "result good";
      }

    }
  );
}


/* =========================================================
   INCOME
========================================================= */

document
  .getElementById(
    "incomeForm"
  )
  .addEventListener(
    "submit",
    e => {

      e.preventDefault();

      data.income.push({

        id:
          crypto.randomUUID(),

        source:
          incomeSource.value,

        amount:
          Number(
            incomeAmount.value
          ),

        date:
          incomeDate.value,

        recurring:
          incomeRecurring.checked

      });

      e.target.reset();

      incomeDate.value =
        today();

      save();

    }
  );


/* =========================================================
   BILLS
========================================================= */

document
  .getElementById(
    "billForm"
  )
  .addEventListener(
    "submit",
    e => {

      e.preventDefault();

      data.bills.push({

        id:
          crypto.randomUUID(),

        name:
          billName.value,

        amount:
          Number(
            billAmount.value
          ),

        date:
          billDate.value,

        paid:
          billPaid.checked,

        recurring:
          billRecurring.checked

      });

      e.target.reset();

      billDate.value =
        today();

      save();

    }
  );


/* =========================================================
   CAN I AFFORD THIS?
========================================================= */

document
  .getElementById(
    "affordBtn"
  )
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
        safeSpend() -
        amount;

      result.className =
        "result " +
        (
          after >= 0
            ? "good"
            : "bad"
        );

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


/* =========================================================
   RESET
========================================================= */

document
  .getElementById(
    "resetBtn"
  )
  .addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "Erase all demo data?"
        )
      ) return;

      data = {
        balance: 0,
        income: [],
        bills: []
      };

      localStorage.removeItem(
        KEY
      );

      if (balanceInput) {

        balanceInput.value =
          "";
      }

      if (balanceSaved) {

        balanceSaved.textContent =
          "";

        balanceSaved.className =
          "result muted";
      }

      const affordAmount =
        document.getElementById(
          "affordAmount"
        );

      const affordResult =
        document.getElementById(
          "affordResult"
        );

      if (affordAmount) {

        affordAmount.value =
          "";
      }

      if (affordResult) {

        affordResult.textContent =
          "";

        affordResult.className =
          "result muted";
      }

      save();

    }
  );


/* =========================================================
   DATES
========================================================= */

incomeDate.value =
  today();

billDate.value =
  today();


/* =========================================================
   INITIAL FOX + RENDER
========================================================= */

addSafeSpendFox();

render();
