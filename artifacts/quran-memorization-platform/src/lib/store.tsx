import React,{createContext,useContext,useEffect,useState} from 'react';
import {AppState,AuditLog,Center,PlanRecord,Role,StudentProgram,User,ReviewRecord,ScheduleAdjustmentMode} from './types';
import {initialData} from './mock-data';

interface Store extends AppState {
 login:(u:string,p:string)=>Promise<boolean>;
 logout:()=>Promise<void>;
 setActiveRole:(r:Role)=>void;
 addUser:(u:Omit<User,'id'>)=>Promise<void>;
 updateUser:(id:string,u:Partial<User>)=>Promise<void>;
 deleteUser:(id:string)=>Promise<void>;
 addPlan:(p:Omit<PlanRecord,'id'>)=>Promise<void>;
 updatePlan:(id:string,u:Partial<PlanRecord>)=>Promise<void>;
 saveProgram:(p:StudentProgram)=>Promise<void>;
 transferManager:(newManagerId:string)=>Promise<boolean>;
 updateCenter:(id:string,u:Partial<Center>)=>Promise<void>;
 addAudit:(log:Omit<AuditLog,'id'|'createdAt'|'centerId'|'actorUserId'>)=>Promise<void>;
 addReview:(review:Omit<ReviewRecord,'id'|'createdAt'|'centerId'>)=>Promise<void>;
 reconcileSchedule:(studentId:string,planId:string,mode:ScheduleAdjustmentMode,pageDelta:number)=>Promise<void>;
 resetData:()=>void;
}
const C=createContext<Store|null>(null);
const API=import.meta.env.VITE_API_MODE==='api';
const BASE=String(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
const api=(path:string)=>`${BASE}/api${path}`;

function normalizeState(raw:AppState):AppState{
  const centers=raw.centers?.length?raw.centers:[{id:'center_1',name:'مركز القرآن النموذجي',active:true,createdAt:new Date().toISOString().slice(0,10)},{id:'center_2',name:'مركز النور لتحفيظ القرآن',active:true,createdAt:new Date().toISOString().slice(0,10)}];
  const users=(raw.users||[]).map(u=>({...u,centerId:u.centerId||'center_1'}));
  const programs=(raw.programs||[]).map(p=>({...p,centerId:p.centerId||users.find(u=>u.id===p.studentId)?.centerId||'center_1',supervisorCanEditPlans:p.supervisorCanEditPlans??true,supervisorCanAdjustSchedule:p.supervisorCanAdjustSchedule??true,delayPolicy:p.delayPolicy??'shift_remaining',reviewCycleDays:p.reviewCycleDays??7,commitmentWeight:p.commitmentWeight??15,commitmentTargetPercent:p.commitmentTargetPercent??70}));
  const plans=(raw.plans||[]).map(p=>({...p,centerId:p.centerId||users.find(u=>u.id===p.studentId)?.centerId||'center_1',status:p.status||'pending',evaluations:p.evaluations||[]}));
  return {...raw,centers,users,programs,plans,auditLogs:raw.auditLogs||[],reviews:raw.reviews||[],activeRole:raw.activeRole||'student',currentUser:raw.currentUser?{...raw.currentUser,centerId:raw.currentUser.centerId||'center_1'}:null};
}

export function StoreProvider({children}:{children:React.ReactNode}){
 const [state,setState]=useState<AppState>(()=>{try{const s=localStorage.getItem('quran-platform-v4');return s?normalizeState(JSON.parse(s)):normalizeState(initialData)}catch{return normalizeState(initialData)}});
 useEffect(()=>{if(!API)localStorage.setItem('quran-platform-v4',JSON.stringify(state))},[state]);
 const refresh=async()=>{const r=await fetch(api('/bootstrap'),{credentials:'include'});if(!r.ok)throw new Error('bootstrap');const b=await r.json();setState(s=>normalizeState({currentUser:b.currentUser,activeRole:b.currentUser.role,centers:b.center?[b.center]:s.centers,users:b.users,plans:b.plans,programs:b.programs,auditLogs:b.auditLogs||[],reviews:b.reviews||[]}));};
 const localLogin=(username:string,password:string)=>{const user=state.users.find(u=>u.username?.trim().toLowerCase()===username.trim().toLowerCase()&&u.password===password&&u.active);if(!user)return false;setState(s=>({...s,currentUser:user,activeRole:user.role}));return true};
 const login=async(username:string,password:string)=>{if(!API)return localLogin(username,password);try{const r=await fetch(api('/auth/login'),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({username,password})});if(!r.ok)return false;await refresh();return true}catch{return false}};
 const logout=async()=>{if(API){try{await fetch(api('/auth/logout'),{method:'POST',credentials:'include'})}catch{}}setState(s=>({...s,currentUser:null}))};
 const setActiveRole=(r:Role)=>setState(s=>({...s,activeRole:r,currentUser:s.users.find(u=>u.role===r&&u.active&&(!s.currentUser?.centerId||u.centerId===s.currentUser.centerId))||s.currentUser}));
 const addUser=async(u:Omit<User,'id'>)=>{if(API){await fetch(api('/users'),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(u)});await refresh();return}setState(s=>({...s,users:[...s.users,{...u,id:`u_${Date.now()}_${Math.random().toString(36).slice(2,6)}`}]}));};
 const updateUser=async(id:string,u:Partial<User>)=>{if(API){await fetch(api(`/users/${id}`),{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(u)});await refresh();return}setState(s=>{const users=s.users.map(x=>x.id===id?{...x,...u}:x);return {...s,users,currentUser:s.currentUser?.id===id?(users.find(x=>x.id===id)||null):s.currentUser}})};
 const deleteUser=async(id:string)=>{if(API){await fetch(api(`/users/${id}`),{method:'DELETE',credentials:'include'});await refresh();return}setState(s=>({...s,users:s.users.filter(x=>x.id!==id),plans:s.plans.filter(p=>p.studentId!==id),programs:s.programs.filter(p=>p.studentId!==id),auditLogs:[...s.auditLogs,{id:`a_${Date.now()}`,centerId:s.currentUser?.centerId||'center_1',actorUserId:s.currentUser?.id||'system',action:'حذف حساب',targetUserId:id,createdAt:new Date().toISOString()}]}));};
 const addPlan=async(p:Omit<PlanRecord,'id'>)=>{if(API){await fetch(api('/plans'),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(p)});await refresh();return}setState(s=>({...s,plans:[...s.plans,{...p,id:`p_${Date.now()}_${Math.random().toString(36).slice(2,5)}`}]}));};
 const updatePlan=async(id:string,u:Partial<PlanRecord>)=>{if(API){await fetch(api(`/plans/${id}`),{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(u)});await refresh();return}setState(s=>({...s,plans:s.plans.map(p=>p.id===id?{...p,...u}:p)}));};
 const reconcileSchedule=async(studentId:string,planId:string,mode:ScheduleAdjustmentMode,pageDelta:number)=>{
  if(API){const r=await fetch(api('/schedule/reconcile'),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({studentId,planId,mode,pageDelta})});if(!r.ok)throw new Error('schedule');await refresh();return}
  setState(s=>{
    const actor=s.currentUser;
    if(!actor)return s;
    const anchor=s.plans.find(p=>p.id===planId&&p.studentId===studentId&&p.centerId===actor.centerId);
    if(!anchor||pageDelta===0)return s;
    const dates=(d:string,n:number)=>{const x=new Date(`${d}T12:00:00`);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
    const future=s.plans.filter(p=>p.centerId===actor.centerId&&p.studentId===studentId&&p.type==='memorization'&&p.date>anchor.date).sort((a,b)=>a.date.localeCompare(b.date));
    let nextPlans=s.plans;
    if(mode==='shift_remaining'){
      const deltaDays=pageDelta<0?Math.ceil(Math.abs(pageDelta)): -Math.floor(Math.abs(pageDelta));
      nextPlans=s.plans.map(p=>future.some(f=>f.id===p.id)?{...p,date:dates(p.date,deltaDays),scheduleNote:pageDelta<0?'تأخر الإنجاز: أُزيح المتبقي تلقائياً':'إنجاز إضافي: قُدّم المتبقي تلقائياً'}:p);
    } else if(mode==='compress_next_week'){
      let remaining=Math.abs(pageDelta);
      const targets=future.filter(p=>p.date<=dates(anchor.date,7));
      nextPlans=s.plans.map(p=>{
        if(!targets.some(t=>t.id===p.id)||remaining<=0)return p;
        const add=Math.max(1,Math.ceil(remaining/targets.length));
        remaining-=add;
        return {...p,requiredAmount:p.requiredAmount+add,scheduleNote:pageDelta<0?'تأخر الإنجاز: تم ضغط المتأخر على الأسبوع القادم':'إنجاز إضافي: تم تخفيف ضغط الأسبوع القادم'};
      });
    }
    return {...s,plans:nextPlans,auditLogs:[...s.auditLogs,{id:`a_${Date.now()}`,centerId:actor.centerId,actorUserId:actor.id,action:'تصحيح البرنامج الزمني',targetUserId:studentId,details:`${mode} / فرق الصفحات ${pageDelta}`,createdAt:new Date().toISOString()}]};
  });
 };
 const saveProgram=async(p:StudentProgram)=>{if(API){await fetch(api(`/programs/${p.studentId}`),{method:'PUT',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(p)});await refresh();return}setState(s=>({...s,programs:s.programs.some(x=>x.studentId===p.studentId)?s.programs.map(x=>x.studentId===p.studentId?p:x):[...s.programs,p]}));};
 const transferManager=async(newManagerId:string)=>{if(API){const r=await fetch(api('/manager/transfer'),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({newManagerId})});if(!r.ok)return false;await refresh();return true}let ok=false;setState(s=>{const actor=s.currentUser;if(!actor||actor.role!=='manager')return s;const target=s.users.find(u=>u.id===newManagerId&&u.centerId===actor.centerId&&u.active&&u.role==='supervisor');if(!target)return s;const users=s.users.map(u=>u.id===actor.id?{...u,role:'supervisor' as Role}:u.id===target.id?{...u,role:'manager' as Role,supervisorId:undefined}:u);ok=true;return {...s,users,currentUser:users.find(u=>u.id===target.id)||null,activeRole:'manager',auditLogs:[...s.auditLogs,{id:`a_${Date.now()}`,centerId:actor.centerId,actorUserId:actor.id,action:'نقل صلاحية مدير المركز',targetUserId:target.id,details:`انتقلت الإدارة إلى ${target.name}`,createdAt:new Date().toISOString()}]}});return ok};
 const updateCenter=async(id:string,u:Partial<Center>)=>{if(API){await fetch(api('/center'),{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(u)});await refresh();return}setState(s=>({...s,centers:s.centers.map(c=>c.id===id?{...c,...u}:c)}));};
 const addAudit=async(log:Omit<AuditLog,'id'|'createdAt'|'centerId'|'actorUserId'>)=>{if(!API)setState(s=>({...s,auditLogs:[...s.auditLogs,{...log,id:`a_${Date.now()}`,centerId:s.currentUser?.centerId||'center_1',actorUserId:s.currentUser?.id||'system',createdAt:new Date().toISOString()}]}));};
 const addReview=async(review:Omit<ReviewRecord,'id'|'createdAt'|'centerId'>)=>{
  if(API){const r=await fetch(api('/reviews'),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(review)});if(!r.ok)throw new Error('review');await refresh();return}
  setState(s=>({...s,reviews:[...s.reviews,{...review,id:`r_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,centerId:s.currentUser?.centerId||'center_1',createdAt:new Date().toISOString()}]}));
 };
 const resetData=()=>setState(normalizeState({...initialData,currentUser:null}));
 return <C.Provider value={{...state,login,logout,setActiveRole,addUser,updateUser,deleteUser,addPlan,updatePlan,reconcileSchedule,saveProgram,transferManager,updateCenter,addAudit,addReview,resetData}}>{children}</C.Provider>
}
export const useStore=()=>{const c=useContext(C);if(!c)throw new Error('useStore must be used within StoreProvider');return c};
