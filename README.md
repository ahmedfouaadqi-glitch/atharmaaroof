# أثر معروف
By: Ahmed Maaroof

منصة عراقية للمفقودات والمعثورات، بواجهة عربية RTL وتصميم داكن أخضر مزرق مستجيب للموبايل.

## تجربة الواجهة
- هوية مرئية باسم **أثر معروف** حصراً، مع شعار مستند وعلامة تحقق.
- واجهة تطبيق Mobile-first وشريط تنقّل سفلي للشاشات الصغيرة.
- تفاعلات React Bits من المصدر المفتوح: SpotlightCard وMagnet وClickSpark.
- مساعد بحث مدمج داخل حقل الصفحة الرئيسية؛ يبحث فعلياً في البلاغات المنشورة ويستخدم موفر OpenAI-compatible اختياري عند ضبط متغيرات الخادم.
- شعار SVG موحّد للعلامة، وأيقونة SVG مستقلة، وPWA manifest وService Worker مع لافتة تثبيت للهواتف والأجهزة اللوحية.
- Spotlight / Magnet / ClickSpark مع Parallax لحركة الجهاز، بعد الموافقة على حساس الحركة في iOS.
- لا تُخزّن واجهة Service Worker صفحات الحسابات أو نقاط API في Cache.

## React Bits
تُستخدم مكونات المصدر المفتوح من David Haz / React Bits. راجع `components/reactbits/NOTICE.md` وإشعار الترخيص قبل إعادة توزيع المكوّنات منفردة.
- https://reactbits.dev/
- https://github.com/DavidHDev/react-bits

## التشغيل
```bash
npm install
npm run dev
```

## إعداد الخدمة والصلاحيات

تحتاج عمليات تسجيل الدخول وحفظ البلاغات والبحث إلى إعداد Supabase وتطبيق ملفات الترحيل بالترتيب. يشرح `docs/SUPABASE_ACCESS_CONTROL.md` الأدوار، الـRLS، منح الصلاحيات، وتسجيل أول مشرف.

صفحة دخول الإدارة مستقلة في `/admin/login`، ولا تسمح بإنشاء حساب إداري. يتم التحقق من العضوية في `athar_admins` على الخادم، كما تُفحص جميع طلبات الإدارة في API.

## مساعد البحث

يبحث المساعد أولاً في `athar_public_reports` فقط. يمكن تفعيل صياغة إجابة عبر موفر متوافق مع OpenAI Chat Completions من خلال متغيرات الخادم `ATHAR_AI_CHAT_COMPLETIONS_URL` و`ATHAR_AI_API_KEY` و`ATHAR_AI_MODEL`. عند غيابها يستخدم المساعد نمط المطابقة المباشرة ولا يدّعي أنه نموذج توليدي.

## إعداد Vercel

اضبط `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` في Production وPreview وDevelopment. لا تضف مفتاح `service_role` إلى المتصفح أو إلى متغير يبدأ بـ`NEXT_PUBLIC_`.

عند غياب إعداد الخدمة، تعرض الواجهة حالة الاتصال بوضوح ولا تستبدلها ببلاغات أو أرقام وهمية.

## التثبيت
يدعم المشروع Web App Manifest وService Worker. يظهر خيار التثبيت المدعوم من المتصفح تلقائياً، ويمكن على المتصفحات التي لا تعرض الحدث استخدام قائمة المتصفح ثم "إضافة إلى الشاشة الرئيسية".
