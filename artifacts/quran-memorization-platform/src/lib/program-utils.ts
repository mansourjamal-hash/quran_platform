import type {PlanRecord, StudentProgram} from './types';

export function planAchievement(plan: PlanRecord){
  if(plan.requiredAmount<=0) return 100;
  return Math.max(0, Math.min(100, (plan.actualAmount/plan.requiredAmount)*100));
}

export function commitmentPercent(plans: PlanRecord[], today=new Date().toISOString().slice(0,10)){
  const due=plans.filter(p=>p.date<=today && p.type==='memorization');
  if(!due.length) return 100;
  const achievement=due.reduce((sum,p)=>sum+planAchievement(p),0)/due.length;
  const onTime=due.filter(p=>p.status==='completed').length/due.length*100;
  const consistent=due.filter(p=>planAchievement(p)>=90).length/due.length*100;
  // الإنجاز اليومي هو الأساس، والحضور في الموعد والاستمرارية تعدلان النتيجة دون معاقبة يوم منخفض منفرد بقسوة.
  return Math.round(achievement*0.75+onTime*0.15+consistent*0.10);
}

export function commitmentScore(plans: PlanRecord[], program?: StudentProgram){
  const percent=commitmentPercent(plans);
  const weight=program?.commitmentWeight ?? 15;
  const target=program?.commitmentTargetPercent ?? 70;
  const normalized=target>=100?percent/100:Math.max(0,Math.min(1,(percent/target)*0.75+Math.max(0,percent-target)/Math.max(1,100-target)*0.25));
  return {percent, points:Math.round(normalized*weight*10)/10, label:percent>=90?'منضبط جداً':percent>=80?'منضبط':percent>=70?'جيد':percent>=60?'مقبول':'دون المطلوب'};
}

export function reviewPercent(plans: PlanRecord[], cycleDays=7){
  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-cycleDays);
  const recent=plans.filter(p=>p.type==='revision' && new Date(`${p.date}T12:00:00`)>=cutoff);
  if(!recent.length) return null;
  const values=recent.flatMap(p=>(p.evaluations||[]).map(e=>e.reviewStrength ?? planAchievement(p)));
  if(!values.length) return Math.round(recent.reduce((a,p)=>a+planAchievement(p),0)/recent.length);
  return Math.round(values.reduce((a,v)=>a+v,0)/values.length);
}

export function overallScore(plans: PlanRecord[], program?: StudentProgram){
  const evaluations=plans.flatMap(p=>(p.evaluations||[]).map(e=>({e,p})));
  if(!evaluations.length) return 0;
  const mastery=evaluations.reduce((a,{e})=>a+(e.memorizationScore/60*35),0)/evaluations.length;
  const rev=reviewPercent(plans,program?.reviewCycleDays??7);
  const review=(rev ?? 0)/100*25;
  const fluency=evaluations.reduce((a,{e})=>a+(e.fluencyScore/25*15),0)/evaluations.length;
  const correction=evaluations.reduce((a,{e})=>a+(e.correctionScore/15*10),0)/evaluations.length;
  const commitment=commitmentScore(plans,program).points;
  return Math.round(mastery+review+fluency+correction+commitment);
}

export function scheduleDelta(plan:PlanRecord){ return Math.round(plan.actualAmount-plan.requiredAmount); }
