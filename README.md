# منصة متابعة حفظ القرآن

نسخة مهيأة للتجربة والنشر على GitHub Pages.

## الحسابات التجريبية
- المدير: `admin` / `1234`
- المشرف: `mohammed` / `1234`
- الطالب: `omar` / `1234`

## ما تم تضمينه
- تسجيل دخول فعلي محلياً مع أدوار مدير/مشرف/طالب.
- إنشاء وتعطيل وحذف حسابات الطلاب والمشرفين، مع اسم مستخدم وكلمة مرور مخصصين.
- برنامج كامل من 604 صفحة لكل طالب.
- حالة مستقلة لكل صفحة: غير محفوظة / تحتاج مراجعة / محفوظة وثابتة.
- التعرف على مواضع بدايات السور داخل الصفحة، بما في ذلك الصفحات التي تجمع أكثر من سورة.
- نطاقات صفحات قابلة للتعديل دفعة واحدة.
- ورد يومي للحفظ والمراجعة، مع فصل مقدار المراجعة عن صفحات التقييم.
- تقييم التسميع وفق بنية 60 + 25 + 15 وحد النجاح 51.
- عرض التقييمات والتقدم للطالب.
- تخزين البيانات في LocalStorage لنسخة التجربة.

## GitHub Pages
الملف `.github/workflows/pages.yml` يجهز النشر تلقائياً عند دفع المشروع إلى فرع `main`، باستخدام المسار:
`/quran-memorization-platform/`

## Multi-center / production mode

The application now supports center-scoped data, separate manager accounts, manager handover, supervisor/student isolation, page-level evaluations, and a PostgreSQL API.

For production, provision PostgreSQL, run the database schema push, seed the first demo data if desired, then set `VITE_API_MODE=api` for the web app. The browser UI uses the same `/api` origin by default and authenticates with an HTTP-only session cookie.

Demo accounts in local mode:
- Center 1 manager: `admin` / `1234`
- Center 2 manager: `admin2` / `1234`
- Center 1 supervisor: `mohammed` / `1234`
- Center 1 student: `omar` / `1234`

### Production deployment checklist
1. Provision PostgreSQL and set `DATABASE_URL`.
2. Run `pnpm --filter @workspace/db push`.
3. Run `pnpm --filter @workspace/api-server build`.
4. Run `pnpm --filter @workspace/api-server seed` once for the demo environment, or replace it with your own initial manager provisioning.
5. Build the web app with `VITE_API_MODE=api`.
6. Serve the web app and API from the same origin (or configure `VITE_API_BASE_URL` and CORS accordingly).
7. Before real use, replace demo passwords, enable HTTPS, and configure automated PostgreSQL backups.
