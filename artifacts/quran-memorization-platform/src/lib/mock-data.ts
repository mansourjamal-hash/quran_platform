import { AppState, QuranPage, User } from './types';

export const surahNames = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];

// Standard Madinah mushaf surah-start pages. A page can therefore show more than one surah start.
export const surahStartPages = [1,2,50,77,106,128,151,177,187,208,221,235,249,255,262,267,282,293,305,312,322,332,342,350,359,367,377,385,396,404,411,415,418,428,434,440,446,453,458,467,477,483,489,496,499,502,507,511,515,518,520,523,526,528,531,534,537,542,545,549,551,553,554,556,558,560,562,564,566,568,570,572,574,575,577,578,580,582,583,585,586,587,587,589,590,591,591,592,593,594,595,595,596,596,597,597,598,598,599,599,600,600,601,601,601,602,602,602,603,603,603,604,604,604];

export const quranPages: QuranPage[] = Array.from({length:604},(_,i)=>{
  const page=i+1;
  const starts=surahStartPages.map((p,idx)=>p===page?idx+1:null).filter(Boolean) as number[];
  const current=surahStartPages.reduce((acc,p,idx)=>p<=page?idx:acc,0);
  const unique=[...new Set([current,...starts.map(n=>n-1)])];
  return {page,surahs:unique.map(n=>({number:n+1,name:surahNames[n],startsHere:surahStartPages[n]===page}))};
});

export function blankPageStates(){ return Object.fromEntries(Array.from({length:604},(_,i)=>[i+1,'not_memorized'])) as Record<number,import('./types').PageState>; }

const today=new Date().toISOString().slice(0,10);

export const initialData: AppState = {
  currentUser: null,
  activeRole:'manager',
  centers:[
    {id:'center_1',name:'مركز القرآن النموذجي',active:true,createdAt:'2026-09-01'},
    {id:'center_2',name:'مركز النور لتحفيظ القرآن',active:true,createdAt:'2026-09-01'}
  ],
  users:[
    {id:'m1',centerId:'center_1',name:'أحمد الإداري',username:'admin',password:'1234',role:'manager',active:true},
    {id:'s1',centerId:'center_1',name:'الشيخ محمد',username:'mohammed',password:'1234',role:'supervisor',active:true},
    {id:'s2',centerId:'center_1',name:'الشيخ عبدالله',username:'abdullah',password:'1234',role:'supervisor',active:true},
    {id:'st1',centerId:'center_1',name:'عمر الطالب',username:'omar',password:'1234',role:'student',active:true,supervisorId:'s1',level:'الجزء 30',enrollmentDate:'2026-01-15'},
    {id:'st2',centerId:'center_1',name:'علي حسن',username:'ali',password:'1234',role:'student',active:true,supervisorId:'s1',level:'الجزء 29',enrollmentDate:'2026-02-10'},
    {id:'m2',centerId:'center_2',name:'مدير مركز النور',username:'admin2',password:'1234',role:'manager',active:true},
    {id:'s3',centerId:'center_2',name:'الشيخ خالد',username:'khaled',password:'1234',role:'supervisor',active:true},
    {id:'st3',centerId:'center_2',name:'يوسف الطالب',username:'yousef',password:'1234',role:'student',active:true,supervisorId:'s3',level:'الجزء 30',enrollmentDate:'2026-03-01'}
  ],
  programs:[
    {studentId:'st1',centerId:'center_1',pageStates:{...blankPageStates(),...Object.fromEntries(Array.from({length:40},(_,i)=>[i+565,'stable']))},active:true,defaultMemorizationPages:1,defaultRevisionPages:4,reviewEvaluationPages:2,supervisorCanEditPlans:true,supervisorCanAdjustSchedule:true,delayPolicy:'shift_remaining',reviewCycleDays:7,commitmentWeight:15,commitmentTargetPercent:70},
    {studentId:'st2',centerId:'center_1',pageStates:{...blankPageStates()},active:true,defaultMemorizationPages:1,defaultRevisionPages:4,reviewEvaluationPages:2,supervisorCanEditPlans:true,supervisorCanAdjustSchedule:true,delayPolicy:'shift_remaining',reviewCycleDays:7,commitmentWeight:15,commitmentTargetPercent:70},
    {studentId:'st3',centerId:'center_2',pageStates:{...blankPageStates()},active:true,defaultMemorizationPages:1,defaultRevisionPages:4,reviewEvaluationPages:2,supervisorCanEditPlans:true,supervisorCanAdjustSchedule:true,delayPolicy:'shift_remaining',reviewCycleDays:7,commitmentWeight:15,commitmentTargetPercent:70}
  ],
  plans:[
    {id:'p1',centerId:'center_1',studentId:'st1',date:today,type:'memorization',surah:'النبأ',ayahFrom:1,ayahTo:20,pageFrom:582,pageTo:582,requiredAmount:1,actualAmount:0,evaluationPages:1,status:'pending'},
    {id:'p2',centerId:'center_1',studentId:'st1',date:today,type:'revision',surah:'المرسلات',ayahFrom:1,ayahTo:50,pageFrom:580,pageTo:581,requiredAmount:4,actualAmount:2,evaluationPages:2,status:'pending'},
    {id:'p3',centerId:'center_2',studentId:'st3',date:today,type:'memorization',surah:'الملك',ayahFrom:1,ayahTo:10,pageFrom:562,pageTo:562,requiredAmount:1,actualAmount:0,evaluationPages:1,status:'pending'}
  ],
  auditLogs:[],
  reviews:[]
};
