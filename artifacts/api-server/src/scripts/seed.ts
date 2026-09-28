import { db, centersTable, usersTable, programsTable, plansTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../lib/auth';

const today=new Date().toISOString().slice(0,10);
const blank=Object.fromEntries(Array.from({length:604},(_,i)=>[i+1,'not_memorized']));

async function main(){
 const existing=await db.select({id:usersTable.id}).from(usersTable).limit(1);
 if(existing.length){console.log('Seed skipped: users already exist.');return;}
 await db.insert(centersTable).values([
  {id:'center_1',name:'مركز القرآن النموذجي',active:true,createdAt:'2026-09-01'},
  {id:'center_2',name:'مركز النور لتحفيظ القرآن',active:true,createdAt:'2026-09-01'}
 ]);
 const password=await hashPassword('1234');
 await db.insert(usersTable).values([
  {id:'m1',centerId:'center_1',name:'أحمد الإداري',username:'admin',passwordHash:password,role:'manager',active:true},
  {id:'s1',centerId:'center_1',name:'الشيخ محمد',username:'mohammed',passwordHash:password,role:'supervisor',active:true},
  {id:'st1',centerId:'center_1',name:'عمر الطالب',username:'omar',passwordHash:password,role:'student',active:true,supervisorId:'s1',level:'الجزء 30',enrollmentDate:'2026-01-15'},
  {id:'m2',centerId:'center_2',name:'مدير مركز النور',username:'admin2',passwordHash:password,role:'manager',active:true},
  {id:'s3',centerId:'center_2',name:'الشيخ خالد',username:'khaled',passwordHash:password,role:'supervisor',active:true},
  {id:'st3',centerId:'center_2',name:'يوسف الطالب',username:'yousef',passwordHash:password,role:'student',active:true,supervisorId:'s3',level:'الجزء 30',enrollmentDate:'2026-03-01'}
 ]);
 await db.insert(programsTable).values([
  {studentId:'st1',centerId:'center_1',pageStates:{...blank,...Object.fromEntries(Array.from({length:40},(_,i)=>[i+565,'stable']))},active:true,defaultMemorizationPages:1,defaultRevisionPages:4,reviewEvaluationPages:2},
  {studentId:'st3',centerId:'center_2',pageStates:blank,active:true,defaultMemorizationPages:1,defaultRevisionPages:4,reviewEvaluationPages:2}
 ]);
 await db.insert(plansTable).values([
  {id:'p1',centerId:'center_1',studentId:'st1',date:today,type:'memorization',surah:'النبأ',ayahFrom:1,ayahTo:20,pageFrom:582,pageTo:582,requiredAmount:1,actualAmount:0,evaluationPages:1,status:'pending',evaluations:[]},
  {id:'p2',centerId:'center_2',studentId:'st3',date:today,type:'memorization',surah:'الملك',ayahFrom:1,ayahTo:10,pageFrom:562,pageTo:562,requiredAmount:1,actualAmount:0,evaluationPages:1,status:'pending',evaluations:[]}
 ]);
 console.log('Demo centers and accounts created.');
}
main().catch(err=>{console.error(err);process.exit(1)});
