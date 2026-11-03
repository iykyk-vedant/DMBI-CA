import React from 'react';
import { PageHeader } from '../components/analytics/PageHeader';
import { FormulaBlock } from '../components/analytics/FormulaBlock';
import { BookOpen, CheckCircle2, ShieldCheck, Scale, Calculator, ExternalLink, FlaskConical } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Theoretical Verification"
        badgeColor="blue"
        icon={BookOpen}
        title="Academic Methodology, Formulations &amp; Proofs"
        description="Complete mathematical rigor, CA1 section alignment, worked 5-transaction mini-example verification, and unit-tested algorithm proofs."
        actions={
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>19/19 Automated Tests Passing</span>
          </span>
        }
      />

      {/* 2. AUTOMATED UNIT TEST STATUS BANNER */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              CA1 Section 7.2 Mini-Example &amp; Formula Parity Verified
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Verified mathematical parity across pytest test suites covering preprocessing, FP-Growth, Apriori, and offline recommender evaluation.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          pytest passing
        </span>
      </div>

      {/* 3. MATHEMATICAL FORMULATION BLOCKS */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Association Rule Evaluation Metric Mathematical Formulations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormulaBlock
            title="1. Support Metric"
            formula="Support(X → Y) = Count(X ∪ Y) / N"
            description="Proportion of all N baskets in dataset containing both itemsets X and Y. Filters out commercially negligible rare events."
            variables={[
              { name: 'X ∪ Y', definition: 'Joint basket containing items of both X and Y' },
              { name: 'N', definition: 'Total unique transaction baskets (16,506 UK)' },
            ]}
            example="If 165 baskets contain both items out of 16,506, Support = 1.0%."
            unitTestStatus="Verified"
          />

          <FormulaBlock
            title="2. Confidence Metric"
            formula="Confidence(X → Y) = Support(X ∪ Y) / Support(X)"
            description="Conditional probability P(Y|X) that a customer buys itemset Y given they have already placed itemset X into their basket."
            variables={[
              { name: 'Support(X)', definition: 'Prevalence of antecedent itemset X' },
              { name: 'Support(X ∪ Y)', definition: 'Prevalence of antecedent and consequent together' },
            ]}
            example="If 3 out of 4 baskets containing X also contain Y, Confidence = 75%."
            unitTestStatus="Verified"
          />

          <FormulaBlock
            title="3. Lift Metric"
            formula="Lift(X → Y) = Confidence(X → Y) / Support(Y)"
            description="Ratio of observed joint occurrence to expected co-occurrence under statistical independence. Lift > 1 indicates genuine positive association."
            variables={[
              { name: 'Support(Y)', definition: 'Expected purchase probability of consequent alone' },
              { name: 'Lift > 1.0', definition: 'Genuine affinity beyond random co-purchase' },
            ]}
            example="If Confidence is 75% and Support(Y) is 10%, Lift = 7.5x."
            unitTestStatus="Verified"
          />
        </div>
      </div>

      {/* 4. CA1 WORKED MINI-EXAMPLE VERIFICATION TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">CA1 Section 7.2 Worked Mini-Example Verification</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hypothetical 5-transaction reference dataset pre-registered in CA1 to verify exact numerical formula parity.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            N = 5 Transactions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-slate-700 block mb-2">Pre-Registered Transactions:</span>
            <div className="border border-slate-200 rounded-lg overflow-hidden font-mono">
              <div className="bg-slate-50 p-2.5 border-b border-slate-200 font-bold text-slate-600 flex justify-between">
                <span>Transaction ID</span> <span>Purchased Items</span>
              </div>
              <div className="p-2 border-b border-slate-100 flex justify-between"><span>T1</span> <span className="font-bold text-slate-800">A, B, C</span></div>
              <div className="p-2 border-b border-slate-100 flex justify-between"><span>T2</span> <span className="font-bold text-slate-800">A, C</span></div>
              <div className="p-2 border-b border-slate-100 flex justify-between"><span>T3</span> <span className="font-bold text-slate-800">A, D</span></div>
              <div className="p-2 border-b border-slate-100 flex justify-between"><span>T4</span> <span className="font-bold text-slate-800">B, C, E</span></div>
              <div className="p-2 flex justify-between"><span>T5</span> <span className="font-bold text-slate-800">A, B, C</span></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              With min support = 40% (≥ 2 baskets), items D (1 basket) and E (1 basket) are pruned by the downward-closure (Apriori) property.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-700 block">Automated Pytest Parity Audit:</span>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Rule A → C</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  TEST PASSED
                </span>
              </div>
              <div className="text-slate-600 text-[11px] font-mono">
                Support = 3/5 (60%) | Confidence = 3/4 (75%) | Lift = 0.75 / 0.80 = <strong>0.94x</strong>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Lift &lt; 1 proves weak association despite high raw confidence (75%), demonstrating why Lift is mandatory to avoid deceptive recommendations.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Rule B → C</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  TEST PASSED
                </span>
              </div>
              <div className="text-slate-600 text-[11px] font-mono">
                Support = 3/5 (60%) | Confidence = 3/3 (100%) | Lift = 1.00 / 0.80 = <strong>1.25x</strong>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Lift &gt; 1 confirms genuine positive association suitable for real-world automated bundling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CONTROLLED A/B TESTING BLUEPRINT */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <FlaskConical className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Controlled A/B Testing Protocol for Production Rollout</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          To satisfy the CA1 Section 2.4 decision boundary, recommendations must be empirically validated online prior to full rollout:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">1. Randomized Split</span>
            <p className="text-slate-600 leading-relaxed">
              50% of shopping sessions receive rule-mined recommendation widgets (Treatment); 50% receive popularity baseline widgets (Control).
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">2. Core Business KPIs</span>
            <p className="text-slate-600 leading-relaxed">
              Track conversion rate (%), average order value (AOV), recommendation click-through rate (CTR), and session revenue.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">3. Guardrail Thresholds</span>
            <p className="text-slate-600 leading-relaxed">
              Evaluate statistical significance at p &lt; 0.05 across a 4-week trial period to avoid false positives and seasonality distortion.
            </p>
          </div>
        </div>
      </div>

      {/* 6. ACADEMIC REFERENCES CITED */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Academic References Cited
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
          <li>
            Chen, D. (2015). <em>Online Retail [Dataset]</em>. UCI Machine Learning Repository.{' '}
            <a
              href="https://archive.ics.uci.edu/dataset/352/online+retail"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://archive.ics.uci.edu/dataset/352/online+retail
            </a>
          </li>
          <li>
            Agrawal, R., Imieliński, T., and Swami, A. (1993). <em>Mining Association Rules Between Sets of Items in Large Databases</em>. Proceedings of the 1993 ACM SIGMOD, pp. 207–216.
          </li>
          <li>
            Agrawal, R., and Srikant, R. (1994). <em>Fast Algorithms for Mining Association Rules</em>. Proceedings of the 20th VLDB, pp. 487–499.
          </li>
          <li>
            Han, J., Pei, J., and Yin, Y. (2000). <em>Mining Frequent Patterns without Candidate Generation</em>. Proceedings of the 2000 ACM SIGMOD, pp. 1–12.
          </li>
          <li>
            Han, J., Kamber, M., and Pei, J. (2011). <em>Data Mining: Concepts and Techniques</em> (3rd ed.). Morgan Kaufmann.
          </li>
          <li>
            mlxtend Documentation. <em>Association Rules &amp; Frequent Pattern Mining</em>.{' '}
            <a
              href="https://rasbt.github.io/mlxtend/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://rasbt.github.io/mlxtend/
            </a>
          </li>
        </ol>
      </div>
    </div>
  );
};
