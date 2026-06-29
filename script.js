const YOUR_WHATSAPP = "254742924045";

const plans = {
  hakika: {
    desc: "Affordable savings plan from KES 3,000/month. Term of 5–15 years. Maturity benefits are guaranteed if all premiums are paid. Includes life cover and optional disability rider.",
    minPremiumMonthly: 3000,
    maxTerm: 15,
    minTerm: 5,
    features: [
      "Guaranteed maturity benefit — determined at the outset if all premiums paid",
      "Built-in Life Cover protects your family in case of your unfortunate demise",
      "Additional rider options are available to cover premiums during disability",
      "Tax relief: 15% of premiums (applicable if policy has a term of 10 years or more)",
      "Surrender value available after you have paid at least 24 months' worth of premiums",
      "Lapse warning: if you stop paying premiums in the first 24 months, policy lapses without value"
    ],
    featureTypes: ["","","","","","warning"]
  },
  elimika: {
    desc: "School fees plan from KES 3,000/month. Term of 5–15 years. Pays out in a series of payments to cater for your child's school fees. Includes life cover and optional riders.",
    minPremiumMonthly: 3000,
    maxTerm: 15,
    minTerm: 5,
    features: [
      "Receive a series of payouts perfectly timed to cater for your child's school fees",
      "Guaranteed maturity benefit if all premiums are paid to maturity",
      "Premium waiver rider pays your remaining premiums if you die or become disabled",
      "Built-in Life Cover protection included for your loved ones",
      "Tax relief: 15% of premiums (applicable if policy has a term of 10 years or more)",
      "Lapse warning: if you stop paying premiums in the first 24 months, policy lapses without value"
    ],
    featureTypes: ["","","","","","warning"]
  }
};

let currentPlan = "hakika";
let currentFrequency = 12;

const frequencyNames = {
  12: "Monthly",
  4: "Quarterly",
  2: "Half-Yearly",
  1: "Annual"
};

function selectPlan(p) {
  currentPlan = p;
  document.querySelectorAll('.plan-tab').forEach((t) => {
    t.classList.toggle('active', t.id === `tab-${p}`);
  });

  const plan = plans[p];
  if (!plan) return;

  document.getElementById('plan-desc').textContent = plan.desc;

  const termSlider = document.getElementById('term');
  termSlider.min = plan.minTerm;
  termSlider.max = plan.maxTerm;

  let currentTerm = parseInt(termSlider.value) || plan.minTerm;
  if (currentTerm < plan.minTerm) currentTerm = plan.minTerm;
  if (currentTerm > plan.maxTerm) currentTerm = plan.maxTerm;
  termSlider.value = currentTerm;

  updatePremiumConstraintsAndValue();
  calc();
}

function selectFrequency(f) {
  currentFrequency = f;
  document.querySelectorAll('.freq-tab').forEach((t) => {
    t.classList.toggle('active', t.id === `freq-${f}`);
  });

  document.getElementById('contribution-label').textContent = `${frequencyNames[f]} contribution`;

  updatePremiumConstraintsAndValue();
  calc();
}

function updatePremiumConstraintsAndValue() {
  const plan = plans[currentPlan];
  const premiumInput = document.getElementById('premium');
  const hintBadge = document.getElementById('premium-min-hint');
  if (!plan || !premiumInput) return;

  const multiplier = 12 / currentFrequency;
  const computedMin = plan.minPremiumMonthly * multiplier;

  premiumInput.min = computedMin;
  if (hintBadge) {
    hintBadge.textContent = "Min: " + computedMin.toLocaleString('en-KE');
  }
}

function fmt(n) {
  return "KES " + Math.round(n).toLocaleString('en-KE');
}

function calc() {
  const plan = plans[currentPlan];
  const premiumInput = document.getElementById('premium');
  const termInput = document.getElementById('term');
  const errorEl = document.getElementById('premium-error');
  const waBtn = document.getElementById('wa-btn');

  if (!plan || !premiumInput || !termInput) return;

  const multiplier = 12 / currentFrequency;
  const computedMin = plan.minPremiumMonthly * multiplier;

  let premium = parseInt(premiumInput.value);

  if (isNaN(premium) || premiumInput.value.trim() === "") {
    premiumInput.classList.add('input-error');
    errorEl.textContent = "A contribution amount is required.";
    errorEl.style.display = "block";
    invalidateResults();
    return;
  } else if (premium < computedMin) {
    premiumInput.classList.add('input-error');
    errorEl.textContent = `The minimum contribution for this frequency is KES ${computedMin.toLocaleString('en-KE')}.`;
    errorEl.style.display = "block";
    invalidateResults();
    return;
  } else {
    premiumInput.classList.remove('input-error');
    errorEl.style.display = "none";
    if (waBtn) waBtn.classList.remove('disabled');
  }

  const term = parseInt(termInput.value) || plan.minTerm;
  document.getElementById('term-val').textContent = term + " yrs";

  const totalPaid = premium * currentFrequency * term;

  let actualPeriodTaxRelief = 0;
  if (term >= 10) {
    const monthlyEquivalentPremium = premium / multiplier;
    const monthlyTaxReliefEquivalent = Math.min(monthlyEquivalentPremium * 0.15, 5000);
    actualPeriodTaxRelief = monthlyTaxReliefEquivalent * multiplier;
  }

  document.getElementById('maturity-val').textContent = "Guaranteed Payout";
  document.getElementById('maturity-sub').textContent = `Benefits are fixed at the outset for your ${term}-year plan.`;
  document.getElementById('total-paid').textContent = fmt(totalPaid);
  document.getElementById('gain-val').textContent = "See official quote";
  document.getElementById('life-cover').textContent = "System Quote Required";
  document.getElementById('tax-relief').textContent = fmt(actualPeriodTaxRelief);

  const taxNote = document.getElementById('tax-note');
  if (term >= 10) {
    taxNote.style.display = 'block';
    const totalTaxSavedOverTerm = actualPeriodTaxRelief * currentFrequency * term;
    taxNote.innerHTML = `<strong>Tax relief bonus:</strong> Your ${term}-year policy qualifies for 15% tax relief on premiums. This yields a savings of ${fmt(actualPeriodTaxRelief)} per payout period, equivalent to a total benefit of ${fmt(totalTaxSavedOverTerm)} over the full term.`;
  } else {
    taxNote.style.display = 'block';
    taxNote.innerHTML = `<strong>Tax Note:</strong> Policies under 10 years do not qualify for the 15% state tax relief. Consider a term of 10–15 years to activate this benefit.`;
  }

  const fl = document.getElementById('features-list');
  if (fl) {
    fl.innerHTML = plan.features.map((f, i) =>
      `<li class="${plan.featureTypes[i]}">${f}</li>`
    ).join('');
  }

  const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  window._waMsg = encodeURIComponent(
    `Hi Becky! I used your savings calculator and I'm interested in the ${planName} plan.\n\n` +
    `My details:\n` +
    `- Premium: KES ${premium.toLocaleString()} (${frequencyNames[currentFrequency]})\n` +
    `- Term: ${term} years\n` +
    `- Status: Awaiting Life Cover, Rider & Payout Quote via Old Mutual System\n\n` +
    `Can you run these details through the system and send me the official illustration contract?`
  );

  if (waBtn) waBtn.href = "#";
} // <-- closes calc()

function invalidateResults() {
  document.getElementById('maturity-val').textContent = "Pending Input";
  document.getElementById('maturity-sub').textContent = "Please resolve the error above.";
  document.getElementById('total-paid').textContent = "KES 0";
  document.getElementById('gain-val').textContent = "Pending";
  document.getElementById('life-cover').textContent = "Pending";
  document.getElementById('tax-relief').textContent = "KES 0";
  document.getElementById('tax-note').style.display = 'none';

  const waBtn = document.getElementById('wa-btn');
  if (waBtn) {
    waBtn.classList.add('disabled');
    waBtn.href = "#";
  }
}

function openWA(e) {
    e.preventDefault();

    const waBtn = document.getElementById("wa-btn");

    if (waBtn.classList.contains("disabled")) {
        alert("Please complete the calculator first.");
        return;
    }

    const msg = window._waMsg || encodeURIComponent("Hi Becky, I'm interested in your savings plans.");

    const link = `https://wa.me/${YOUR_WHATSAPP}?text=${msg}`;

    window.open(link, "_blank");
}
window.addEventListener('DOMContentLoaded', () => {
  selectPlan('hakika');
});